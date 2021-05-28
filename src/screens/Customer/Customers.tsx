import React from 'react';
import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert, DeviceEventEmitter, FlatList, useWindowDimensions } from 'react-native';
import styles from './style';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Zocial from 'react-native-vector-icons/Zocial';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Dropdown from 'react-native-modal-dropdown';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RBSheet from 'react-native-raw-bottom-sheet';
import { FONT_FAMILY, APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { connect } from 'react-redux';
import Foundation from 'react-native-vector-icons/Foundation';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';

import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';// customer_faliure.svg
import Faliure from '../../assets/images/icons/customer_faliure.svg';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-community/async-storage';
import { InvoiceService } from '@/core/services/invoice/invoice.service';

interface Props {
  navigation: any;
  resetFun: any;
}

export class Customers extends React.Component<Props> {
  constructor (props: any) {
    super(props);
    this.getAllDeatils();
    this.setActiveCompanyCountry()
    this.checkStoredCountryCode();
    this.props.resetFun(this.resetState);
  }

  async getAllDeatils () {
    await this.setState({ loading: true });
    const allPartyTypes = await CustomerVendorService.getAllPartyType()
    // let allStateName = await CustomerVendorService.getAllStateName("IN")
    const allCurrency = await CustomerVendorService.getAllCurrency()
    // let allCountry = await CustomerVendorService.getAllCountryName()
    const allCallingCode = await CustomerVendorService.getAllCallingCode()
    await this.setState({ allPartyType: allPartyTypes.body.partyTypes, allCurrency: allCurrency.body, allCallingCode: allCallingCode.body.callingCodes })
    // await this.setState({ allPartyType: allPartyTypes.body.partyTypes, allStates: allStateName.body.stateList, allCurrency: allCurrency.body, allCountry: allCountry.body, allCallingCode: allCallingCode.body.callingCodes })
    await this.setState({ loading: false });
  }

  async setActiveCompanyCountry () {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          activeCompanyCountryCode: activeCompanyCountryCode,
          selectedCountry: results.body.country,
          selectedCallingCode: results.body.country.callingCode,
          selectedCurrency: results.body.country.currency.code
        })
      }
    } catch (e) { }
  }

  state = {
    loading: false,
    partyName: '',
    contactNumber: '',
    emailId: '',
    partyType: 'not applicable',
    allPartyType: [],
    AllGroups: ['Sundry Debtors'],
    ref: RBSheet,
    allStates: [],
    savedAddress: {
      street_billing: '',
      gstin_billing: '',
      state_billing: '',
      pincode: ''
    },
    street_billing: '',
    gstin_billing: '',
    state_billing: '',
    openAddress: false,
    showBalanceDetails: false,
    creditPeriodRef: Dropdown,
    radioBtn: 0,
    foreignOpeningBalance: '0',
    openingBalance: '0',
    selectedCurrency: 'INR',
    allCurrency: [],
    selectedCountry: {
      alpha3CountryCode: 'IND',
      alpha2CountryCode: 'IN',
      countryName: 'India',
      callingCode: '91',
      currency: {
        code: 'INR',
        symbol: '₹'
      },
      countryIndia: true
    },
    allCountry: [],
    allCallingCode: [],
    selectedCallingCode: '91',
    successDialog: false,
    faliureDialog: false,
    selectedGroup: 'Sundry Debtors',
    partyDropDown: Dropdown,
    pincode: '',
    isEmailInvalid: false,
    isMobileNoValid: false,
    groupDropDown: Dropdown,
    isGroupDD: false,
    isPartyDD: false,
    partyPlaceHolder: '',
    partyDialog: false,
    showForgeinBalance: true,
    activeCompanyCountryCode: ''
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
    const allStateName = await CustomerVendorService.getAllStateName(value.alpha2CountryCode)
    await this.setState({ allStates: allStateName.body.stateList })
    this.setState({ loading: false });
  }

  renderSavedAddress = () => {
    return (
      <View style={{ marginLeft: 46 }}>
        <Text style={{ fontFamily: FONT_FAMILY.bold }}>Billing Address*</Text>
        {this.state.selectedCountry && this.state.savedAddress.state_billing != '' && <Text style={{ color: '#808080' }} >{this.state.selectedCountry.countryName}</Text>}
        {this.state.savedAddress.street_billing != '' && <Text style={{ color: '#808080' }} >{this.state.savedAddress.street_billing}</Text>}
        {this.state.savedAddress.state_billing.name != '' && <Text style={{ color: '#808080' }}>{this.state.savedAddress.state_billing.name}</Text>}
        {this.state.savedAddress.pincode != '' && <Text style={{ color: '#808080' }}>{this.state.savedAddress.pincode}</Text>}
        {this.state.savedAddress.gstin_billing != '' && <Text style={{ color: '#808080' }}>{this.state.savedAddress.gstin_billing}</Text>}
      </View>);
  };

  renderBalanceDetails = () => {
    return (
      <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 }}>
          <View style={{ width: '74%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10 }} >Set Currency (account)</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%', }}>Choose currency for opening Balance eg.INR  </Text> */}
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 5, paddingHorizontal: 10, height: 40, width: '30%', borderWidth: 1, borderColor: '#d9d9d9', justifyContent: 'space-between', overflow: 'hidden' }}>
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
        {this.state.showForgeinBalance && <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, marginTop: 10 }}>
          <View style={{ width: '74%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
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
            style={{ borderWidth: 1, borderColor: '#d9d9d9', width: '30%', height: '80%', paddingStart: 10 }} />
        </View>}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
          <View style={{ width: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10 }} >Opening Balance</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            <RadioForm
              formHorizontal={true}
              initial={0}
              animation={true}
            >

              {
                this.radio_props.map((obj, i) => (
                  <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.radioBtn === i}
                      onPress={(val) => { this.setState({ radioBtn: val }) }}
                      borderWidth={1}
                      buttonInnerColor={'#864DD3'}
                      buttonOuterColor={this.state.radioBtn === i ? '#864DD3' : '#808080'}
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
                ))}
            </RadioForm>
          </View>
          <TextInput
            keyboardType="number-pad"
            onChangeText={(val) => {
              this.setState({ openingBalance: val });
            }}
            value={this.state.openingBalance}
            placeholder="Amount"
            style={{ borderWidth: 1, width: '30%', borderColor: '#d9d9d9', height: '70%', paddingStart: 10, marginTop: 5 }} />
        </View>
      </View>
    );
  }

  isCreateButtonVisible = () => {
    if (this.state.partyName && this.state.partyType != 'Party Type*' && this.state.savedAddress.state_billing) {
      // When selected country is same as company country then state is compulsory
      return true;
    } else if (this.state.partyName && this.state.partyType != 'Party Type*' && this.state.selectedCountry.alpha2CountryCode != this.state.activeCompanyCountryCode) {
      // When selected country is different from company country then state is not compulsory
      return true
    } else {
      return false;
    }
  }

  validateMobileNumber = () => {
    if (this.state.contactNumber == '') {
      return true
    }
    const pattern = new RegExp(/^[0-9\b]+$/);
    if (!pattern.test(this.state.contactNumber)) {
      Alert.alert('Error', 'Please enter only number.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    } else if (this.state.contactNumber.length != 10) {
      Alert.alert('Error', 'Please enter valid phone number.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    }
    return true
  }

  validateMobileNumberTextInput = (mobileNo: any) => {
    if (mobileNo == '') {
      return true
    }
    const pattern = new RegExp(/^[0-9\b]+$/);
    if (!pattern.test(mobileNo)) {
      return false;
    } else if (mobileNo.length != 10) {
      return false;
    }
    return true
  }

  validateEmailTextInput = (emailId: any) => {
    if (emailId == '') {
      return true
    }
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    if (!expression.test(String(emailId).toLowerCase())) {
      return false;
    }
    return true
  }

  validateEmail = () => {
    if (this.state.emailId == '') {
      return true
    }
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([\t]*\r\n)?[\t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([\t]*\r\n)?[\t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    if (!expression.test(String(this.state.emailId).toLowerCase())) {
      Alert.alert('Error', 'Please enter correct email-address.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    }
    return true
  }

  genrateCustomer = () => {
    if (!this.state.partyName) {
      Alert.alert('Error', 'Please select a party.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
    } else {
      if (this.validateMobileNumber() && this.validateEmail()) {
        this.createCustomerRequest();
      }
    }
  }

  createCustomerRequest = async () => {
    this.setState({ loading: true });
    try {
      const postBody = {
        activeGroupUniqueName: 'sundrydebtors',
        name: this.state.partyName,
        uniqueName: '',
        openingBalanceType: this.state.radioBtn == 0 ? 'DEBIT' : 'CREDIT',
        foreignOpeningBalance: this.state.foreignOpeningBalance,
        openingBalance: this.state.openingBalance,
        mobileNo: this.state.contactNumber,
        mobileCode: '',
        email: this.state.emailId,
        companyName: '',
        attentionTo: '',
        description: '',
        addresses: [
          {
            gstNumber: this.state.savedAddress.gstin_billing,
            address: this.state.savedAddress.street_billing,
            state: this.state.savedAddress.state_billing != '' ? this.state.savedAddress.state_billing : { code: null, name: '', stateGstCode: '' },
            stateCode: this.state.savedAddress.state_billing.stateGstCode ? this.state.savedAddress.state_billing.stateGstCode : null,
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
        closingBalanceTriggerAmount: '',
        closingBalanceTriggerAmountType: 'CREDIT',
        customFields: [
        ],
        hsnNumber: '',
        sacNumber: ''
      }
      console.log('Create Customer postBody is', JSON.stringify(postBody));
      const results = await CustomerVendorService.createCustomer(postBody);
      console.log('rabbit' + JSON.stringify(results));
      if (results.status == 'success') {
        await DeviceEventEmitter.emit(APP_EVENTS.CustomerCreated, {});
        await this.resetState();
        await this.setState({ successDialog: true });
        await this.getAllDeatils()
        await this.setState({ loading: false });
      } else {
        this.setState({ faliureDialog: true });
        this.setState({ loading: false });
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ faliureDialog: true });
      this.setState({ loading: false });
    }
    this.setState({ loading: false });
  }

  resetState = () => {
    this.setState({
      loading: false,
      partyName: '',
      contactNumber: '',
      emailId: '',
      partyType: 'not applicable',
      allPartyType: [],
      AllGroups: ['Sundry Debtors'],
      ref: RBSheet,
      allStates: [],
      savedAddress: {
        street_billing: '',
        gstin_billing: '',
        state_billing: '',
        pincode: ''
      },
      street_billing: '',
      gstin_billing: '',
      state_billing: '',
      openAddress: false,
      showBalanceDetails: false,
      creditPeriodRef: Dropdown,
      radioBtn: 0,
      foreignOpeningBalance: '0',
      openingBalance: '0',
      selectedCurrency: 'INR',
      allCurrency: [],
      selectedCountry: {
        alpha3CountryCode: 'IND',
        alpha2CountryCode: 'IN',
        countryName: 'India',
        callingCode: '91',
        currency: {
          code: 'INR',
          symbol: '₹'
        },
        countryIndia: true
      },
      allCountry: [],
      allCallingCode: [],
      selectedCallingCode: '91',
      successDialog: false,
      faliureDialog: false,
      selectedGroup: 'Sundry Debtors',
      partyDropDown: Dropdown,
      groupDropDown: Dropdown,
      isGroupDD: false,
      isPartyDD: false,
      partyPlaceHolder: '',
      partyDialog: false,
      showForgeinBalance: true,
      pincode: '',
      isEmailInvalid: false,
      isMobileNoValid: false,
      groupDropDown: Dropdown,
      isGroupDD: false,
      isPartyDD: false,
      partyPlaceHolder: '',
      partyDialog: false,
      activeCompanyCountryCode: ''
    })
  }

  selectBillingAddress = async (address) => {
    console.log(address);
    const newAddress = {
      street_billing: address.address,
      gstin_billing: address.gstNumber,
      state_billing: address.state,
      pincode: address.pincode
    };
    const companyCountry = this.state.activeCompanyCountryCode;
    if (companyCountry != address.selectedCountry.alpha2CountryCode) {
      this.setState({ showForgeinBalance: true });
    } else {
      this.setState({ showForgeinBalance: false });
    }
    this.setState({
      savedAddress: newAddress,
      selectedCountry: address.selectedCountry,
      selectedCallingCode: address.selectedCountry.callingCode,
      selectedCurrency: address.selectedCountry.currency.code
    });
  };

  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      await this.resetState();
      await this.setActiveCompanyCountry()
      await this.getAllDeatils();
    });
  }

  checkStoredCountryCode = async () => {
    const storedCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
    if (storedCode == this.state.selectedCountry.alpha2CountryCode) {
      this.setState({ showForgeinBalance: false })
    } else {
      this.setState({ showForgeinBalance: true });
    }
  }

  render () {
    return (
      <View style={styles.customerMainContainer}>
        <Dialog.Container
          visible={this.state.partyDialog}
          onBackdropPress={() => {
            this.setState({ partyDialog: false })
          }}
          contentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', maxHeight: '70%' }}
        >
          <Text style={{ marginBottom: 10, fontSize: 16, fontFamily: FONT_FAMILY.bold }}>Select Party Type</Text>
          <FlatList
            style={{ flex: 1, width: '100%', height: '100%' }}
            data={this.state.allPartyType}
            renderItem={(item) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ partyType: item.item.value, partyDialog: false });
                  }}
                  key={item.item.value}
                  style={{ flex: 1, alignItems: 'center', borderBottomColor: '#808080', borderBottomWidth: 0.55 }}>
                  <Text style={{ flex: 1, padding: 20, fontSize: 13 }}>{item.item.label}</Text>
                </TouchableOpacity>);
            }}
          />
        </Dialog.Container>
        {this.state.successDialog
          ? <Dialog.Container visible={this.state.successDialog} onBackdropPress={() => this.setState({ successDialog: false })} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
          <Award />
          <Text style={{ color: '#229F5F', fontSize: 16 }}>Success</Text>
          <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>The Customer is created successfully.</Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              width: '70%',
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
            <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: 'center' }}>Done</Text>
          </TouchableOpacity>
        </Dialog.Container>
          : null}
        {this.state.faliureDialog
          ? <Dialog.Container visible={this.state.faliureDialog} onBackdropPress={() => this.setState({ faliureDialog: false })} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
          <Faliure />
          <Text style={{ color: '#F2596F', fontSize: 16 }}>Error!</Text>
          <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>Sorry, Failed to import the entries.</Text>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              width: '70%',
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
            <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: 'center' }}>Try Again</Text>
          </TouchableOpacity>
        </Dialog.Container>
          : null}

        <View style={{ flex: 1 }}>
          <View style={styles.rowContainer}>
            <Ionicons name="person" size={18} color="#864DD3" />
            <TextInput
              onBlur={() => {
                if (this.state.partyName == '') {
                  this.setState({ partyPlaceHolder: '' })
                }
              }}
              onFocus={() => this.setState({ partyPlaceHolder: 'a' })}
              onChangeText={(text) => {
                console.log(text)
                this.setState({ partyName: text })
              }
              }
              style={styles.input}>
              <Text style={{ color: this.state.partyPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.partyPlaceHolder == '' ? 'Enter Party Name' : this.state.partyName}</Text>
              <Text style={{ color: '#E04646' }}>{this.state.partyPlaceHolder == '' ? '*' : ''}</Text>
            </TextInput>
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

              dropdownStyle={{ width: '17%' }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
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
              style={{ ...styles.input, color: this.state.contactNumber == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }} />
          </View>
          {this.state.isMobileNoValid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 47 }}>Sorry! Invalid Number</Text>}
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
          {this.state.isEmailInvalid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 47, marginTop: -7 }}>Sorry! Invalid Email-Id</Text>}
          <View style={{ ...styles.rowContainer, marginTop: 5 }}>
            <MaterialCommunityIcons name="account-group" size={18} color="#864DD3" />
            <Dropdown
              ref={(ref) => this.state.groupDropDown = ref}
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue={this.state.selectedGroup}
              options={this.state.AllGroups}
              renderSeparator={() => {
                return (<View></View>);
              }}
              onDropdownWillShow={() => this.setState({ isGroupDD: true })}
              onDropdownWillHide={() => this.setState({ isGroupDD: false })}
              dropdownStyle={{ marginLeft: 30, width: '75%', height: 50, marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options}</Text>);
              }}
              onSelect={(index, value) => { this.setState({ selectedGroup: value }) }} />
            <Icon
              style={{ transform: [{ rotate: this.state.isGroupDD ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                this.setState({ isGroupDD: true });
                this.state.groupDropDown.show();
              }}
            />
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 25, marginBottom: 5, justifyContent: 'space-between' }}>
            <MaterialIcons name="hourglass-full" size={18} color="#864DD3" />
            <TouchableOpacity
              onPress={() => {
                this.setState({ partyDialog: true })
              }}
              style={{ flexDirection: 'row', flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: this.state.partyType == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.partyType == '' ? 'Party Type' : this.state.partyType}</Text>
              <Text style={{ color: '#E04646' }}>{this.state.partyType == '' ? '*' : ''}</Text>
            </TouchableOpacity>
            {/* <Dropdown
              ref={(ref) => this.state.partyDropDown = ref}
              style={{ flex: 1, paddingLeft: 10 }}
              textStyle={{ color: '#808080' }}
              defaultValue={this.state.partyType}
              options={this.state.allPartyType}
              renderSeparator={() => {
                return (<View></View>);
              }}
              onDropdownWillShow={() => this.setState({ isPartyDD: true })}
              onDropdownWillHide={() => this.setState({ isPartyDD: false })}
              dropdownStyle={{ marginLeft: 30, width: '75%', marginTop: 10, borderRadius: 10 }}
              dropdownTextStyle={{ color: '#1C1C1C' }}
              renderRow={(options) => {
                return (<Text style={{ padding: 13, color: '#1C1C1C' }}>{options.value}</Text>);
              }}
              renderButtonText={(text) => text.value}
              onSelect={(index, value) => { this.setState({ partyType: value.value }) }}
            /> */}
            <Icon
              style={{ transform: [{ rotate: this.state.isPartyDD ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                this.setState({ partyDialog: true });
                // this.setState({ isPartyDD: true })
                // this.state.partyDropDown.show();
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
                address: BillingAddress,
                selectAddress: (this.selectBillingAddress).bind(this),
                headerColor: '#864DD3',
                statusBarColor: '#520EAD'
              })
            }}
            style={{ ...styles.rowContainer, justifyContent: 'space-between', marginVertical: 10, paddingVertical: 10, backgroundColor: this.state.openAddress ? 'rgba(80,80,80,0.05)' : 'white' }}>
            <AntDesign
              name="pluscircle"
              size={16}
              color="#864DD3"
              style={{ transform: [{ rotate: this.state.openAddress ? '45deg' : '0deg' }] }} />
            <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10, flexDirection: 'row' }}>
              <Text style={{ color: '#1C1C1C' }}>Address Details</Text>
              <Text style={{ color: '#E04646' }}>*</Text>
            </View>
            <Icon
              style={{ transform: [{ rotate: this.state.openAddress ? '180deg' : '0deg' }] }}
              name={'9'}
              size={12}
              color="#808080"
              onPress={() => {
                if (this.state.savedAddress.state_billing.name) {
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
                    address: BillingAddress,
                    selectAddress: (this.selectBillingAddress).bind(this),
                    headerColor: '#864DD3',
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
        </View>
        {this.isCreateButtonVisible() && <TouchableOpacity
          style={{ alignSelf: 'flex-end', paddingHorizontal: 10, flex: 1 }}
          onPress={() => {
            this.genrateCustomer();
          }}>
          <Icon name={'path-18'} size={48} color={'#5773FF'} />
        </TouchableOpacity>}
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
              top: 0
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

function Screen (props) {
  const isFocused = useIsFocused();

  return <Customers {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps)(Screen);
