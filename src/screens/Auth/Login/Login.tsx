import React from 'react';
import {Text} from '@ui-kitten/components';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';

import {Image, View, TouchableOpacity, Keyboard, Platform, ScrollView} from 'react-native';
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
import {googleLogin, appleLogin, userEmailLogin} from './LoginAction';
import { appleAuth } from '@invertase/react-native-apple-authentication';

class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      keyboard: false,
      username: '',
      password: ''
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

  componentDidUpdate(prevProps) {
    if (!prevProps.startTFA && this.props.startTFA) {
      this.setState({showLoader: false});
      this.props.navigation.navigate('Otp');
    }
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  async  onAppleButtonPress() {
    // performs login request
    try{
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      // get current authentication state for user
      // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
    
      // use credentialState response to ensure the user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // user is authenticated
        this.props.appleLogin(appleAuthRequestResponse)
      }
    }
    catch(err){
      alert(err)
    }
   
  }
  _googleSignIn = async () => {
    //Prompts a modal to let the user sign in into your application.
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
     // await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
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

  signInWithUsernamePassword() {
      this.props.userLogin({username: this.state.username, password: this.state.password})
  }

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

      {Platform.OS == 'ios' && <LoginButton size={ButtonSize.medium} label={'Sign in with Apple'} style={style.appleButton} icon="apple" onPress={()=>  this.onAppleButtonPress()}/>}  
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
            <View style={{height: 10}}></View>
              <GDRoundedInput icon="email" label="Company Name" value={this.state.username} placeholder="sampleaddress@mail.com" 
              onChange={(value) =>  this.setState({username: value})}
              />
              <View style={{height: 10}}></View>
              <GDRoundedInput secureTextEntry = {true} style={{marginTop: 6}} icon="lock" label="Company Name" value={this.state.password} placeholder="********" 
                            onChange={(value) =>  this.setState({password: value})}
                            />
            </View>

            <View style={style.loginButtonContainer}>
              <GDButton
                size={ButtonSize.medium}
                style={style.loginButtonStyle}
                label={'Login'}
                onPress={() => this.signInWithUsernamePassword()}
              />
              {/* <TouchableOpacity onPress={() => alert('comming soon')}>
                <Text style={style.forgotStyle}>Forgot password?</Text>
              </TouchableOpacity> */}
            </View>
          </View>
          {/* <View style={style.troubleLoginContainer}>
            <View style={style.seperator}>
              <Text style={style.bottomTextStyle}>Trouble logging in?</Text>
              <Text style={style.bottomTextStyleLink}>Click here</Text>
            </View>
            <Text style={[style.bottomTextSeparater, style.forgotStyle]}>or</Text>
            <Text style={style.bottomTextStyleLink}>Create a new account</Text>
          </View> */}
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
              top: 0,
            }}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </View>
    );
    //}
  }
}

const mapStateToProps = (state: RootState) => {
  const {LoginReducer} = state;
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...LoginReducer,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    googleLogin: (token, email) => {
      dispatch(googleLogin(token, email));
    },
    appleLogin:(payload)=> {
      dispatch(appleLogin(payload));
    },
    userLogin:(payload)=> {
      dispatch(userEmailLogin(payload));
    }
  };
}

// const mapDispatchToProps = (dispatch: Dispatch) => {
//   return {
//     login: dispatch.auth.loginAction,
//     googleLogin: dispatch.auth.googleLoginAction,
//   };
// };

export default connect(mapStateToProps, mapDispatchToProps)(Login);