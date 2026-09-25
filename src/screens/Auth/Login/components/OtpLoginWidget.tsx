import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  UIManager,
  View
} from 'react-native';
import {
  GestureHandlerRootView,
  TouchableOpacity
} from 'react-native-gesture-handler';
import {
  KeyboardAwareScrollView,
  KeyboardAvoidingView
} from 'react-native-keyboard-controller';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '@/utils/colors';
import { isPhoneNumberTooLongForRegion, isPhoneNumberTooShortForRegion, validatePhoneNumberWithRegion } from '@/utils/helper';
import { OTPWidget } from '@msg91comm/sendotp-react-native';
import {
  buildMsg91Identifier,
  getMsg91ErrorMessage,
  isMsg91VerifySuccessToken,
  isValidMsg91Email,
  normalizeMsg91Email,
  OtpContactMode,
  OtpRetryChannel,
  resolveSendOtpResponse,
  RETRY_CHANNEL_TO_MSG91_CODE
} from '@/screens/Auth/Login/msg91Otp';
import { SmsUserConsent } from '@/native/SmsUserConsent';
import styles from './OtpLoginWidget.styles';
import DynamicOtpBoxes from './DynamicOtpBoxes';

export type { OtpRetryChannel, OtpContactMode };

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OtpLength = 4 | 6 | 8;

const POPUP_SCALE_START = 0.96;
const POPUP_TRANSLATE_Y = 14;
const ANIM_IN_MS = 340;
const ANIM_OUT_MS = 240;
const DEFAULT_RETRY_AFTER_SECONDS = 30;
const DEFAULT_RETRY_CHANNELS: OtpRetryChannel[] = ['sms', 'call', 'whatsapp'];
const DEFAULT_EMAIL_RETRY_CHANNELS: OtpRetryChannel[] = ['email'];

const RETRY_CHANNEL_META: Record<OtpRetryChannel, { label: string; icon: string }> = {
  sms: { label: 'SMS', icon: 'message-text-outline' },
  call: { label: 'Call', icon: 'phone-outline' },
  whatsapp: { label: 'WhatsApp', icon: 'whatsapp' },
  email: { label: 'Email', icon: 'email-outline' }
};

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeIn = Easing.bezier(0.4, 0, 1, 1);

/** Convert ISO country code (e.g. IN) to flag emoji (🇮🇳) */
const getFlagEmoji = (cca2: string) =>
  cca2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const normalizeRetryChannels = (
  channels?: string[],
  contactMode: OtpContactMode = 'mobile'
): OtpRetryChannel[] => {
  const allowed = new Set<OtpRetryChannel>(['sms', 'call', 'whatsapp', 'email']);
  const normalized = (channels ?? [])
    .map((c) => String(c).trim().toLowerCase())
    .filter((c): c is OtpRetryChannel => allowed.has(c as OtpRetryChannel));
  const unique = [...new Set(normalized)];

  if (contactMode === 'email') {
    const emailOnly = unique.filter((c) => c === 'email');
    return emailOnly.length ? emailOnly : DEFAULT_EMAIL_RETRY_CHANNELS;
  }

  const mobileOnly = unique.filter((c) => c !== 'email');
  return mobileOnly.length ? mobileOnly : DEFAULT_RETRY_CHANNELS;
};

const formatRetryCountdown = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsLabel = mins < 10 ? `0${mins}` : `${mins}`;
  const secsLabel = secs < 10 ? `0${secs}` : `${secs}`;
  return `${minsLabel}:${secsLabel}`;
};

/**
 * User Consent returns the full SMS, not a parsed code. Avoid guessing when
 * several same-length numbers exist (for example, an amount and an OTP).
 */
const extractOtpFromSms = (message: string, otpLength: OtpLength): string | null => {
  const candidates: Array<{ code: string; index: number; score: number }> = [];
  const codePattern = new RegExp(`(^|\\D)(\\d{${otpLength}})(?!\\d)`, 'g');
  let match: RegExpExecArray | null;

  while ((match = codePattern.exec(message)) !== null) {
    const code = match[2];
    const index = match.index + match[1].length;
    const nearbyText = message
      .slice(Math.max(0, index - 45), Math.min(message.length, index + code.length + 45))
      .toLowerCase();
    const score = /\b(otp|code|verification|verify|login|password|pin)\b/.test(nearbyText)
      ? 1
      : 0;
    candidates.push({ code, index, score });
  }

  if (candidates.length === 1) {
    return candidates[0].code;
  }

  const highestScore = Math.max(0, ...candidates.map((candidate) => candidate.score));
  const bestCandidates = candidates.filter((candidate) => candidate.score === highestScore);
  return highestScore > 0 && bestCandidates.length === 1 ? bestCandidates[0].code : null;
};

