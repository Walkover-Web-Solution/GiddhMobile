import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    View,
    TouchableOpacity,
    Dimensions,
    FlatList,
    Text,
    StatusBar,
    Alert, Platform, ToastAndroid, SafeAreaView
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dropdown from 'react-native-modal-dropdown';
import { GdSVGIcons } from '@/utils/icons-pack';
import { GD_ICON_SIZE } from '@/utils/constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import colors, { baseColor } from '@/utils/colors';
import { TextInput } from 'react-native-gesture-handler';
import getSymbolFromCurrency from 'currency-symbol-map';
import TOAST from 'react-native-root-toast';
import { PaymentServices } from '@/core/services/payment/payment';
import LoaderKit  from 'react-native-loader-kit';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

class BulkPayment extends React.Component {
    constructor(props: Props) {
        super(props)
    }

    storeAmountAndReviewText = () => {
        let activeCompany = this.props.route.params.activeCompanyName
        let selectedItemTextinputAndReview: any = {}
        this.props.route.params.selectedItem.forEach((item) => {
            let remark = (item.name).split(' ')[0] + " - " + (activeCompany).split(' ')[0]
            selectedItemTextinputAndReview[item.uniqueName] = {
                totalAmount: "₹" + this.currencyFormat(item.closingBalance.amount, this.props.route.params.activeCompany?.balanceDisplayFormat),
                totalAmountPlaceHolder: 'a',
                remark: remark,
                remarkPlaceHolder: 'a',
            }
        });
        return selectedItemTextinputAndReview
    }

    state = {
        payorDropDown: Dropdown,
        selectedItem: [...this.props.route.params.selectedItem],
        isPayorDD: false,
        selectedPayor: null,
        activeCompany: this.props.route.params.activeCompany,
        selectedItemTextinputAndReview: this.storeAmountAndReviewText(),
        bankAccounts: [],
        selectPayorData: [],
        disablePayButton: false,
    }

    componentDidMount() {
        this.getBankAccountsData()
    }

    async getBankAccountsData() {
        //this.setState({disablePayButton:true})
        let allAccounts = await PaymentServices.getAccounts()
        if (allAccounts.body.length > 0) {
            let allPayor = await PaymentServices.getAllPayor(allAccounts.body[0].uniqueName, 1);
            if (allAccounts.status == "success") {
                await this.setState({ bankAccounts: allAccounts.body })
                // console.log(JSON.stringify("All bank Account " + JSON.stringify(this.state.bankAccounts)))
            }
            if (allPayor.status == "success") {
                await this.setState({ selectPayorData: allPayor.body })
                if (allPayor.body.length > 0) {
                    await this.setState({ selectedPayor: allPayor.body[0] })
                }
                // console.log(JSON.stringify("All Payor " + JSON.stringify(this.state.selectPayorData)))
            }
        }
        //this.setState({disablePayButton:false})
    }

    FocusAwareStatusBar = (isFocused: any) => {
        return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
    };

