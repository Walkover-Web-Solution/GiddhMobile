import React from 'react';
import {Text} from '@ui-kitten/components';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {Image, View} from 'react-native';
import {GDButton} from '@/core/components/button/button.component';
import color from '@/utils/colors';
import style from '@/screens/Auth/Password/style';
//google sign in
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import StatusBarComponent from '@/core/components/status-bar/status-bar.component';
import {ButtonSize} from '@/models/enums/button';
import {GdImages} from '@/utils/icons-pack';
import {GDRoundedInput} from '@/core/components/input/rounded-input.component';

class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    //initial google sign in configuration
    GoogleSignin.configure({
      webClientId: '641015054140-5j1ct1gdkhrkltujn29tsomf4449d01f.apps.googleusercontent.com',
    });
  }

  _googleSignIn = async () => {
    //Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signIn();
      const getGoogleToken = await GoogleSignin.getTokens();
      this.props.googleLogin(getGoogleToken.accessToken);
    } catch (error) {
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

  render() {
    return (
      <GDContainer>
        <View>
          <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
        </View>
        <View style={style.backgroundContainer}>
          <StatusBarComponent backgroundColor={color.SECONDARY} barStyle="light-content" />

          <View style={style.loginContainer}>
            <View style={style.loginFormContainer}>
              <View>
                <Text style={style.resetHead}>Password Reset Request</Text>
                <Text style={style.resetBody}>
                  Enter your email address in the space below and we will mail you a verification code to reset the
                  password.
                </Text>
              </View>
              <View>
                <GDRoundedInput icon="email" label="Company Name" value="" placeholder="sampleaddress@mail.com" />
              </View>

              <View style={style.loginButtonContainer}>
                <GDButton size={ButtonSize.medium} style={style.requestButtonStyle} label={'Request'} />
                <Text style={style.loginStyle}>Back to Login</Text>
              </View>
            </View>
          </View>
        </View>
      </GDContainer>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.auth.isLoginInProcess,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: dispatch.auth.loginAction,
    googleLogin: dispatch.auth.googleLoginAction,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
