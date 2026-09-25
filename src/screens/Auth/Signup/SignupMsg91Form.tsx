import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { OTPWidget } from '@msg91comm/sendotp-react-native';
import colors from '@/utils/colors';
import { validatePhoneNumberWithRegion } from '@/utils/helper';
import {
  buildMsg91Identifier,
  getMsg91ErrorMessage,
  isMsg91VerifySuccessToken,
  isValidMsg91Email,
  Msg91WidgetConfig,
  normalizeMsg91Email,
  parsePhoneHintValue,
  ParsedPhone,
  resolveSendOtpResponse,
  RETRY_CHANNEL_TO_MSG91_CODE
} from '@/screens/Auth/Login/msg91Otp';
import DynamicOtpBoxes from '@/screens/Auth/Login/components/DynamicOtpBoxes';
import InvisibleVerifyingModal from '@/screens/Auth/Login/components/InvisibleVerifyingModal';
import {
  PhoneNumberHintErrorCodes,
  showPhoneNumberHint
} from '@/native/PhoneNumberHint';
import { SmsUserConsent } from '@/native/SmsUserConsent';
import styles from './SignupMsg91Form.styles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const softLayoutAnim = () => {
  LayoutAnimation.configureNext({
    duration: 280,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity
    },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity
    }
  });
};

type SignupMsg91FormProps = {
  config: Msg91WidgetConfig;
  busy?: boolean;
  onErrorMessage?: (message: string) => void;
  onComplete: (payload: {
    emailId: string;
    emailIdAccessToken: string;
    mobileNo: string;
    mobileNoAccessToken: string;
  }) => void;
};

type OtpBoxLength = 4 | 6 | 8;

const getFlagEmoji = (cca2: string) =>
  cca2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

/**
 * User Consent returns the full SMS. Prefer a single unambiguous OTP.
 */
