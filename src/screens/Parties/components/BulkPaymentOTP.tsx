import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    View,
    TouchableOpacity,
    Dimensions,
    Text,
    StatusBar, StyleSheet, ToastAndroid
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from '@/core/components/custom-icon/custom-icon';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import getSymbolFromCurrency from 'currency-symbol-map';

class BulkPaymentOTP extends React.Component {
    constructor(props: Props) {
        super(props)
    }

    totalAmount = () => {
        // for now using indian currency but change it in next update. 
        let totalAmount = 0
        for (var key in this.props.route.params.totalAmountAndReviews) {
            let amount = Number(this.props.route.params.totalAmountAndReviews[key].totalAmount.replace(/₹/g, ''))
            totalAmount = totalAmount + amount
        }
        return totalAmount
    }
    state = {
        selectedItems: this.props.route.params.selectedItems,
        totalAmount: this.totalAmount(),
        code: ''
    }

    componentDidMount() {

    }

    FocusAwareStatusBar = (isFocused: any) => {
        return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle="light-content" /> : null;
    };

    numberWithCommas = (x) => {
        if (x == null) {
            return "0";
        }
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    resentOTP = async () => {
        await this.setState({ code: '' })
        ToastAndroid.show("Otp resend successfully to kriti", ToastAndroid.SHORT)
    }

    onSubmit = () => {
        this.props.navigation.pop(2);
        this.props.route.params.getback(true);
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
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
                    <Text style={{ fontSize: 18, color: 'black' }}>{
                        `Paying ${this.state.selectedItems.length} vendors payment of`}
                    </Text>
                    <Text style={{ fontSize: 18, color: 'black', fontWeight: "bold" }} >{this.state.selectedItems[0].country.code == 'IN'
                        ? '₹'
                        : getSymbolFromCurrency(this.state.selectedItems[0].country.code)}
                        {this.numberWithCommas(this.state.totalAmount)} </Text>
                    <Text style={{ fontSize: 18, color: 'black', marginTop: 30 }} >Enter OTP</Text>
                    <OTPInputView
                        style={{ width: '85%', height: 100, }}
                        pinCount={6}
                        code={this.state.code}
                        onCodeChanged={code => { this.setState({ code }) }}
                        autoFocusOnLoad
                        codeInputFieldStyle={styles.underlineStyleBase}
                        onCodeFilled={(code) => {
                            console.log(`Code is ${code}, you are good to go!`)
                        }}
                    />
                    <Text style={{ fontSize: 16, color: '#808080' }} >An OTP has been sent to User : Kriti</Text>
                    <TouchableOpacity onPress={() => this.resentOTP()}>
                        <Text style={{ fontSize: 16, color: '#5773FF', marginTop: 10 }} >Resend</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 98 + "%" }}>
                    <TouchableOpacity onPress={() => { this.onSubmit() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                        <Text style={{ fontSize: 20, color: "white" }}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
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