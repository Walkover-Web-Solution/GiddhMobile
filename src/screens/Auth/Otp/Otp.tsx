import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDContainer} from '@/core/components/container/container.component';
import {Image, View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import style from '@/screens/Auth/Otp/style';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {GdImages} from '@/utils/icons-pack';

import colors from '@/utils/colors';
import {verifyOTP, clearOTPError} from '../Login/LoginAction';
import { Bars } from 'react-native-loader';
import { baseColor } from '../../../utils/colors';

const {width, height} = Dimensions.get('window');
class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      code: ''
    };
  }

  render() {
    return (
      <GDContainer>
        <View style={{flex: 1, alignItems: 'center', backgroundColor: 'white'}}>
          <View style={style.upperContainer}>
            <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
          </View>
          <Text style={style.heading}>Verify</Text>
          <Text style={style.message}>
            We have sent a verification code at {'\n'} <Text style={{color: 'black'}}>{this.props.tfaDetails.contactNumber}</Text>, enter
            the code {'\n'}and click on the submit button
          </Text>
          <Text style={[style.message, {color:baseColor.PRIMARY_RED}]}>{this.props.otpVerificationError}</Text>

          <OTPInputView
            style={{width: '65%', height: height * 0.15, color: 'red'}}
            pinCount={4}
            color={'red'}
            placeholderCharacter={'*'}
            codeInputFieldStyle ={'red'}
            placeholderTextColor={colors.PRIMARY_NORMAL}
            code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
            onCodeChanged = {code => { 
              this.setState({code})
              this.props.clearOTPError()
            }}
            autoFocusOnLoad
            codeInputFieldStyle={style.underlineStyleBase}
            codeInputHighlightStyle={style.underlineStyleHighLighted}
            onCodeFilled={(code) => {
              this.setState({code})
              console.log(`Code is ${code}, you are good to go!`);
            }}
          />
          {/* <TouchableOpacity delayPressIn={0}>
            <Text style={{color: colors.PRIMARY_NORMAL, fontSize: 18}}>Resend Code</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={[style.submitButton, {backgroundColor: this.state.code.length == 4 ? colors.PRIMARY_BASIC : colors.PRIMARY_DISABLED}]} delayPressIn={0} onPress={()=> {
            if (this.state.code.length == 4 ){
              this.props.verifyOTP(this.state.code, this.props.tfaDetails.countryCode, this.props.tfaDetails.contactNumber)
            }
          }}>
            <Text style={{color: 'white', fontSize: 18}}>Submit</Text>
          </TouchableOpacity>
          {/* <View style={{flexDirection: 'row', position: 'absolute', bottom: 20}}>
            <Text style={{fontSize: 18}}>Entered wrong E-mail ID ?</Text>
            <TouchableOpacity delayPressIn={0}>
              <Text style={{fontSize: 18, color: colors.PRIMARY_NORMAL, marginLeft: 5}}>Click here</Text>
            </TouchableOpacity>
          </View> */}
           {this.props.isVerifyingOTP && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>}
        </View>
       
      </GDContainer>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state: RootState) => {
  const { LoginReducer } = state;
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...LoginReducer
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    verifyOTP: (otp, countryCode, mobileNumber) => {
      dispatch(verifyOTP(otp, countryCode, mobileNumber));
    },
    clearOTPError: () => {
      dispatch(clearOTPError());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
