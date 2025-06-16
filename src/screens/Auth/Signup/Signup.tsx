import React from 'react';
import { Text } from '@ui-kitten/components';
import { connect } from 'react-redux';

import { Image, View, Keyboard, Platform, ScrollView, ToastAndroid, TouchableOpacity, Dimensions } from 'react-native';
import { GDButton } from '@/core/components/button/button.component';
import LoginButton from '@/core/components/login-button/login-button.component';
import style from '@/screens/Auth/Login/style';
import { GDRoundedInput } from '@/core/components/input/rounded-input.component';
// google sign in
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ButtonSize } from '@/models/enums/button';
import { GdImages } from '@/utils/icons-pack';
import { WEBCLIENT_ID } from '@/env.json';
// @ts-ignore
import LoaderKit  from 'react-native-loader-kit';
import { googleLogin, appleLogin, userEmailSignup, verifySignupOTP } from '../Login/LoginAction';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import Messages from '@/utils/messages';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import colors from '@/utils/colors';
import { STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Routes from '@/navigation/routes';

class Signup extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      keyboard: false,
      username: '',
      password: '',
      otpSent: false,
      code: ""
    };
  }

  componentDidMount() {
    // initial google sign in configuration
    GoogleSignin.configure({
      webClientId: `${WEBCLIENT_ID}`
    });
  }

  componentDidUpdate(prevProps) {
    // if (!prevProps.startTFA && this.props.startTFA) {
    //   this.setState({ showLoader: false });
    //   console.log('going to otp');
    //   this.props.navigation.navigate('Otp');
    // }
  }

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

  async signUpWithUsernamePassword() {
    Keyboard.dismiss();
    await this.props.userSignupSentOTP({ email: this.state.username, password: this.state.password });
    // Send otp
    setTimeout(() => {
      if (this.props.signUpOTPSent) {
        this.setState({ otpSent: true });
      }
    }, 1000)
  }

  async verifyOTP() {
    if (this.state.code.length !== 8) {
      alert("Please enter valid verification code");
      return
    }
    await this.props.verifySignupOTP({ email: this.state.username, verificationCode: this.state.code })
  }

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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={style.loginContainer}
        contentContainerStyle={style.verticalCenter}
      >
        <View style={[style.socialLoginContainer, { marginTop: this.state.keyboard ? 10 : 50 }]}>
          <View style={style.titleContainer}>
            <Text style={style.loginTextStyle}>Signup to </Text>
            <Image style={style.logoStyle} source={GdImages.icons.logoSmall} />
            <Image style={style.logoTwo} source={require('@/assets/images/books.png')} />
          </View>

          <LoginButton
            size={ButtonSize.medium}
            label={'Signup with Google'}
            style={[style.gmailButton, { marginTop: this.state.keyboard ? 15 : 30 }]}
            onPress={this._googleSignIn}
            icon="gmail"
          />

          {Platform.OS == 'ios' && (
            <LoginButton
              size={ButtonSize.medium}
              label={'Signup with Apple'}
              style={style.appleButton}
              icon="apple"
              onPress={() => this.onAppleButtonPress()}
            />
          )}
        </View>

        <View style={style.seperator}>
          <Text style={style.forgotStyle}>or</Text>
          <View style={style.horizontalRule} />
        </View>

        {!this.state.otpSent ? <View style={[style.loginFormContainer, { marginTop: this.state.keyboard ? 10 : 30 }]}>
          <View>
            <Text style={style.registerStyle}>Email ID</Text>
          </View>

          <View style={style.formInput}>
            <View style={{ height: 10 }}></View>
            <GDRoundedInput
              icon="email"
              label="Company Name"
              value={this.state.username}
              placeholder="sampleaddress@mail.com"
              onChange={(value) => this.setState({ username: value })}
            />
            <View style={{ height: 10 }}></View>
            <GDRoundedInput
              secureTextEntry={true}
              style={{ marginTop: 6 }}
              icon="lock"
              label="Company Name"
              value={this.state.password}
              placeholder="********"
              onChange={(value) => this.setState({ password: value })}
            />
          </View>

          <View style={[style.loginButtonContainer, { flexDirection: "row", justifyContent: "space-between" }]}>
            <GDButton
              size={ButtonSize.medium}
              style={style.loginButtonStyle}
              label={'Signup'}
              onPress={() => this.signUpWithUsernamePassword()}
            />
            {/* <TouchableOpacity style={{ justifyContent: "flex-start", alignItems: "flex-start", width: "40%" }} onPress={() => {
              this.signUpWithUsernamePassword();
            }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'AvenirLTStd-Book',
                  color: colors.PRIMARY_NORMAL,
                }}>Resend Code</Text>
            </TouchableOpacity> */}
          </View>
        </View> :
          <View style={[style.loginFormContainer, { marginTop: this.state.keyboard ? 10 : 30 }]}>
            <Text style={style.registerStyle}>Verify Email ID</Text>
            <OTPInputView
              style={{ width: '100%', height: Dimensions.get('screen').height * 0.13 }}
              pinCount={8}
              color={'red'}
              placeholderCharacter={'*'}
              codeInputFieldStyle={'red'}
              placeholderTextColor={colors.PRIMARY_NORMAL}
              code={this.state.code} // You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              onCodeChanged={code => {
                this.setState({ code })
              }}
              autoFocusOnLoad
              codeInputFieldStyle={style.underlineStyleBase}
              codeInputHighlightStyle={style.underlineStyleHighLighted}
              onCodeFilled={(code) => {
                this.setState({ code })
                console.log(`Code is ${code}, you are good to go!`);
              }}
            />
            <View style={[style.loginButtonContainer, { flexDirection: "row", justifyContent: "space-between" }]}>
              <GDButton
                size={ButtonSize.medium}
                style={style.loginButtonStyle}
                label={'Verify Email '}
                onPress={() => this.verifyOTP()}
              />
              <TouchableOpacity style={{ justifyContent: "flex-start", alignItems: "flex-start", width: "40%" }} onPress={() => {
                this.signUpWithUsernamePassword()
              }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'AvenirLTStd-Book',
                    color: colors.PRIMARY_NORMAL,
                  }}>Resend Code</Text>
              </TouchableOpacity>
            </View>
          </View>}
        <View style={[style.loginButtonContainer, { flexDirection: "row", marginTop: 40, justifyContent: "flex-start" }]}>
          <Text style={{ fontFamily: 'AvenirLTStd-Book' }}>Already have an account?  </Text>
          <TouchableOpacity style={{}} onPress={() => {
            this.props.navigation.navigate(Routes.Login);
          }}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'AvenirLTStd-Book',
                color: colors.PRIMARY_NORMAL,
                textDecorationLine: 'underline',
              }}>Login</Text>
          </TouchableOpacity>
        </View>
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
                color={colors.PRIMARY_NORMAL}
            />
          </View>
        )}
      </ScrollView>
    );
    // }
  }
}

const mapStateToProps = (state: RootState) => {
  const { LoginReducer } = state;
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    signUpOTPSent: state.LoginReducer.signUpOTPSent,
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
    userSignupSentOTP: (payload) => {
      dispatch(userEmailSignup(payload));
    },
    verifySignupOTP: (payload) => {
      dispatch(verifySignupOTP(payload));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