    currencyFormat(amount: number, currencyType: string | undefined) {
        switch (currencyType) {
            case 'IND_COMMA_SEPARATED':
                // eslint-disable-next-line no-lone-blocks
                {
                    if (amount.toString().length > 4) {
                        return amount
                            .toFixed(1)
                            .toString()
                            .replace(/\B(?=(\d{2})+(?!\d))/g, ',');
                    } else if (amount.toString().length === 3) {
                        return amount.toFixed(1).toString();
                    } else if (amount.toString().length === 4) {
                        return amount
                            .toFixed(1)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    }
                }
                break;
            case 'INT_SPACE_SEPARATED': {
                return amount
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            }
            case 'INT_APOSTROPHE_SEPARATED': {
                return amount
                    .toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
            }
            default: {
                return amount
                    //.toFixed(1)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }
    }

    removeItem = async (item: any) => {
        let selectedItem = [...this.state.selectedItem]
        for (let i = 0; i < selectedItem.length; i++) {
            if (selectedItem[i].uniqueName == item.uniqueName) {
                await selectedItem.splice(i, 1)
                await this.setState({ selectedItem })
                break
            }
        }
        let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
        await delete selectedItemTextinputAndReview[item.uniqueName]
        await this.setState({ selectedItemTextinputAndReview })
    }

    resendOTP = async () => {
        // Resend OTP
        try {
            let totalAmountAndReviews = { ...this.state.selectedItemTextinputAndReview }
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
                bankName: this.state.bankAccounts[0].bankName,
                urn: this.state.selectedPayor?.bankUserId,
                uniqueName: this.state.bankAccounts[0].uniqueName,
                totalAmount: totalAmount,
                bankPaymentTransactions: bankPaymentTransactions
            }
            console.log("Send OTP request for Bulk payment " + JSON.stringify(payload))
            const response = await PaymentServices.sendOTP(payload)
            console.log("OTP response" + JSON.stringify(response))
            if (response.status == "success") {
                this.props.navigation.navigate('BulkPaymentOTP', {
                    selectedItems: this.state.selectedItem,
                    totalAmountAndReviews: this.state.selectedItemTextinputAndReview,
                    getback: this.props.route.params.getback,
                    OTPMessage: response.body.message,
                    requestIdOTP: response.body.requestId,
                    bankAccounts: this.state.bankAccounts,
                    selectedPayor: this.state.selectedPayor
                })
                this.setState({ disablePayButton: false })
                if (Platform.OS == "ios") {
                    await setTimeout(() => {
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
                        }), 100
                    });
                } else {
                    ToastAndroid.show(response.body.message, ToastAndroid.LONG)
                }
            } else {
                await this.setState({ disablePayButton: false })
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

    submit = () => {
        this.setState({ disablePayButton: true })
        if (this.state.selectedPayor == null) {
            this.setState({ disablePayButton: false })
            Alert.alert("Missing Fields", "Enter all the mandatory fields",
                [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
            return
        }
        let totalAmountAndReviews = { ...this.state.selectedItemTextinputAndReview }
        for (var key in totalAmountAndReviews) {
            let amount = totalAmountAndReviews[key].totalAmount.replace(/₹/g, '').replace(/,/g, '')
            let review = totalAmountAndReviews[key].remark
            if (amount == '' || review == '') {
                this.setState({ disablePayButton: false })
                Alert.alert("Missing Fields", "Enter all the mandatory fields",
                    [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                return
            } else if (Number(amount) == null || Number(amount) == undefined || Number(amount).toString() == "NaN") {
                this.setState({ disablePayButton: false })
                Alert.alert("Invalid", "Please Enter Valid Amount",
                    [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                return
            } else if (Number(amount) < 1) {
                this.setState({ disablePayButton: false })
                Alert.alert("Invalid", "Amount should be greater than or equal to 1",
                    [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                return
            }
        }
        this.resendOTP()
    }

    renderItem = (item: any) => {
        let currencySymbol = (item.country.code === 'IN' ?
            getSymbolFromCurrency("INR") : (getSymbolFromCurrency(item.country.code) ? getSymbolFromCurrency(item.country.code) : ''))
        return (
            <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 15, width: "70%",fontFamily: 'AvenirLTStd-Book'  }}>{item.name}</Text>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontSize: 15,fontFamily: 'AvenirLTStd-Black'}}>
                            {item.country.code === 'IN' ? (getSymbolFromCurrency("INR") +
                                this.currencyFormat(item.closingBalance.amount, this.state.activeCompany?.balanceDisplayFormat)) :
                                ((getSymbolFromCurrency(item.country.code) ? getSymbolFromCurrency(item.country.code) : '') +
                                    this.currencyFormat(item.closingBalance.amount, this.state.activeCompany?.balanceDisplayFormat))}
                        </Text>
                        <View style={{ width: 2 }} />
                        {item.openingBalance.type == 'CREDIT' && (
                            <GdSVGIcons.outgoing style={{
                                height: GD_ICON_SIZE.input_icon,
                                width: GD_ICON_SIZE.input_icon,
                                alignSelf: 'flex-start',
                                marginTop: 5
                            }} width={10} height={10} />
                        )}
                        {item.openingBalance.type == 'DEBIT' && (
                            <GdSVGIcons.incoming style={{
                                height: GD_ICON_SIZE.input_icon,
                                width: GD_ICON_SIZE.input_icon,
                                alignSelf: 'flex-start',
                                marginTop: 7
                            }} width={10} height={10} />
                        )}
                    </View>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <View style={{ backgroundColor: '#864DD3', width: 25, height: 25, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                        <FontAwesome name={'dollar'} color="white" size={18} />
                    </View>
                    <TextInput
                        onBlur={async () => {
                            if (this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount == '') {
                                let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                                let deatils = selectedItemTextinputAndReview[item.uniqueName]
                                deatils.totalAmountPlaceHolder = ''
                                this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                            } else {
                                let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                                let deatils = selectedItemTextinputAndReview[item.uniqueName]
                                let totalAmount = deatils.totalAmount
                                let amount = await (this.currencyFormat(Number((totalAmount).replace(/[^0-9.]/g, '').replace(/,/g, '')), this.state.activeCompany?.balanceDisplayFormat))
                                console.log("Total Amount " + (totalAmount).replace(/[^0-9.]/g, '').replace(/,/g, '') + " currency symbol " + currencySymbol)
                                if (amount == "NaN") {
                                    if (Platform.OS == "ios") {
                                        TOAST.show("Invalid Amount", {
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
                                        ToastAndroid.show("Invalid Amount", ToastAndroid.SHORT)
                                    }
                                    deatils.totalAmount = ''
                                    deatils.totalAmountPlaceHolder = ''
                                    await this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                                    return
                                }
                                deatils.totalAmount = currencySymbol + amount
                                await this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                            }
                        }}
                        keyboardType="number-pad"
                        returnKeyType={"done"}
                        onFocus={() => {
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.totalAmountPlaceHolder = 'a'
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }}
                        onChangeText={(text) => {
                            console.log(text)
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.totalAmount = (text).replace(/[^0-9.₹]/g, '')
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        style={{ fontSize: 15, textAlignVertical: "center", marginHorizontal: 10, width: "90%", padding: 0, paddingTop: 8 }}>
                        <Text style={{ fontFamily: 'AvenirLTStd-Book',color: this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                            {this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? 'Total Amount' :
                                ((this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount.length > 1 ||
                                    this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount == currencySymbol) && currencySymbol != "" ?
                                    (currencySymbol).substring(1)
                                    : (currencySymbol))}</Text>
                        <Text style={{ fontFamily: 'AvenirLTStd-Book',color: this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.totalAmountPlaceHolder == '' ?
                            '' : (this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmount)}</Text>
                        <Text style={{ color: '#E04646',fontFamily: 'AvenirLTStd-Book'}}>{this.state.selectedItemTextinputAndReview[item.uniqueName].totalAmountPlaceHolder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                {this.state.selectedItem.length > 1 ? <View style={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
                    <TouchableOpacity onPress={() => { this.removeItem(item) }} style={{ width: 30, height: 20, alignItems: "center", justifyContent: "center" }}>
                        <Entypo name={'cross'} color={colors.LABEL_COLOR} size={25} style={{ alignSelf: "center" }} />
                    </TouchableOpacity>
                </View> : <View style={{ height: 17 }} />}
                <View style={{ flexDirection: "row", marginLeft: 0 }}>
                    <Ionicons name={'md-document-text'} color='#864DD3' size={27} />
                    <TextInput
                        multiline={true}
                        returnKeyType={"done"}
                        onBlur={() => {
                            if (this.state.selectedItemTextinputAndReview[item.uniqueName].remark == '') {
                                let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                                let deatils = selectedItemTextinputAndReview[item.uniqueName]
                                deatils.remarkPlaceHolder = ''
                                this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                            }
                        }}
                        onFocus={() => {
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.remarkPlaceHolder = 'a'
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        onChangeText={(text) => {
                            let selectedItemTextinputAndReview = { ...this.state.selectedItemTextinputAndReview }
                            let deatils = selectedItemTextinputAndReview[item.uniqueName]
                            deatils.remark = text
                            this.setState({ selectedItemTextinputAndReview: selectedItemTextinputAndReview })
                        }
                        }
                        style={{ fontSize: 15, marginHorizontal: 10, textAlignVertical: "center", padding: 0, width: "90%", }}>
                        <Text style={{ fontFamily: 'AvenirLTStd-Book',color: this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? 'Remark' : this.state.selectedItemTextinputAndReview[item.uniqueName].remark}</Text>
                        <Text style={{ color: '#E04646',fontFamily: 'AvenirLTStd-Book'}}>{this.state.selectedItemTextinputAndReview[item.uniqueName].remarkPlaceHolder == '' ? '*' : ''}</Text>
                    </TextInput>
                </View>
                <View style={{ marginVertical: 5, width: "100%", height: 1, backgroundColor: colors.LABEL_COLOR, opacity: 0.4 }} />
            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                {/* {this.FocusAwareStatusBar(this.props.isFocused)} */}
                <KeyboardAwareScrollView keyboardShouldPersistTaps={'handled'}>
                    <View
                        style={{
                            height: Dimensions.get('window').height * 0.08,
                            backgroundColor: '#864DD3',
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 20,
                        }}>
                        <TouchableOpacity
                            hitSlop={{right: 20, left: 20, top: 10, bottom: 10}} 
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name={'Backward-arrow'} color="#fff" size={18} />
                        </TouchableOpacity>

                        <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                            Bulk Payment
                        </Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        //padding: 15,
                        paddingHorizontal: 20, marginTop: 10
                    }}>
                        <Ionicons name="person" size={25} color="#864DD3" style={{ marginTop: 7 }} />
                        <Dropdown
                            ref={(ref) => this.state.payorDropDown = ref}
                            style={{ flex: 1, paddingLeft: 10 }}
                            textStyle={{ color: 'black', fontSize: 15 ,fontFamily: 'AvenirLTStd-Book' }}
                            options={this.state.selectPayorData.length > 0 ? this.state.selectPayorData : ["No results found"]}
                            renderSeparator={() => {
                                return (<View></View>);
                            }}
                            onDropdownWillShow={() => this.setState({ isPayorDD: true })}
                            onDropdownWillHide={() => this.setState({ isPayorDD: false })}
                            dropdownStyle={{ width: '78%', height: this.state.selectPayorData.length > 1 ? 100 : 50, marginTop: 5, borderRadius: 5 }}
                            dropdownTextStyle={{ color: '#1C1C1C' }}
                            renderRow={(options) => {
                                return (<Text style={{ padding: 10, color: '#1C1C1C',fontFamily: 'AvenirLTStd-Book',backgroundColor:"white"  }}>{options == "No results found" ? options : options.user.name}</Text>);
                            }}
                            onSelect={(index, value) => {
                                if (value != "No results found") {
                                    this.setState({ selectedPayor: value })
                                }
                            }} >
                            <View style={{ flexDirection: "row" }}>
                                <Text style={{ color: this.state.selectedPayor == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c',fontFamily: 'AvenirLTStd-Book'  }}>
                                    {this.state.selectedPayor == null ? 'Select Payor' : this.state.selectedPayor.user.name}</Text>
                                <Text style={{ color: '#E04646',fontFamily: 'AvenirLTStd-Book'  }}>{this.state.selectedPayor == null ? '*' : ''}</Text>
                            </View>
                        </Dropdown>
                        <Icon
                            style={{ transform: [{ rotate: this.state.isPayorDD ? '180deg' : '0deg' }], padding: 5, marginLeft: 20 }}
                            name={'9'}
                            size={12}
                            color="#808080"
                            onPress={() => {
                                this.setState({ isPayorDD: true });
                                this.state.payorDropDown.show();
                            }}
                        />
                    </View>
                    {this.state.selectedPayor ? <Text style={{ paddingHorizontal: 20, marginLeft: 35, color: '#808080', fontSize: 12, marginBottom: 10,fontFamily: 'AvenirLTStd-Book'  }}>
                        {`Bank Bal ${this.state.bankAccounts.length > 0 ? this.state.bankAccounts[0].effectiveBal : 0} dr`}</Text> : <View style={{ marginBottom: 10 }}></View>}
                    <FlatList
                        data={this.state.selectedItem}
                        renderItem={({ item }) => this.renderItem(item)}
                        removeClippedSubviews={false}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </KeyboardAwareScrollView>
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                    <TouchableOpacity disabled={this.state.disablePayButton} onPress={() => { this.submit() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.disablePayButton ? '#ACBAFF' : '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                        <Text style={{ fontSize: 20, color: "white",fontFamily: 'AvenirLTStd-Book'  }}>Pay</Text>
                    </TouchableOpacity>
                </View>
                {this.state.disablePayButton && (
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
                        {/* <Bars size={15} color={'#5773FF'} /> */}
                        <LoaderKit
                            style={{ width: 45, height: 45 }}
                            name={'LineScale'}
                            color={colors.PRIMARY_NORMAL}
                        />
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

    return <BulkPayment {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps, mapDispatchToProps)(Screen);