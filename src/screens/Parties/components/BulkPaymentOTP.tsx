import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    View,
    TouchableOpacity,
    Dimensions,
    Text,
    StatusBar, StyleSheet, ToastAndroid, Platform, Alert, SafeAreaView
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from '@/core/components/custom-icon/custom-icon';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import getSymbolFromCurrency from 'currency-symbol-map';
import TOAST from 'react-native-root-toast';
import { PaymentServices } from '@/core/services/payment/payment';
import { Bars } from 'react-native-loader';
import SMSUserConsent from '../../../../SMSUserConsent';

interface SMSMessage {
    receivedOtpMessage: string
}

class BulkPaymentOTP extends React.Component {
    constructor(props: Props) {
        super(props)
        this.getSMSMessage()
    }

    totalAmount = () => {
        // for now using indian currency but change it in next update. 
        let totalAmount = 0
        for (var key in this.props.route.params.totalAmountAndReviews) {
            let amount = Number(this.props.route.params.totalAmountAndReviews[key].totalAmount.replace(/₹/g, '').replace(/,/g, ''))
            totalAmount = totalAmount + amount
        }
        return totalAmount
    }
    state = {
        selectedItems: this.props.route.params.selectedItems,
        totalAmount: this.totalAmount(),
        code: '',
        disableResendButton: false,
        requestIdOTP: this.props.route.params.requestIdOTP,
        OTPMessage: this.props.route.params.OTPMessage,
        paymentProcessing: false
    }

    componentDidMount() {

    }

    FocusAwareStatusBar = (isFocused: any) => {
        return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
    };

