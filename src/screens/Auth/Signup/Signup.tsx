import React from 'react';
import { connect } from 'react-redux';

import {
  Image,
  View,
  Platform,
  ToastAndroid,
  TouchableOpacity,
  Text as RNText
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import LoginButton from '@/core/components/login-button/login-button.component';
import style from '@/screens/Auth/Login/style';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ButtonSize } from '@/models/enums/button';
import { GdImages } from '@/utils/icons-pack';
import { WEBCLIENT_ID } from '@/env.json';
// @ts-ignore
import LoaderKit from 'react-native-loader-kit';
import { googleLogin, appleLogin, registerWithMsg91 } from '../Login/LoginAction';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import Messages from '@/utils/messages';
import colors from '@/utils/colors';
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Routes from '@/navigation/routes';
import Toast from 'react-native-root-toast';
import { OTPWidget } from '@msg91comm/sendotp-react-native';
import {
  MSG91_TOKEN_AUTH,
  MSG91_WIDGET_ID,
  Msg91WidgetConfig,
  parseMsg91WidgetProcess
} from '@/screens/Auth/Login/msg91Otp';
import SignupMsg91Form from './SignupMsg91Form';
import GoogleColorIcon from '@/assets/images/icons/google-official.svg';

class Signup extends React.Component<any, any> {
  registerStartedRef = false;

  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      keyboard: false,
      widgetConfig: null as Msg91WidgetConfig | null
    };
  }

  componentDidMount() {
    GoogleSignin.configure({
      webClientId: `${WEBCLIENT_ID}`
    });
    OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
    this._loadWidgetConfig();
  }

  _getFallbackWidgetConfig = (): Msg91WidgetConfig => ({
    otpLength: 4,
    retryAfterSeconds: 15,
    maxRetryAttempts: 2,
    retryChannels: ['sms', 'call', 'whatsapp', 'email'],
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
      console.log('[MSG91] signup getWidgetProcess:', response);

      if (!response || response?.hasError || response?.status === 'error') {
        this.setState({ widgetConfig: fallback });
        return fallback;
      }

      const config = {
        ...parseMsg91WidgetProcess(response),
        // Signup always enables invisible OTP + phone hint on Android
        invisible: true
      };
      this.setState({ widgetConfig: config });
      return config;
    } catch (error: any) {
      console.error('[MSG91] signup getWidgetProcess error:', error);
      this.setState({ widgetConfig: fallback });
      return fallback;
    }
  };

  _showToast = (message: string) => {
    if (!message) {
      return;
    }
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
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
    }
  };

  async onAppleButtonPress() {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
      });
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );
      if (appleAuthRequestResponse.email != null) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.APPLELOGINRESPONSE,
          JSON.stringify(appleAuthRequestResponse)
        );
      } else {
        let appleLoginOldResponse = await AsyncStorage.getItem(
          STORAGE_KEYS.APPLELOGINRESPONSE
        );
        if (
          appleLoginOldResponse != null &&
          JSON.parse(appleLoginOldResponse).user == appleAuthRequestResponse.user
        ) {
          appleAuthRequestResponse.email = JSON.parse(appleLoginOldResponse).email;
          appleAuthRequestResponse.fullName = JSON.parse(
            appleLoginOldResponse
          ).fullName;
        }
      }
      if (credentialState === appleAuth.State.AUTHORIZED) {
        this.props.appleLogin(appleAuthRequestResponse);
      }
    } catch (err) {
      alert(err);
    }
  }

  _googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true
      });
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
        if (Platform.OS == 'ios') {
          alert(Messages.internetNotAvailable);
        } else {
          ToastAndroid.show(Messages.internetNotAvailable, ToastAndroid.LONG);
        }
        console.log('Some Other Error Happened');
      }
    }
  };

  _onSignupComplete = (payload: {
    emailId: string;
    emailIdAccessToken: string;
    mobileNo: string;
    mobileNoAccessToken: string;
  }) => {
    if (this.registerStartedRef || this.props.isAuthenticatingUser) {
      return;
    }
    this.registerStartedRef = true;
    this.props.registerWithMsg91({
      emailId: payload.emailId,
      emailIdAccessToken: payload.emailIdAccessToken,
      emailIdAuthType: 'giddh',
      mobileNo: payload.mobileNo,
      mobileNoAccessToken: payload.mobileNoAccessToken
    });
  };

  render() {
    const config = this.state.widgetConfig || this._getFallbackWidgetConfig();

    return (
      <SafeAreaView style={style.loginContainer} edges={['top', 'bottom']}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={style.authScreenContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bottomOffset={28}
          extraKeyboardSpace={12}
          disableScrollOnKeyboardHide
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
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
                <RNText style={style.welcomeTitle}>Create account</RNText>
                <RNText style={style.subtitle}>Sign up to continue</RNText>
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

                <SignupMsg91Form
                  config={config}
                  busy={Boolean(this.props.isAuthenticatingUser)}
                  onErrorMessage={this._showToast}
                  onComplete={this._onSignupComplete}
                />
              </View>
            </View>

            <View style={[style.signupBlock, style.authFooter]}>
              <RNText style={style.signupHint}>Already have an account? </RNText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  this.props.navigation.replace(Routes.Login);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <RNText style={style.signupLink}>Login</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>

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
            }}
          >
            <LoaderKit
              style={{ width: 45, height: 45 }}
              name={'LineScale'}
              color={colors.PRIMARY_NORMAL}
            />
          </View>
        )}
      </SafeAreaView>
    );
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
    registerWithMsg91: (payload) => {
      dispatch(registerWithMsg91(payload));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
