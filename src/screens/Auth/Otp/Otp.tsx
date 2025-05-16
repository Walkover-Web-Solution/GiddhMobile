import React from 'react';
import { connect } from 'react-redux';
import { GDContainer } from '@/core/components/container/container.component';
import { Image, View, Text, StyleSheet, Dimensions, TouchableOpacity, ToastAndroid, Platform, Alert } from 'react-native';
import style from '@/screens/Auth/Otp/style';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { GdImages } from '@/utils/icons-pack';

import colors from '@/utils/colors';
import { verifyOTP, clearOTPError, OTPScreenUnmounting } from '../Login/LoginAction';
import { sendOTP } from '../Login/LoginService';
import LoaderKit  from 'react-native-loader-kit';
import { baseColor } from '../../../utils/colors';
import TOAST from 'react-native-root-toast';
import SMSUserConsent from '../../../../SMSUserConsent';

interface SMSMessage {
  receivedOtpMessage: string
}

const { width, height } = Dimensions.get('window');
class Login extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      code: '',
      disableResendButton: false,
    };
    this.getSMSMessage()
  }

  // getSMSMessage = async () => {
  //   try {
  //     const message: SMSMessage = await SMSUserConsent.listenOTP()
  //     let messageResponse = message.receivedOtpMessage.slice(message.receivedOtpMessage.length - 5)
  //     messageResponse = messageResponse.slice(0, 4)
  //     console.log(messageResponse)
  //     await this.setState({ code: messageResponse.toString() })
  //   } catch (e) {
  //     console.log(JSON.stringify(e))
  //   }
  // }

  retrieveVerificationCode=(sms:any, codeLength:any) =>{
    const codeRegExp = new RegExp(`\\d{${codeLength}}`, 'm');
    const code = sms?.match(codeRegExp)?.[0];
    return code ?? "";
  } 

  getSMSMessage = async () => {
    try {
      const message: SMSMessage = await SMSUserConsent.listenOTP()
      let messageResponse = message.receivedOtpMessage
      console.log(messageResponse)
      var otp = this.retrieveVerificationCode(messageResponse,4)
      await this.setState({ code: otp.toString() })
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  }

  componentWillUnmount() {
    this.props.unmounting();
    this.removeSmsListener()
  }

  removeSmsListener = () => {
    try {
      SMSUserConsent.removeOTPListener()
    } catch (e) {
      // error
    }
  }

  sendOTP = async () => {
    await this.setState({ code: '', disableResendButton: true })
    let payload = await { mobileNumber: this.props.tfaDetails.contactNumber, countryCode: this.props.tfaDetails.countryCode }
    const response = await sendOTP(payload);
    if (response.status == "success") {
      if (Platform.OS == "ios") {
        await this.setState({ disableResendButton: false })
        TOAST.show(response.body, {
          duration: TOAST.durations.LONG,
          position: -140,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      } else {
        ToastAndroid.show(response.body, ToastAndroid.LONG)
        await this.setState({ disableResendButton: false })
        await this.getSMSMessage()
      }
    } else {
      await this.setState({ disableResendButton: false })
    }
  }
  render() {
    return (
      <GDContainer>
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>
          <View style={style.upperContainer}>
            <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
          </View>
          <Text style={style.heading}>Verify</Text>
          <Text style={style.message}>
            We have sent a verification code at {'\n'} <Text style={{ color: 'black' }}>{this.props.tfaDetails.contactNumber}</Text>, enter
            the code {'\n'}and click on the submit button
          </Text>
          <Text style={[style.message, { color: baseColor.PRIMARY_RED }]}>{this.props.otpVerificationError}</Text>

          <OTPInputView
            style={{ width: '65%', height: height * 0.15, color: 'red',fontFamily: 'AvenirLTStd-Book' }}
            pinCount={4}
            color={'red'}
            textContentType="oneTimeCode"
            placeholderCharacter={'*'}
            codeInputFieldStyle={'red'}
            placeholderTextColor={colors.PRIMARY_NORMAL}
            code={this.state.code} // You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
            onCodeChanged={code => {
              this.setState({ code })
              this.props.clearOTPError()
            }}
            autoFocusOnLoad
            codeInputFieldStyle={style.underlineStyleBase}
            codeInputHighlightStyle={style.underlineStyleHighLighted}
            onCodeFilled={(code) => {
              this.setState({ code })
              console.log(`Code is ${code}, you are good to go!`);
            }}
          />
          {/* <TouchableOpacity delayPressIn={0}>
            <Text style={{color: colors.PRIMARY_NORMAL, fontSize: 18}}>Resend Code</Text>
          </TouchableOpacity> */}
          <TouchableOpacity disabled={this.state.disableResendButton} onPress={() => { this.sendOTP() }} style={{ paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: this.state.disableResendButton ? colors.PRIMARY_DISABLED : colors.PRIMARY_BASIC, fontFamily: 'AvenirLTStd-Book' }}>Resend Code</Text></TouchableOpacity>
          <TouchableOpacity style={[style.submitButton, { backgroundColor: this.state.code.length == 4 ? colors.PRIMARY_BASIC : colors.PRIMARY_DISABLED }]} delayPressIn={0} onPress={() => {
            if (this.state.code.length == 4 && !this.props.isVerifyingOTP) {
              this.props.verifyOTP(this.state.code, this.props.tfaDetails.countryCode, this.props.tfaDetails.contactNumber)
            }
          }}>
            <Text style={{ color: 'white', fontSize: 18 ,fontFamily: 'AvenirLTStd-Book'}}>Submit</Text>
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
    unmounting: () => {
      dispatch(OTPScreenUnmounting());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
