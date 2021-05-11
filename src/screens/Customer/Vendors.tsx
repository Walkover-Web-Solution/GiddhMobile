import React from 'react';
import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert, DeviceEventEmitter } from 'react-native';
import styles from './style';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Zocial from 'react-native-vector-icons/Zocial';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FONT_FAMILY } from '@/utils/constants';
import CheckBox from '@react-native-community/checkbox'
import { connect } from 'react-redux';
import Foundation from 'react-native-vector-icons/Foundation';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel, } from 'react-native-simple-radio-button';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';//customer_faliure.svg
import Faliure from '../../assets/images/icons/customer_faliure.svg';

interface Props {
  navigation: any;
}

export class Vendors extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  async getAllDeatils() {
    await this.setState({ loading: true });
    let allPartyTypes = await CustomerVendorService.getAllPartyType()
    // let allStateName = await CustomerVendorService.getAllStateName("IN")
    let allCurrency = await CustomerVendorService.getAllCurrency()
    // let allCountry = await CustomerVendorService.getAllCountryName()
    let allCallingCode = await CustomerVendorService.getAllCallingCode()
    await this.setState({ allPartyType: allPartyTypes.body.partyTypes, allCurrency: allCurrency.body, allCallingCode: allCallingCode.body.callingCodes })
    // await this.setState({ allPartyType: allPartyTypes.body.partyTypes, allStates: allStateName.body.stateList, allCurrency: allCurrency.body, allCountry: allCountry.body, allCallingCode: allCallingCode.body.callingCodes })
    await this.setState({ loading: false });
  }

  state = {
    loading: false,
    partyName: "",
    contactNumber: "",
    emailId: "",
    partyType: "Party Type*",
    allPartyType: [],
    AllGroups: ["Sundry Creditors"],
    ref: RBSheet,
    allStates: [],
    savedAddress: {
      street_billing: "",
      gstin_billing: "",
      state_billing: "",
      pincode: ""
    },
    street_billing: "",
    gstin_billing: "",
    state_billing: '',
    openAddress: false,
    showBalanceDetails: false,
    creditPeriodRef: Dropdown,
    radioBtn: 0,
    foreignOpeningBalance: "0",
    openingBalance: '0',
    selectedCurrency: "INR",
    allCurrency: [],
    selectedCountry: {
      "alpha3CountryCode": "IND",
      "alpha2CountryCode": "IN",
      "countryName": "India",
      "callingCode": "91",
      "currency": {
        "code": "INR",
        "symbol": "₹"
      },
      "countryIndia": true
    },
    allCountry: [],
    allCallingCode: [],
    selectedCallingCode: "91",
    successDialog: false,
    faliureDialog: false,
    selectedGroup: "Sundry Creditors",
    partyDropDown: Dropdown,
    showBankDetails: false,
    bankName: "",
    bankAccountNumber: "",
    IFSC_Code: "",
    isEmailInvalid: false,
    isMobileNoValid: false
  }

  radio_props = [
    { label: 'I receive (Dr)', value: 0 },
    { label: 'I pay (Cr)', value: 1 }
  ];

  setStreetBilling = (text: string) => {
    this.setState({ street_billing: text });
  }
  setGSTINBilling = (text: string) => {
    this.setState({ gstin_billing: text });
  }

  setStreetShipping = (text: string) => {
    this.setState({ street_shipping: text });
  }
  setGSTINShipping = (text: string) => {
    this.setState({ gstin_shipping: text });
  }

  setCountrySelected = async (value: any) => {
    this.setState({ loading: true });
    await this.setState({ state_billing: '', selectedCountry: value, selectedCurrency: value.currency.code, selectedCallingCode: value.callingCode })
    let allStateName = await CustomerVendorService.getAllStateName(value.alpha2CountryCode)
    await this.setState({ allStates: allStateName.body.stateList })
    this.setState({ loading: false });
  }

  selectBillingAddress = (address) => {
    console.log(address);
    const newAddress = {
      street_billing: address.address,
      gstin_billing: address.gstNumber,
      state_billing: address.state,
      pincode: address.pincode
    };
    this.setState({
      savedAddress: newAddress, selectedCountry: address.selectedCountry,
      selectedCallingCode: address.selectedCountry.callingCode, selectedCurrency: address.selectedCountry.currency.code
    });
  };



  renderSavedAddress = () => {
    return (
      <View style={{ marginLeft: 46 }}>
        <Text style={{ fontFamily: FONT_FAMILY.bold }}>Billing Address*</Text>
        {this.state.savedAddress.street_billing != "" && <Text style={{ color: "#808080" }} >{this.state.savedAddress.street_billing}</Text>}
        {this.state.savedAddress.state_billing != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.state_billing.name}</Text>}
        {this.state.savedAddress.pincode != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.pincode}</Text>}
        {this.state.savedAddress.gstin_billing != "" && <Text style={{ color: "#808080" }}>{this.state.savedAddress.gstin_billing}</Text>}
      </View>);
  };

  renderBalanceDetails = () => {

    return (
      <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, }}>
          <View style={{ width: "74%", }}>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10 }} >Set Currency (account)</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%', }}>Choose currency for opening Balance eg.INR  </Text> */}
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 5, paddingHorizontal: 10, height: 40, width: "30%", borderWidth: 1, borderColor: '#d9d9d9', justifyContent: 'space-between', overflow: 'hidden' }}>
            <Dropdown
              ref={(ref) => this.state.creditPeriodRef = ref}
              textStyle={{ color: '#808080' }}
              defaultValue={this.state.selectedCurrency}
              renderButtonText={(text) => {
                return text.code;
              }}
              options={this.state.allCurrency}
              renderSeparator={() => {
                return (<View></View>);
              }}
              onSelect={(idx, value) => this.setState({ selectedCurrency: value.code })}

              dropdownStyle={{ width: '25%', marginTop: 11, marginRight: -60 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options.code}</Text>);
              }}
            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }], paddingLeft: 20 }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                this.state.creditPeriodRef.show();
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>
          <View style={{ width: "74%", }}>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10 }} >Foreign Opening Balance</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%' }}>Enter Amount</Text> */}
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(val) => { this.setState({ foreignOpeningBalance: val }) }}
            value={this.state.foreignOpeningBalance}
            placeholder="Amount"
            style={{ borderWidth: 1, borderColor: "#d9d9d9", width: "30%", height: '80%', paddingStart: 10, }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: 5 }}>
          <View style={{ width: "70%", }}>
            <View style={{ flexDirection: 'row', alignItems: "flex-end" }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10 }} >Opening Balance</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <RadioForm
              formHorizontal={true}
              initial={0}
              animation={true}
            >

              {
                this.radio_props.map((obj, i) => (
                  <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
            {/* <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.radioBtn === i}
                      onPress={(val) => { this.setState({ radioBtn: val }) }}
                      borderWidth={1}
                      buttonInnerColor={'#864DD3'}
                      buttonOuterColor={this.state.radioBtn === i ? "#864DD3" : '#808080'}
                      buttonSize={8}
                      buttonOuterSize={15}
                      buttonStyle={{}}
                      buttonWrapStyle={{ marginTop: 10 }}
                    />
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={() => { }}
                      labelStyle={{ color: '#808080' }}
                      labelWrapStyle={{ marginRight: 10, marginTop: 10 }}
                    />
                  </RadioButton>
                )) }*/}
            {/* </RadioForm> */}
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(val) => {
              this.setState({ openingBalance: val });
            }}
            value={this.state.openingBalance}
            placeholder="Amount"
            style={{ borderWidth: 1, width: "30%", borderColor: "#d9d9d9", height: '70%', paddingStart: 10, marginTop: 5 }} />
        </View>
      </View>
    );
  }

  renderBankDetails = () => {
    return (
      <View style={{ marginLeft: 20, marginRight: 20 }}>
        <Text style={{ width: '100%', color: '#808080', marginTop: 10, fontSize: 13 }}>Bank Name</Text>
        <TextInput
          style={{
            borderBottomColor: '#808080',
            borderBottomWidth: 0.55,
            paddingBottom: -5
          }}
          value={this.state.bankName != "" ? this.state.bankName : ""}
          multiline={true}
          onChangeText={(text) => this.setState({ bankName: text })} />
        <Text style={{ color: '#808080', marginTop: 10, fontSize: 13 }}>Account Number</Text>
        <TextInput
          style={{
            borderBottomColor: '#808080',
            borderBottomWidth: 0.55,
            paddingBottom: -5
          }}
          value={this.state.bankAccountNumber != "" ? this.state.showBankDetails : ""}
          multiline={true}
          onChangeText={(text) => this.setState({ bankAccountNumber: text })} />
        <Text style={{ color: '#808080', marginTop: 10, fontSize: 13 }}>IFSC Code</Text>
        <TextInput
          style={{
            borderBottomColor: '#808080',
            borderBottomWidth: 0.55,
            paddingBottom: -5
          }}
          value={this.state.IFSC_Code != "" ? this.state.IFSC_Code : ""}
          multiline={true}
          onChangeText={(text) => this.setState({ IFSC_Code: text })} />
      </View>
    );
  }

  isCreateButtonVisible = () => {
    if (this.state.partyName && this.state.partyType != "Party Type*" && this.state.savedAddress.state_billing) {
      return true;
    } else {
      return false;
    }
  }

  validateMobileNumber = () => {
    if (this.state.contactNumber == "") {
      return true
    }
    var pattern = new RegExp(/^[0-9\b]+$/);
    if (!pattern.test(this.state.contactNumber)) {
      Alert.alert("Error", 'Please enter only number.', [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
      return false;
    } else if (this.state.contactNumber.length != 10) {
      Alert.alert("Error", 'Please enter valid phone number.', [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
      return false;
    }
    return true
  }

  validateMobileNumberTextInput = (mobileNo: any) => {
    if (mobileNo == "") {
      return true
    }
    var pattern = new RegExp(/^[0-9\b]+$/);
    if (!pattern.test(mobileNo)) {
      return false;
    } else if (mobileNo.length != 10) {
      return false;
    }
    return true
  }

  validateEmail = () => {
    if (this.state.emailId == "") {
      return true
    }
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    if (!expression.test(String(this.state.emailId).toLowerCase())) {
      Alert.alert("Error", 'Please enter correct email-address.', [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
      return false;
    }
    return true
  }

  validateEmailTextInput = (emailId: any) => {
    if (emailId == "") {
      return true
    }
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    if (!expression.test(String(emailId).toLowerCase())) {
      return false;
    }
    return true
  }

  genrateCustomer = () => {
    if (!this.state.partyName) {
      Alert.alert("Error", 'Please select a party.', [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
    } else if (!this.state.savedAddress.state_billing) {
      Alert.alert("Error", 'Please select state to proceed.', [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
    } else {
      if (this.validateMobileNumber() && this.validateEmail()) {
        this.createCustomerRequest();
      }
    }
  }

  createCustomerRequest = async () => {
    this.setState({ loading: true });
    try {
      let postBody = {
        activeGroupUniqueName: "sundrycreditors",
        name: this.state.partyName,
        uniqueName: "",
        openingBalanceType: "CREDIT",
        foreignOpeningBalance: this.state.foreignOpeningBalance,
        openingBalance: this.state.openingBalance,
        mobileNo: this.state.contactNumber,
        mobileCode: "",
        email: this.state.emailId,
        companyName: "",
        attentionTo: "",
        description: "",
        addresses: [
          {
            gstNumber: this.state.savedAddress.gstin_billing,
            address: this.state.savedAddress.street_billing,
            state: this.state.savedAddress.state_billing,
            stateCode: this.state.savedAddress.state_billing.stateGstCode,
            isDefault: false,
            isComposite: false,
            partyType: this.state.partyType,
            pincode: this.state.savedAddress.pincode
          }
        ],
        country: {
          countryCode: this.state.selectedCountry.alpha2CountryCode
        },
        currency: this.state.selectedCurrency,
        accountBankDetails: [{
          bankName: this.state.bankName,
          bankAccountNo: this.state.bankAccountNumber,
          ifsc: this.state.IFSC_Code,
          beneficiaryName: "",
          branchName: "",
          swiftCode: ""
        }],
        closingBalanceTriggerAmount: "",
        closingBalanceTriggerAmountType: "CREDIT",
        customFields: [
        ],
        hsnNumber: "",
        sacNumber: ""
      }
      console.log('Create Customer postBody is', JSON.stringify(postBody));
      const results = await CustomerVendorService.createVendor(postBody);
      if (results.status == "success") {
        await DeviceEventEmitter.emit(APP_EVENTS.CustomerCreated, {});
        await this.resetState();
        this.state.partyDropDown.select(-1);
        await this.setState({ successDialog: true, });
        await this.getAllDeatils()
        await this.setState({ loading: false, });
      } else {
        this.setState({ faliureDialog: true, });
        this.setState({ loading: false, });
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ faliureDialog: true, });
      this.setState({ loading: false, });
    }
    this.setState({ loading: false });
  }

  resetState = () => {
    this.setState({
      loading: false,
      partyName: "",
      contactNumber: "",
      emailId: "",
      partyType: "Party Type*",
      allPartyType: [],
      AllGroups: ["Sundry Debtors"],
      ref: RBSheet,
      allStates: [],
      savedAddress: {
        street_billing: "",
        gstin_billing: "",
        state_billing: '',
        pincode: ""
      },
      street_billing: "",
      gstin_billing: "",
      state_billing: '',
      street_shipping: "",
      gstin_shipping: "",
      state_shipping: '',
      shippingSame: false,
      openAddress: false,
      showBalanceDetails: false,
      creditPeriodRef: Dropdown,
      radioBtn: 0,
      foreignOpeningBalance: "0",
      openingBalance: '0',
      selectedCurrency: "INR",
      allCurrency: [],
      selectedCountry: {
        "alpha3CountryCode": "IND",
        "alpha2CountryCode": "IN",
        "countryName": "India",
        "callingCode": "91",
        "currency": {
          "code": "INR",
          "symbol": "₹"
        },
        "countryIndia": true
      },
      allCountry: [],
      allCallingCode: [],
      selectedCallingCode: "91",
      successDialog: false,
      faliureDialog: false,
      selectedGroup: "Sundry Debtors",
      partyDropDown: Dropdown,
      showBankDetails: false,
      bankName: "",
      bankAccountNumber: "",
      IFSC_Code: "",
      isEmailInvalid: false,
      isMobileNoValid: false
    })
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      await this.resetState();
      await this.getAllDeatils();
    });
  }

  render() {
    return (
      <View style={styles.customerMainContainer}>
        {this.state.successDialog ? <Dialog.Container visible={this.state.successDialog} onBackdropPress={() => this.setState({ successDialog: false })} contentStyle={{ justifyContent: "center", alignItems: "center" }}>
          <Award />
          <Text style={{ color: "#229F5F", fontSize: 16 }}>Success</Text>
          <Text style={{ fontSize: 14, marginTop: 10, textAlign: "center" }}>The Vendor is created successfully.</Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              width: "70%",
              alignSelf: 'center',
              borderRadius: 30,
              backgroundColor: '#229F5F',
              marginTop: 30,
              height: 50
            }}
            onPress={() => {
              this.setState({ successDialog: false });
              this.props.navigation.goBack();
            }}
          >
            <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: "center" }}>Done</Text>
          </TouchableOpacity>
        </Dialog.Container> : null}
        {this.state.faliureDialog ? <Dialog.Container visible={this.state.faliureDialog} onBackdropPress={() => this.setState({ faliureDialog: false })} contentStyle={{ justifyContent: "center", alignItems: "center" }}>
          <Faliure />
          <Text style={{ color: "#F2596F", fontSize: 16 }}>Error!</Text>
          <Text style={{ fontSize: 14, marginTop: 10, textAlign: "center" }}>Sorry, Failed to import the entries.</Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              width: "70%",
              alignSelf: 'center',
              borderRadius: 30,
              backgroundColor: '#F2596F',
              marginTop: 30,
              height: 50
            }}
            onPress={() => {
              this.setState({ faliureDialog: false });
            }}
          >
            <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: "center" }}>Try Again</Text>
          </TouchableOpacity>
        </Dialog.Container> : null}

        <View style={{ flex: 1 }}>
          <View style={styles.rowContainer}>
            <Ionicons name="person" size={18} color="#864DD3" />
            <TextInput
              onChangeText={(text) => { this.setState({ partyName: text }) }}
              placeholder="Enter Party Name*"
              value={this.state.partyName}
              style={styles.input} />
          </View>
          <View style={styles.rowContainer}>
            <Zocial name="call" size={18} style={{ marginRight: 10 }} color="#864DD3" />
            <Dropdown
              textStyle={{ color: '#808080', fontSize: 15, marginTop: -1 }}
              defaultValue={this.state.selectedCallingCode}
              renderButtonText={(text) => {
                return text;
              }}
              options={this.state.allCallingCode}
              renderSeparator={() => {
                return (<View></View>);
              }}
              onSelect={(idx, value) => this.setState({ selectedCallingCode: value })}

              dropdownStyle={{ width: '17%', }}
              dropdownTextStyle={{ color: '#1C1C1C', }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
            />
            <TextInput
              onChangeText={(text) => {
                this.setState({
                  contactNumber: text,
                  isMobileNoValid: !this.validateMobileNumberTextInput(text)
                })
              }}
              placeholder="Enter Contact Number"
              value={this.state.contactNumber}
              style={styles.input} />
          </View>
          {this.state.isMobileNoValid && <Text style={{ fontSize: 10, color: "red", paddingLeft: 47 }}>Sorry! Invalid Number</Text>}
          <View style={styles.rowContainer}>
            <MaterialCommunityIcons name="email-open" size={18} color="#864DD3" />
            <TextInput
              onChangeText={(text) => this.setState({
                emailId: text,
                isEmailInvalid: !this.validateEmailTextInput(text)
              })}
              value={this.state.emailId}
              placeholder="Email Address"
              style={styles.input} />
          </View>
          {this.state.isEmailInvalid && <Text style={{ fontSize: 10, color: "red", paddingLeft: 47, marginTop: -7 }}>Sorry! Invalid Email-Id</Text>}
          <View style={{ ...styles.rowContainer, marginTop: 5 }}>
            <MaterialCommunityIcons name="account-group" size={18} color="#864DD3" />
            <Dropdown
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue={this.state.selectedGroup}
              options={this.state.AllGroups}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ marginLeft: 30, width: '75%', height: 50, marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
              onSelect={(index, value) => { this.setState({ selectedGroup: value }) }}

            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {

              }}
            />
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 25, marginBottom: 5 }}>
            <MaterialIcons name="hourglass-full" size={18} color="#864DD3" />
            <Dropdown
              ref={(ref) => this.state.partyDropDown = ref}
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue={this.state.partyType}
              options={this.state.allPartyType}
              renderSeparator={() => {
                return (<View></View>);
              }}
              dropdownStyle={{ marginLeft: 30, width: '75%', marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options.value}</Text>);
              }}
              renderButtonText={(text) => text.value}
              onSelect={(index, value) => { this.setState({ partyType: value.value }) }}
            />
            <Icon
              style={{ transform: [{ rotate: 0 ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {

              }}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              const BillingAddress = {
                address: this.state.savedAddress.street_billing,
                stateName: this.state.savedAddress.state_billing,
                selectedCountry: this.state.selectedCountry,
                gstNumber: this.state.savedAddress.gstin_billing,
                pincode: this.state.savedAddress.pincode
              };
              this.props.navigation.navigate('EditAddressCV', {
                addressArray: BillingAddress,
                selectAddress: (this.selectBillingAddress).bind(this),
                headerColor: "#864DD3",
                statusBarColor: '#520EAD'
              })
            }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', marginVertical: 10, paddingVertical: 10, backgroundColor: this.state.openAddress ? "rgba(80,80,80,0.05)" : "white" }}>
            <AntDesign
              name="pluscircle"
              size={16}
              color="#864DD3"
              style={{ transform: [{ rotate: this.state.openAddress ? '45deg' : '0deg' }] }} />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: '#1C1C1C' }}>Address Details*</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.openAddress ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                if (this.state.savedAddress.state_billing) {
                  this.setState({ openAddress: !this.state.openAddress });
                } else {
                  const BillingAddress = {
                    address: this.state.savedAddress.street_billing,
                    stateName: this.state.savedAddress.state_billing,
                    selectedCountry: this.state.selectedCountry,
                    gstNumber: this.state.savedAddress.gstin_billing,
                    pincode: this.state.savedAddress.pincode
                  };
                  this.props.navigation.navigate('EditAddressCV', {
                    addressArray: BillingAddress,
                    selectAddress: (this.selectBillingAddress).bind(this),
                    headerColor: "#864DD3",
                    statusBarColor: '#520EAD'
                  })
                }
              }}
            />
          </TouchableOpacity>
          {this.state.openAddress && this.renderSavedAddress()}
          <TouchableOpacity
            onPress={() => { this.setState({ showBalanceDetails: !this.state.showBalanceDetails }) }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', backgroundColor: this.state.showBalanceDetails ? 'rgba(80,80,80,0.05)' : 'white', paddingVertical: 10 }}>
            <AntDesign
              name="pluscircle"
              size={16}
              color="#864DD3"
              style={{ transform: [{ rotate: this.state.showBalanceDetails ? '45deg' : '0deg' }] }} />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: '#1C1C1C' }}>Balance Details</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.showBalanceDetails ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
            />
          </TouchableOpacity>
          {this.state.showBalanceDetails && this.renderBalanceDetails()}
          <TouchableOpacity
            onPress={() => { this.setState({ showBankDetails: !this.state.showBankDetails }) }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', backgroundColor: this.state.showBankDetails ? 'rgba(80,80,80,0.05)' : 'white', paddingVertical: 18 }}>
            <AntDesign
              name="pluscircle"
              size={16}
              color="#864DD3"
              style={{ transform: [{ rotate: this.state.showBankDetails ? '45deg' : '0deg' }] }} />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: '#1C1C1C' }}>Bank Details</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.showBankDetails ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
            />
          </TouchableOpacity>
          {this.state.showBankDetails && this.renderBankDetails()}
        </View>
        {this.isCreateButtonVisible() && <TouchableOpacity
          style={{ alignSelf: 'flex-end', paddingHorizontal: 10, flex: 1 }}
          onPress={() => {
            this.genrateCustomer();
          }}>
          <Icon name={'path-18'} size={48} color={'#5773FF'} />
        </TouchableOpacity>}
        {/* <RBSheet ref={(ref) => { this.state.ref = ref }}
          height={500}
          customStyles={{
            container: {
              borderRadius: 10
            }
          }}>
          {this.renderAddressDetails()}
        </RBSheet> */}
        {this.state.loading && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              backgroundColor: 'rgba(0,0,0,0)',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
            }}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </View>
    )
  }
};

const mapStateToProps = (state: RootState) => {
  return {
    // activeCompany: state.company.activeCompany,
  };
};

function Screen(props) {
  const isFocused = useIsFocused();

  return <Vendors {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps)(Screen);