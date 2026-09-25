import React from 'react';
import { connect } from 'react-redux';

import { Image, View, Platform, ScrollView, ToastAndroid, Text as RNText, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginButton from '@/core/components/login-button/login-button.component';
import color from '@/utils/colors';
import style from '@/screens/Auth/Login/style';
// google sign in
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ButtonSize } from '@/models/enums/button';
import { GdImages } from '@/utils/icons-pack';
import { WEBCLIENT_ID } from '@/env.json';
// @ts-ignore
import LoaderKit  from 'react-native-loader-kit';
import { googleLogin, appleLogin, loginWithOTP } from './LoginAction';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import Messages from '@/utils/messages';
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-root-toast';
import OtpLoginWidget from '@/screens/Auth/Login/components/OtpLoginWidget';
import InvisibleVerifyingModal from '@/screens/Auth/Login/components/InvisibleVerifyingModal';
import {
  PhoneNumberHintErrorCodes,
  showPhoneNumberHint
} from '@/native/PhoneNumberHint';
import { SmsUserConsent } from '@/native/SmsUserConsent';
import { OTPWidget } from '@msg91comm/sendotp-react-native';
import GoogleColorIcon from '@/assets/images/icons/google-official.svg';
import {
  MSG91_TOKEN_AUTH,
  MSG91_WIDGET_ID,
  Msg91WidgetConfig,
  parseMsg91WidgetProcess,
  parsePhoneHintValue,
  ParsedPhone,
  resolveSendOtpResponse
} from '@/screens/Auth/Login/msg91Otp';