type OtpLoginWidgetProps = {
  visible: boolean;
  onClose: () => void;
  /** Header title. Defaults to "Login with OTP". */
  title?: string;
  /** Initial Email | Mobile mode. Defaults to mobile. */
  initialContactMode?: OtpContactMode;
  /** When false, hide Email|Mobile radio (signup steps). Default true. */
  allowContactModeSwitch?: boolean;
  /** OTP digit count — from getWidgetProcess. Defaults to 8. */
  otpLength?: number;
  /** Seconds before retry is allowed — from getWidgetProcess.retryTime */
  retryAfterSeconds?: number;
  /** Available retry methods — from getWidgetProcess RETRY channels */
  retryChannels?: string[];
  /** Max retry taps allowed — from getWidgetProcess.retryCount */
  maxRetryAttempts?: number;
  initialEmail?: string;
  initialMobileNumber?: string;
  initialCountryCode?: CountryCode;
  initialCallingCode?: string;
  /** When invisible verify fell back to OTP, start at OTP step */
  initialReqId?: string;
  /** SMS approved while the parent invisible-verification flow was active. */
  initialSmsMessage?: string;
  autoConfirmNumber?: boolean;
  onVerified?: (payload: {
    accessToken: string;
    contactMode: OtpContactMode;
    email?: string;
    mobileNumber?: string;
    countryCallingCode?: string;
    countryCode?: CountryCode;
  }) => void;
  onErrorMessage?: (message: string) => void;
};

const normalizeOtpLength = (length?: number): OtpLength => {
  if (length === 4 || length === 6 || length === 8) {
    return length;
  }
  return 8;
};

