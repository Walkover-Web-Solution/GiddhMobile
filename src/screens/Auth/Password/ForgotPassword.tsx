import React from 'react';
import { Text } from '@ui-kitten/components';
import { connect } from 'react-redux';
import { GDContainer } from '@/core/components/container/container.component';
import { Image, View } from 'react-native';
import { GDButton } from '@/core/components/button/button.component';
import style from '@/screens/Auth/Password/style';
// google sign in
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { ButtonSize } from '@/models/enums/button';
import { GdImages } from '@/utils/icons-pack';
import { GDRoundedInput } from '@/core/components/input/rounded-input.component';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { resetPassword } from '../Login/LoginAction';

class ForgotPassword extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      email: ''
    }
  }

  componentDidMount() {
    // initial google sign in configuration
    GoogleSignin.configure({
      webClientId: '641015054140-3cl9c3kh18vctdjlrt9c8v0vs85dorv2.apps.googleusercontent.com'
    });
  }

  _googleSignIn = async () => {
    // Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true
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
    // Remove user session from the device.
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    return (
      // <GDContainer>
        <View style={style.backgroundContainer}>
          <View style={style.loginContainer}>
            <View style={style.upperContainer}>
              <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
            </View>
            <View style={style.loginFormContainer}>
              <View>
                <Text style={style.resetHead}>Password Reset Request</Text>
                <Text style={style.resetBody}>
                  Enter your email address in the space below and we will mail you a verification code to reset the
                  password.
                </Text>
              </View>
              <View>
                <GDRoundedInput
                  onChange={(value) => this.setState({ email: value })}
                  icon="email"
                  label="Company Name"
                  value={this.state.email}
                  style={{ flex: 1 }}
                  placeholder="*************" />
                {/* <GDRoundedInput
                  onChange={(value) => this.setState({ email: value })}
                  icon=""
                  label="Password"
                  value=""
                  style ={{flex:1}}
                  placeholder="*********" /> */}
                {/* <GDRoundedInput
                  onChange={(value) => this.setState({ email: value })}
                  icon="email"
                  label="Company Name"
                  value=""
                  style ={{flex:1}}
                  placeholder="sampleaddress@mail.com" /> */}
              </View>
              <View style={style.loginButtonContainer}>
                <GDButton
                  size={ButtonSize.medium}
                  style={style.requestButtonStyle}
                  label={'Request'}
                  onPress={async () => {
                    await this.props.resetPassword({ email: this.state.email, navigation: this.props.navigation })
                  }}
                />
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}>
                  <Text style={style.loginStyle}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      // </GDContainer>
    );
  }
}

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...LoginReducer
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    resetPassword: (email) => {
      dispatch(resetPassword(email));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