const extractOtpFromSms = (message: string, otpLength: OtpBoxLength): string | null => {
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

const SignupMsg91Form: React.FC<SignupMsg91FormProps> = ({
  config,
  busy = false,
  onErrorMessage,
  onComplete
}) => {
  const otpLength = (
    config.otpLength === 4 || config.otpLength === 6 || config.otpLength === 8
      ? config.otpLength
      : 4
  ) as OtpBoxLength;

  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailReqId, setEmailReqId] = useState('');
  const [emailAccessToken, setEmailAccessToken] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  const [countryCode, setCountryCode] = useState<CountryCode>(
    config.defaultCountryCode || 'IN'
  );
  const [callingCode, setCallingCode] = useState(config.defaultCallingCode || '91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileReqId, setMobileReqId] = useState('');
  const [mobileAccessToken, setMobileAccessToken] = useState('');
  const [mobileSending, setMobileSending] = useState(false);
  const [mobileVerifying, setMobileVerifying] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isInvisibleVerifying, setIsInvisibleVerifying] = useState(false);
  const [consentedSmsMessage, setConsentedSmsMessage] = useState('');

  const smsConsentActiveRef = useRef(false);
  const smsConsentGenerationRef = useRef(0);
  const autoVerifiedSmsRef = useRef('');
  const invisibleCancelledRef = useRef(false);
  const mobileVerifyingRef = useRef(false);
  const mobileReqIdRef = useRef('');
  const completedRef = useRef(false);
  const phoneHintAttemptedRef = useRef(false);

  useEffect(() => {
    mobileVerifyingRef.current = mobileVerifying;
  }, [mobileVerifying]);

  useEffect(() => {
    mobileReqIdRef.current = mobileReqId;
  }, [mobileReqId]);

  useEffect(() => {
    if (config.defaultCountryCode) {
      setCountryCode(config.defaultCountryCode);
    }
    if (config.defaultCallingCode) {
      setCallingCode(config.defaultCallingCode);
    }
  }, [config.defaultCountryCode, config.defaultCallingCode]);

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
        console.log(
          '[SMS User Consent] Manual OTP entry remains active:',
          error?.code
        );
      });
  }, []);

  useEffect(() => {
    return () => {
      stopSmsConsent();
    };
  }, [stopSmsConsent]);

  const emailVerified = Boolean(emailAccessToken);
  const mobileVerified = Boolean(mobileAccessToken);
  const showEmailOtp = Boolean(emailReqId) && !emailVerified;
  const showMobileSection = emailVerified;
  const showMobileOtp = Boolean(mobileReqId) && !mobileVerified;

  const isEmailValid = isValidMsg91Email(email);
  const fullPhone = `+${callingCode}${mobileNumber}`;
  const isPhoneValid =
    mobileNumber.trim().length > 0 &&
    validatePhoneNumberWithRegion(fullPhone, countryCode);

  const onSelectCountry = useCallback(
    (country: Country) => {
      if (mobileVerified || mobileSending || isInvisibleVerifying) {
        return;
      }
      setCountryCode(country.cca2);
      setCallingCode(country.callingCode?.[0] ?? '91');
      setShowCountryPicker(false);
      setMobileReqId('');
      setMobileOtp('');
      stopSmsConsent();
      setConsentedSmsMessage('');
    },
    [mobileVerified, mobileSending, isInvisibleVerifying, stopSmsConsent]
  );

  const sendEmailOtp = async () => {
    if (!isEmailValid || emailSending || emailVerified || busy) {
      return;
    }
    const identifier = normalizeMsg91Email(email);
    setEmailSending(true);
    try {
      console.log('[MSG91] signup sendOTP email:', identifier);
      const response = await OTPWidget.sendOTP({ identifier });
      console.log('[MSG91] signup sendOTP email response:', response);
      const outcome = resolveSendOtpResponse(response);

      if (outcome.kind === 'invisible_success') {
        setEmailAccessToken(outcome.accessToken);
        setEmailReqId('');
        setEmailOtp('');
        onErrorMessage?.('Email verified');
        return;
      }
      if (outcome.kind === 'error') {
        onErrorMessage?.(outcome.message);
        return;
      }
      softLayoutAnim();
      setEmailReqId(outcome.reqId);
      setEmailOtp('');
      onErrorMessage?.('OTP sent to email');
    } catch (error: any) {
      onErrorMessage?.(error?.message || 'Failed to send email OTP');
    } finally {
      setEmailSending(false);
    }
  };

  const verifyEmailOtp = async (otpOverride?: string) => {
    const otp = (otpOverride ?? emailOtp).replace(/\D/g, '').slice(0, otpLength);
    if (!emailReqId || otp.length !== otpLength || emailVerifying || busy) {
      return;
    }
    setEmailVerifying(true);
    try {
      const response = await OTPWidget.verifyOTP({ reqId: emailReqId, otp });
      console.log('[MSG91] signup verify email response:', response);
      const token = isMsg91VerifySuccessToken(response);
      if (!token) {
        onErrorMessage?.(getMsg91ErrorMessage(response, 'Invalid email OTP'));
        return;
      }
      setEmailAccessToken(token);
      setEmailOtp('');
      onErrorMessage?.('Email verified');
    } catch (error: any) {
      onErrorMessage?.(error?.message || 'Failed to verify email OTP');
    } finally {
      setEmailVerifying(false);
    }
  };

  const verifyMobileOtp = useCallback(
    async (otpOverride?: string, reqIdOverride?: string) => {
      const otp = (otpOverride ?? mobileOtp).replace(/\D/g, '').slice(0, otpLength);
      const reqId = reqIdOverride || mobileReqIdRef.current;
      if (!reqId || otp.length !== otpLength || mobileVerifyingRef.current || busy) {
        return;
      }
      mobileVerifyingRef.current = true;
      setMobileVerifying(true);
      try {
        const response = await OTPWidget.verifyOTP({ reqId, otp });
        console.log('[MSG91] signup verify mobile response:', response);
        const token = isMsg91VerifySuccessToken(response);
        if (!token) {
          onErrorMessage?.(getMsg91ErrorMessage(response, 'Invalid mobile OTP'));
          return;
        }
        stopSmsConsent();
        setMobileAccessToken(token);
        setMobileOtp('');
        setMobileReqId('');
        onErrorMessage?.('Mobile verified');
      } catch (error: any) {
        onErrorMessage?.(error?.message || 'Failed to verify mobile OTP');
      } finally {
        mobileVerifyingRef.current = false;
        setMobileVerifying(false);
      }
    },
    [mobileOtp, otpLength, busy, onErrorMessage, stopSmsConsent]
  );

  const isPhoneValueValid = useCallback(
    (cc: string, number: string, region: CountryCode) => {
      const digits = String(number ?? '').replace(/\D/g, '');
      if (digits.length < 6) {
        return false;
      }
      return validatePhoneNumberWithRegion(`+${cc}${digits}`, region);
    },
    []
  );

  const resolvePhoneFromHint = useCallback(async (): Promise<ParsedPhone | null> => {
    if (Platform.OS !== 'android') {
      return null;
    }
    try {
      console.log('[PhoneNumberHint] signup requesting…');
      const phoneNumber = await showPhoneNumberHint();
      console.log('[PhoneNumberHint] signup selected:', phoneNumber);
      if (!phoneNumber) {
        return null;
      }
      return parsePhoneHintValue(
        phoneNumber,
        config.defaultCountryCode || 'IN',
        config.defaultCallingCode || '91'
      );
    } catch (error: any) {
      const code = error?.code;
      const message = String(error?.message ?? '');
      const noNumberOnDevice =
        /no phone number is found/i.test(message) || /error code:\s*16/i.test(message);

      console.log('[PhoneNumberHint] signup error:', code, message);

      if (
        code === PhoneNumberHintErrorCodes.USER_CANCELLED ||
        code === PhoneNumberHintErrorCodes.ALREADY_IN_PROGRESS ||
        code === PhoneNumberHintErrorCodes.UNSUPPORTED ||
        noNumberOnDevice
      ) {
        return null;
      }

      if (
        code === PhoneNumberHintErrorCodes.RESOLUTION_REQUIRED ||
        code === PhoneNumberHintErrorCodes.API_NOT_CONNECTED
      ) {
        onErrorMessage?.(
          'Turn on Phone number sharing in Settings → Google → All services.'
        );
      } else if (code === PhoneNumberHintErrorCodes.NETWORK_ERROR) {
        onErrorMessage?.('Network error. Enter your number manually.');
      } else if (code === PhoneNumberHintErrorCodes.SIGN_IN_REQUIRED) {
        onErrorMessage?.(
          'Sign in to your Google account, or enter the number manually.'
        );
      }

      return null;
    }
  }, [config.defaultCountryCode, config.defaultCallingCode, onErrorMessage]);

  const sendMobileOtp = useCallback(
    async (phoneOverride?: ParsedPhone) => {
      const number = phoneOverride?.mobileNumber ?? mobileNumber;
      const cc = phoneOverride?.callingCode ?? callingCode;
      const region = (phoneOverride?.countryCode ?? countryCode) as CountryCode;
      const phoneOk = isPhoneValueValid(cc, number, region);

      if (
        !emailVerified ||
        !phoneOk ||
        mobileSending ||
        mobileVerified ||
        busy ||
        isInvisibleVerifying
      ) {
        return;
      }

      if (phoneOverride) {
        setCountryCode(phoneOverride.countryCode);
        setCallingCode(phoneOverride.callingCode);
        setMobileNumber(phoneOverride.mobileNumber);
      }

      const identifier =
        phoneOverride?.identifier ?? buildMsg91Identifier(cc, number);
      // Signup always prefers invisible on Android when the widget/config allows it
      const useInvisibleUi =
        Platform.OS === 'android' && Boolean(config.invisible ?? true);

      invisibleCancelledRef.current = false;
      autoVerifiedSmsRef.current = '';
      setMobileSending(true);

      if (useInvisibleUi) {
        setIsInvisibleVerifying(true);
      }

      // Start before sendOTP so SMS / invisible-fallback is eligible.
      startSmsConsent(true);

      try {
        console.log('[MSG91] signup sendOTP mobile:', identifier);
        const response = await OTPWidget.sendOTP({ identifier });
        console.log('[MSG91] signup sendOTP mobile response:', response);

        if (invisibleCancelledRef.current) {
          return;
        }

        const outcome = resolveSendOtpResponse(response);

        if (outcome.kind === 'invisible_success') {
          stopSmsConsent();
          setIsInvisibleVerifying(false);
          setMobileAccessToken(outcome.accessToken);
          setMobileReqId('');
          setMobileOtp('');
          onErrorMessage?.('Mobile verified');
          return;
        }

        if (outcome.kind === 'error') {
          stopSmsConsent();
          setIsInvisibleVerifying(false);
          onErrorMessage?.(outcome.message);
          return;
        }

        // Invisible did not complete — continue with OTP boxes + SMS autofill
        setIsInvisibleVerifying(false);
        softLayoutAnim();
        setMobileReqId(outcome.reqId);
        setMobileOtp('');
        onErrorMessage?.('OTP sent to mobile');
      } catch (error: any) {
        if (invisibleCancelledRef.current) {
          return;
        }
        stopSmsConsent();
        setIsInvisibleVerifying(false);
        onErrorMessage?.(error?.message || 'Failed to send mobile OTP');
      } finally {
        setMobileSending(false);
      }
    },
    [
      mobileNumber,
      callingCode,
      countryCode,
      isPhoneValueValid,
      emailVerified,
      mobileSending,
      mobileVerified,
      busy,
      isInvisibleVerifying,
      config.invisible,
      startSmsConsent,
      stopSmsConsent,
      onErrorMessage
    ]
  );

  // After email is verified: Android phone hint → prefill → invisible / OTP send
  useEffect(() => {
    if (
      !emailVerified ||
      mobileVerified ||
      Platform.OS !== 'android' ||
      phoneHintAttemptedRef.current ||
      mobileReqId ||
      isInvisibleVerifying ||
      mobileSending ||
      busy
    ) {
      return;
    }
    // Don't interrupt if the user already typed a number
    if (mobileNumber.trim()) {
      return;
    }

    phoneHintAttemptedRef.current = true;

    void (async () => {
      const hinted = await resolvePhoneFromHint();
      if (!hinted) {
        return;
      }
      softLayoutAnim();
      await sendMobileOtp(hinted);
    })();
  }, [
    emailVerified,
    mobileVerified,
    mobileReqId,
    isInvisibleVerifying,
    mobileSending,
    busy,
    mobileNumber,
    resolvePhoneFromHint,
    sendMobileOtp
  ]);

  const cancelInvisibleVerify = () => {
    invisibleCancelledRef.current = true;
    setIsInvisibleVerifying(false);
    setMobileSending(false);
    if (!mobileReqIdRef.current) {
      stopSmsConsent();
    }
  };

  const retryEmailOtp = async () => {
    if (!emailReqId || emailSending || emailVerified) {
      return;
    }
    setEmailSending(true);
    try {
      const response = await OTPWidget.retryOTP({
        reqId: emailReqId,
        retryChannel: RETRY_CHANNEL_TO_MSG91_CODE.email
      });
      if (response?.type === 'error') {
        onErrorMessage?.(getMsg91ErrorMessage(response, 'Failed to resend OTP'));
        return;
      }
      setEmailOtp('');
      onErrorMessage?.('OTP resent to email');
    } catch (error: any) {
      onErrorMessage?.(error?.message || 'Failed to resend email OTP');
    } finally {
      setEmailSending(false);
    }
  };

  const retryMobileOtp = async () => {
    if (!mobileReqId || mobileSending || mobileVerified) {
      return;
    }
    setMobileSending(true);
    autoVerifiedSmsRef.current = '';
    startSmsConsent(true);
    try {
      const response = await OTPWidget.retryOTP({
        reqId: mobileReqId,
        retryChannel: RETRY_CHANNEL_TO_MSG91_CODE.sms
      });
      if (response?.type === 'error') {
        stopSmsConsent();
        onErrorMessage?.(getMsg91ErrorMessage(response, 'Failed to resend OTP'));
        return;
      }
      setMobileOtp('');
      onErrorMessage?.('OTP resent to mobile');
    } catch (error: any) {
      stopSmsConsent();
      onErrorMessage?.(error?.message || 'Failed to resend mobile OTP');
    } finally {
      setMobileSending(false);
    }
  };

  // Autofill OTP from Android SMS User Consent
  useEffect(() => {
    if (
      !consentedSmsMessage ||
      !showMobileOtp ||
      !mobileReqId ||
      mobileVerifying ||
      mobileVerified
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

    const verificationKey = `${mobileReqId}:${code}`;
    if (autoVerifiedSmsRef.current === verificationKey) {
      return;
    }
    autoVerifiedSmsRef.current = verificationKey;
    setMobileOtp(code);
    void verifyMobileOtp(code, mobileReqId);
  }, [
    consentedSmsMessage,
    showMobileOtp,
    mobileReqId,
    otpLength,
    mobileVerifying,
    mobileVerified,
    verifyMobileOtp
  ]);

  // After both tokens exist, complete signup once
  useEffect(() => {
    if (!emailAccessToken || !mobileAccessToken || busy || completedRef.current) {
      return;
    }
    const emailId = normalizeMsg91Email(email);
    const mobileNo = buildMsg91Identifier(callingCode, mobileNumber);
    if (!emailId || !mobileNo) {
      return;
    }
    completedRef.current = true;
    stopSmsConsent();
    onComplete({
      emailId,
      emailIdAccessToken: emailAccessToken,
      mobileNo,
      mobileNoAccessToken: mobileAccessToken
    });
  }, [
    emailAccessToken,
    mobileAccessToken,
    busy,
    email,
    callingCode,
    mobileNumber,
    onComplete,
    stopSmsConsent
  ]);

  const emailOtpComplete = emailOtp.replace(/\D/g, '').length === otpLength;
  const mobileOtpComplete = mobileOtp.replace(/\D/g, '').length === otpLength;

  const emailVerifyLabel = useMemo(() => {
    if (emailVerified) {
      return 'Verified';
    }
    if (emailSending) {
      return 'Sending…';
    }
    return emailReqId ? 'Resend' : 'Get OTP';
  }, [emailVerified, emailSending, emailReqId]);

  const mobileVerifyLabel = useMemo(() => {
    if (mobileVerified) {
      return 'Verified';
    }
    if (mobileSending || isInvisibleVerifying) {
      return 'Sending…';
    }
    return mobileReqId ? 'Resend' : 'Get OTP';
  }, [mobileVerified, mobileSending, isInvisibleVerifying, mobileReqId]);

  const phoneLocked =
    mobileVerified || mobileSending || isInvisibleVerifying || busy;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Email ID</Text>
      <View style={styles.row}>
        <View
          style={[styles.inputWrap, emailVerified && styles.inputWrapLocked]}
        >
          <TextInput
            style={styles.input}
            value={email}
            editable={!emailVerified && !emailSending && !busy}
            placeholder="sampleaddress@mail.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onChangeText={(text) => {
              setEmail(text);
              if (emailReqId || emailAccessToken) {
                setEmailReqId('');
                setEmailOtp('');
                setEmailAccessToken('');
              }
            }}
          />
          {emailVerified && (
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={colors.TRANSACTION_RECEIPT}
              style={styles.verifiedIcon}
            />
          )}
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={
            emailVerified ||
            emailSending ||
            busy ||
            (!emailReqId && !isEmailValid)
          }
          style={[
            styles.actionButton,
            (emailVerified ||
              emailSending ||
              (!emailReqId && !isEmailValid)) &&
              styles.actionButtonDisabled,
            emailVerified && styles.actionButtonSuccess
          ]}
          onPress={() => {
            if (emailReqId && !emailVerified) {
              void retryEmailOtp();
              return;
            }
            void sendEmailOtp();
          }}
        >
          {emailSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.actionButtonLabel}>{emailVerifyLabel}</Text>
          )}
        </TouchableOpacity>
      </View>

      {showEmailOtp && (
        <View style={styles.otpBlock}>
          <Text style={styles.otpLabel}>Enter email OTP</Text>
          <DynamicOtpBoxes
            length={otpLength}
            value={emailOtp}
            autoFocus
            onChange={(code) => {
              setEmailOtp(code);
              if (code.length === otpLength && !emailVerifying && !busy) {
                void verifyEmailOtp(code);
              }
            }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!emailOtpComplete || emailVerifying || busy}
            style={[
              styles.verifyOtpButton,
              (!emailOtpComplete || emailVerifying) && styles.actionButtonDisabled
            ]}
            onPress={() => void verifyEmailOtp()}
          >
            {emailVerifying ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.actionButtonLabel}>Verify email OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
        Mobile number
      </Text>
      {!showMobileSection && (
        <Text style={styles.hintText}>Verify email first to continue</Text>
      )}
      {showMobileSection && (
        <>
          <View style={styles.row}>
            <View
              style={[styles.phoneWrap, phoneLocked && styles.inputWrapLocked]}
            >
              <TouchableOpacity
                style={styles.countryBtn}
                activeOpacity={0.7}
                disabled={phoneLocked}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.flag}>{getFlagEmoji(countryCode)}</Text>
                <Text style={styles.dial}>+{callingCode}</Text>
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
              <TextInput
                style={[styles.input, styles.phoneInput]}
                value={mobileNumber}
                editable={!phoneLocked}
                placeholder="Mobile number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                maxLength={15}
                returnKeyType="done"
                onChangeText={(text) => {
                  setMobileNumber(text.replace(/\D/g, ''));
                  if (mobileReqId || mobileAccessToken) {
                    setMobileReqId('');
                    setMobileOtp('');
                    setMobileAccessToken('');
                    stopSmsConsent();
                    setConsentedSmsMessage('');
                  }
                }}
              />
              {mobileVerified && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.TRANSACTION_RECEIPT}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={
                mobileVerified ||
                mobileSending ||
                isInvisibleVerifying ||
                busy ||
                (!mobileReqId && !isPhoneValid)
              }
              style={[
                styles.actionButton,
                (mobileVerified ||
                  mobileSending ||
                  isInvisibleVerifying ||
                  (!mobileReqId && !isPhoneValid)) &&
                  styles.actionButtonDisabled,
                mobileVerified && styles.actionButtonSuccess
              ]}
              onPress={() => {
                if (mobileReqId && !mobileVerified) {
                  void retryMobileOtp();
                  return;
                }
                void sendMobileOtp();
              }}
            >
              {mobileSending || isInvisibleVerifying ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.actionButtonLabel}>{mobileVerifyLabel}</Text>
              )}
            </TouchableOpacity>
          </View>

          {showMobileOtp && (
            <View style={styles.otpBlock}>
              <Text style={styles.otpLabel}>Enter mobile OTP</Text>
              <DynamicOtpBoxes
                length={otpLength}
                value={mobileOtp}
                autoFocus
                onChange={(code) => {
                  setMobileOtp(code);
                  if (code.length === otpLength && !mobileVerifying && !busy) {
                    void verifyMobileOtp(code);
                  }
                }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={!mobileOtpComplete || mobileVerifying || busy}
                style={[
                  styles.verifyOtpButton,
                  (!mobileOtpComplete || mobileVerifying) &&
                    styles.actionButtonDisabled
                ]}
                onPress={() => void verifyMobileOtp()}
              >
                {mobileVerifying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.actionButtonLabel}>Verify mobile OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <InvisibleVerifyingModal
        visible={isInvisibleVerifying}
        phoneLabel={
          mobileNumber ? `+${callingCode} ${mobileNumber}` : undefined
        }
        onCancel={cancelInvisibleVerify}
      />
    </View>
  );
};

export default SignupMsg91Form;
