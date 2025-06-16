import React from 'react';
import { connect } from 'react-redux';
import { Image, View, Text, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import style from '@/screens/Auth/Otp/style';
import { GdImages } from '@/utils/icons-pack';

import colors from '@/utils/colors';
import { resetPassword, setNewPassword } from '../Login/LoginAction';
import LoaderKit  from 'react-native-loader-kit';

const { width, height } = Dimensions.get('window');
class ResetPassword extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
      code: '',
      newPass: ''
    };
  }

  render() {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white' }}>
            <View style={style.upperContainer}>
              <Image style={style.logoStyle} source={GdImages.icons.logoGiddh} />
            </View>
            <Text style={style.heading}>Verify</Text>
            <Text style={style.message}>
              We have sent a verification code at {'\n'} {this.props.route?.params?.email}, enter
              the code {'\n'}and click on the submit button
            </Text>
            <Text style={[style.message, { color: "#000000", marginTop: 10 }]}>
              {/* {"Enter verification code"} */}
            </Text>
            <TextInput
              autoFocus
              placeholder={"Verification Code"}
              style={{ width: '80%', borderRadius: 10, borderColor: "grey", borderWidth: 0.5, padding: 10, textAlign: "center", fontFamily: 'AvenirLTStd-Book' }}
              keyboardType={"number-pad"}
              value={this.state.code}
              onChangeText={(code) => {
                this.setState({ code })
                console.log(`Code is ${code}, you are good to go!`);
              }}
            />
            <Text style={[style.message, { color: "#000000", marginTop: 5 }]}>
              {/* {"Enter new password"} */}
            </Text>
            <TextInput
              placeholder={"New Password"}
              secureTextEntry={true}
              value={this.state.newPass}
              onChangeText={(newPass) => {
                this.setState({ newPass })
                console.log(`New Password is ${newPass}, you are good to go!`);
              }}
              style={{ width: '80%', borderRadius: 10, borderColor: "grey", borderWidth: 0.5, padding: 10, textAlign: "center", fontFamily: 'AvenirLTStd-Book' }}
            />

            <TouchableOpacity onPress={() => {
              this.setState({ code: "", newPass: "" })
              this.props.resetPassword({ email: this.props.route?.params?.email })
            }} delayPressIn={0} style={{ marginTop: 30 }}>
              <Text style={{ color: colors.PRIMARY_NORMAL, fontSize: 16, fontFamily: 'AvenirLTStd-Book' }}>Resend Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[style.submitButton, { backgroundColor: this.state.code.length == 8 && this.state.newPass.length != 0 ? colors.PRIMARY_BASIC : colors.PRIMARY_DISABLED }]} delayPressIn={0} onPress={() => {
              if (this.state.code.length == 8 && !this.props.isVerifyingOTP) {
                this.props.setNewPassword({ navigation: this.props.navigation, data: { "uniqueKey": this.props.route?.params?.email, "verificationCode": this.state.code, "newPassword": this.state.newPass } })
              }
            }}>
              <Text style={{ color: 'white', fontSize: 18, fontFamily: 'AvenirLTStd-Book' }}>Submit</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', marginTop: height * 0.17,alignItems:"flex-start",flex:1 }}>
              <Text style={{ fontSize: 16, fontFamily: 'AvenirLTStd-Book' }}>Entered wrong E-mail ID ?</Text>
              <TouchableOpacity delayPressIn={0}
                onPress={() => this.props.navigation.goBack()}
              >
                <Text style={{ fontSize: 16, color: colors.PRIMARY_NORMAL, marginLeft: 5, fontFamily: 'AvenirLTStd-Book' }}>Click here</Text>
              </TouchableOpacity>
            </View>
            {this.props.isVerifyingOTP && <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
              <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={colors.PRIMARY_NORMAL}
            />
            </View>}
          </View>
        </ScrollView>
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
    setNewPassword: (data) => {
      dispatch(setNewPassword(data));
    },
    resetPassword: (email) => {
      dispatch(resetPassword(email));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
