import React, { createRef } from 'react';
import { Text, View, TextInput, TouchableOpacity, Alert, DeviceEventEmitter, FlatList, Keyboard, Platform, SafeAreaView, ScrollView } from 'react-native';
import styles from './style';
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
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import { useIsFocused } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';// customer_faliure.svg
import Faliure from '../../assets/images/icons/customer_faliure.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import { getRegionCodeForCountryCode } from '@/core/services/storage/storage.service';
import Modal from 'react-native-modal';
import Fontisto from 'react-native-vector-icons/Fontisto';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';
import BottomSheet from '@/components/BottomSheet';

const PhoneNumber = require('awesome-phonenumber');
interface Props {
  resetFun: any;
  navigation: any;
}

export class Vendors extends React.Component<Props> {
  private showGroupBottomSheetRef: React.Ref<BottomSheet>;
  private partyTypeBottomSheetRef: React.Ref<BottomSheet>;
  constructor(props: any) {
    super(props);
    this.showGroupBottomSheetRef = createRef<BottomSheet>();
    this.partyTypeBottomSheetRef = createRef<BottomSheet>();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.onPressFlag = this.onPressFlag.bind(this);
    this.selectCountry = this.selectCountry.bind(this);
    this.updateInfo = this.updateInfo.bind(this);
    this.setState({picker:false})
  }

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