const OtpLoginWidget: React.FC<OtpLoginWidgetProps> = ({
  visible,
  onClose,
  title = 'Login with OTP',
  initialContactMode = 'mobile',
  allowContactModeSwitch = true,
  otpLength: otpLengthProp,
  retryAfterSeconds: retryAfterSecondsProp,
  retryChannels: retryChannelsProp,
  maxRetryAttempts: maxRetryAttemptsProp = 2,
  initialEmail = '',
  initialMobileNumber = '',
  initialCountryCode = 'IN',
  initialCallingCode = '91',
  initialReqId = '',
  initialSmsMessage = '',
  autoConfirmNumber = false,
  onVerified,
  onErrorMessage
}) => {
  const insets = useSafeAreaInsets();
  const otpLength = normalizeOtpLength(otpLengthProp);
  const retryAfterSeconds = Math.max(
    0,
    Math.floor(retryAfterSecondsProp ?? DEFAULT_RETRY_AFTER_SECONDS)
  );
  const maxRetryAttempts = Math.max(0, Math.floor(maxRetryAttemptsProp));
  const phoneInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<any>(null);

  const [contactMode, setContactMode] = useState<OtpContactMode>(initialContactMode);
  const [email, setEmail] = useState(initialEmail);
  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountryCode);
  const [callingCode, setCallingCode] = useState(initialCallingCode);
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [otp, setOtp] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  /** Identifier confirmed via Continue — only then show OTP UI */
  const [isNumberConfirmed, setIsNumberConfirmed] = useState(false);
  /** Keeps Modal mounted until fade-out finishes */
  const [modalMounted, setModalMounted] = useState(false);
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0);
  const [retriesLeft, setRetriesLeft] = useState(maxRetryAttempts);
  const [reqId, setReqId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [consentedSmsMessage, setConsentedSmsMessage] = useState('');
  const hasOpenedRef = useRef(false);
  const otpRowYRef = useRef(0);
  const smsConsentActiveRef = useRef(false);
  const smsConsentGenerationRef = useRef(0);
  const autoVerifiedSmsRef = useRef('');
  const isSubmittingRef = useRef(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(POPUP_SCALE_START)).current;
  const popupTranslateY = useRef(new Animated.Value(POPUP_TRANSLATE_Y)).current;
  const otpSectionOpacity = useRef(new Animated.Value(0)).current;
  const keyboardLift = useRef(new Animated.Value(0)).current;

  const retryChannels = useMemo(
    () => normalizeRetryChannels(retryChannelsProp, contactMode),
    [retryChannelsProp, contactMode]
  );

  const fullPhone = `+${callingCode}${mobileNumber}`;
  const isPhoneValid =
    mobileNumber.trim().length > 0 &&
    validatePhoneNumberWithRegion(fullPhone, countryCode);
  const isEmailValid = isValidMsg91Email(email);
  const isIdentifierValid = contactMode === 'email' ? isEmailValid : isPhoneValid;

  const showOtpSection =
    isNumberConfirmed && (contactMode === 'email' ? isEmailValid : isPhoneValid);
  const isOtpComplete = otp.length === otpLength;
  const isPhoneTooLong = isPhoneNumberTooLongForRegion(fullPhone, countryCode);
  const isPhoneTooShort = isPhoneNumberTooShortForRegion(fullPhone, countryCode);
  // Lock as soon as Continue is tapped (while sending) and after OTP is sent
  const isPhoneLocked = isNumberConfirmed || isSubmitting;
  const isContactModeLocked = isPhoneLocked;
  // Don't error while typing an incomplete (too-short) number; do error if too long or fully invalid
  const showPhoneError =
    contactMode === 'mobile' &&
    (isPhoneTooLong ||
      (phoneTouched &&
        mobileNumber.length > 0 &&
        !isPhoneValid &&
        !isPhoneTooShort));
  const showEmailError =
    contactMode === 'email' && emailTouched && email.length > 0 && !isEmailValid;
  const canRetry =
    showOtpSection &&
    retrySecondsLeft <= 0 &&
    retryChannels.length > 0 &&
    retriesLeft > 0 &&
    !isSubmitting;
  const isRetryCountingDown = showOtpSection && retrySecondsLeft > 0;
  const retriesExhausted = showOtpSection && retriesLeft <= 0;
  // Keep padding stable while keyboard animates — layout jumps cancel the first tap.
  const bottomPad = 8;

  const softLayoutAnim = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity
      }
    });
  }, []);

  const animateKeyboardLift = useCallback(
    (_height: number, _duration = 220) => {
      keyboardLift.setValue(0);
    },
    [keyboardLift]
  );

  const startRetryTimer = useCallback(() => {
    setRetrySecondsLeft(retryAfterSeconds);
  }, [retryAfterSeconds]);

  const stopSmsConsent = useCallback(() => {
    smsConsentGenerationRef.current += 1;
    smsConsentActiveRef.current = false;
    SmsUserConsent.stopListening();
  }, []);

  const startSmsConsent = useCallback((restart = false) => {
    if (!SmsUserConsent.isAvailable()) {
      return;
    }
    if (smsConsentActiveRef.current && !restart) {
      return;
    }
    if (restart) {
      SmsUserConsent.stopListening();
      smsConsentActiveRef.current = false;
    }

    const generation = smsConsentGenerationRef.current + 1;
    smsConsentGenerationRef.current = generation;
    smsConsentActiveRef.current = true;
    setConsentedSmsMessage('');

    SmsUserConsent.listenForOtp()
      .then((result) => {
        if (smsConsentGenerationRef.current !== generation) {
          return;
        }
        smsConsentActiveRef.current = false;
        const message = result?.receivedOtpMessage?.trim();
        if (message) {
          setConsentedSmsMessage(message);
        }
      })
      .catch((error: any) => {
        if (smsConsentGenerationRef.current !== generation) {
          return;
        }
        smsConsentActiveRef.current = false;
        // Denial, timeout, or unavailable Play Services must leave manual entry usable.
        console.log('[SMS User Consent] Manual OTP entry remains active:', error?.code);
      });
  }, []);

  const applyInitialValues = useCallback(() => {
    setContactMode(initialContactMode || 'mobile');
    setEmail(initialEmail || '');
    setMobileNumber(initialMobileNumber || '');
    setCountryCode(initialCountryCode || 'IN');
    setCallingCode(initialCallingCode || '91');
    setRetriesLeft(maxRetryAttempts);
    setReqId(initialReqId || '');
    setOtp('');
    setPhoneTouched(false);
    setEmailTouched(false);
    setPhoneFocused(false);
    setEmailFocused(false);
    setShowCountryPicker(false);
    setIsSubmitting(false);
    setConsentedSmsMessage('');
    autoVerifiedSmsRef.current = '';
    isSubmittingRef.current = false;
    if (autoConfirmNumber && (initialReqId || initialMobileNumber)) {
      setIsNumberConfirmed(Boolean(initialReqId));
      if (initialReqId) {
        setRetrySecondsLeft(retryAfterSeconds);
      } else {
        setRetrySecondsLeft(0);
        setIsNumberConfirmed(false);
      }
    } else {
      setIsNumberConfirmed(false);
      setRetrySecondsLeft(0);
    }
  }, [
    initialContactMode,
    initialEmail,
    initialMobileNumber,
    initialCountryCode,
    initialCallingCode,
    maxRetryAttempts,
    initialReqId,
    autoConfirmNumber,
    retryAfterSeconds
  ]);

  const resetForm = useCallback(() => {
    setContactMode(initialContactMode || 'mobile');
    setEmail('');
    setMobileNumber('');
    setOtp('');
    setPhoneTouched(false);
    setEmailTouched(false);
    setPhoneFocused(false);
    setEmailFocused(false);
    setCountryCode('IN');
    setCallingCode('91');
    setShowCountryPicker(false);
    setIsNumberConfirmed(false);
    setRetrySecondsLeft(0);
    setRetriesLeft(maxRetryAttempts);
    setReqId('');
    setIsSubmitting(false);
    setIsKeyboardVisible(false);
    setKeyboardHeight(0);
    setConsentedSmsMessage('');
    autoVerifiedSmsRef.current = '';
    isSubmittingRef.current = false;
    stopSmsConsent();
    keyboardLift.setValue(0);
    otpSectionOpacity.setValue(0);
  }, [
    otpSectionOpacity,
    keyboardLift,
    maxRetryAttempts,
    stopSmsConsent,
    initialContactMode
  ]);

  useEffect(() => {
    if (visible) {
      hasOpenedRef.current = true;
      applyInitialValues();
      setModalMounted(true);
      backdropOpacity.setValue(0);
      popupOpacity.setValue(0);
      popupScale.setValue(POPUP_SCALE_START);
      popupTranslateY.setValue(POPUP_TRANSLATE_Y);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIM_IN_MS,
          easing: easeOut,
          useNativeDriver: true
        }),
        Animated.timing(popupOpacity, {
          toValue: 1,
          duration: ANIM_IN_MS,
          easing: easeOut,
          useNativeDriver: true
        }),
        Animated.spring(popupScale, {
          toValue: 1,
          friction: 8,
          tension: 58,
          useNativeDriver: true
        }),
        Animated.timing(popupTranslateY, {
          toValue: 0,
          duration: ANIM_IN_MS,
          easing: easeOut,
          useNativeDriver: true
        })
      ]).start(() => {
        // Focus input after popup settles — skip when already on OTP step
        if (!(autoConfirmNumber && initialReqId)) {
          setTimeout(() => {
            if (initialContactMode === 'email') {
              emailInputRef.current?.focus();
            } else {
              phoneInputRef.current?.focus();
            }
          }, 40);
        }
      });
      return;
    }

    if (!hasOpenedRef.current) {
      return;
    }

    hasOpenedRef.current = false;
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_OUT_MS,
        easing: easeIn,
        useNativeDriver: true
      }),
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: ANIM_OUT_MS,
        easing: easeIn,
        useNativeDriver: true
      }),
      Animated.timing(popupScale, {
        toValue: POPUP_SCALE_START,
        duration: ANIM_OUT_MS,
        easing: easeIn,
        useNativeDriver: true
      }),
      Animated.timing(popupTranslateY, {
        toValue: POPUP_TRANSLATE_Y * 0.6,
        duration: ANIM_OUT_MS,
        easing: easeIn,
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished) {
        setModalMounted(false);
        resetForm();
      }
    });
  }, [
    visible,
    backdropOpacity,
    popupOpacity,
    popupScale,
    popupTranslateY,
    resetForm,
    applyInitialValues
  ]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates?.height ?? 0;
      setIsKeyboardVisible(true);
      setKeyboardHeight(height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isRetryCountingDown) {
      return;
    }
    const interval = setInterval(() => {
      setRetrySecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRetryCountingDown]);

  useEffect(() => {
    if (!showOtpSection) {
      otpSectionOpacity.setValue(0);
      return;
    }
    otpSectionOpacity.setValue(0);
    Animated.timing(otpSectionOpacity, {
      toValue: 1,
      duration: 220,
      easing: easeOut,
      useNativeDriver: true
    }).start();
  }, [showOtpSection, otpSectionOpacity]);

  useEffect(() => {
    if (visible && showOtpSection && reqId && contactMode === 'mobile') {
      startSmsConsent();
    }
  }, [visible, showOtpSection, reqId, contactMode, startSmsConsent]);

  useEffect(() => {
    if (visible && initialSmsMessage) {
      setConsentedSmsMessage(initialSmsMessage);
    }
  }, [visible, initialSmsMessage]);

  const emitVerified = useCallback(
    (accessToken: string) => {
      if (contactMode === 'email') {
        onVerified?.({
          accessToken,
          contactMode: 'email',
          email: normalizeMsg91Email(email)
        });
        return;
      }
      onVerified?.({
        accessToken,
        contactMode: 'mobile',
        mobileNumber,
        countryCallingCode: callingCode,
        countryCode
      });
    },
    [contactMode, email, mobileNumber, callingCode, countryCode, onVerified]
  );

  const switchContactMode = (mode: OtpContactMode) => {
    if (isContactModeLocked || mode === contactMode || !allowContactModeSwitch) {
      return;
    }
    softLayoutAnim();
    setContactMode(mode);
    setOtp('');
    setIsNumberConfirmed(false);
    setRetrySecondsLeft(0);
    setReqId('');
    setRetriesLeft(maxRetryAttempts);
    stopSmsConsent();
    setTimeout(() => {
      if (mode === 'email') {
        emailInputRef.current?.focus();
      } else {
        phoneInputRef.current?.focus();
      }
    }, 100);
  };

  const onSelectCountry = useCallback((country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode?.[0] ?? '91');
    setShowCountryPicker(false);
    setIsNumberConfirmed(false);
    setOtp('');
    setTimeout(() => phoneInputRef.current?.focus(), 120);
  }, []);

  const openCountryPicker = () => {
    if (isPhoneLocked) {
      return;
    }
    Keyboard.dismiss();
    setShowCountryPicker(true);
  };

  const handleDone = async () => {
    if (contactMode === 'email') {
      setEmailTouched(true);
      if (!isEmailValid || isSubmittingRef.current) {
        return;
      }

      const identifier = normalizeMsg91Email(email);
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      Keyboard.dismiss();
      try {
        const response = await OTPWidget.sendOTP({ identifier });
        console.log('[MSG91] sendOTP email response:', response);

        const outcome = resolveSendOtpResponse(response);

        if (outcome.kind === 'invisible_success') {
          // Email path should not be invisible, but handle token if returned
          emitVerified(outcome.accessToken);
          return;
        }

        if (outcome.kind === 'error') {
          onErrorMessage?.(outcome.message);
          return;
        }

        softLayoutAnim();
        setReqId(outcome.reqId);
        setIsNumberConfirmed(true);
        setOtp('');
        setRetriesLeft(maxRetryAttempts);
        startRetryTimer();
      } catch (error: any) {
        console.error('[MSG91] sendOTP email error:', error);
        onErrorMessage?.(error?.message || 'Failed to send OTP');
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
      return;
    }

    setPhoneTouched(true);
    if (!isPhoneValid || isSubmittingRef.current) {
      return;
    }

    const identifier = buildMsg91Identifier(callingCode, mobileNumber);

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    Keyboard.dismiss();
    // Google requires listening to start before the server sends the SMS.
    startSmsConsent();
    try {
      const response = await OTPWidget.sendOTP({ identifier });
      console.log('[MSG91] sendOTP response:', response);

      const outcome = resolveSendOtpResponse(response);

      // Same MSG91 rules: invisibleVerified → done; else reqId → OTP UI
      if (outcome.kind === 'invisible_success') {
        stopSmsConsent();
        emitVerified(outcome.accessToken);
        return;
      }

      if (outcome.kind === 'error') {
        stopSmsConsent();
        onErrorMessage?.(outcome.message);
        return;
      }

      softLayoutAnim();
      setReqId(outcome.reqId);
      setIsNumberConfirmed(true);
      setOtp('');
      setRetriesLeft(maxRetryAttempts);
      startRetryTimer();
    } catch (error: any) {
      stopSmsConsent();
      console.error('[MSG91] sendOTP error:', error);
      onErrorMessage?.(error?.message || 'Failed to send OTP');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleChangeNumber = () => {
    softLayoutAnim();
    setOtp('');
    setIsNumberConfirmed(false);
    setRetrySecondsLeft(0);
    setReqId('');
    setRetriesLeft(maxRetryAttempts);
    stopSmsConsent();
    setTimeout(() => {
      if (contactMode === 'email') {
        emailInputRef.current?.focus();
      } else {
        phoneInputRef.current?.focus();
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    stopSmsConsent();
    onClose();
  };

  const handleRetryChannel = async (channel: OtpRetryChannel) => {
    if (!canRetry || !reqId) {
      return;
    }
    setIsSubmitting(true);
    // Retry can produce a new SMS, so replace any stale five-minute listener.
    autoVerifiedSmsRef.current = '';
    if (contactMode === 'mobile') {
      startSmsConsent(true);
    }
    try {
      const body = {
        reqId,
        retryChannel: RETRY_CHANNEL_TO_MSG91_CODE[channel]
      };
      const response = await OTPWidget.retryOTP(body);
      console.log('[MSG91] retryOTP response:', response);

      if (response?.type === 'error') {
        if (contactMode === 'mobile') {
          stopSmsConsent();
        }
        onErrorMessage?.(getMsg91ErrorMessage(response, 'Failed to resend OTP'));
        return;
      }

      setOtp('');
      setRetriesLeft((prev) => Math.max(0, prev - 1));
      startRetryTimer();
    } catch (error: any) {
      if (contactMode === 'mobile') {
        stopSmsConsent();
      }
      console.error('[MSG91] retryOTP error:', error);
      onErrorMessage?.(error?.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = useCallback(async (otpOverride?: string) => {
    const submittedOtp = (otpOverride ?? otp).replace(/\D/g, '').slice(0, otpLength);
    if (
      !showOtpSection ||
      submittedOtp.length !== otpLength ||
      !reqId ||
      isSubmittingRef.current
    ) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await OTPWidget.verifyOTP({
        reqId,
        otp: submittedOtp
      });
      console.log('[MSG91] verifyOTP response:', response);

      const accessToken = isMsg91VerifySuccessToken(response);

      if (!accessToken) {
        onErrorMessage?.(getMsg91ErrorMessage(response, 'Invalid OTP'));
        return;
      }

      stopSmsConsent();
      emitVerified(String(accessToken));
    } catch (error: any) {
      console.error('[MSG91] verifyOTP error:', error);
      onErrorMessage?.(error?.message || 'Failed to verify OTP');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [
    otp,
    otpLength,
    showOtpSection,
    reqId,
    stopSmsConsent,
    emitVerified,
    onErrorMessage
  ]);

  /** Auto-verify as soon as paste / entry fills all OTP boxes */
  const handleOtpChange = useCallback(
    (code: string) => {
      setOtp(code);
      if (
        code.length === otpLength &&
        showOtpSection &&
        reqId &&
        !isSubmitting
      ) {
        Keyboard.dismiss();
        void handleVerify(code);
      }
    },
    [otpLength, showOtpSection, reqId, isSubmitting, handleVerify]
  );

  useEffect(() => {
    if (
      !consentedSmsMessage ||
      !showOtpSection ||
      !reqId ||
      isSubmitting ||
      contactMode !== 'mobile'
    ) {
      return;
    }

    const code = extractOtpFromSms(consentedSmsMessage, otpLength);
    if (!code) {
      console.warn(
        '[SMS User Consent] Could not identify one unambiguous OTP; keeping manual entry'
      );
      return;
    }

    const verificationKey = `${reqId}:${code}`;
    if (autoVerifiedSmsRef.current === verificationKey) {
      return;
    }
    autoVerifiedSmsRef.current = verificationKey;
    setOtp(code);
    Keyboard.dismiss();
    handleVerify(code);
  }, [
    consentedSmsMessage,
    showOtpSection,
    reqId,
    otpLength,
    isSubmitting,
    contactMode,
    handleVerify
  ]);

  const handleBackdropPress = () => {
    if (isKeyboardVisible || keyboardHeight > 0) {
      Keyboard.dismiss();
      return;
    }
    handleClose();
  };

  return (
    <Modal
      visible={modalMounted}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <SystemBars style={{ statusBar: 'dark', navigationBar: 'dark' }} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.48]
              })
            }
          ]}
        />
        <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.popupAvoider}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.popupCard,
              {
                opacity: popupOpacity,
                transform: [
                  { scale: popupScale },
                  { translateY: popupTranslateY }
                ],
                marginTop: Math.max(insets.top, 12),
                marginBottom: Math.max(insets.bottom, 12),
                maxHeight: '86%'
              }
            ]}
          >
            <View style={styles.cardClip}>
            <KeyboardAwareScrollView
              ref={scrollRef}
              style={styles.scrollView}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="interactive"
              bottomOffset={24}
              extraKeyboardSpace={8}
              disableScrollOnKeyboardHide
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: bottomPad }
              ]}
            >
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closeButton}
                activeOpacity={0.7}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

              {allowContactModeSwitch && (
                <View style={styles.modeRadioRow}>
                  {(['mobile', 'email'] as OtpContactMode[]).map((mode) => {
                    const selected = contactMode === mode;
                    return (
                      <TouchableOpacity
                        key={mode}
                        accessibilityRole="radio"
                        accessibilityState={{ selected, disabled: isContactModeLocked }}
                        disabled={isContactModeLocked}
                        activeOpacity={0.7}
                        style={[
                          styles.modeRadioOption,
                          selected && styles.modeRadioOptionActive,
                          isContactModeLocked && styles.modeRadioOptionDisabled
                        ]}
                        onPress={() => switchContactMode(mode)}
                      >
                        <View
                          style={[
                            styles.modeRadioDot,
                            selected && styles.modeRadioDotActive
                          ]}
                        />
                        <Text
                          style={[
                            styles.modeRadioLabel,
                            selected && styles.modeRadioLabelActive
                          ]}
                        >
                          {mode === 'mobile' ? 'Mobile' : 'Email'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {contactMode === 'email' ? (
                <>
                  <Text style={styles.sectionLabel}>Email address</Text>
                  <View
                    style={[
                      styles.phoneRow,
                      emailFocused && !isPhoneLocked && styles.phoneRowFocused,
                      showEmailError && styles.phoneRowError,
                      isPhoneLocked && styles.phoneRowLocked
                    ]}
                  >
                    <View style={styles.phoneInputWrap}>
                      <TextInput
                        ref={emailInputRef}
                        style={[
                          styles.phoneInput,
                          isPhoneLocked && styles.phoneInputLocked
                        ]}
                        value={email}
                        editable={!isPhoneLocked}
                        onChangeText={(text) => {
                          setEmail(text);
                          setIsNumberConfirmed(false);
                          setOtp('');
                        }}
                        placeholder="sampleaddress@mail.com"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => {
                          setEmailFocused(false);
                          setEmailTouched(true);
                        }}
                        returnKeyType="done"
                        onSubmitEditing={handleDone}
                      />
                    </View>
                  </View>

                  <Text
                    style={[styles.helperText, showEmailError && styles.errorText]}
                  >
                    {showEmailError
                      ? 'Please enter a valid email address'
                      : isNumberConfirmed
                        ? ' '
                        : 'Enter your email to receive an OTP'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>Mobile number</Text>
                  <View
                    style={[
                      styles.phoneRow,
                      phoneFocused && !isPhoneLocked && styles.phoneRowFocused,
                      showPhoneError && styles.phoneRowError,
                      isPhoneLocked && styles.phoneRowLocked
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.countryButton}
                      activeOpacity={0.7}
                      disabled={isPhoneLocked}
                      onPress={openCountryPicker}
                    >
                      <Text style={styles.flagEmoji}>{getFlagEmoji(countryCode)}</Text>
                      <Text style={styles.callingCode}>+{callingCode}</Text>
                      {!isPhoneLocked && (
                        <Text style={styles.countryChevron}>▾</Text>
                      )}
                    </TouchableOpacity>

                    <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withEmoji
                      withCallingCode
                      withCloseButton
                      visible={showCountryPicker}
                      onSelect={onSelectCountry}
                      onClose={() => setShowCountryPicker(false)}
                      renderFlagButton={() => null}
                    />

                    <View style={styles.phoneInputWrap}>
                      <TextInput
                        ref={phoneInputRef}
                        style={[
                          styles.phoneInput,
                          isPhoneLocked && styles.phoneInputLocked
                        ]}
                        value={mobileNumber}
                        editable={!isPhoneLocked}
                        onChangeText={(text) => {
                          setMobileNumber(text.replace(/\D/g, ''));
                          setIsNumberConfirmed(false);
                          setOtp('');
                        }}
                        placeholder="Enter mobile number"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="phone-pad"
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => {
                          setPhoneFocused(false);
                          setPhoneTouched(true);
                        }}
                        maxLength={15}
                        returnKeyType="done"
                        onSubmitEditing={handleDone}
                      />
                    </View>
                  </View>

                  <Text
                    style={[styles.helperText, showPhoneError && styles.errorText]}
                  >
                    {isPhoneTooLong
                      ? 'Number is too long for the selected country'
                      : showPhoneError
                        ? 'Please enter a valid mobile number'
                        : isNumberConfirmed
                          ? ' '
                          : 'Select country code and enter your number'}
                  </Text>
                </>
              )}

              {!isNumberConfirmed && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={!isIdentifierValid || isSubmitting}
                  style={[
                    styles.primaryButton,
                    styles.doneButton,
                    isIdentifierValid && styles.primaryButtonReady,
                    !isIdentifierValid && styles.primaryButtonDisabled
                  ]}
                  onPressIn={() => {
                    if (!isIdentifierValid || isSubmittingRef.current) {
                      return;
                    }
                    void handleDone();
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                        style={styles.buttonSpinner}
                      />
                      <Text style={styles.primaryButtonLabel}>Sending…</Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.primaryButtonLabel,
                        !isIdentifierValid && styles.primaryButtonLabelDisabled
                      ]}
                    >
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {showOtpSection && (
                <Animated.View
                  style={[styles.otpSection, { opacity: otpSectionOpacity }]}
                >
                  <Text style={styles.otpHint}>
                    Enter the {otpLength}-digit code sent to{'\n'}
                    <Text style={styles.otpHintStrong}>
                      {contactMode === 'email'
                        ? normalizeMsg91Email(email)
                        : `+${callingCode} ${mobileNumber}`}
                    </Text>
                  </Text>

                  <View
                    onLayout={(e) => {
                      otpRowYRef.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <DynamicOtpBoxes
                      length={otpLength}
                      value={otp}
                      onChange={handleOtpChange}
                      autoFocus
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.changeNumber}
                    activeOpacity={0.7}
                    onPress={handleChangeNumber}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.changeNumberText}>
                      {contactMode === 'email' ? 'Change email' : 'Change number'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={!isOtpComplete || isSubmitting}
                    style={[
                      styles.primaryButton,
                      styles.verifyButton,
                      isOtpComplete && styles.primaryButtonReady,
                      !isOtpComplete && styles.primaryButtonDisabled
                    ]}
                    onPressIn={() => {
                      if (!isOtpComplete || isSubmittingRef.current) {
                        return;
                      }
                      void handleVerify();
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                          style={styles.buttonSpinner}
                        />
                        <Text style={styles.primaryButtonLabel}>Verifying…</Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.primaryButtonLabel,
                          !isOtpComplete && styles.primaryButtonLabelDisabled
                        ]}
                      >
                        Verify
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.retrySection}>
                    {retriesExhausted ? (
                      <Text style={styles.retryHint}>
                        Please retry after some time
                      </Text>
                    ) : isRetryCountingDown ? (
                      <>
                        <Text style={styles.retryHint}>
                          Resend code in{' '}
                          <Text style={styles.retryHintTime}>
                            {formatRetryCountdown(retrySecondsLeft)}
                          </Text>
                        </Text>
                        <Text style={[styles.retryHint, { marginTop: 6 }]}>
                          {retriesLeft} attempt{retriesLeft === 1 ? '' : 's'} left
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.retryHint}>
                          Didn’t get the code?{' '}
                          <Text style={styles.retryHintTime}>
                            {retriesLeft} attempt{retriesLeft === 1 ? '' : 's'} left
                          </Text>
                        </Text>
                        <View style={styles.retryChannelsRow}>
                          {retryChannels.map((channel) => {
                            const meta = RETRY_CHANNEL_META[channel];
                            return (
                              <TouchableOpacity
                                key={channel}
                                activeOpacity={0.7}
                                disabled={!canRetry}
                                onPress={() => handleRetryChannel(channel)}
                                style={styles.retryChannelBtn}
                              >
                                <MaterialCommunityIcons
                                  name={meta.icon as any}
                                  size={15}
                                  color={colors.PRIMARY_BASIC}
                                />
                                <Text style={styles.retryChannelLabel}>
                                  {meta.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </>
                    )}
                  </View>
                </Animated.View>
              )}
            </KeyboardAwareScrollView>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default OtpLoginWidget;
