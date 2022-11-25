import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Keyboard,
  ActivityIndicator,
  DeviceEventEmitter,
  Animated,
  NativeModules,
  Platform,
  Dimensions,
  StatusBar,
  PermissionsAndroid,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
// import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _, {isInteger} from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useIsFocused} from '@react-navigation/native';
import style from './style';
import {FONT_FAMILY} from '../../utils/constants';
import CheckBox from 'react-native-check-box';
import routes from '@/navigation/routes';

const {SafeAreaOffsetHelper} = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash',
  receipt: 'receipt',
  payment: 'payment',
};

const {width, height} = Dimensions.get('window');
export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.focusRef = React.createRef();
    this.state = {
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,

      partyName: '',
      searchResults: [],
      searchPartyName: '',
      searchTop: height * 0.15,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      clearanceDate: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      showClearanceDatePicker: false,
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      modesArray: [],
      SelectedTaxData: {
        taxType: '',
        taxText: '',
        taxDetailsArray: [],
      },
      fetechingTaxList: false,
      taxArray: [],
      tdsTcsTaxArray: [],
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '₹ ',
      exchangeRate: 1,
      companyCountryDetails: '',
      selectedInvoice: '',
      allBillingToAddresses: [],
      billFromSameAsShipFrom: true,
      billToSameAsShipTo: false,
      tdsOrTcsArray: [],
      partyType: undefined,
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1,
      showPaymentModePopup: false,
      selectedButton: false,
      modalVisible: false,
      isTaxBoxSelected: false,
      isChecked: false,
      amountForReceipt: '',
      paymentMode: {
        uniqueName: '',
        name: '',
      },
      chequeNumber: '',
      isClearanceDateSelelected: false,
      addDescription: '',
      selectedTax: {
        uniqueName: '',
        taxType: '',
      },
      adjustedAmountOfLinkedInvoices: null,
      navigatingAgain: false,
      checkedTaxName: '',
      allPaymentModes: [],
      showAccountsPopup: false,
      radioBtn: 0,
      radio_props: [],
      isSelectAccountButtonSelected: false,
      selectedArrayType: [],
      showTaxPopup: false,
      showTaxCalculationMethodPopup: false,
      tdsTcsTaxCalculationMethod: 'OnTaxableAmount',
      taxAmount: 10,
      balanceDetails: {
        totalTaxableAmount: 0,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
      isAmountFieldInFocus: false,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? (
      <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} />
    ) : null;
  };

  setSelectedButton = (buttonSelect) => {
    this.setState({selectedButton: buttonSelect});
  };

  // Other Taxes Modal
  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  };

  async getAllInvoice() {
    try {
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const page = 1;
      const count = 50;
      const number = '';
      const payload = await {
        accountUniqueName: this.state.partyName.uniqueName,
        voucherType: INVOICE_TYPE.payment,
        number: '',
        page: page,
      };
      const results = await InvoiceService.getInvoicesForReceipt(
        date,
        payload,
        this.state.companyVersionNumber,
        page,
        count,
      );
      if (results.body && results.status == 'success') {
        let allVoucherInvoice = this.state.companyVersionNumber == 1 ? results.body.results : results.body.items;
        this.setState({allVoucherInvoice});
      }
    } catch (e) {
      this.setState({allVoucherInvoice: []});
    }
  }

  async getExchangeRateToINR(currency) {
    try {
      const results = await InvoiceService.getExchangeRate(
        moment().format('DD-MM-YYYY'),
        this.state.companyCountryDetails.currency.code,
        currency,
      );
      if (results.body && results.status == 'success') {
        await this.setState({
          exchangeRate: results.body,
        });
      }
    } catch (e) {}
    return 1;
  }

  async setActiveCompanyCountry() {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          companyCountryDetails: results.body.country,
        });
      }
    } catch (e) {}
  }

  async createPayment(type) {
    try {
      this.setState({loading: true});
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const page = 1;
      const count = 50;
      const lang = 'en';
      const selectedInvoices = this.state.allVoucherInvoice.filter((item) => {
        return item.isSelect == true;
      });

      const adjustmentsInvoicesPayload = await selectedInvoices.map((item) => {
        return {
          voucherType: item.voucherType,
          subVoucher: null,
          voucherNumber: item.voucherNumber,
          voucherTotal: {
            amountForAccount: parseInt(item.voucherTotal.amountForAccount),
            Company: parseInt(item.voucherTotal.Company),
          },
          uniqueName: item.uniqueName,
          currency: item.currency,
          exchangeRate: item.exchangeRate,
          amount: {
            amountForAccount: parseInt(item.adjustedAmount),
            amountForCompany: parseInt(item.adjustedAmount),
          },
          accountUniqueName: item.accountUniqueName,
          noteVoucherType: item.noteVoucherType,
          voucherBalanceType: null,
          voucherDate: item.voucherDate,
          accountCurrency: item.currency,
          calculatedTaxAmount: 0,
        };
      });

      const payload = await {
        transactions: [
          {
            amount: parseInt(this.state.amountForReceipt),
            particular: this.state.paymentMode.uniqueName,
            ...(this.state.SelectedTaxData.taxDetailsArray?.length > 0 && {
              taxes: await this.state.SelectedTaxData.taxDetailsArray.map((item) => {
                return item.uniqueName;
              }),
            }),
            total: parseInt(this.state.amountForReceipt),
            convertedTotal: (
              Math.round(
                (this.state.balanceDetails.totalTaxableAmount - this.state.balanceDetails.tdsOrTcsTaxAmount) *
                  this.state.exchangeRate *
                  100,
              ) / 100
            ).toFixed(2),
            discount: 0,
            convertedDiscount: 0,
            isStock: false,
            convertedRate: 0,
            convertedAmount: (
              Math.round(parseInt(this.state.amountForReceipt) * this.state.exchangeRate * 100) / 100
            ).toFixed(2),
            isChecked: false,
            showTaxationDiscountBox: false,
            itcAvailable: '',
            advanceReceiptAmount: parseInt(this.state.amountForReceipt),
            showDropdown: false,
            showOtherTax: true,
            type: 'DEBIT',
            discounts: [],
            isInclusiveTax: false,
            shouldShowRcmEntry: false,
            subVoucher: '',
            ...(adjustmentsInvoicesPayload?.length > 0 && {adjustments: adjustmentsInvoicesPayload}),
          },
        ],
        voucherType: 'pay',
        entryDate: moment(this.state.date).format('DD-MM-YYYY'),
        unconfirmedEntry: false,
        attachedFile: '',
        attachedFileName: '',
        tag: null,
        description: this.state.addDescription,
        generateInvoice: true,
        chequeNumber: this.state.chequeNumber,
        chequeClearanceDate:
          this.state.showClearanceDatePicker && moment(this.state.clearanceDate).format('DD-MM-YYYY')
            ? moment(this.state.clearanceDate).format('DD-MM-YYYY')
            : '',
        invoiceNumberAgainstVoucher: '',
        compoundTotal: parseInt(this.state.amountForReceipt),
        convertedCompoundTotal: (
          Math.round(parseInt(this.state.amountForReceipt) * this.state.exchangeRate * 100) / 100
        ).toFixed(2),
        invoicesToBePaid: [],
        tdsTcsTaxesSum: this.state.balanceDetails.tdsOrTcsTaxAmount,
        otherTaxesSum: this.state.balanceDetails.tdsOrTcsTaxAmount,
        exchangeRate: this.state.exchangeRate,
        valuesInAccountCurrency: true,
        selectedCurrencyToDisplay: 0,
        isOtherTaxesApplicable: true,
        ...(this.state.selectedArrayType?.length > 0 && {
          otherTaxType: this.state.selectedArrayType.filter((item) => {
            if (item == 'tdspay' || item == 'tcspay' || item == 'tdsrc' || item == 'tcsrc') {
              return item;
            }
          })[0],
          tcsCalculationMethod: this.state.tdsTcsTaxCalculationMethod,
        }),
      };

      const results = await InvoiceService.createPayment(
        payload,
        this.state.partyName.uniqueName,
        this.state.companyVersionNumber,
        lang,
      );

      if (type != 'share') {
        this.setState({loading: false});
      }
      if (results.body) {
        alert('Payment created successfully!');
        const partyDetails = this.state.partyDetails;
        const partyName = this.state.partyName;
        this.resetState();
        this.setActiveCompanyCountry();
        this.getAllPaymentModes();
        this.getAllTaxes();
        this.getCompanyVersionNumber();
        if (type == 'navigate') {
          this.props.navigation.navigate(routes.Parties, {
            screen: 'PartiesTransactions',
            initial: false,
            params: {
              item: {
                name: partyName.name,
                uniqueName: partyName.uniqueName,
                country: {code: partyDetails.country.countryCode},
                mobileNo: partyDetails.mobileNo,
              },
              type: 'Vendors',
            },
          });
        }
      }
    } catch (e) {
      this.setState({allVoucherInvoice: []});
    }
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllPaymentModes();
    this.getCompanyVersionNumber();
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInPurchaseBill, (data) => {});

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      this.getCompanyVersionNumber();
      if (this.state.searchPartyName == '') {
        this.searchCalls();
      }
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry();
      this.getAllTaxes();
      this.getAllPaymentModes();
      this.getCompanyVersionNumber();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }
  }

  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber);
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      this.setState({companyVersionNumber});
    }
  };

  /*
         Added Keyboard Listner for making view scroll if needed
       */
  keyboardWillShow = (event) => {
    const value = event.endCoordinates.height - this.state.bottomOffset;
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: value,
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: 0,
    }).start();
  };

  renderHeader() {
    return (
      <View style={[style.header, {paddingTop: 10}]}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderSelectPartyName() {
    return (
      <View
        onLayout={this.onLayout}
        style={{flexDirection: 'row', minHeight: 50, alignItems: 'center'}}
        onPress={() => {}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Icon name={'Profile'} color={'#fafafa'} style={{margin: 16}} size={16} />
          <TextInput
            placeholderTextColor={'#fafafa'}
            placeholder={'Select Parties Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{color: 'white', marginRight: 16, fontFamily: 'AvenirLTStd-Book'}}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y,
    });
  };

  searchCalls = _.debounce(this.searchUser, 2000);

  async getAllPaymentModes() {
    try {
      const results = await InvoiceService.getBriefAccountForReceipt();
      if (results.body && results.status == 'success') {
        this.setState({allPaymentModes: results.body.results});
      }
    } catch (e) {}
  }

  async getAllTaxes() {
    this.setState({fetechingTaxList: true});
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        this.setState({taxArray: results.body, fetechingTaxList: false});
        this.getTdsTcsTaxes();
      }
    } catch (e) {
      this.setState({fetechingTaxList: false});
    }
  }

  async getTdsTcsTaxes() {
    const taxes = this.state.taxArray.filter((item) => {
      return item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tdsrc' || item.taxType == 'tcsrc';
    });
    await this.setState({tdsTcsTaxArray: taxes});
    await this.setState({tdsOrTcsArray: taxes});
  }

  _renderSearchList() {
    return (
      <View style={[style.searchResultContainer, {top: height * 0.12}]}>
        <FlatList
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={this.state.searchResults.length == 0 ? ['Result Not found'] : this.state.searchResults}
          style={{paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5}}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{}}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                if (item != 'Result Not found') {
                  this.setState(
                    {
                      partyName: item,
                      searchResults: [],
                      searchPartyName: item.name,
                      searchError: '',
                      isSearchingParty: false,
                    },
                    () => {
                      this.searchAccount();
                      Keyboard.dismiss();
                      this.state.partyName ? this.handleInputFocus() : null;
                    },
                  );
                } else {
                  this.setState({isSearchingParty: false, searchResults: []});
                }
              }}>
              <Text style={{color: '#1C1C1C', paddingVertical: 10}}>{item.name ? item.name : 'Result Not found'}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            padding: 5,
            alignItems: 'center',
          }}
          onPress={() =>
            this.setState({
              searchResults: [],
              searchError: '',
              isSearchingParty: false,
            })
          }>
          <Ionicons name="close-circle" size={20} color={'#424242'} />
        </TouchableOpacity>
      </View>
    );
  }

  async searchUser() {
    this.setState({isSearchingParty: true});
    try {
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrycreditors', false);

      if (results.body && results.body.results) {
        this.setState({searchResults: results.body.results, isSearchingParty: false, searchError: ''});
      }
    } catch (e) {
      this.setState({searchResults: [], searchError: 'No Results', isSearchingParty: false});
    }
  }

  async searchAccount() {
    this.setState({isSearchingParty: true});
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);
      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        this.getAllInvoice();
        await this.setState({
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          countryDeatils: results.body.country,
          currency: results.body.currency,
          currencySymbol: results.body.currencySymbol,
        });
      }
    } catch (e) {
      this.setState({searchResults: [], searchError: 'No Results', isSearchingParty: false});
    }
  }

  resetState = () => {
    this.setState({
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,

      partyName: '',
      searchResults: [],
      searchPartyName: '',
      searchTop: height * 0.15,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      clearanceDate: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      showClearanceDatePicker: false,
      BillToAddress: {},
      BillFromAddress: {},
      shipToAddress: {},
      shipFromAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      tempAmountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      tempSelectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      modesArray: [],
      SelectedTaxData: {
        quantityText: '',
        rateText: '',
        unitText: '',
        amountText: '',
        discountValueText: '',
        discountPercentageText: '',
        discountType: '',
        taxType: '',
        taxText: '',
        warehouse: '',
        total: 0,
        taxDetailsArray: [],
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      tdsTcsTaxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null,
      },
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '₹ ',
      exchangeRate: 1,
      companyCountryDetails: '',
      selectedInvoice: '',
      tdsOrTcsArray: [],
      partyType: undefined,
      companyVersionNumber: 1,
      showPaymentModePopup: false,
      selectedButton: false,
      modalVisible: false,
      isTaxBoxSelected: false,
      isChecked: false,
      amountForReceipt: '',
      paymentMode: {
        uniqueName: '',
        name: '',
      },
      chequeNumber: '',
      isClearanceDateSelelected: false,
      addDescription: '',
      selectedTax: {
        uniqueName: '',
        taxType: '',
      },
      adjustedAmountOfLinkedInvoices: null,
      navigatingAgain: false,
      checkedTaxName: '',
      allPaymentModes: [],
      showAccountsPopup: false,
      isSelectAccountButtonSelected: false,
      selectedArrayType: [],
      showTaxPopup: false,
      showTaxCalculationMethodPopup: false,
      tdsTcsTaxCalculationMethod: 'OnTaxableAmount',
      balanceDetails: {
        totalTaxableAmount: 0,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
    });
  };

  clearAll = () => {
    this.resetState();
    this.resetOnUncheckTax();
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllPaymentModes();
    this.getCompanyVersionNumber();
  };

  _renderTaxCalculationMethodModal() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showTaxCalculationMethodPopup}
        onRequestClose={() => {
          this.setState({showTaxCalculationMethodPopup: false});
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}
          onPress={() => {
            this.setState({showTaxCalculationMethodPopup: false});
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              marginHorizontal: 20,
              maxHeight: 400,
              alignSelf: 'stretch',
              paddingBottom: 5,
            }}>
            <Text
              style={[
                {fontFamily: FONT_FAMILY.bold, fontSize: 16, color: '#084EAD', marginHorizontal: 20, margin: 10},
              ]}>
              {'Calculation Method'}
            </Text>
            <View style={{backgroundColor: 'black', height: 1.1}}></View>
            <TouchableOpacity
              onFocus={() => this.onChangeText('')}
              style={{
                backgroundColor: this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount' ? '#084EAD80' : '#fff',
                paddingHorizontal: 20,
                marginHorizontal: 2,
                borderRadius: 10,
                marginTop: 10,
              }}
              onPress={async () => {
                await this.setState({tdsTcsTaxCalculationMethod: 'OnTaxableAmount'});
                await this.calculatedTaxAmounstForReceipt();
                await this.setState({showTaxCalculationMethodPopup: false});
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                {this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount' ? (
                  <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
                ) : (
                  <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
                )}
                <Text
                  style={{
                    color: '#1C1C1C',
                    paddingVertical: 4,
                    fontSize: 14,
                    textAlign: 'center',
                    marginLeft: 10,
                    fontFamily: FONT_FAMILY.semibold,
                  }}>
                  {'On Taxable Value (Amt - Dis)'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onFocus={() => this.onChangeText('')}
              style={{
                backgroundColor: this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount' ? '#084EAD80' : '#fff',
                paddingHorizontal: 20,
                marginHorizontal: 2,
                borderRadius: 10,
                marginBottom: 10,
              }}
              onPress={async () => {
                await this.setState({tdsTcsTaxCalculationMethod: 'OnTotalAmount'});
                await this.calculatedTaxAmounstForReceipt();
                await this.setState({showTaxCalculationMethodPopup: false});
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                {this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount' ? (
                  <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
                ) : (
                  <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
                )}
                <Text
                  style={{
                    color: '#1C1C1C',
                    paddingVertical: 4,
                    fontSize: 14,
                    textAlign: 'center',
                    marginLeft: 10,
                    fontFamily: FONT_FAMILY.semibold,
                  }}>
                  {'On Total Value (Taxable + Gst + Cess)'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  _renderTax() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showTaxPopup}
        onRequestClose={() => {
          this.setState({showTaxPopup: false});
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}
          onPress={() => {
            this.setState({
              showTaxPopup: false,
              isChecked: this.state.SelectedTaxData.taxDetailsArray.length > 0 ? true : false,
            });
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              marginHorizontal: 20,
              maxHeight: 400,
              minWidth: 200,
              maxWidth: 200,
              alignSelf: 'center',
            }}>
            <FlatList
              data={this.state.tdsTcsTaxArray}
              style={{}}
              renderItem={({item}) => {
                const selectedTaxArray = this.state.SelectedTaxData.taxDetailsArray;
                const selectedTaxTypeArr = [...this.state.selectedArrayType];
                const filtered = _.filter(selectedTaxArray, function (o) {
                  if (o.uniqueName == item.uniqueName) {
                    return o;
                  }
                });
                return (
                  <TouchableOpacity
                    style={{paddingHorizontal: 20}}
                    onFocus={() => this.onChangeText('')}
                    onPress={async () => {
                      if (
                        (selectedTaxTypeArr.includes(item.taxType) && !selectedTaxArray.includes(item)) ||
                        ((selectedTaxTypeArr.includes('tdspay') ||
                          selectedTaxTypeArr.includes('tdsrc') ||
                          selectedTaxTypeArr.includes('tcsrc')) &&
                          item.taxType == 'tcspay') ||
                        ((selectedTaxTypeArr.includes('tdspay') ||
                          selectedTaxTypeArr.includes('tcspay') ||
                          selectedTaxTypeArr.includes('tcsrc')) &&
                          item.taxType == 'tdsrc') ||
                        ((selectedTaxTypeArr.includes('tdspay') ||
                          selectedTaxTypeArr.includes('tdsrc') ||
                          selectedTaxTypeArr.includes('tcspay')) &&
                          item.taxType == 'tcsrc') ||
                        ((selectedTaxTypeArr.includes('tcspay') ||
                          selectedTaxTypeArr.includes('tdsrc') ||
                          selectedTaxTypeArr.includes('tcsrc')) &&
                          item.taxType == 'tdspay')
                      ) {
                        console.log('did not select');
                      } else {
                        const itemDetails = this.state.SelectedTaxData;
                        var filtered = _.filter(selectedTaxArray, function (o) {
                          if (o.uniqueName == item.uniqueName) {
                            return o;
                          }
                        });

                        if (filtered.length == 0) {
                          selectedTaxArray.push(item);
                          itemDetails.taxDetailsArray = selectedTaxArray;
                          const arr1 = [...selectedTaxTypeArr, item.taxType];
                          if (
                            item.taxType == 'tdspay' ||
                            item.taxType == 'tcspay' ||
                            item.taxType == 'tdsrc' ||
                            item.taxType == 'tcsrc'
                          ) {
                            await this.calculatedTaxAmounstForReceipt();
                            this.setState({showTaxCalculationMethodPopup: true});
                          }
                          this.setState({selectedArrayType: arr1});
                        } else {
                          await this.calculatedTaxAmounstForReceipt();
                          var filtered = _.filter(selectedTaxArray, function (o) {
                            if (o.uniqueName !== item.uniqueName) {
                              return o;
                            }
                          });

                          const arr2 = _.filter(selectedTaxTypeArr, function (o) {
                            if (o !== item.taxType) {
                              return o;
                            }
                          });
                          itemDetails.taxDetailsArray = filtered;
                          this.setState({selectedArrayType: arr2});
                        }
                      }
                      this.calculatedTaxAmounstForReceipt();
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                      <View
                        style={{
                          borderRadius: 1,
                          borderWidth: 1,
                          borderColor: filtered.length == 0 ? '#CCCCCC' : '#1C1C1C',
                          width: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                          // backgroundColor: 'yellow'
                        }}>
                        {filtered.length > 0 && (
                          <AntDesign name={'check'} size={10} color={filtered.length == 0 ? '#CCCCCC' : '#1C1C1C'} />
                        )}
                      </View>

                      <Text
                        style={{
                          color: '#1C1C1C',
                          paddingVertical: 4,
                          fontFamily: FONT_FAMILY.semibold,
                          fontSize: 12,
                          textAlign: 'center',
                          marginLeft: 20,
                          // backgroundColor: 'grey'
                        }}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={() => {
                return (
                  <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                    <Text
                      style={{
                        flex: 1,
                        color: '#1C1C1C',
                        paddingVertical: 4,
                        fontFamily: FONT_FAMILY.semibold,
                        fontSize: 14,
                        textAlign: 'center',
                        alignSelf: 'center',
                        // marginLeft: 20,
                        // backgroundColor: 'grey'
                      }}>
                      No Taxes Available
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  handleInputFocus() {
    this.focusRef.current.focus();
  }

  renderAmount() {
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{paddingVertical: Platform.OS == 'ios'? 10 : 0, paddingHorizontal: 15, flex: 1, flexDirection: 'row'}}>
          <Text style={[style.invoiceAmountText, {textAlignVertical: 'center', fontSize: 18}]}>
            {this.state.currencySymbol}
          </Text>
          <TextInput
            style={[style.invoiceAmountText, {marginRight: 10, flex: 1}]}
            keyboardType="phone-pad"
            placeholder={'0.00'}
            placeholderTextColor={this.state.isAmountFieldInFocus ? '#c9c9c9' : 'white'}
            value={this.state.amountForReceipt}
            ref={this.focusRef}
            onFocus={() => {
              this.setState({
                isAmountFieldInFocus: true,
              });
            }}
            onBlur={() => {
              this.setState({
                isAmountFieldInFocus:
                  this.state.amountForReceipt != 0 || this.state.amountForReceipt != '' ? true : false,
              });
            }}
            onChangeText={async (text) => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                await this.setState({
                  amountForReceipt: text.replace(/[^0-9]/g, ''),
                  amountPaidNowText: text.replace(/[^0-9]/g, ''),
                  balanceDetails: {totalTaxableAmount: text.replace(/[^0-9]/g, '')},
                });
                this.calculatedTaxAmounstForReceipt();
              }
            }}></TextInput>
        </View>
      </View>
    );
  }

  getSelectedDateDisplay() {}
  getYesterdayDate() {
    this.setState({date: moment().subtract(1, 'days')});
  }

  getTodayDate() {
    this.setState({date: moment()});
  }

  formatDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.date;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return 'Today';
    } else if (diffYears === 0 && diffDays === 1) {
      return 'Yesterday';
    } else if (diffYears === 0 && diffDays === -1) {
      return 'Tomorrow';
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else if (diffYears >= 1) {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + ' ' + date;
    }
  }
  formatClearanceDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.clearanceDate;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return 'Today';
    } else if (diffYears === 0 && diffDays === 1) {
      return 'Yesterday';
    } else if (diffYears === 0 && diffDays === -1) {
      return 'Tomorrow';
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else if (diffYears >= 1) {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + ' ' + date;
    }
  }

  hideDatePicker = () => {
    this.setState({showDatePicker: false});
  };
  hideClearanceDatePicker = () => {
    this.setState({showClearanceDatePicker: false});
  };

  handleConfirm = (date) => {
    this.setState({date: moment(date)});
    this.hideDatePicker();
  };

  handleConfirmClearanceDate = (date) => {
    this.setState({clearanceDate: moment(date)});
    this.hideClearanceDatePicker();
  };

  _renderDateView() {
    const {date, displayedDate} = this.state;

    return (
      <View style={style.dateView}>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.setState({showDatePicker: true});
            }
          }}>
          <Icon name={'Calendar'} color={'#084EAD'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.state.date.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate();
            }
          }}>
          <Text style={{color: '#808080'}}>
            {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderAccountsPopUp() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showAccountsPopup}
        onRequestClose={() => {
          this.setState({showAccountsPopup: false});
          this.setState({isSelectAccountButtonSelected: this.state.paymentMode.uniqueName != '' ? true : false});
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}
          onPress={() => {
            this.setState({showAccountsPopup: false});
            this.setState({isSelectAccountButtonSelected: this.state.paymentMode.uniqueName != '' ? true : false});
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              marginHorizontal: 20,
              maxHeight: 400,
              alignSelf: 'stretch',
              paddingBottom: 5,
            }}>
            <Text
              style={[
                {fontFamily: FONT_FAMILY.bold, fontSize: 16, color: '#084EAD', marginHorizontal: 20, margin: 10},
              ]}>
              Select A/c
            </Text>
            <View style={{backgroundColor: 'black', height: 1.1}}></View>
            <FlatList
              data={this.state.allPaymentModes}
              style={{paddingVertical: 10}}
              keyExtractor={(item, index) => {
                index;
              }}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onFocus={() => this.onChangeText('')}
                    style={{
                      backgroundColor: this.state.paymentMode.uniqueName == item.uniqueName ? '#084EAD80' : '#fff',
                      paddingHorizontal: 20,
                      marginHorizontal: 2,
                      borderRadius: 10,
                    }}
                    onPress={async () => {
                      await this.setState({
                        paymentMode: {
                          uniqueName: item.uniqueName,
                          name: item.name,
                        },
                      });
                      await this.setState({showAccountsPopup: false});
                      await this.setState({
                        isSelectAccountButtonSelected: this.state.paymentMode.uniqueName != '' ? true : false,
                      });
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                      {this.state.paymentMode.uniqueName == item.uniqueName ? (
                        <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
                      ) : (
                        <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
                      )}
                      <Text
                        style={{
                          color: '#1C1C1C',
                          paddingVertical: 4,
                          fontSize: 14,
                          textAlign: 'center',
                          marginLeft: 10,
                          fontFamily: FONT_FAMILY.bold,
                        }}>
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'Path-12190'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{'Payment Mode*'}</Text>
        </View>

        <View style={{paddingVertical: 6, marginTop: 10}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={() => {
                if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
                  this.setState({showAccountsPopup: true});
                } else {
                  alert('Please select a party.');
                }
              }}
              textColor={{color}}>
              <View
                style={[
                  style.cashBankButtonWrapper,
                  {marginLeft: 20},
                  {borderColor: this.state.isSelectAccountButtonSelected ? '#084EAD' : '#d9d9d9'},
                ]}>
                <Text
                  style={[
                    style.cashBankButtonText,
                    {
                      color: this.state.isSelectAccountButtonSelected ? '#084EAD' : '#868686',
                    },
                  ]}>
                  {this.state.isSelectAccountButtonSelected ? this.state.paymentMode.name : 'Select A/c'}
                </Text>
              </View>
              {this.state.isSelectAccountButtonSelected ? (
                <Entypo name="edit" size={16} color={'#084EAD'} style={{alignSelf: 'center'}} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  _renderTaxes() {
    return (
      <TouchableOpacity
        style={[style.senderAddress]}
        onPress={async () => {
          if (!this.state.partyName) {
            alert('Please select a party.');
          } else if (this.state.amountForReceipt == '') {
            alert('Please enter amount.');
          } else {
            await this.setState({
              isChecked: true,
              modalVisible: true,
              showTaxPopup: true,
            });

            if (this.state.isChecked == false) {
              await this.setState({
                selectedTax: {uniqueName: '', taxType: ''},
                SelectedTaxData: {taxDetailsArray: []},
                selectedArrayType: '',
              });
              this.resetOnUncheckTax();
            }
          }
        }}>
        <View style={{flexDirection: 'row'}}>
          <CheckBox
            checkBoxColor={'#084EAD'}
            uncheckedCheckBoxColor={'#084EAD'}
            style={{marginLeft: -4}}
            onClick={async () => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else if (this.state.amountForReceipt == '') {
                alert('Please enter amount.');
              } else {
                await this.setState({
                  isChecked: !this.state.isChecked,
                  modalVisible: !this.state.isChecked,
                  showTaxPopup: !this.state.isChecked,
                  selectedArrayType: '',
                });
                if (this.state.isChecked == false) {
                  await this.setState({
                    selectedTax: {uniqueName: '', taxType: ''},
                    SelectedTaxData: {taxDetailsArray: []},
                    selectedArrayType: '',
                  });
                  this.resetOnUncheckTax();
                }
              }
            }}
            isChecked={this.state.isChecked}
          />
          {this.state.SelectedTaxData.taxDetailsArray.length > 0 ? (
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <Text style={[style.addressHeaderText, {marginLeft: 5}]}>{'Tax'} </Text>
                <Text style={[style.addressHeaderText, {marginLeft: 5, color: '#084EADBF'}]}>
                  {`(${this.state.SelectedTaxData.taxDetailsArray.map((item) => ` ${item.name}`)} )`}{' '}
                </Text>
              </View>
              <View style={{alignSelf: 'center', justifyContent: 'flex-end'}}>
                <Entypo name="edit" size={16} color={'#084EAD'} style={{paddingRight: 10}} />
              </View>
            </View>
          ) : (
            <Text style={[style.addressHeaderText, {marginLeft: 5}]}>{'Tax'}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Cheque Details View
  _renderChequeDetails() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'path-15'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{'Cheque Details'}</Text>
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={[
                style.cashBankButtonWrapper,
                {marginHorizontal: 20},
                {
                  justifyContent: 'center',
                  width: 150,
                  height: 40,
                  borderColor: this.state.chequeNumber ? '#084EAD' : '#d9d9d9',
                },
              ]}>
              <TextInput
                style={[
                  style.chequeButtonText,
                  {
                    color: this.state.chequeNumber ? '#084EAD' : '#868686',
                  },
                ]}
                autoCapitalize={'characters'}
                value={this.state.chequeNumber.toString()}
                placeholder={'Cheque #'}
                placeholderTextColor={'#868686'}
                returnKeyType={'done'}
                multiline={true}
                // onFocus={() => {
                //   if (!this.state.partyName) {
                //     alert('Please select a party.');
                //   } else if (this.state.amountForReceipt == '') {
                //     alert('Please enter amount.');
                //   } else {
                //   }
                // }}
                onChangeText={(text) => {
                  if (!this.state.partyName) {
                    alert('Please select a party.');
                  } else if (this.state.amountForReceipt == '') {
                    alert('Please enter amount.');
                  } else {
                    this.setState({chequeNumber: text});
                  }
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else if (this.state.amountForReceipt == '') {
                  alert('Please enter amount.');
                } else {
                  this.setSelectedButton(4);
                  this.setState({showClearanceDatePicker: true});
                  this.setState({isClearanceDateSelelected: true});
                }
              }}>
              <View
                style={[
                  style.cashBankButtonWrapper,
                  {borderColor: this.state.selectedButton == 4 ? '#084EAD' : '#d9d9d9'},
                ]}>
                {this.state.isClearanceDateSelelected ? (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: this.state.selectedButton == 4 ? '#084EAD' : '#868686',
                      },
                    ]}>
                    {this.formatClearanceDate()}
                  </Text>
                ) : (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: this.state.selectedButton == 4 ? '#084EAD' : '#868686',
                        fontFamily: this.state.selectedButton == 4 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                      },
                    ]}>
                    Clearance Date
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Link Invoice View
  _renderLinkIvoice() {
    return (
      <TouchableOpacity
        style={[style.senderAddress, {flexDirection: 'row'}]}
        onPress={() => {
          if (!this.state.partyName) {
            alert('Please select a party.');
          } else if (!this.state.amountForReceipt) {
            alert('Please enter amount.');
          } else {
            this.props.navigation.navigate('PaymentLinkToInvice', {
              getLinkedInvoicesAdjustedAmount: this.getLinkedInvoicesAdjustedAmount.bind(this),
              navigatingAgain: this.state.navigatingAgain,
              partyName: this.state.searchPartyName,
              currencySymbol: this.state.currencySymbol,
              partyAmount: this.state.amountPaidNowText,
              realVoucherInvoice: this.state.allVoucherInvoice,
            });
          }
        }}>
        <View style={{flexDirection: 'row', flex: 1, padding: 10, marginLeft: -2.5, paddingLeft: 0}}>
          <View style={{flexDirection: 'row'}}>
            <Entypo name="link" size={21} color={'#084EAD'} />
            <Text style={[style.addressHeaderText, {marginLeft: 7}]}>{'Link Invoice'}</Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            {this.state.adjustedAmountOfLinkedInvoices != null && this.state.adjustedAmountOfLinkedInvoices != 0 ? (
              <Text style={[style.addressHeaderText, {color: '#808080'}]}>
                {'Adjusted Amt.: ' + this.state.currencySymbol + ' ' + this.state.adjustedAmountOfLinkedInvoices}
              </Text>
            ) : null}
          </View>
          <AntDesign name={'right'} size={18} color={'#808080'} />
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}></View>
        </View>
      </TouchableOpacity>
    );
  }

  // Add Description View
  _renderAddDescription() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'path-15'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{'Add Description'}</Text>
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <TextInput
            style={{marginLeft: 20, margin: 10, borderBottomColor: '#808080', borderBottomWidth: 1.5}}
            value={this.state.addDescription}
            placeholder={'Note (Opional)'}
            onChangeText={(text) => {
              this.setState({addDescription: text});
            }}></TextInput>
        </View>
      </View>
    );
  }

  _renderSaveButton() {
    return (
      <TouchableOpacity
        style={{flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60}}
        onPress={async () => {
          await this.genrateInvoice('navigate');
        }}>
        <Icon name={'path-18'} size={48} color={'#084EAD'} />
      </TouchableOpacity>
    );
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false,
    });
  };
  getLinkedInvoicesAdjustedAmount = async (adjustedAmount, allVoucherInvoice) => {
    this.setState({adjustedAmountOfLinkedInvoices: adjustedAmount});
    this.setState({allVoucherInvoice: allVoucherInvoice});
    this.setState({navigatingAgain: true});
  };

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }

  resetOnUncheckTax() {
    this.setState({
      balanceDetails: {
        totalTaxableAmount: this.state.amountForReceipt,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
    });
  }

  calculatedTaxAmounstForReceipt() {
    const receiptAmount = Number(this.state.amountForReceipt);
    let mainTaxPercentage = 0;

    let mainTax = 0;
    this.state.SelectedTaxData.taxDetailsArray.map((item) => {
      if (item.taxType != 'tdspay' && item.taxType != 'tcspay' && item.taxType != 'tdsrc' && item.taxType != 'tcsrc') {
        mainTaxPercentage = mainTaxPercentage + item.taxDetail[0].taxValue;
      }
    });

    let SelectedTdsOrTcsTaxDetails =
      this.state.selectedArrayType.includes('tcspay') ||
      this.state.selectedArrayType.includes('tcsrc') ||
      this.state.selectedArrayType.includes('tdspay') ||
      this.state.selectedArrayType.includes('tdsrc')
        ? this.state.SelectedTaxData.taxDetailsArray
            .map((item) => {
              if (
                item.taxType == 'tdspay' ||
                item.taxType == 'tcspay' ||
                item.taxType == 'tdsrc' ||
                item.taxType == 'tcsrc'
              ) {
                return {taxValue: item.taxDetail[0].taxValue, taxType: item.taxType};
              }
            })
            .filter((notUndefined) => notUndefined !== undefined)
        : [{taxValue: 0, taxType: 'tdspay'}];

    let totalTaxableAmount = 0;

    if (SelectedTdsOrTcsTaxDetails[0].taxValue != 0) {
      if (this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount') {
        if (SelectedTdsOrTcsTaxDetails[0].taxType == 'tdspay' || SelectedTdsOrTcsTaxDetails[0].taxType == 'tdsrc') {
          const tdsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(receiptAmount / (1 + (mainTaxPercentage - tdsTaxRate) / 100));
        } else if (
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcspay' ||
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcsrc'
        ) {
          const tcsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(receiptAmount / (1 + (mainTaxPercentage + tcsTaxRate) / 100));
        }
      } else if (this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount') {
        if (SelectedTdsOrTcsTaxDetails[0].taxType == 'tdspay' || SelectedTdsOrTcsTaxDetails[0].taxType == 'tdsrc') {
          const tdsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(((receiptAmount / (100 - tdsTaxRate)) * 100) / (100 + mainTaxPercentage)) * 100;
        } else if (
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcspay' ||
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcsrc'
        ) {
          const tcsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(((receiptAmount / (100 + tcsTaxRate)) * 100) / (100 + mainTaxPercentage)) * 100;
        }
      }
    } else {
      totalTaxableAmount = Number(receiptAmount / (1 + mainTaxPercentage / 100));
    }

    let mainTaxAmount = 0;
    if (mainTaxPercentage != 0) {
      mainTaxAmount = Number((totalTaxableAmount * mainTaxPercentage) / 100);
    }

    let tdsOrTcsTaxAmount = 0;
    if (SelectedTdsOrTcsTaxDetails[0].taxValue != 0) {
      if (this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount') {
        tdsOrTcsTaxAmount = Number((totalTaxableAmount * SelectedTdsOrTcsTaxDetails[0].taxValue) / 100);
      } else if (this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount') {
        tdsOrTcsTaxAmount = Number(
          ((totalTaxableAmount + mainTaxAmount) * SelectedTdsOrTcsTaxDetails[0].taxValue) / 100,
        );
      }
    }

    function roundToTwo(num) {
      return +(Math.round(num + 'e+2') + 'e-2');
    }

    this.setState({
      balanceDetails: {
        totalTaxableAmount: totalTaxableAmount != 0 ? roundToTwo(totalTaxableAmount) : this.state.amountForReceipt,
        mainTaxAmount: mainTaxAmount != 0 ? roundToTwo(mainTaxAmount) : 0,
        tdsOrTcsTaxAmount: SelectedTdsOrTcsTaxDetails[0].taxValue != 0 ? roundToTwo(tdsOrTcsTaxAmount) : 0,
      },
    });
  }

  // Balance Dropdown View
  _renderTotalAmount() {
    return (
      <View>
        <View
          style={{
            backgroundColor: '#E6E6E6',
            flexDirection: 'row',
            paddingVertical: 9,
            paddingHorizontal: 16,
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row'}}>
            <Icon style={{marginRight: 10}} name={'Path-12190'} size={16} color="#084EAD" />
            <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>Balance</Text>
          </View>
          <Icon
            style={{transform: [{rotate: this.state.expandedBalance ? '180deg' : '0deg'}]}}
            name={'9'}
            size={16}
            color="#808080"
            onPress={() => {
              this.setState({expandedBalance: !this.state.expandedBalance});
            }}
          />
        </View>

        {this.state.expandedBalance && (
          <View style={{margin: 16}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{'Taxable Amount'}</Text>
              <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                {this.state.currencySymbol + Number(this.state.balanceDetails.totalTaxableAmount).toFixed(2)}
              </Text>
            </View>
            {this.state.balanceDetails.mainTaxAmount > 0 ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{'Tax'}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + Number(this.state.balanceDetails.mainTaxAmount).toFixed(2)}
                </Text>
              </View>
            ) : null}
            {this.state.selectedArrayType.includes('tdspay') || this.state.selectedArrayType.includes('tdsrc') ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{'TDS'}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {'- ' + this.state.currencySymbol + Number(this.state.balanceDetails.tdsOrTcsTaxAmount).toFixed(2)}
                </Text>
              </View>
            ) : null}
            {this.state.selectedArrayType.includes('tcspay') || this.state.selectedArrayType.includes('tcsrc') ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{'TCS'}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + Number(this.state.balanceDetails.tdsOrTcsTaxAmount).toFixed(2)}
                </Text>
              </View>
            ) : null}
            <View style={{height: 1.1, backgroundColor: 'black', marginVertical: 10}}></View>

            {this.state.amountForReceipt != 0 && this.state.amountForReceipt != '' ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{'Total'}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + Number(this.state.amountForReceipt).toFixed(2)}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  genrateInvoice(type) {
    if (!this.state.partyName) {
      alert('Please select a party.');
    } else if (this.state.amountForReceipt == '') {
      alert('Please enter amount.');
    } else if (!this.state.paymentMode.uniqueName) {
      alert('Please select account.');
    } else {
      this.createPayment(type);
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="never"
          style={[{flex: 1, backgroundColor: 'white'}, {marginBottom: this.keyboardMargin}]}
          bounces={false}>
          <View style={[style.container, {paddingBottom: 80}]}>
            {this.FocusAwareStatusBar(this.props.isFocused)}
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderSelectPartyName()}
              {this.renderAmount()}
            </View>
            {this._renderDateView()}
            {this._renderAddress()}
            {this._renderChequeDetails()}
            {this._renderTaxes()}
            {this._renderLinkIvoice()}
            {this._renderAddDescription()}
            {this.state.amountForReceipt > 0 && this.state.partyName.name && this._renderTotalAmount()}
            {this.state.showAccountsPopup && this._renderAccountsPopUp()}
            {this.state.showTaxPopup && this._renderTax()}
            {this.state.showTaxCalculationMethodPopup && this._renderTaxCalculationMethodModal()}

            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />

            <DateTimePickerModal
              isVisible={this.state.showClearanceDatePicker}
              mode="date"
              onConfirm={this.handleConfirmClearanceDate}
              onCancel={this.hideClearanceDatePicker}
            />
          </View>

          {this.state.searchResults.length > 0 && this._renderSearchList()}
          {this.state.loading && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.4)',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
              }}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          )}
        </Animated.ScrollView>
        {this.state.amountForReceipt > 0 &&
          this.state.partyName.name &&
          this.state.paymentMode.uniqueName != '' &&
          this._renderSaveButton()}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const {commonReducer} = state;
  return {
    ...commonReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <Payment {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