  getProps = async (uniqueName: any) => {
    await this.setState({ loading: true })
    const vendorEntry = await CustomerVendorService.getVendorEntry(uniqueName)
    if (vendorEntry.body && vendorEntry.status == "success") {
      const vendorEntryResponse = vendorEntry.body
      console.log("RESULT " + JSON.stringify(vendorEntryResponse))
      var mobileCode = ""
      if (vendorEntryResponse.mobileNo) {
        mobileCode = vendorEntryResponse.mobileNo.split('-')[0]
      }
      await this.setState({
        partyName: vendorEntryResponse.name,
        partyPlaceHolder: 'a',
        selectedGroup: vendorEntryResponse.parentGroups[vendorEntryResponse.parentGroups.length - 1].name,
        selectedGroupUniqueName: vendorEntryResponse.parentGroups[vendorEntryResponse.parentGroups.length - 1].uniqueName,
        contactNumber: vendorEntryResponse.mobileNo ? (vendorEntryResponse.mobileNo).replace('-','') : '',
        emailId: vendorEntryResponse.emails.length > 0 ? vendorEntryResponse.emails[0] : '',
        partyType: vendorEntryResponse.addresses[0].partyType,
        savedAddress: {
          street_billing: vendorEntryResponse.addresses[0].address,
          gstin_billing: vendorEntryResponse.addresses[0].gstNumber,
          state_billing: vendorEntryResponse.addresses[0].state,
          pincode: vendorEntryResponse.addresses[0].pincode ? vendorEntryResponse.addresses[0].pincode : '',
          isDefault: vendorEntryResponse.addresses[0].isDefault ? vendorEntryResponse.addresses[0].isDefault : false
        },
        street_billing: vendorEntryResponse.addresses[0].address,
        gstin_billing: vendorEntryResponse.addresses[0].gstNumber,
        state_billing: vendorEntryResponse.addresses[0].state,
        radioBtn: vendorEntryResponse.openingBalanceType == 'DEBIT' ? 0 : 1,
        foreignOpeningBalance: vendorEntryResponse.foreignOpeningBalance,
        openingBalance: vendorEntryResponse.openingBalance,
        selectedCurrency: vendorEntryResponse.currency,
        selectedCallingCode: mobileCode,
        countryFromProps: vendorEntryResponse.country,
        bankName: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].bankName == null ? '' : vendorEntryResponse.accountBankDetails[0].bankName) : '',
        beneficiaryName: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].beneficiaryName != null ? vendorEntryResponse.accountBankDetails[0].beneficiaryName : '') : '',
        bankBranchName: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].branchName != null ? vendorEntryResponse.accountBankDetails[0].branchName : '') : '',
        bankAccountSwiftCode: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].swiftCode != null ? vendorEntryResponse.accountBankDetails[0].swiftCode : '') : '',
        bankAccountNumber: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].bankAccountNo != null ? vendorEntryResponse.accountBankDetails[0].bankAccountNo : '') : '',
        IFSC_Code: vendorEntryResponse.accountBankDetails.length > 0 ? (vendorEntryResponse.accountBankDetails[0].ifsc != null ? vendorEntryResponse.accountBankDetails[0].ifsc : '') : '',
      })
      await this.setActiveCompanyCountry();
      this.getInitialNumber(this.state.contactNumber)
      
    }
  }

  clearAll = async () => {
    console.log('CLEAR ALLL Vendor')
    await this.resetState();
    await Keyboard.dismiss();
    await this.getAllDeatils();
    await this.setActiveCompanyCountry()
    await this.checkStoredCountryCode();
    await this.phone.setValue('91');
    await this.state.partyDropDown.select(-1);
  }

  async getAllDeatils() {
    const allPartyTypes = await CustomerVendorService.getAllPartyType()
    await this.setState({ allPartyType: allPartyTypes.body.partyTypes })
    const vendorGroupName = await CustomerVendorService.getVendorGroupName()
    await this.setState({ AllGroups: vendorGroupName.body.results })
  }

  async setActiveCompanyCountry() {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(this.state.countryFromProps != '' ? this.state.countryFromProps.countryCode : activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          activeCompanyCountryCode: activeCompanyCountryCode,
          selectedCountry: results.body.country,
        })
        if (this.state.selectedCallingCode == "" || this.state.countryFromProps == '') {
          await this.setState({
            selectedCallingCode: results.body.country.callingCode,
          })
        }
        if (this.state.countryFromProps == '') { this.setState({ selectedCurrency: results.body.country.currency.code }) }
        await this.setState({ loading: false });
      }
    } catch (e) { }
    await this.setState({ loading: false });
  }

  state = {
    picker:false,
    pickerData: null,
    cca2: 'US',
    loading: false,
    partyName: '',
    contactNumber: '',
    emailId: '',
    partyType: "NOT APPLICABLE",
    allPartyType: [],
    AllGroups: [],
    ref: RBSheet,
    allStates: [],
    savedAddress: {
      street_billing: '',
      gstin_billing: '',
      state_billing: '',
      pincode: '',
      isDefault: false
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
    allCurrency: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],
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
    allCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
    selectedCallingCode: '91',
    successDialog: false,
    faliureDialog: false,
    selectedGroup: 'Sundry Creditors',
    selectedGroupUniqueName: 'sundrycreditors',
    partyDropDown: Dropdown,
    showBankDetails: false,
    bankName: '',
    beneficiaryName: '',
    bankBranchName: '',
    bankAccountSwiftCode: '',
    bankAccountNumber: '',
    IFSC_Code: '',
    isEmailInvalid: false,
    isMobileNoValid: false,
    isGroupDD: false,
    isPartyDD: false,
    partyPlaceHolder: '',
    showForgeinBalance: true,
    activeCompanyCountryCode: '',
    isAccountNoValid: false,
    isSwiftCodeValid: false,
    countryFromProps: '',
    faliureMessage: '',
    isMobileModalVisible: false,
    isCurrencyModalVisible: false,
    filteredCurrencyData: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],
    filteredCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
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

  selectBillingAddress = async (address) => {
    const newAddress = {
      street_billing: address.address,
      gstin_billing: address.gstNumber,
      state_billing: address.state,
      pincode: address.pincode
    };
    const companyCountry = this.state.activeCompanyCountryCode

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

  renderSavedAddress = () => {
    return (
      <View style={{ marginLeft: 46, marginTop: 10, marginBottom: 5 }}>
        <Text style={{ fontFamily: FONT_FAMILY.regular }}>Billing Address*</Text>
        {this.state.selectedCountry && this.state.savedAddress.state_billing != '' && <Text style={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }} >{this.state.selectedCountry.countryName}</Text>}
        {this.state.savedAddress.street_billing != '' && <Text style={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }} >{this.state.savedAddress.street_billing}</Text>}
        {this.state.savedAddress.state_billing != '' && <Text style={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}>{this.state.savedAddress.state_billing.name}</Text>}
        {this.state.savedAddress.pincode != '' && <Text style={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}>{this.state.savedAddress.pincode}</Text>}
        {this.state.savedAddress.gstin_billing != '' && <Text style={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}>{this.state.savedAddress.gstin_billing}</Text>}
      </View>);
  };

  renderBalanceDetails = () => {
    return (
      <View style={{ marginHorizontal: 20, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >Set Currency (account)</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%', }}>Choose currency for opening Balance eg.INR  </Text> */}
          </View>
          <View style={{ ...styles.rowContainer, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "30%", borderWidth: 1, borderColor: '#d9d9d9', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                  filteredCurrencyData: this.state.allCurrency,
                })
              }} style={{ padding: 2, flex: 1 }}><Text
                style={{ color: '#1C1C1C', fontSize: 15, marginTop: 3, fontFamily: 'AvenirLTStd-Book', marginLeft: 10, paddingHorizontal: 5 }}
              >{this.state.selectedCurrency}</Text></TouchableOpacity>
            {/* <Dropdown
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

              style={{ flex: 1 }}
              dropdownStyle={{ marginTop: Platform.OS == "ios" ? 13 : 11, width: Dimensions.get('screen').width > 550 ? Dimensions.get('screen').width / 3.5 : Dimensions.get('screen').width / 3.68, marginRight: -43, borderRadius: 0 }}
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
            /> */}
          </View>
        </View>
        {this.state.showForgeinBalance && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <View style={{ width: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >Foreign Opening Balance</Text>
              <Foundation name="info" size={16} color="#b2b2b2" />
            </View>
            {/* <Text style={{ color: '#808080', fontSize: 12, maxWidth: '80%' }}>Enter Amount</Text> */}
          </View>
          <TextInput
            returnKeyType={'done'}
            keyboardType="number-pad"
            onChangeText={(val) => { this.setState({ foreignOpeningBalance: val }) }}
            value={this.state.foreignOpeningBalance}
            placeholder="Amount"
            placeholderTextColor={'rgba(80,80,80,0.5)'}
            style={{ borderWidth: 1, borderColor: '#d9d9d9', width: '30%', height: 40, paddingStart: 10, fontFamily: 'AvenirLTStd-Book' }} />
        </View>}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
          <View style={{ width: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >Opening Balance</Text>
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
                      labelStyle={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}
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
            placeholderTextColor={'rgba(80,80,80,0.5)'}
            value={this.state.openingBalance.toString()}
            placeholder={"Amount"}
            returnKeyType={'done'}
            style={{ borderWidth: 1, width: '30%', borderColor: '#d9d9d9', height: '70%', paddingStart: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} />
        </View>
      </View>
    );
  }

  renderBankDetails = () => {
    return (
      <View style={{ marginLeft: 20, marginRight: 20, marginBottom: 20 }}>
        {this.state.selectedCountry.alpha2CountryCode == 'AE'
          ? <View>
            <Text style={{ width: '100%', color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>Beneficiary Name</Text>
            <TextInput
              style={{
                borderBottomColor: '#808080',
                borderBottomWidth: 0.55,
                paddingBottom: -5,
                fontFamily: 'AvenirLTStd-Book', marginVertical: 5
              }}
              returnKeyType={"done"}
              placeholder={'Enter Beneficiary Name '}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              value={this.state.beneficiaryName != '' ? this.state.beneficiaryName : ''}
              onChangeText={(text) => this.setState({ beneficiaryName: text })} />
          </View>
          : null
        }
        <Text style={{ width: '100%', color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>Bank Name</Text>
        <TextInput
          style={{
            borderBottomColor: '#808080',
            borderBottomWidth: 0.55,
            paddingBottom: -5,
            fontFamily: 'AvenirLTStd-Book', marginVertical: 5
          }}
          returnKeyType={"done"}
          placeholderTextColor={'rgba(80,80,80,0.5)'}
          placeholder={'Enter Bank Name '}
          value={this.state.bankName != '' ? this.state.bankName : ''}
          onChangeText={(text) => this.setState({ bankName: text })} />
        {this.state.selectedCountry.alpha2CountryCode == 'AE'
          ? <View>
            <Text style={{ width: '100%', color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>Branch Name</Text>
            <TextInput
              style={{
                borderBottomColor: '#808080',
                borderBottomWidth: 0.55,
                paddingBottom: -5,
                fontFamily: 'AvenirLTStd-Book', marginVertical: 5
              }}
              returnKeyType={"done"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder={'Enter Branch Name'}
              value={this.state.bankBranchName != '' ? this.state.bankBranchName : ''}
              onChangeText={(text) => this.setState({ bankBranchName: text })} />
          </View>
          : null
        }
        <Text style={{ color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>{this.state.selectedCountry.alpha2CountryCode == 'IN' ? 'Account Number' : 'IBAN'}</Text>
        <TextInput
          style={{
            borderBottomColor: '#808080',
            borderBottomWidth: 0.55,
            paddingBottom: -5,
            fontFamily: 'AvenirLTStd-Book', marginVertical: 5
          }}
          returnKeyType={"done"}
          placeholderTextColor={'rgba(80,80,80,0.5)'}
          placeholder={'Enter Account No. '}
          value={this.state.bankAccountNumber != '' ? this.state.bankAccountNumber : ''}
          onChangeText={(text) => this.setState({ bankAccountNumber: text, isAccountNoValid: !this.validateBankAccountNumberFromTextInput(text) })} />
        {this.state.isAccountNoValid && <Text style={{ fontSize: 10, color: 'red', marginTop: 0 }}>{this.state.selectedCountry.alpha2CountryCode == 'IN' ? 'Account number must contains 9 to 18 characters' : 'IBAN number must contains 23 to 34 characters'}</Text>}
        {this.state.selectedCountry.alpha2CountryCode == 'AE'
          ? <View>
            <Text style={{ width: '100%', color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>SWIFT Code/BIC</Text>
            <TextInput
              style={{
                borderBottomColor: '#808080',
                borderBottomWidth: 0.55,
                paddingBottom: -5,
                fontFamily: 'AvenirLTStd-Book', marginVertical: 5
              }}
              returnKeyType={"done"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder={'Enter SWIFT/BIC Code'}
              value={this.state.bankAccountSwiftCode != '' ? this.state.bankAccountSwiftCode : ''}
              onChangeText={(text) => this.setState({ bankAccountSwiftCode: text, isSwiftCodeValid: !this.validateBankSwiftCodeFromTextInput(text) })} />
            {this.state.isSwiftCodeValid && <Text style={{ fontSize: 10, color: 'red', marginTop: 0 }}>SWIFT Code/BIC must conatins 8 to 11 characters.</Text>}
          </View>
          : <View>
            <Text style={{ color: '#808080', marginTop: 10, fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>IFSC Code</Text>
            <TextInput
              style={{
                borderBottomColor: '#808080',
                borderBottomWidth: 0.55,
                paddingBottom: -5,
                fontFamily: 'AvenirLTStd-Book', marginVertical: 5
              }}
              returnKeyType={"done"}
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder={'Enter IFSC Code'}
              value={this.state.IFSC_Code != '' ? this.state.IFSC_Code : ''}
              onChangeText={(text) => this.setState({ IFSC_Code: text })} />
          </View>
        }
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
    // var getRegionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode);
    // var pn = new PhoneNumber(this.state.contactNumber.toString(), getRegionCode);
    // if (!pn.isValid()) {
    //   Alert.alert('Error', 'Please enter valid phone number.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
    //   return false
    // }
    if(this.state.isMobileNoValid){
      return false
    }
    return true
  }

  validateMobileNumberTextInput = (mobileNo: any) => {
    if (mobileNo == '') {
      return true
    }
    //alert(PhoneNumber.getExample( 'SA', 'mobile' ).getNumber())
    var getRegionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode);
    var pn = new PhoneNumber(mobileNo.toString(), getRegionCode);
    return pn.isValid()
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

  validateBankAccountNumber() {
    if (this.state.bankAccountNumber == '') {
      return true
    }
    if (this.state.selectedCountry.alpha2CountryCode == 'IN' && (this.state.bankAccountNumber.length < 9 || this.state.bankAccountNumber.length > 18)) {
      Alert.alert('Error', 'Account Number must conatins 9 to 18 characters.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    } else if (this.state.selectedCountry.alpha2CountryCode != 'IN' && (this.state.bankAccountNumber.length < 23 || this.state.bankAccountNumber.length > 34)) {
      Alert.alert('Error', 'IBAN Number must conatins 23 to 34 characters.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    }
    return true
  }

  validateBankSwiftCode() {
    if (this.state.bankAccountSwiftCode == '') {
      return true
    }
    if (this.state.bankAccountSwiftCode.length < 8 || this.state.bankAccountSwiftCode.length > 11) {
      Alert.alert('Error', 'SWIFT Code/BIC must conatins 8 to 11 characters.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
      return false;
    }
    return true
  }

  validateBankAccountNumberFromTextInput(accountNumber: any) {
    console.log(this.state.selectedCountry.alpha2CountryCode)
    if (accountNumber == '') {
      return true
    }
    if (this.state.selectedCountry.alpha2CountryCode == 'IN' && (accountNumber.length < 9 || accountNumber.length > 18)) {
      return false;
    } else if (this.state.selectedCountry.alpha2CountryCode != 'IN' && (accountNumber.length < 23 || accountNumber.length > 34)) {
      return false;
    }
    return true
  }

  validateBankSwiftCodeFromTextInput(swiftCode: any) {
    if (swiftCode == '') {
      return true
    }
    if (swiftCode.length < 8 || swiftCode.length > 11) {
      return false;
    }
    return true
  }

  bankDetailsCheck() {
    if (this.state.selectedCountry.alpha2CountryCode != 'AE') {
      if (this.state.bankName == '' && this.state.IFSC_Code == '' && this.state.bankAccountNumber == '') {
        return true
      } else if (this.state.bankName == '' || this.state.IFSC_Code == '' || this.state.bankAccountNumber == '') {
        Alert.alert('Error', 'All the bank fields are mandatory if you provide data for any of them', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return false
      }
      return true
    } else {
      if (this.state.bankName == '' && this.state.beneficiaryName == '' && this.state.bankBranchName == '' && this.state.bankAccountSwiftCode == '' && this.state.bankAccountNumber == '') {
        return true
      } else if (this.state.bankName == '' || this.state.beneficiaryName == '' || this.state.bankBranchName == '' || this.state.bankAccountSwiftCode == '' || this.state.bankAccountNumber == '') {
        Alert.alert('Error', 'All the bank fields are mandatory if you provide data for any of them', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return false
      }
      return true
    }
  }

  genrateCustomer = () => {
    if (!this.state.partyName) {
      Alert.alert('Error', 'Please select a party.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
    } else {
      if (this.validateMobileNumber() && this.validateEmail() && this.validateBankAccountNumber() && this.validateBankSwiftCode() && this.bankDetailsCheck()) {
        this.createCustomerRequest();
      }
    }
  }

  createCustomerRequest = async () => {
    this.setState({ loading: true });
    try {
      const postBody = {
        activeGroupUniqueName: this.state.selectedGroup,
        name: this.state.partyName,
        uniqueName: this.props.uniqueName ? this.props.uniqueName : '',
        openingBalanceType: this.state.radioBtn == 0 ? 'DEBIT' : 'CREDIT',
        foreignOpeningBalance: this.state.foreignOpeningBalance,
        openingBalance: this.state.openingBalance,
        mobileNo: this.state.contactNumber,
        mobileCode: this.state.selectedCallingCode,
        email: this.state.emailId,
        companyName: '',
        attentionTo: '',
        description: '',
        addresses: [
          {
            gstNumber: this.state.savedAddress.gstin_billing,
            address: this.state.savedAddress.street_billing,
            state: this.state.savedAddress.state_billing != '' ? this.state.savedAddress.state_billing : { code: null, name: '', stateGstCode: '' },
            stateCode: this.state.savedAddress.state_billing ? this.state.savedAddress.state_billing.stateGstCode : null,
            isDefault: this.state.savedAddress.isDefault ? this.state.savedAddress.isDefault : false,
            isComposite: false,
            partyType: this.state.partyType,
            pincode: this.state.savedAddress.pincode
          }
        ],
        country: {
          countryCode: this.state.selectedCountry.alpha2CountryCode
        },
        currency: this.state.selectedCurrency,
        // currency: 'INR',
        accountBankDetails: [{
          bankName: this.state.bankName,
          bankAccountNo: this.state.bankAccountNumber,
          ifsc: this.state.IFSC_Code,
          beneficiaryName: this.state.beneficiaryName,
          branchName: this.state.bankBranchName,
          swiftCode: this.state.bankAccountSwiftCode
        }],
        closingBalanceTriggerAmount: '',
        closingBalanceTriggerAmountType: '',
        customFields: [
        ],
        hsnNumber: '',
        sacNumber: ''
      }
      console.log('Create Customer postBody is', JSON.stringify(postBody));
      let results;
      if (this.props.uniqueName != null) {
        results = await CustomerVendorService.updateVendor(postBody, this.props.uniqueName,this.state.selectedGroupUniqueName);
      } else {
        results = await CustomerVendorService.createVendor(this.state.selectedGroupUniqueName,postBody);
      }
      if (results.status == 'success') {
        await DeviceEventEmitter.emit(APP_EVENTS.CustomerCreated, {});
        await this.resetState();
        this.phone.setValue('91');
        // this.state.partyDropDown.select(-1);
        await this.setState({ successDialog: true });
        this.setActiveCompanyCountry()
        this.getAllDeatils();
        this.checkStoredCountryCode();
        await this.setState({ loading: false });
      } else {
        this.setState({ faliureDialog: true, faliureMessage: results.message });
        this.setState({ loading: false });
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ faliureDialog: true, faliureMessage: "" });
      this.setState({ loading: false });
    }
    this.setState({ loading: false });
  }

  resetState = () => {
    this.setState({
      picker:false,
      pickerData: null,
      cca2: 'US',
      loading: false,
      partyName: '',
      contactNumber: '',
      emailId: '',
      partyType: 'not applicable',
      allPartyType: [],
      AllGroups: [],
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
      street_shipping: '',
      gstin_shipping: '',
      state_shipping: '',
      shippingSame: false,
      openAddress: false,
      showBalanceDetails: false,
      creditPeriodRef: Dropdown,
      radioBtn: 0,
      foreignOpeningBalance: '0',
      openingBalance: '0',
      selectedCurrency: 'INR',
      allCurrency: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],
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
      allCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
      selectedCallingCode: '91',
      successDialog: false,
      faliureDialog: false,
      selectedGroup: 'Sundry Creditors',
      selectedGroupUniqueName: 'sundrycreditors',
      partyDropDown: Dropdown,
      showBankDetails: false,
      bankName: '',
      bankAccountNumber: '',
      IFSC_Code: '',
      isEmailInvalid: false,
      isMobileNoValid: false,
      partyPlaceHolder: '',
      isGroupDD: false,
      isPartyDD: false,
      activeCompanyCountryCode: '',
      isAccountNoValid: false,
      isSwiftCodeValid: false,
      countryFromProps: '',
      faliureMessage: '',
      isMobileModalVisible: false,
      isCurrencyModalVisible: false,
      filteredCurrencyData: [{ "code": "AMD", "symbol": "֏" }, { "code": "AZN", "symbol": "₼" }, { "code": "BAM", "symbol": "KM" }, { "code": "KZT", "symbol": "₸" }, { "code": "LTL", "symbol": "Lt" }, { "code": "LVL", "symbol": "Ls" }, { "code": "EEK", "symbol": "kr" }, { "code": "STD", "symbol": "Db" }, { "code": "SCR", "symbol": "SRe" }, { "code": "SLL", "symbol": "Le" }, { "code": "SBD", "symbol": "$" }, { "code": "SZL", "symbol": "L" }, { "code": "TJS", "symbol": "ЅМ" }, { "code": "FKP", "symbol": "£" }, { "code": "LAK", "symbol": "₭" }, { "code": "KPW", "symbol": "₩" }, { "code": "SHP", "symbol": "£" }, { "code": "XCD", "symbol": "$" }, { "code": "USD", "symbol": "$" }, { "code": "CAD", "symbol": "$" }, { "code": "EUR", "symbol": "€" }, { "code": "AED", "symbol": "د.إ" }, { "code": "AFN", "symbol": "؋" }, { "code": "ALL", "symbol": "L" }, { "code": "ARS", "symbol": "$" }, { "code": "AUD", "symbol": "$" }, { "code": "BDT", "symbol": "৳" }, { "code": "BGN", "symbol": "лв" }, { "code": "BHD", "symbol": ".د.ب" }, { "code": "BIF", "symbol": "Fr" }, { "code": "BND", "symbol": "$" }, { "code": "BOB", "symbol": "Bs." }, { "code": "BRL", "symbol": "R$" }, { "code": "BWP", "symbol": "P" }, { "code": "BYR", "symbol": "Br" }, { "code": "BZD", "symbol": "$" }, { "code": "CDF", "symbol": "Fr" }, { "code": "CHF", "symbol": "Fr" }, { "code": "CLP", "symbol": "$" }, { "code": "CNY", "symbol": "¥" }, { "code": "COP", "symbol": "$" }, { "code": "CRC", "symbol": "₡" }, { "code": "CVE", "symbol": "Esc" }, { "code": "CZK", "symbol": "Kč" }, { "code": "DJF", "symbol": "Fr" }, { "code": "DKK", "symbol": "kr" }, { "code": "DOP", "symbol": "$" }, { "code": "DZD", "symbol": "د.ج" }, { "code": "EGP", "symbol": "£" }, { "code": "SRD", "symbol": "$" }, { "code": "FJD", "symbol": "$" }, { "code": "XPF", "symbol": "₣" }, { "code": "GMD", "symbol": "D" }, { "code": "GIP", "symbol": "£" }, { "code": "GYD", "symbol": "$" }, { "code": "HTG", "symbol": "G" }, { "code": "KGS", "symbol": "Лв" }, { "code": "LSL", "symbol": "M" }, { "code": "LRD", "symbol": "$" }, { "code": "MWK", "symbol": "MK" }, { "code": "MVR", "symbol": ".ރ" }, { "code": "MRO", "symbol": "UM" }, { "code": "MNT", "symbol": "₮" }, { "code": "PGK", "symbol": "K" }, { "code": "WST", "symbol": "T" }, { "code": "AOA", "symbol": "Kz" }, { "code": "AWG", "symbol": "ƒ" }, { "code": "BSD", "symbol": "$" }, { "code": "BBD", "symbol": "$" }, { "code": "BYN", "symbol": "Br" }, { "code": "BMD", "symbol": "$" }, { "code": "BTN", "symbol": "Nu." }, { "code": "KYD", "symbol": "$" }, { "code": "CUC", "symbol": "$" }, { "code": "CUP", "symbol": "$" }, { "code": "TMT", "symbol": "m" }, { "code": "VUV", "symbol": "Vt" }, { "code": "ERN", "symbol": "Nfk" }, { "code": "ETB", "symbol": "Br" }, { "code": "GBP", "symbol": "£" }, { "code": "GEL", "symbol": "ლ" }, { "code": "GHS", "symbol": "₵" }, { "code": "GNF", "symbol": "Fr" }, { "code": "GTQ", "symbol": "Q" }, { "code": "HKD", "symbol": "$" }, { "code": "HNL", "symbol": "L" }, { "code": "HRK", "symbol": "kn" }, { "code": "HUF", "symbol": "Ft" }, { "code": "IDR", "symbol": "Rp" }, { "code": "ILS", "symbol": "₪" }, { "code": "INR", "symbol": "₹" }, { "code": "IQD", "symbol": "ع.د" }, { "code": "IRR", "symbol": "﷼" }, { "code": "ISK", "symbol": "kr" }, { "code": "JMD", "symbol": "$" }, { "code": "JOD", "symbol": "د.ا" }, { "code": "JPY", "symbol": "¥" }, { "code": "KES", "symbol": "Sh" }, { "code": "KHR", "symbol": "៛" }, { "code": "KMF", "symbol": "Fr" }, { "code": "KRW", "symbol": "₩" }, { "code": "KWD", "symbol": "د.ك" }, { "code": "LBP", "symbol": "ل.ل" }, { "code": "LKR", "symbol": "Rs" }, { "code": "LYD", "symbol": "ل.د" }, { "code": "MAD", "symbol": "د.م." }, { "code": "MDL", "symbol": "L" }, { "code": "MGA", "symbol": "Ar" }, { "code": "MKD", "symbol": "ден" }, { "code": "MMK", "symbol": "Ks" }, { "code": "MOP", "symbol": "P" }, { "code": "MUR", "symbol": "₨" }, { "code": "MXN", "symbol": "$" }, { "code": "MYR", "symbol": "RM" }, { "code": "MZN", "symbol": "MT" }, { "code": "NAD", "symbol": "$" }, { "code": "NGN", "symbol": "₦" }, { "code": "NIO", "symbol": "C$" }, { "code": "NOK", "symbol": "kr" }, { "code": "NPR", "symbol": "₨" }, { "code": "NZD", "symbol": "$" }, { "code": "OMR", "symbol": "ر.ع." }, { "code": "PAB", "symbol": "B/." }, { "code": "PEN", "symbol": "S/." }, { "code": "PHP", "symbol": "₱" }, { "code": "PKR", "symbol": "₨" }, { "code": "PLN", "symbol": "zł" }, { "code": "PYG", "symbol": "₲" }, { "code": "QAR", "symbol": "ر.ق" }, { "code": "RON", "symbol": "lei" }, { "code": "RSD", "symbol": "дин." }, { "code": "RUB", "symbol": "₽" }, { "code": "RWF", "symbol": "Fr" }, { "code": "SAR", "symbol": "ر.س" }, { "code": "SDG", "symbol": "ج.س." }, { "code": "SEK", "symbol": "kr" }, { "code": "SGD", "symbol": "$" }, { "code": "SOS", "symbol": "Sh" }, { "code": "SYP", "symbol": "£" }, { "code": "THB", "symbol": "฿" }, { "code": "TND", "symbol": "د.ت" }, { "code": "TOP", "symbol": "T$" }, { "code": "TTD", "symbol": "$" }, { "code": "TWD", "symbol": "$" }, { "code": "TZS", "symbol": "Sh" }, { "code": "UAH", "symbol": "₴" }, { "code": "UGX", "symbol": "Sh" }, { "code": "UYU", "symbol": "$" }, { "code": "VEF", "symbol": "Bs F" }, { "code": "VND", "symbol": "₫" }, { "code": "XAF", "symbol": "Fr" }, { "code": "XOF", "symbol": "Fr" }, { "code": "YER", "symbol": "﷼" }, { "code": "ZAR", "symbol": "Rs" }, { "code": "TRY", "symbol": "₺" }, { "code": "UZS", "symbol": "so'm" }, { "code": "ZMW", "symbol": "ZK" }],
      filteredCallingCode: ["590", "591", "350", "592", "230", "351", "593", "352", "231", "353", "595", "232", "354", "233", "234", "355", "597", "356", "235", "598", "236", "357", "237", "358", "359", "238", "239", "1473", "240", "241", "242", "1", "243", "244", "245", "246", "1345", "248", "249", "7", "20", "27", "1242", "370", "371", "250", "372", "251", "252", "373", "374", "253", "254", "375", "376", "255", "377", "256", "378", "257", "258", "379", "30", "31", "32", "33", "34", "36", "39", "1809", "380", "381", "260", "261", "382", "262", "263", "264", "385", "386", "265", "387", "266", "267", "1246", "389", "268", "269", "40", "41", "43", "44", "45", "46", "47", "48", "49", "1264", "51", "52", "53", "54", "55", "56", "57", "58", "960", "961", "1268", "962", "963", "964", "965", "966", "60", "967", "968", "61", "62", "63", "4779", "64", "65", "66", "290", "291", "1284", "297", "298", "299", "850", "971", "972", "852", "973", "974", "853", "975", "855", "976", "977", "856", "76", "500", "501", "502", "503", "504", "81", "505", "82", "506", "507", "84", "508", "86", "509", "992", "993", "994", "995", "996", "90", "91", "998", "92", "93", "94", "95", "98", "880", "886", "1869", "1868", "1 340", "1876", "1758", "1767", "420", "421", "423", "1649", "670", "672", "673", "674", "675", "676", "677", "678", "679", "1671", "1670", "680", "681", "682", "683", "1787", "685", "686", "1664", "1784", "687", "688", "689", "690", "691", "692", "212", "213", "216", "218", "220", "221", "222", "223", "224", "225", "1684", "226", "227", "1441", "228", "229"],
    })
  }

  componentDidMount() {
    console.log('mounting Vendor');
    this.setActiveCompanyCountry()
    this.getAllDeatils();
    this.checkStoredCountryCode();
    this.props.uniqueName && this.getProps(this.props.uniqueName)
    this.props.resetFun(this.clearAll);
    this.setState({
      pickerData: this.phone.getPickerData(),
    });
  }

  onPressFlag() {
    this.setState({picker:true})
    }
    updateInfo() {
      if(this.phone.isValidNumber()){
        this.setState({isMobileNoValid:false})
      }else{
        this.setState({isMobileNoValid:true})
      }
    }
    getInitialNumber(number){
      this.phone.setValue(number)
    }
  
    selectCountry(country) {
      console.log(country);
      this.phone.selectCountry(country.cca2.toLowerCase());
      this.setState({ cca2: country.cca2 });
    }
    setSelectedCountry(cca2){
      this.phone.selectCountry(cca2.toLowerCase());
      this.setState({ cca2: cca2 });
      this.phone.focus();
    }

  checkStoredCountryCode = async () => {
    const storedCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
    if (storedCode == this.state.selectedCountry.alpha2CountryCode) {
      this.setState({ showForgeinBalance: false })
    } else {
      this.setState({ showForgeinBalance: true });
    }
  }

  getMobilePlaceHolder = () => {
    var regionCode = getRegionCodeForCountryCode(this.state.selectedCallingCode)
    let placeholder = regionCode != null ? PhoneNumber.getExample(regionCode, 'mobile').getNumber('significant') : "Enter Contact number"
    return placeholder
  }

  searchCallingCode = (text: string) => {
    if (text == '') {
      this.setState({
        filteredCallingCode: this.state.allCallingCode,
      })
      return
    }
    let filteredCallingCode: any[] = [];
    for (let i = 0; i < this.state.allCallingCode.length; i++) {
      if (this.state.allCallingCode[i].includes(text)) {
        filteredCallingCode.push(this.state.allCallingCode[i]);
      }
    }
    this.setState({ filteredCallingCode })
  };

  searchCurrency = (text: string) => {
    if (text == '') {
      this.setState({
        filteredCurrencyData: this.state.allCurrency,
      })
      return
    }
    let filteredCurrencyData: any[] = [];
    for (let i = 0; i < this.state.filteredCurrencyData.length; i++) {
      if (this.state.filteredCurrencyData[i].code.toLowerCase().includes(text.toLowerCase())) {
        filteredCurrencyData.push(this.state.filteredCurrencyData[i]);
      }
    }
    this.setState({ filteredCurrencyData })
  };

  renderItem(callingCode: any) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity style={{ paddingVertical: 10, width: "90%", }}
          onPress={async () => {
            await this.setState({ isMobileModalVisible: false, selectedCallingCode: callingCode })
            await this.setState({ isMobileNoValid: !this.validateMobileNumberTextInput(this.state.contactNumber) })
          }}>
          <Text style={{ fontSize: 15, color: '#1c1c1c' }}>{callingCode}</Text>
        </TouchableOpacity>
        <View style={styles.borderInModal} />
      </View>
    );
  }

  renderCurrencyItem(Currency: any) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <TouchableOpacity style={{ paddingVertical: 10, width: "90%", flexDirection: "row", justifyContent: "space-between" }}
          onPress={() => {
            this.setState({ selectedCurrency: Currency.code, isCurrencyModalVisible: false })
          }}>
          <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{Currency.code}</Text>
          <Text style={{ fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}>{Currency.symbol}</Text>
        </TouchableOpacity>
        <View style={styles.borderInModal} />
      </View>
    );
  }

  renderModalView = () => {
    return (
      <Modal isVisible={this.state.isMobileModalVisible} onBackdropPress={() => { this.setState({ isMobileModalVisible: !this.state.isMobileModalVisible }) }}
        onBackButtonPress={() => { this.setState({ isMobileModalVisible: !this.state.isMobileModalVisible }) }}
        style={[styles.modalMobileContainer, { paddingTop: Platform.OS == "ios" ? this.props?.insets?.top : 0 }]}>
        <SafeAreaView style={styles.modalViewContainer}>
          <View style={styles.cancelButtonModal} >
            <TouchableOpacity onPress={() => { this.setState({ isMobileModalVisible: false }) }} style={styles.cancelButtonTextModal}>
              <Fontisto name="close-a" size={Platform.OS == "ios" ? 10 : 18} color={'black'} style={{ marginTop: 5 }} />
            </TouchableOpacity>
            <TextInput
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder="Enter Calling Code"
              keyboardType={'number-pad'}
              returnKeyType={"done"}
              style={{ marginTop: 10, borderRadius: 5, width: "80%", marginHorizontal: 15, fontSize: 15, color: '#1c1c1c' }}
              onChangeText={(text) => {
                this.searchCallingCode(text);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              scrollEnabled
              data={this.state.filteredCallingCode}
              renderItem={({ item }) => this.renderItem(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  renderCurrencyModalView = () => {
    return (
      <Modal isVisible={this.state.isCurrencyModalVisible} onBackdropPress={() => { this.setState({ isCurrencyModalVisible: !this.state.isCurrencyModalVisible }) }}
        onBackButtonPress={() => { this.setState({ isCurrencyModalVisible: !this.state.isCurrencyModalVisible }) }}
        style={[styles.modalMobileContainer, { paddingTop: Platform.OS == "ios" ? this.props?.insets?.top : 0 }]}>
        <SafeAreaView style={styles.modalViewContainer}>
          <View style={styles.cancelButtonModal} >
            <TextInput
              placeholderTextColor={'rgba(80,80,80,0.5)'}
              placeholder="Enter Currency e.g. INR"
              returnKeyType={"done"}
              style={{ height: 50, borderRadius: 5, width: "80%", fontSize: 15, fontFamily: 'AvenirLTStd-Book', color: '#1c1c1c' }}
              onChangeText={(text) => {
                this.searchCurrency(text);
              }}
            />
            <TouchableOpacity onPress={() => { this.setState({ isCurrencyModalVisible: false }) }} style={styles.cancelButtonTextModal}>
              <Fontisto name="close-a" size={18} color={'black'}/>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <FlatList
              scrollEnabled
              data={this.state.filteredCurrencyData}
              renderItem={({ item }) => this.renderCurrencyItem(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  allGroupsBottomSheet(){
    const renderItem = ({name, uniqueName}: {name: string, uniqueName: string}) => {
      return (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            this.setState({ 
              selectedGroup: name,
              selectedGroupUniqueName: uniqueName
            });
            this.setBottomSheetVisible(this.showGroupBottomSheetRef, false);
          }}
        >
          <Icon name={this.state.selectedGroup == name ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
          <Text style={styles.buttonText}
          >
            {name}
          </Text>
        </TouchableOpacity>
      )
    }
    return(
      <BottomSheet
        bottomSheetRef={this.showGroupBottomSheetRef}
        headerText='Select Group'
        headerTextColor='#864DD3'
        onClose={() => {
          this.setState({ isGroupDD: false });
          Keyboard.dismiss();
        }}
      >
        {this.state.AllGroups?.map(renderItem)}
      </BottomSheet>
    )
  }

  partyTypeBottomSheet(){
    const renderItem = (item: any) => {
      return (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            this.setState({ partyType: item.item.label });
            this.setBottomSheetVisible(this.partyTypeBottomSheetRef, false);
          }}
        >
          <Icon name={this.state.partyType == item.item.label ? 'radio-checked2' : 'radio-unchecked'} color={"#864DD3"} size={16} />
          <Text style={styles.buttonText}
          >
            {item.item.label}
          </Text>
        </TouchableOpacity>
      )
    }
    return(
      <BottomSheet
        bottomSheetRef={this.partyTypeBottomSheetRef}
        headerText='Select Party Type'
        headerTextColor='#864DD3'
        onClose={() => {
          this.setState({ isPartyDD: false });
          Keyboard.dismiss();
        }}
        flatListProps={{
          data: this.state.allPartyType,
          renderItem: renderItem
        }}
      />
    )
  }

  render() {
    return (
      <ScrollView style={styles.customerMainContainer} contentContainerStyle={styles.scrollViewContainerStyle}>
        <View style={{ flexGrow: 1 }}>
          {this.state.successDialog
            ? <Dialog.Container
              onRequestClose={() => { this.setState({ successDialog: false }) }}
              visible={this.state.successDialog} onBackdropPress={() => this.setState({ successDialog: false })} contentStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor:'#fff' }}>
              <Award />
              <Text style={{ color: '#229F5F', fontSize: 16, fontFamily: 'AvenirLTStd-Book' }}>Success</Text>
              <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center', fontFamily: 'AvenirLTStd-Book' }}>{`The Vendor is ${this.props.uniqueName != null ? 'updated' : 'created'} successfully.`}</Text>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  width: '70%',
                  alignSelf: 'center',
                  borderRadius: 30,
                  backgroundColor: '#229F5F',
                  marginTop: 30,
                  height: 50, marginBottom: 5
                }}
                onPress={() => {
                  this.setState({ successDialog: false });
                  this.props.navigation.goBack();
                }}
              >
                <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: 'center', fontFamily: 'AvenirLTStd-Book',marginTop:Platform.OS =="ios"?5:0  }}>Done</Text>
              </TouchableOpacity>
            </Dialog.Container>
            : null}
          {this.state.faliureDialog
            ? <Dialog.Container
              onRequestClose={() => { this.setState({ faliureDialog: false }) }}
              visible={this.state.faliureDialog} onBackdropPress={() => this.setState({ faliureDialog: false })} contentStyle={{ justifyContent: 'center', alignItems: 'center' }}>
              <Faliure />
              <Text style={{ color: '#F2596F', fontSize: 16, fontFamily: 'AvenirLTStd-Book' }}>Error!</Text>
              <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center', fontFamily: 'AvenirLTStd-Book' }}>{this.state.faliureMessage != '' ? this.state.faliureMessage : "Sorry, Failed to import the entries."}</Text>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  width: '70%',
                  alignSelf: 'center',
                  borderRadius: 30,
                  backgroundColor: '#F2596F',
                  marginTop: 30,
                  height: 50, marginBottom: 5
                }}
                onPress={() => {
                  this.setState({ faliureDialog: false });
                }}
              >
                <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: 'center', fontFamily: 'AvenirLTStd-Book' }}>Try Again</Text>
              </TouchableOpacity>
            </Dialog.Container>
            : null}

          <View style={{ flex: 1}}>
            <View style={styles.rowContainer}>
              <MaterialIcons name="person" size={19} color="#864DD3" />
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
                <Text style={{ color: this.state.partyPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.partyPlaceHolder == '' ? 'Enter Party Name' : this.state.partyName}</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.partyPlaceHolder == '' ? '*' : ''}</Text>
              </TextInput>
            </View>
            {/* <View style={styles.rowContainer}>
              <Zocial name="call" size={18} style={{ marginRight: 10 }} color="#864DD3" />
              <TouchableOpacity onPress={() => {
                this.setState({
                  isMobileModalVisible: !this.state.isMobileModalVisible, filteredCallingCode: this.state.allCallingCode,
                })
              }}><Text
                style={{ color: '#1c1c1c', paddingRight: 7, paddingVertical: 5, fontSize: 15, fontFamily: 'AvenirLTStd-Book', }}
              >{this.state.selectedCallingCode}</Text></TouchableOpacity> */}
              {/* <Dropdown
                ref={(ref) => this.state.partyDropDown = ref}
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
              /> */}
              {/* <TextInput
                returnKeyType={'done'}
                keyboardType="number-pad"
                onChangeText={(text) => {
                  this.setState({
                    contactNumber: text,
                    isMobileNoValid: !this.validateMobileNumberTextInput(text)
                  })
                }}
                placeholderTextColor={'rgba(80,80,80,0.5)'}
                placeholder={this.getMobilePlaceHolder()}
                value={this.state.contactNumber}
                style={{ ...styles.input, paddingLeft: 5, marginTop: 2, color: this.state.contactNumber == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', }} />
            </View> */}
            <View style={[styles.rowContainer,{marginVertical:10}]} >
            <Zocial name="call" size={18} style={{ marginRight: 10 }} color="#864DD3" />
            <PhoneInput
              ref={(ref) => { this.phone = ref; }}
              //  initialValue={this.getInitialNumber()}
              textProps={{placeholder: 'Enter Party Number'}}
              initialCountry={"in"} 
              onChangeFormattedText={value => 
                this.selectCountry(value)
              }
              onChangePhoneNumber={(num)=> {
                this.updateInfo()
                this.setState({contactNumber:num})
              }}
              textStyle={{fontFamily:'AvenirLTStd-Book'}}
              withShadow
              onPressFlag={this.onPressFlag}
              // blur={this.updateInfo}
            />
          <CountryPicker
            modalProps={{
              visible: this.state.picker,
            }}
            placeholder={' '}
            onSelect={({ cca2 }) =>
            this.setSelectedCountry(cca2)
                }
            translation="eng"
            cca2={this.state.cca2}
            withCallingCode
            withAlphaFilter
            withFilter
            theme={{fontSize: 15, flagSizeButton: 15, fontFamily: FONT_FAMILY.regular, primaryColor: '#1c1c1c'}}
            filterProps={{marginHorizontal: 10}}
            closeButtonStyle={{position: 'absolute', right: -5, zIndex: 1}}
            flatListProps={{contentContainerStyle: { paddingLeft: 10 }}}
            onClose={() => this.setState({picker:false})}
          />
            </View>
            {this.state.isMobileNoValid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 47 }}>Sorry! Invalid Number</Text>}
            <View style={styles.rowContainer}>
              <MaterialCommunityIcons name="email-open" size={18} color="#864DD3" />
              <TextInput
                onChangeText={(text) => this.setState({
                  emailId: text,
                  isEmailInvalid: !this.validateEmailTextInput(text)
                })}
                placeholderTextColor={'rgba(80,80,80,0.5)'}
                value={this.state.emailId}
                placeholder="Email Address"
                style={styles.input} />
            </View>
            {this.state.isEmailInvalid && <Text style={{ fontSize: 10, color: 'red', paddingLeft: 47, marginTop: -7 }}>Sorry! Invalid Email-Id</Text>}
            <TouchableOpacity 
              style={{ ...styles.rowContainer, paddingVertical: 20 }}
              onPress={() => {
                this.setState({ isGroupDD: true });
                this.setBottomSheetVisible(this.showGroupBottomSheetRef, true);
              }}
            >
              <MaterialCommunityIcons name="account-group" size={18} color="#864DD3" />
              <Text style={{ color: '#1c1c1c', fontFamily: 'AvenirLTStd-Book', fontSize: 14, marginHorizontal: 10, flex: 1 }}>
                {this.state.selectedGroup}
              </Text>
              <Icon
                style={{ transform: [{ rotate: this.state.isGroupDD ? '180deg' : '0deg' }] }}
                name={'9'}
                size={12}
                color="#808080"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ ...styles.rowContainer, paddingVertical: 20 }}
              onPress={() => {
                this.setState({ isPartyDD: true });
                this.setBottomSheetVisible(this.partyTypeBottomSheetRef, true)
              }}
            >
              <MaterialIcons name="hourglass-full" size={18} color="#864DD3" style={{ marginLeft: -1 }} />
                <Text style={{ color: this.state.partyType == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book', fontSize: 14, marginHorizontal: 10, flex: 1 }}>{this.state.partyType == '' ? 'Party Type' : this.state.partyType}
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.partyType == '' ? '*' : ''}</Text></Text>
              <Icon
                style={{ transform: [{ rotate: this.state.isPartyDD ? '180deg' : '0deg' }] }}
                name={'9'}
                size={12}
                color="#808080"
              />
            </TouchableOpacity>
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
              style={{ ...styles.rowContainer, justifyContent: 'space-between', paddingVertical: 20, backgroundColor: this.state.openAddress ? 'rgba(80,80,80,0.05)' : 'white' }}>
              <AntDesign
                name="pluscircle"
                size={16}
                color="#864DD3"
                style={{ transform: [{ rotate: this.state.openAddress ? '45deg' : '0deg' }] }} />
              <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10, flexDirection: 'row' }}>
                <Text style={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}>Address Details</Text>
                <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>*</Text>
              </View>
              <Icon
                style={{ transform: [{ rotate: this.state.openAddress ? '180deg' : '0deg' }], padding: 6, right: -5 }}
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
              style={{ ...styles.rowContainer, justifyContent: 'space-between', backgroundColor: this.state.showBalanceDetails ? 'rgba(80,80,80,0.05)' : 'white', paddingVertical: 20 }}>
              <AntDesign
                name="pluscircle"
                size={16}
                color="#864DD3"
                style={{ transform: [{ rotate: this.state.showBalanceDetails ? '45deg' : '0deg' }] }} />
              <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
                <Text style={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}>Balance Details</Text>
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
              style={{ ...styles.rowContainer, justifyContent: 'space-between', backgroundColor: this.state.showBankDetails ? 'rgba(80,80,80,0.05)' : 'white', paddingVertical: 20 }}>
              <AntDesign
                name="pluscircle"
                size={16}
                color="#864DD3"
                style={{ transform: [{ rotate: this.state.showBankDetails ? '45deg' : '0deg' }] }} />
              <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 10 }}>
                <Text style={{ color: '#1C1C1C', fontFamily: 'AvenirLTStd-Book' }}>Bank Details</Text>
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
          {/* {this.isCreateButtonVisible() && <TouchableOpacity
            style={{ position:'absolute',bottom:10 }}
            onPress={() => {
              this.genrateCustomer();
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity>} */}
          {/* <RBSheet ref={(ref) => { this.state.ref = ref }}
            height={500}
            customStyles={{
              container: {
                borderRadius: 10
              }
            }}>
            {this.renderAddressDetails()}
          </RBSheet> */}
          {this.renderModalView()}
          {this.renderCurrencyModalView()}
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
              <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={color.PRIMARY_NORMAL}
              />
            </View>
          )}
        </View>
        <TouchableOpacity
          disabled={!this.isCreateButtonVisible()}
          style={[styles.saveButton, (!this.isCreateButtonVisible() && { backgroundColor: '#CCCCCC'})]}
          onPress={() => {
            this.genrateCustomer();
          }}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
        {this.allGroupsBottomSheet()}
        {this.partyTypeBottomSheet()}
      </ScrollView>
    )
  }
};

const mapStateToProps = (state: RootState) => {
  const { commonReducer } = state;
  return {
    ...commonReducer,
  };
};

function Screen(props) {
  const isFocused = useIsFocused();

  return <Vendors {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps)(Screen);
