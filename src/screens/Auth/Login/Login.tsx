import React from 'react';
import {Text} from '@ui-kitten/components';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';

import {Image, View, TouchableOpacity, Keyboard} from 'react-native';
import {GDButton} from '@/core/components/button/button.component';
import LoginButton from '@/core/components/login-button/login-button.component';
import color from '@/utils/colors';
import style from '@/screens/Auth/Login/style';
import {GDRoundedInput} from '@/core/components/input/rounded-input.component';
//google sign in
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import {ButtonSize} from '@/models/enums/button';
import {GdImages} from '@/utils/icons-pack';
import {WEBCLIENT_ID} from '@/env.json';
// @ts-ignore
import {Bars} from 'react-native-loader';
import {googleLogin} from './LoginAction';

class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      keyboard: false,
    };
  }

  componentDidMount() {
    //initial google sign in configuration
    GoogleSignin.configure({
      webClientId: `${WEBCLIENT_ID}`,
    });
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _googleSignIn = async () => {
    //Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signIn();
      this.setState({showLoader: true});
      const getGoogleToken = await GoogleSignin.getTokens();
      const userInfo = await GoogleSignin.getCurrentUser();
      this.props.googleLogin(getGoogleToken.accessToken, userInfo.user.email);
    } catch (error) {
      this.setState({showLoader: false});
      console.log('Message', error.message);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };

  _googleSignOut = async () => {
    //Remove user session from the device.
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  _keyboardDidShow = () => {
    this.setState({keyboard: true});
  };

  _keyboardDidHide = () => {
    this.setState({keyboard: false});
  };

  render() {
    if (this.state.showLoader) {
      return (
        <GDContainer>
          <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />
          <View style={style.alignLoader}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        </GDContainer>
      );
    } else {
      return (
        <View style={style.loginContainer}>
          <View style={[style.socialLoginContainer, {marginTop: this.state.keyboard ? 10 : 50}]}>
            <View style={style.titleContainer}>
              <Text style={style.loginTextStyle}>Login to </Text>
              <Image style={style.logoStyle} source={GdImages.icons.logoSmall} />
            </View>

            <LoginButton
              size={ButtonSize.medium}
              label={'Sign in with Google'}
              style={[style.gmailButton, {marginTop: this.state.keyboard ? 15 : 30}]}
              onPress={this._googleSignIn}
              icon="gmail"
            />

            <LoginButton size={ButtonSize.medium} label={'Sign in with apple'} style={style.appleButton} icon="apple" onPress={()=>  alert('comming soon')}/>
          </View>

          <View style={style.seperator}>
            <Text style={style.forgotStyle}>or</Text>
            <View style={style.horizontalRule} />
          </View>

          <View style={[style.loginFormContainer, {marginTop: this.state.keyboard ? 10 : 30}]}>
            <View>
              <Text style={style.registerStyle}>Registered Email ID</Text>
            </View>

            <View style={style.formInput}>
              <GDRoundedInput icon="email" label="Company Name" value="" placeholder="sampleaddress@mail.com" />
              <GDRoundedInput icon="lock" label="Company Name" value="" placeholder="********" />
            </View>

            <View style={style.loginButtonContainer}>
              <GDButton size={ButtonSize.medium} style={style.loginButtonStyle} label={'Login'} onPress={()=>  alert('comming soon')}/>
              <TouchableOpacity onPress={() => alert('comming soon')}>
                <Text style={style.forgotStyle}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={style.troubleLoginContainer}>
            <View style={style.seperator}>
              <Text style={style.bottomTextStyle}>Trouble logging in?</Text>
              <Text style={style.bottomTextStyleLink}>Click here</Text>
            </View>
            <Text style={[style.bottomTextSeparater, style.forgotStyle]}>or</Text>
            <Text style={style.bottomTextStyleLink}>Create a new account</Text>
          </View>
        </View>
      );
    }
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    googleLogin: (token, email) => {
      dispatch(googleLogin(token, email));
    },
  };
}

// const mapDispatchToProps = (dispatch: Dispatch) => {
//   return {
//     login: dispatch.auth.loginAction,
//     googleLogin: dispatch.auth.googleLoginAction,
//   };
// };

export default connect(mapStateToProps, mapDispatchToProps)(Login);