class Login extends React.Component<any, any> {
  invisibleCancelledRef = false;
  smsConsentGeneration = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      keyboard: false,
      isNewOtpWidgetVisible: false,
      isHintLoading: false,
      isInvisibleVerifying: false,
      forceVisibleOtp: false,
      widgetConfig: null as Msg91WidgetConfig | null,
      prefillPhone: null as ParsedPhone | null,
      otpReqId: '',
      consentedSmsMessage: '',
      autoConfirmNumber: false
    };
  }

  componentDidMount() {
    // initial google sign in configuration
    GoogleSignin.configure({
      webClientId: `${WEBCLIENT_ID}`
    });
    OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.startTFA && this.props.startTFA) {
      this.setState({ showLoader: false });
      console.log('going to otp');
      this.props.navigation.navigate('Otp');
    }
  }

  componentWillUnmount() {
    this._stopSmsConsent();
  }

  _stopSmsConsent = () => {
    this.smsConsentGeneration += 1;
    SmsUserConsent.stopListening();
  };

  _startSmsConsent = () => {
    if (!SmsUserConsent.isAvailable()) {
      return;
    }

    this._stopSmsConsent();
    const generation = this.smsConsentGeneration;
    this.setState({ consentedSmsMessage: '' });
    SmsUserConsent.listenForOtp()
      .then((result) => {
        if (generation !== this.smsConsentGeneration) {
          return;
        }
        const message = result?.receivedOtpMessage?.trim();
        if (message) {
          this.setState({ consentedSmsMessage: message });
        }
      })
      .catch((error: any) => {
        if (generation === this.smsConsentGeneration) {
          console.log(
            '[SMS User Consent] Invisible fallback keeps manual entry:',
            error?.code
          );
        }
      });
  };
  _showHintToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
      return;
    }
    Toast.show(message, {
      duration: Toast.durations.LONG,
      position: -70,
      hideOnPress: true,
      backgroundColor: '#1E90FF',
      textColor: 'white',
      opacity: 1,
      shadow: false,
      animation: true,
      containerStyle: { borderRadius: 10 }
    });
  };

  _openManualOtp = (overrides: Partial<{
    prefillPhone: ParsedPhone | null;
    forceVisibleOtp: boolean;
    otpReqId: string;
    autoConfirmNumber: boolean;
  }> = {}) => {
    this.setState({
      isNewOtpWidgetVisible: true,
      isInvisibleVerifying: false,
      ...overrides
    });
  };

  _getFallbackWidgetConfig = (): Msg91WidgetConfig => ({
    otpLength: 8,
    retryAfterSeconds: 15,
    maxRetryAttempts: 2,
    retryChannels: ['sms', 'whatsapp', 'call'],
    invisible: true,
    defaultCountryCode: 'IN',
    defaultCallingCode: '91'
  });

  _loadWidgetConfig = async (): Promise<Msg91WidgetConfig> => {
    const fallback = this._getFallbackWidgetConfig();
    try {
      await OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
      const response = await Promise.race([
        OTPWidget.getWidgetProcess(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getWidgetProcess timed out')), 12000)
        )
      ]);
      console.log('[MSG91] getWidgetProcess response:', response);

      if (!response || response?.hasError || response?.status === 'error') {
        console.warn('[MSG91] bad getWidgetProcess response, using fallback');
        this.setState({ widgetConfig: fallback });
        return fallback;
      }

      const config = parseMsg91WidgetProcess(response);
      console.log('[MSG91] parsed widget config:', config);
      this.setState({ widgetConfig: config });
      return config;
    } catch (error: any) {
      console.error('[MSG91] getWidgetProcess error:', error);
      this.setState({ widgetConfig: fallback });
      return fallback;
    }
  };

  /**
   * Invisible OTP (MSG91 docs):
   * - On mobile network, sendOTP may return access-token + invisibleVerified: true
   *   → login immediately (no verifyOTP)
   * - Otherwise message = reqId → open OTP popup for verifyOTP / retryOTP
   */
  _startInvisibleVerify = async (phone: ParsedPhone) => {
    this.invisibleCancelledRef = false;
    this.setState({
      isInvisibleVerifying: true,
      isHintLoading: false,
      isNewOtpWidgetVisible: false,
      prefillPhone: phone,
      forceVisibleOtp: false,
      otpReqId: '',
      consentedSmsMessage: '',
      autoConfirmNumber: false
    });

    // Start before sendOTP so an invisible-verification fallback SMS is eligible.
    this._startSmsConsent();
    try {
      const response = await OTPWidget.sendOTP({ identifier: phone.identifier });
      console.log('[MSG91] invisible sendOTP response:', response);

      if (this.invisibleCancelledRef) {
        return;
      }

      const outcome = resolveSendOtpResponse(response);
      this.setState({ isInvisibleVerifying: false });

      if (outcome.kind === 'invisible_success') {
        // Fully verified on mobile network — no OTP UI
        this._stopSmsConsent();
        this.props.loginWithOTP(outcome.accessToken);
        return;
      }

      if (outcome.kind === 'otp_required') {
        // Invisible did not complete — continue with verifyOTP / retryOTP
        this._openManualOtp({
          prefillPhone: phone,
          forceVisibleOtp: true,
          otpReqId: outcome.reqId,
          autoConfirmNumber: true
        });
        return;
      }

      this._showHintToast(outcome.message);
      this._stopSmsConsent();
      this._openManualOtp({
        prefillPhone: phone,
        forceVisibleOtp: true,
        otpReqId: '',
        autoConfirmNumber: false
      });
    } catch (error: any) {
      if (this.invisibleCancelledRef) {
        return;
      }
      console.error('[MSG91] invisible sendOTP error:', error);
      this._stopSmsConsent();
      this.setState({ isInvisibleVerifying: false });
      this._showHintToast(error?.message || 'Verification failed');
      this._openManualOtp({
        prefillPhone: phone,
        forceVisibleOtp: true,
        otpReqId: '',
        autoConfirmNumber: false
      });
    }
  };

  _cancelInvisibleVerify = () => {
    this.invisibleCancelledRef = true;
    this._stopSmsConsent();
    this.setState({ isInvisibleVerifying: false });
    // User cancelled invisible attempt — enter number/OTP manually
    this._openManualOtp({
      prefillPhone: this.state.prefillPhone,
      forceVisibleOtp: true,
      otpReqId: '',
      autoConfirmNumber: false
    });
  };

  /**
   * invisible=0 + number selected from hint:
   * send OTP immediately. Same response rules:
   * invisibleVerified → login; else reqId → OTP popup.
   */
  _sendOtpForSelectedNumber = async (phone: ParsedPhone) => {
    this.setState({
      isHintLoading: true,
      prefillPhone: phone,
      forceVisibleOtp: true,
      consentedSmsMessage: ''
    });

    this._startSmsConsent();
    try {
      const response = await OTPWidget.sendOTP({ identifier: phone.identifier });
      console.log('[MSG91] sendOTP (visible/hint) response:', response);

      const outcome = resolveSendOtpResponse(response);

      if (outcome.kind === 'invisible_success') {
        this._stopSmsConsent();
        this.props.loginWithOTP(outcome.accessToken);
        return;
      }

      if (outcome.kind === 'otp_required') {
        this._openManualOtp({
          prefillPhone: phone,
          forceVisibleOtp: true,
          otpReqId: outcome.reqId,
          autoConfirmNumber: true
        });
        return;
      }

      this._showHintToast(outcome.message);
      this._stopSmsConsent();
      this._openManualOtp({
        prefillPhone: phone,
        forceVisibleOtp: true,
        otpReqId: '',
        autoConfirmNumber: false
      });
    } catch (error: any) {
      this._stopSmsConsent();
      console.error('[MSG91] sendOTP (visible/hint) error:', error);
      this._showHintToast(error?.message || 'Failed to send OTP');
      this._openManualOtp({
        prefillPhone: phone,
        forceVisibleOtp: true,
        otpReqId: '',
        autoConfirmNumber: false
      });
    }
  };

  _resolveFromHint = async (config: Msg91WidgetConfig): Promise<ParsedPhone | null> => {
    if (Platform.OS !== 'android') {
      return null;
    }

    try {
      console.log('[PhoneNumberHint] requesting…');
      const phoneNumber = await showPhoneNumberHint();
      console.log('[PhoneNumberHint] Selected phone number:', phoneNumber);
      if (!phoneNumber) {
        return null;
      }
      return parsePhoneHintValue(
        phoneNumber,
        config.defaultCountryCode,
        config.defaultCallingCode
      );
    } catch (error: any) {
      const code = error?.code;
      const message = String(error?.message ?? '');
      const noNumberOnDevice =
        /no phone number is found/i.test(message) || /error code:\s*16/i.test(message);

      console.log('[PhoneNumberHint] error code:', code);
      console.log('[PhoneNumberHint] error message:', message);

      // Common / expected cases — open manual entry without noisy toasts
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
        this._showHintToast(
          'Turn on Phone number sharing in Settings → Google → All services.'
        );
      } else if (code === PhoneNumberHintErrorCodes.NETWORK_ERROR) {
        this._showHintToast('Network error. Enter your number manually.');
      } else if (code === PhoneNumberHintErrorCodes.SIGN_IN_REQUIRED) {
        this._showHintToast('Sign in to your Google account, or enter the number manually.');
      } else if (code === PhoneNumberHintErrorCodes.NO_ACTIVITY) {
        this._showHintToast('App is not ready. Please try again.');
      } else if (code === PhoneNumberHintErrorCodes.DEVELOPER_ERROR) {
        this._showHintToast('Phone hint module not ready. Enter number manually.');
      }

      return null;
    }
  };

  /**
   * 1) getWidgetProcess → otp length / retry / invisible
   * 2) Android hint for number
   * 3) Android + selected number + invisible=1 → Verifying loader only
   * 4) Otherwise normal OTP popup (manual typing never shows Verifying)
   */
  _openNewOtpLogin = async () => {
    console.log('[OTP Login New] pressed', {
      isHintLoading: this.state.isHintLoading,
      isInvisibleVerifying: this.state.isInvisibleVerifying
    });

    // Don't start a second flow while invisible verify is on screen
    if (this.state.isInvisibleVerifying) {
      return;
    }

    // Prevent overlapping taps while config/hint is in progress
    if (this.state.isHintLoading) {
      return;
    }

    this._stopSmsConsent();
    this.setState({
      isHintLoading: true,
      forceVisibleOtp: true,
      otpReqId: '',
      consentedSmsMessage: '',
      autoConfirmNumber: false,
      prefillPhone: null
    });

    try {
      const config = await this._loadWidgetConfig();
      const hinted = await this._resolveFromHint(config);
      console.log('[OTP Login New] hinted phone:', hinted);

      if (hinted) {
        // Verifying UI only: Android + user selected a number + invisible=1
        if (Platform.OS === 'android' && config.invisible) {
          await this._startInvisibleVerify(hinted);
          return;
        }
        // Selected number but invisible off → send OTP, open popup on OTP step
        await this._sendOtpForSelectedNumber(hinted);
        return;
      }

      // Manual typing: never show Verifying — normal OTP popup only
      this._openManualOtp({
        prefillPhone: null,
        forceVisibleOtp: true,
        otpReqId: '',
        autoConfirmNumber: false
      });
    } catch (error: any) {
      console.error('[OTP Login New] unexpected error:', error);
      this._showHintToast(error?.message || 'Something went wrong');
      this._openManualOtp({
        prefillPhone: null,
        forceVisibleOtp: true
      });
    } finally {
      this.setState({ isHintLoading: false });
    }
  };

  async onAppleButtonPress() {
    // performs login request
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
      });
      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
      if (appleAuthRequestResponse.email != null) {
        await AsyncStorage.setItem(STORAGE_KEYS.APPLELOGINRESPONSE, JSON.stringify(appleAuthRequestResponse))
      } else {
        let appleLoginOldResponse = await AsyncStorage.getItem(STORAGE_KEYS.APPLELOGINRESPONSE)
        if (appleLoginOldResponse != null && JSON.parse(appleLoginOldResponse).user == appleAuthRequestResponse.user) {
          appleAuthRequestResponse.email = JSON.parse(appleLoginOldResponse).email
          appleAuthRequestResponse.fullName = JSON.parse(appleLoginOldResponse).fullName
        }
      }
      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        this.props.appleLogin(appleAuthRequestResponse);
      }
    } catch (err) {
      alert(err);
    }
  }

  _googleSignIn = async () => {
    // Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true
      });
      // await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await GoogleSignin.signIn();
      this.setState({ showLoader: true });
      const getGoogleToken = await GoogleSignin.getTokens();
      const userInfo = await GoogleSignin.getCurrentUser();
      this.props.googleLogin(getGoogleToken.accessToken, userInfo.user.email);
    } catch (error) {
      this.setState({ showLoader: false });
      console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        if (Platform.OS == "ios") {
          alert(Messages.internetNotAvailable);
        } else {
          ToastAndroid.show(Messages.internetNotAvailable, ToastAndroid.LONG);
        }
        console.log('Some Other Error Happened');
      }
    }
  };

  _googleSignOut = async () => {
    // Remove user session from the device.
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  _keyboardDidShow = () => {
    this.setState({ keyboard: true });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboard: false });
  };

  render() {
    // if (this.state.showLoader) {
    //   return (
    //     <GDContainer>
    //       <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />
    //       <View style={style.alignLoader}>
    //         <Bars size={15} color={color.PRIMARY_NORMAL} />
    //       </View>
    //     </GDContainer>
    //   );
    // } else {
    return (
      <SafeAreaView style={style.loginContainer} edges={['top', 'bottom']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={style.authScreenContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View style={style.authInner}>
            <View style={style.authMain}>
              <View style={style.heroBlock}>
                <View style={style.blobSoft} pointerEvents="none" />
                <View style={style.blobAccent} pointerEvents="none" />
                <View style={style.blobDot} pointerEvents="none" />
                <View style={style.logoBubble}>
                  <View style={style.titleContainer}>
                    <Image style={style.logoStyle} source={GdImages.icons.logoSmall} />
                    <Image
                      style={style.logoTwo}
                      source={require('@/assets/images/books.png')}
                    />
                  </View>
                </View>
                <RNText style={style.welcomeTitle}>Welcome back</RNText>
                <RNText style={style.subtitle}>Login to continue</RNText>
              </View>

              <View style={style.authStack}>
                <View style={style.authButtonWrap}>
                  <LoginButton
                    size={ButtonSize.medium}
                    label={'Continue with Google'}
                    style={[style.authButton, style.googleAuthButton]}
                    labelStyle={style.googleAuthLabel}
                    onPress={this._googleSignIn}
                    iconElement={<GoogleColorIcon width={20} height={20} />}
                  />
                </View>

                {Platform.OS == 'ios' && (
                  <View style={style.authButtonWrap}>
                    <LoginButton
                      size={ButtonSize.medium}
                      label={'Continue with Apple'}
                      style={[style.authButton, style.appleAuthButton]}
                      icon="apple"
                      onPress={() => this.onAppleButtonPress()}
                    />
                  </View>
                )}

                <View style={style.orRow}>
                  <View style={style.orLine} />
                  <View style={style.orPill}>
                    <RNText style={style.orText}>or</RNText>
                  </View>
                  <View style={style.orLine} />
                </View>

                <View style={style.authButtonWrap}>
                  <LoginButton
                    size={ButtonSize.medium}
                    label={'Sign in with OTP'}
                    style={[style.authButton, style.otpAuthButton]}
                    labelStyle={style.otpAuthLabel}
                    icon="msg91"
                    onPress={this._openNewOtpLogin}
                  />
                </View>
              </View>
            </View>

            <View style={[style.signupBlock, style.authFooter]}>
              <RNText style={style.signupHint}>Don't have an account? </RNText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  this.props.navigation.replace('Signup');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <RNText style={style.signupLink}>Create an account</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {this.props.isAuthenticatingUser && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0
            }}>
            <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={color.PRIMARY_NORMAL}
            />
          </View>
        )}
        {this.state.isHintLoading && !this.state.isInvisibleVerifying && (
          <View
            pointerEvents="auto"
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              backgroundColor: 'rgba(255,255,255,0.55)',
              zIndex: 20
            }}
          >
            <LoaderKit
              style={{ width: 45, height: 45 }}
              name={'LineScale'}
              color={color.PRIMARY_NORMAL}
            />
          </View>
        )}
        <InvisibleVerifyingModal
          visible={this.state.isInvisibleVerifying}
          phoneLabel={
            this.state.prefillPhone
              ? `+${this.state.prefillPhone.callingCode} ${this.state.prefillPhone.mobileNumber}`
              : undefined
          }
          onCancel={this._cancelInvisibleVerify}
        />
        <OtpLoginWidget
          visible={this.state.isNewOtpWidgetVisible}
          onClose={() =>
            this.setState({
              isNewOtpWidgetVisible: false,
              otpReqId: '',
              consentedSmsMessage: '',
              autoConfirmNumber: false
            })
          }
          otpLength={this.state.widgetConfig?.otpLength ?? 8}
          retryAfterSeconds={this.state.widgetConfig?.retryAfterSeconds ?? 15}
          retryChannels={this.state.widgetConfig?.retryChannels ?? ['sms', 'call', 'whatsapp']}
          maxRetryAttempts={this.state.widgetConfig?.maxRetryAttempts ?? 2}
          initialMobileNumber={this.state.prefillPhone?.mobileNumber ?? ''}
          initialCountryCode={
            this.state.prefillPhone?.countryCode ??
            this.state.widgetConfig?.defaultCountryCode ??
            'IN'
          }
          initialCallingCode={
            this.state.prefillPhone?.callingCode ??
            this.state.widgetConfig?.defaultCallingCode ??
            '91'
          }
          initialReqId={this.state.otpReqId}
          initialSmsMessage={this.state.consentedSmsMessage}
          autoConfirmNumber={this.state.autoConfirmNumber}
          onVerified={(payload) => {
            this.setState({ isNewOtpWidgetVisible: false });
            this.props.loginWithOTP(payload.accessToken);
          }}
          onErrorMessage={(message) => this._showHintToast(message)}
        />
      </SafeAreaView>
    );
    // }
  }
}

const mapStateToProps = (state: RootState) => {
  const { LoginReducer } = state;
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...LoginReducer
  };
};

function mapDispatchToProps(dispatch) {
  return {
    googleLogin: (token, email) => {
      dispatch(googleLogin(token, email));
    },
    appleLogin: (payload) => {
      dispatch(appleLogin(payload));
    },
    loginWithOTP: (accessToken) => {
      dispatch(loginWithOTP(accessToken))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