    numberWithCommas = (x) => {
        if (x == null) {
            return "0";
        }
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

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
            var otp = this.retrieveVerificationCode(messageResponse,6)
            await this.setState({ code: otp.toString() })
        } catch (e) {
            console.log(JSON.stringify(e))
        }
    }

    componentWillUnmount() {
        this.removeSmsListener()
    }

    removeSmsListener = () => {
        try {
            SMSUserConsent.removeOTPListener()
        } catch (e) {
            console.log(e)
        }
    }


    resendOTP = async () => {
        // Resend OTP
        try {
            await this.setState({ code: '', disableResendButton: true })
            let totalAmountAndReviews = { ...this.props.route.params.totalAmountAndReviews }
            let bankPaymentTransactions = []
            let totalAmount = 0
            for (var key in totalAmountAndReviews) {
                let amount = totalAmountAndReviews[key].totalAmount.replace(/₹/g, '').replace(/,/g, '')
                let review = totalAmountAndReviews[key].remark
                totalAmount = totalAmount + Number(amount)
                await bankPaymentTransactions.push({
                    amount: Number(amount),
                    remarks: review, vendorUniqueName: key
                })
            }
            const payload = {
                bankName: this.props.route.params.bankAccounts[0].bankName,
                urn: this.props.route.params.selectedPayor.urn,
                uniqueName: this.props.route.params.bankAccounts[0].uniqueName,
                totalAmount: totalAmount,
                bankPaymentTransactions: bankPaymentTransactions
            }
            console.log("Send OTP request " + JSON.stringify(payload))
            const response = await PaymentServices.sendOTP(payload)
            console.log("OTP response" + JSON.stringify(response))
            if (response.status == "success") {
                if (Platform.OS == "ios") {
                    TOAST.show(response.body.message, {
                        duration: TOAST.durations.LONG,
                        position: -150,
                        hideOnPress: true,
                        backgroundColor: "#1E90FF",
                        textColor: "white",
                        opacity: 1,
                        shadow: false,
                        animation: true,
                        containerStyle: { borderRadius: 10 }
                    });
                    this.setState({ disableResendButton: false, requestIdOTP: response.body.requestId, OTPMessage: response.body.message })
                } else {
                    ToastAndroid.show(response.body.message, ToastAndroid.LONG)
                    this.setState({ disableResendButton: false, requestIdOTP: response.body.requestId, OTPMessage: response.body.message })
                    await this.getSMSMessage()
                }
            } else {
                await this.setState({ disableResendButton: false })
                if (Platform.OS == "ios") {
                    TOAST.show(response.data.message, {
                        duration: TOAST.durations.LONG,
                        position: -150,
                        hideOnPress: true,
                        backgroundColor: "#1E90FF",
                        textColor: "white",
                        opacity: 1,
                        shadow: false,
                        animation: true,
                        containerStyle: { borderRadius: 10 }
                    });
                } else {
                    ToastAndroid.show(response.data.message, ToastAndroid.LONG)
                }
            }
        } catch (e) {
            this.setState({ disableResendButton: false })
            if (Platform.OS == "ios") {
                TOAST.show("Error - Please try again", {
                    duration: TOAST.durations.LONG,
                    position: -150,
                    hideOnPress: true,
                    backgroundColor: "#1E90FF",
                    textColor: "white",
                    opacity: 1,
                    shadow: false,
                    animation: true,
                    containerStyle: { borderRadius: 10 }
                });
            } else {
                ToastAndroid.show("Error - Please try again", ToastAndroid.LONG)
            }
            console.log("Error in sending OTP " + JSON.stringify(e))
        }
    }

    onSubmit = async () => {
        if (this.state.code.length != 6) {
            Alert.alert("Missing Fields", "Enter complete OTP",
                [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
            return
        }
        // Confirm Payment
        try {
            await this.setState({ paymentProcessing: true })
            const payload = { requestId: this.state.requestIdOTP, otp: this.state.code }
            console.log("Payment payload " + JSON.stringify(payload))
            const response = await PaymentServices.confirmPayment(payload, this.props.route.params.selectedPayor.urn,
                this.props.route.params.bankAccounts[0].uniqueName)
            if (response.status == "success") {
                this.removeSmsListener()
                this.props.navigation.pop(2);
                this.props.route.params.getback(true);
                if (Platform.OS == "ios") {
                    await setTimeout(() => {
                        TOAST.show(response.body.Message, {
                            duration: TOAST.durations.LONG,
                            position: -150,
                            hideOnPress: true,
                            backgroundColor: "#1E90FF",
                            textColor: "white",
                            opacity: 1,
                            shadow: false,
                            animation: true,
                            containerStyle: { borderRadius: 10 }
                        }), 100
                    })
                } else {
                    ToastAndroid.show(response.body.Message, ToastAndroid.LONG)
                }
                await this.setState({ paymentProcessing: false })
            } else {
                await this.setState({ paymentProcessing: false, code: '' })
                if (Platform.OS == "ios") {
                    await setTimeout(() => {
                        TOAST.show(response.data.message, {
                            duration: TOAST.durations.LONG,
                            position: -150,
                            hideOnPress: true,
                            backgroundColor: "#1E90FF",
                            textColor: "white",
                            opacity: 1,
                            shadow: false,
                            animation: true,
                            containerStyle: { borderRadius: 10 }
                        }), 100
                    })
                } else {
                    ToastAndroid.show(response.data.message, ToastAndroid.LONG)
                }
            }
        } catch (e) {
            await this.setState({ paymentProcessing: false, code: '' })
        }
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                {this.FocusAwareStatusBar(this.props.isFocused)}
                <View
                    style={{
                        height: Dimensions.get('window').height * 0.08,
                        backgroundColor: '#864DD3',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Icon name={'Backward-arrow'} color="#fff" size={18} />
                    </TouchableOpacity>

                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                        Bulk Payment
                    </Text>
                </View>
                <View style={{
                    alignItems: 'center',
                    justifyContent: "center",
                    paddingHorizontal: 20,
                    flex: 1,
                }}>
                    <Text style={{ fontSize: 18, color: 'black',fontFamily: 'AvenirLTStd-Book' }}>{
                        `Paying ${this.state.selectedItems.length} vendors payment of`}
                    </Text>
                    <Text style={{ fontSize: 18, color: 'black',fontFamily: 'AvenirLTStd-Black', }} >{this.state.selectedItems[0].country.code == 'IN'
                        ? '₹'
                        : getSymbolFromCurrency(this.state.selectedItems[0].country.code)}
                        {this.numberWithCommas(this.state.totalAmount)} </Text>
                    <Text style={{ fontSize: 18, color: 'black', marginTop: 30 ,fontFamily: 'AvenirLTStd-Book'}} >Enter OTP</Text>
                    <OTPInputView
                        style={{ width: '85%', height: 100, }}
                        pinCount={6}
                        code={this.state.code}
                        onCodeChanged={code => { this.setState({ code }) }}
                        autoFocusOnLoad
                        returnKeyType={"done"}
                        codeInputFieldStyle={styles.underlineStyleBase}
                        onCodeFilled={(code) => {
                            console.log(`Code is ${code}, you are good to go!`)
                        }}
                    />
                    <Text style={{
                        fontSize: 16, color: '#808080', marginHorizontal: 25,fontFamily: 'AvenirLTStd-Book'}} >{this.state.OTPMessage}</Text>
                    <TouchableOpacity disabled={this.state.disableResendButton} onPress={() => this.resendOTP()}>
                        <Text style={{ fontSize: 16, color: this.state.disableResendButton ? '#ACBAFF' : '#5773FF', marginTop: 10,fontFamily: 'AvenirLTStd-Book' }} >Resend</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                    <TouchableOpacity disabled={this.state.paymentProcessing} onPress={() => { this.onSubmit() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.paymentProcessing ? '#ACBAFF' : '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                        <Text style={{ fontSize: 20, color: "white",fontFamily: 'AvenirLTStd-Book' }}>Confirm</Text>
                    </TouchableOpacity>
                </View>
                {this.state.paymentProcessing && (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0,
                        }}>
                        <Bars size={15} color={'#5773FF'} />
                    </View>
                )}
            </SafeAreaView>
        )
    }
}
const mapStateToProps = (state: any) => {
    return {
        isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    };
};

const mapDispatchToProps = () => {
    return {
    };
};

function Screen(props: any) {
    const isFocused = useIsFocused();

    return <BulkPaymentOTP {...props} isFocused={isFocused} />;
}
const styles = StyleSheet.create({
    underlineStyleBase: {
        width: 35,
        height: 45,
        borderWidth: 1,
        borderColor: '#F5F5F5',
        backgroundColor: '#F5F5F5',
        borderRadius: 5,
        color: "black"
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Screen);