import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {Image, View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import color from '@/utils/colors';
import style from '@/screens/Auth/Otp/style';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {GdImages} from '@/utils/icons-pack';

import colors from '@/utils/colors';

const {width, height} = Dimensions.get('window');
class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
    };
  }

  render() {
    return (
      <GDContainer>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View style={style.upperContainer}>
            <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
          </View>
          <Text style={style.heading}>Reset your password</Text>
          <Text style={style.message}>
            We have sent a verification code at {'\n'} <Text style={{color: 'black'}}>shubhendra@giddh.com</Text>,enter
            the code {'\n'}and click on the submit button
          </Text>
          <OTPInputView
            style={{width: '65%', height: height * 0.15}}
            pinCount={4}
            placeholderCharacter={'*'}
            placeholderTextColor={colors.PRIMARY_NORMAL}
            // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
            // onCodeChanged = {code => { this.setState({code})}}
            autoFocusOnLoad
            codeInputFieldStyle={style.underlineStyleBase}
            codeInputHighlightStyle={style.underlineStyleHighLighted}
            onCodeFilled={(code) => {
              console.log(`Code is ${code}, you are good to go!`);
            }}
          />
          <TouchableOpacity delayPressIn={0}>
            <Text style={{color: colors.PRIMARY_NORMAL, fontSize: 18}}>Resend Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.submitButton} delayPressIn={0}>
            <Text style={{color: 'white', fontSize: 18}}>Submit</Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', position: 'absolute', bottom: 20}}>
            <Text style={{fontSize: 18}}>Entered wrong E-mail ID ?</Text>
            <TouchableOpacity delayPressIn={0}>
              <Text style={{fontSize: 18, color: colors.PRIMARY_NORMAL, marginLeft: 5}}>Click here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GDContainer>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    login: dispatch.auth.loginAction,
    googleLogin: dispatch.auth.googleLoginAction,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
