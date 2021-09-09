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
  Alert
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EditItemDetail from './EditItemDetails';
import routes from '@/navigation/routes';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import CheckBox from 'react-native-check-box';
import Dropdown from 'react-native-modal-dropdown';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { TransactionDBOptions } from '@/Database';
import { TRANSACTION_SCHEMA } from '@/Database/AllSchemas/transaction-schema';

const { SafeAreaOffsetHelper } = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash'
};
interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide'
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide'
};
export class SalesInvoice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      searchNamesOnly: [],
      test: Dropdown,
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
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
      displayedDate: moment(),
      dueDate: moment().add(10, 'day'),
      showDatePicker: false,
      showDueDatePicker: false,
      partyBillingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: ''
        },
        stateCode: '',
        stateName: '',
        pincode: ''
      },
      partyShippingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: ''
        },
        stateCode: '',
        stateName: '',
        pincode: ''
      },
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash'
      },
      modesArray: [],
      editItemDetails: {
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
        total: 0
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null
      },
      ShareModal: false,
      countryDeatils: {
        countryName: '',
        countryCode: ''
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      companyCountryDetails: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      partyType: undefined,
      showExtraDetails: false,
      defaultAccountTax: [],
      defaultAccountDiscount: [],
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setOtherDetails = (data) => {
    this.setState({ otherDetails: data });
  };

  selectBillingAddress = (address) => {
    console.log(address);
    this.setState({ partyBillingAddress: address });
    if (this.state.billSameAsShip) {
      this.setState({ partyShippingAddress: address });
    }
  };

  selectShippingAddress = (address) => {
    console.log('shipping add', address);
    this.setState({ partyShippingAddress: address });
  };

  // func1 = async () => {
  //   const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
  //   console.log(activeCompany);
  // };
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#0E7942" barStyle="light-content" /> : null;
  };

  async setActiveCompanyCountry() {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          companyCountryDetails: results.body.country
        });
      }
    } catch (e) { }
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    this.initialPartyFiller();
    // this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
    // console.log('resetDog');
    // await this.resetState();
    // this.setActiveCompanyCountry()
    // this.getAllTaxes();
    // this.getAllDiscounts();
    // this.getAllWarehouse();
    // this.getAllAccountsModes();
    // });

    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
      this.updateAddedItems(data);
      // fire logout action
      // store.dispatch.auth.logout();
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setActiveCompanyCountry();
      this.resetState();
      this.getAllTaxes();
      this.getAllDiscounts();
      this.getAllWarehouse();
      this.getAllAccountsModes();
      this.initialPartyFiller();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
  }

  initialPartyFiller = async () => {
    await this.searchCalls();
  }

  clearAll = () => {
    Keyboard.dismiss();
    this.resetState();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    this.initialPartyFiller();
  };

  /*
       Added Keyboard Listner for making view scroll if needed
     */
  keyboardWillShow = (event) => {
    const value = event.endCoordinates.height - this.state.bottomOffset;
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: value
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: 0
    }).start();
  };

  renderHeader() {
    return (
      <View style={[style.header, { paddingTop: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>
              {this.state.invoiceType == INVOICE_TYPE.credit ? 'Sales Invoice' : 'Cash Invoice'}
            </Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginRight: 16, alignSelf: 'center' }}
          onPress={() => {
            if (this.state.invoiceType == INVOICE_TYPE.credit) {
              this.setCashTypeInvoice();
            } else {
              this.setCreditTypeInvoice();
            }
            // this.setState({ showInvoiceModal: true })
          }}>
          <Text style={style.invoiceTypeTextRight}>
            {`${this.state.invoiceType == INVOICE_TYPE.credit ? INVOICE_TYPE.cash : INVOICE_TYPE.credit}` + '?'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderInvoiceTypeModal() {
    return (
      <Modal
        isVisible={this.state.showInvoiceModal}
        backdropColor={'black'}
        animationIn="fadeIn"
        transparent={true}
        animationOut="fadeOut"
        style={{
          position: 'absolute',
          elevation: 10,
          justifyContent: 'center',
          alignItems: 'center',
          right: 0,
          left: 0,
          bottom: 0,
          top: 0
        }}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            overflow: 'hidden',
            alignSelf: 'center',
            width: '100%',
            height: '100%'
          }}>
          <View style={{ backgroundColor: 'white', marginTop: 70, marginHorizontal: 40, borderRadius: 10 }}>
            <TouchableOpacity
              style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }}
              onPress={() => this.setCashTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Cash' ? '#5773FF' : 'black' }}>Cash Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }}
              onPress={() => this.setCreditTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Credit' ? '#5773FF' : 'black' }}>Credit Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }


  renderSelectPartyName() {
    return (
      <View
        onLayout={this.onLayout}
        style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center' }}
        onPress={() => { }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}> */}
          <Icon name={'Profile'} color={'#A6D8BF'} style={{ margin: 16 }} size={16} />
          <Dropdown
            ref={(ref) => this.state.test = ref}
            defaultValue={''}
            renderSeparator={() => {
              return (<View />);
            }}
            renderButtonText={() => {
              return (<View />);
            }}
            onSelect={(index, option) => {
              const item = this.state.searchResults[index];
              this.setState(
                {
                  partyName: item,
                  searchResults: [],
                  searchPartyName: item.name,
                  searchError: '',
                  isSearchingParty: false
                },
                () => {
                  this.searchAccount();
                  this.getAllAccountsModes();
                  Keyboard.dismiss();
                }
              );
            }}
            renderRow={(option) => {
              return (
                <Text
                  style={{
                    color: '#1C1C1C',
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    alignItems: 'center'
                  }}>
                  {option}</Text>
              );
            }}
            dropdownStyle={{ width: width * 0.75, marginTop: 10, borderRadius: 10 }}
            options={this.state.searchNamesOnly} />
          <TextInput
            placeholderTextColor={'#A6D8BF'}
            placeholder={this.state.invoiceType == 'cash' ? 'Enter Party Name' : 'Search Party Name'}
            returnKeyType={'done'}
            onFocus={() => {
              this.setState({ toDiplayList: true });
            }}
            value={this.state.searchPartyName}
            onChangeText={(text) => {
              this.state.invoiceType == INVOICE_TYPE.credit
                ? (this.setState({ searchPartyName: text }), this.searchCalls())
                : this.setState({ searchPartyName: text, partyName: { name: text, uniqueName: 'cash' } });
            }}
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{ color: 'white', marginRight: 16 }}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y
    });
  };

  searchCalls = _.debounce(this.searchUser, 2000);

  async getAllDiscounts() {
    this.setState({ fetechingDiscountList: true });
    try {
      const results = await InvoiceService.getDiscounts();
      if (results.body && results.status == 'success') {
        this.setState({ discountArray: results.body, fetechingDiscountList: false });
      }
    } catch (e) {
      this.setState({ fetechingDiscountList: false });
    }
  }

  async getAllWarehouse() {
    this.setState({ fetechingWarehouseList: true });
    try {
      const results = await InvoiceService.getWarehouse();
      if (results.body && results.status == 'success') {
        this.setState({ warehouseArray: results.body.results, fetechingWarehouseList: false });
      }
    } catch (e) {
      this.setState({ fetechingWarehouseList: false });
    }
  }

  async getAllAccountsModes() {
    try {
      const results = await InvoiceService.getBriefAccount();
      if (results.body && results.status == 'success') {
        this.setState({ modesArray: results.body.results });
      }
    } catch (e) { }
  }

  async getAllTaxes() {
    this.setState({ fetechingTaxList: true });
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        this.setState({ taxArray: results.body, fetechingTaxList: false });
      }
    } catch (e) {
      this.setState({ fetechingTaxList: false });
    }
  }

  getTaxDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.state.taxArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  getDiscountDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  async getExchangeRateToINR(currency) {
    try {
      const results = await InvoiceService.getExchangeRate(
        moment().format('DD-MM-YYYY'),
        this.state.companyCountryDetails.currency.code,
        currency
      );
      if (results.body && results.status == 'success') {
        await this.setState({
          totalAmountInINR: (Math.round(Number(this.getTotalAmount()) * results.body * 100) / 100).toFixed(2),
          exchangeRate: results.body
        });
      }
    } catch (e) { }
    return 1;
  }

  _renderSearchList() {
    return (
      <Modal animationType="none" transparent={true} visible={true}>
        <View style={[style.searchResultContainer, { top: height * 0.12 }]}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-end',
              padding: 5,
              alignItems: 'center'
            }}
            onPress={() =>
              this.setState({
                searchResults: [],
                searchError: '',
                isSearchingParty: false
              })
            }>
            <Ionicons name="close-circle" size={20} color={'#424242'} />
            {/* <Text style={{marginLeft: 3}}>Close</Text> */}
          </TouchableOpacity>
          <FlatList
            data={this.state.searchResults}
            style={{ paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{}}
                onFocus={() => this.onChangeText('')}
                onPress={async () => {
                  this.setState(
                    {
                      partyName: item,
                      searchResults: [],
                      searchPartyName: item.name,
                      searchError: '',
                      isSearchingParty: false
                    },
                    () => {
                      this.searchAccount();
                      this.getAllAccountsModes();
                      Keyboard.dismiss();
                    }
                  );
                }}>
                <Text style={{ color: '#1C1C1C', paddingVertical: 10 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    );
  }

  async searchUser() {
    this.setState({ isSearchingParty: true });
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrydebtors', false);

      if (results.body && results.body.results) {
        let namesOnly = [];
        results.body.results.forEach((element, index) => {
          namesOnly.push(element.name);
          if (index >= results.body.results.length - 1) {
            this.setState({
              searchNamesOnly: namesOnly
            })
          }
        });
        this.setState({ searchResults: results.body.results, isSearchingParty: false, searchError: '' });
        this.state.test.show();
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });
    }
  }
  setDefaultAccountTax(tax) {
    var allDefaultTax = []
    if (tax) {
      for (let j = 0; j < tax.length; j++) {
        allDefaultTax.push(tax[j].uniqueName)
      }
    }
    this.setState({ defaultAccountTax: allDefaultTax })
    console.log("ALL TAX " + JSON.stringify(allDefaultTax))
  }

  setDefaultDiscount(discount) {
    var allDefaultDiscount = []
    if (discount) {
      for (let j = 0; j < discount.length; j++) {
        allDefaultDiscount.push(discount[j].uniqueName)
      }
    }
    this.setState({ defaultAccountDiscount: allDefaultDiscount })
    console.log("ALL Discount " + JSON.stringify(allDefaultDiscount))
  }

  async getPartyTypeFromAddress(addressArr) {
    if (addressArr.length > 0) {
      for (let i = 0; i < addressArr.length; i++) {
        if (addressArr[i].partyType == "SEZ") {
          this.setState({ partyType: addressArr[i].partyType })
          break
        }
        if (i + 1 == addressArr.length) {
          this.setState({ partyType: addressArr[i].partyType })
        }
      }
    } else {
      this.setState({ partyType: undefined })
    }
    console.log(JSON.stringify(this.state.partyType))
  }

  async searchAccount() {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);

      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        console.log(JSON.stringify(results.body))
        this.setDefaultAccountTax(results.body.applicableTaxes)
        this.setDefaultDiscount(results.body.applicableDiscounts)
        this.getPartyTypeFromAddress(results.body.addresses)
        await this.setState({
          addedItems: [],
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          countryDeatils: results.body.country,
          currency: results.body.currency,
          currencySymbol: results.body.currencySymbol,
          addressArray: results.body.addresses.length < 1 ? [] : results.body.addresses,
          partyBillingAddress:
            results.body.addresses.length < 1
              ? {
                address: '',
                gstNumber: '',
                state: {
                  code: '',
                  name: ''
                },
                stateCode: '',
                stateName: ''
              }
              : results.body.addresses[0],
          partyShippingAddress:
            results.body.addresses.length < 1
              ? {
                address: '',
                gstNumber: '',
                state: {
                  code: '',
                  name: ''
                },
                stateCode: '',
                stateName: ''
              }
              : results.body.addresses[0],
        });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });
    }
  }

  resetState = () => {
    this.setState({
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
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
      displayedDate: moment(),
      dueDate: moment().add(10, 'day'),
      showDatePicker: false,
      showDueDatePicker: false,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash'
      },
      modesArray: [],
      editItemDetails: {
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
        total: 0
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null
      },
      ShareModal: false,
      countryDeatils: {
        countryName: '',
        countryCode: ''
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      partyBillingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: ''
        },
        stateCode: '',
        stateName: ''
      },
      partyShippingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: ''
        },
        stateCode: '',
        stateName: ''
      },
      companyCountryDetails: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      partyType: undefined,
      showExtraDetails: false,
      defaultAccountTax: [],
      defaultAccountDiscount: [],
    });
  };

  getDiscountForEntry(item) {
    // console.log('item is', item);
    const discountArr = [];
    if (item.fixedDiscount) {
      const discountItem = {
        calculationMethod: 'FIX_AMOUNT',
        uniqueName: item.fixedDiscount.uniqueName,
        amount: { type: 'DEBIT', amountForAccount: Number(item.fixedDiscount.discountValue) },
        discountValue: Number(item.fixedDiscount.discountValue),
        name: '',
        particular: ''
      };
      discountArr.push(discountItem);
    }
    if (item.percentDiscountArray) {
      if (item.percentDiscountArray.length > 0) {
        for (let i = 0; i < item.percentDiscountArray.length; i++) {
          const discountItem = {
            calculationMethod: 'PERCENTAGE',
            uniqueName: item.percentDiscountArray[i].uniqueName,
            amount: { type: 'DEBIT', amountForAccount: item.percentDiscountArray[i].discountValue },
            discountValue: item.percentDiscountArray[i].discountValue,
            name: item.percentDiscountArray[i].name,
            particular: item.percentDiscountArray[i].linkAccount.uniqueName
          };
          discountArr.push(discountItem);
        }
      }
    }
    if (discountArr.length > 0) {
      return discountArr;
    } else {
      return [
        { calculationMethod: 'FIX_AMOUNT', amount: { type: 'DEBIT', amountForAccount: 0 }, name: '', particular: '' }
      ];
    }
  }

  getTaxesForEntry(item) {
    const taxArr = [];
    // console.log(' tax item is', item);
    if (item.taxDetailsArray) {
      for (let i = 0; i < item.taxDetailsArray.length; i++) {
        const tax = item.taxDetailsArray[i];
        const taxItem = { uniqueName: tax.uniqueName, calculationMethod: 'OnTaxableAmount' };
        taxArr.push(taxItem);
      }
      return taxArr;
    }
    return [];
  }

  getEntries() {
    const entriesArray = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      console.log('item is', item);
      const entry = {
        date: moment(this.state.date).format('DD-MM-YYYY'),
        description: item.description,
        discounts: this.getDiscountForEntry(item),
        // discounts: [
        //   {calculationMethod: 'FIX_AMOUNT', amount: {type: 'DEBIT', amountForAccount: 0}, name: '', particular: ''},
        // ],
        hsnNumber: item.hsnNumber == null ? '' : item.hsnNumber,
        purchaseOrderItemMapping: { uniqueName: '', entryUniqueName: '' },
        sacNumber: item.sacNumber == null ? '' : item.sacNumber,
        taxes: this.getTaxesForEntry(item),
        // taxes: [],
        transactions: [
          {
            account: { uniqueName: item.uniqueName, name: item.name },
            amount: { type: 'DEBIT', amountForAccount: Number(item.rate) * Number(item.quantity) },
            stock: item.stock
              ? {
                quantity: item.quantity,
                sku: item.stock.skuCode,
                name: item.stock.name,

                uniqueName: item.stock.uniqueName,
                rate: {
                  amountForAccount: Number(item.rate)
                },
                stockUnit: {
                  code: item.stock.stockUnitCode
                }
              }
              : undefined
          }
        ],
        voucherNumber: '',
        voucherType: this.state.invoiceType
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  refreshEverything = async () => {
    this.resetState();
    await this.setActiveCompanyCountry();
    await this.getAllTaxes();
    await this.getAllDiscounts();
    await this.getAllWarehouse();
    await this.getAllAccountsModes();
  }

  async createInvoice(type) {
    this.setState({ loading: true });
    try {
      console.log('came to this');
      if (this.state.currency != this.state.companyCountryDetails.currency.code) {
        let exchangeRate = 1;
        (await this.getTotalAmount()) > 0
          ? (exchangeRate = Number(this.state.totalAmountInINR) / this.getTotalAmount())
          : (exchangeRate = 1);
        await this.setState({ exchangeRate: exchangeRate });
      }
      console.log('Response' + JSON.stringify(this.state.partyShippingAddress.state));
      const postBody = {
        account: {
          attentionTo: this.state.attentionTo,
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : '',
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : ''
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : '',
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : '',
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : ''
          },
          contactNumber: this.state.mobileNo,
          country: this.state.countryDeatils,
          currency: { code: this.state.currency },
          currencySymbol: this.state.currencySymbol,
          email: '',
          mobileNumber: '',
          name: this.state.partyName.name,
          // shippingDetails: this.state.partyShippingAddress,
          shippingDetails: {
            address: [this.state.partyShippingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : '',
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : ''
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : '',
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : '',
            pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : ''
          },
          uniqueName: this.state.partyName.uniqueName,
          customerName: this.state.partyName.name
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: moment(this.state.dueDate).format('DD-MM-YYYY'),
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.invoiceType == 'cash' ? 0 : this.state.amountPaidNowText
        },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        passportNumber: '',
        templateDetails: {
          other: {
            shippingDate: this.state.otherDetails.shipDate,
            shippedVia: this.state.otherDetails.shippedVia,
            trackingNumber: this.state.otherDetails.trackingNumber,
            customField1: this.state.otherDetails.customField1,
            customField2: this.state.otherDetails.customField2,
            customField3: this.state.otherDetails.customField3
          }
        },
        touristSchemeApplicable: false,
        type: this.state.invoiceType,
        updateAccountDetails: false,
        voucherAdjustments: { adjustments: [] }
      };
      console.log('postBody is', JSON.stringify(postBody));
      this.setState({ loading: false });
      if (!this.props.isInternetReachable) {
        this.storeOffline(postBody, type);
        this.setState({ loading: false });
        return;
      }
      const results = await InvoiceService.createInvoice(
        postBody,
        this.state.partyName.uniqueName,
        this.state.invoiceType
      );
      if (type != 'share') {
        this.setState({ loading: false });
      }
      if (results.body) {
        // this.setState({loading: false});
        alert('Invoice created successfully!');
        const partyDetails = this.state.partyDetails;
        const invoiceType = this.state.invoiceType;
        const partyUniqueName = this.state.partyDetails.uniqueName;
        // Here for cash invoice party detail is empty {}
        await this.refreshEverything();
        DeviceEventEmitter.emit(APP_EVENTS.InvoiceCreated, {});
        if (type == 'navigate') {
          if (invoiceType == INVOICE_TYPE.cash) {
            this.props.navigation.goBack();
          } else {
            this.props.navigation.navigate(routes.Parties, {
              screen: 'PartiesTransactions',
              initial: false,
              params: {
                item: {
                  name: partyDetails.name,
                  uniqueName: partyDetails.uniqueName,
                  country: { code: partyDetails.country.countryCode },
                  mobileNo: partyDetails.mobileNo
                },
                type: 'Creditors'
              }
            });
          }
        }
        else if (type == 'share') {
          console.log('sharing');
          this.downloadFile(
            results.body.entries[0].voucherType,
            results.body.entries[0].voucherNumber,
            partyUniqueName
          );
        }
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ isSearchingParty: false, loading: false });
    }
  }

  storeOffline = (postbody, type) => {
    const objects = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item, 'InvoiceDue');
      const amount = Number(item.rate) * Number(item.quantity);
      const total = amount - discount + tax;
      objects.push({
        particular: {
          name: postbody.account.customerName
        },
        voucherName: postbody.type,
        entryDate: postbody.date,
        voucherNo: '0',
        otherTransactions: [{
          amount: total,
          inventory: null,
          particular: {
            currency: {
              code: postbody.account.currency.code
            }
          }
        }],
        creditAmount: null,
        debitAmount: total
      });
    }
    console.log(objects);
    Realm.open(TransactionDBOptions)
      .then((realm) => {
        const TransactionData = realm.objects(TRANSACTION_SCHEMA);
        realm.write(async () => {
          if (TransactionData[0]?.objects?.length > 0) {
            TransactionData[0].objects = [...objects, ...TransactionData[0].objects.toJSON()];
          } else {
            this.state.Realm.create(TRANSACTION_SCHEMA, {
              timeStamp: calculateDataLoadedTime(new Date()),
              objects: objects,
            });
          }
          DeviceEventEmitter.emit(APP_EVENTS.InvoiceCreated, {});
          if (type == 'navigate') {
            this.props.navigation.goBack();
          }
          await this.refreshEverything();
        });
      });
  }

  renderAmount() {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Text style={style.invoiceAmountText}>{this.state.currencySymbol + this.getTotalAmount()}</Text>
      </View>
    );
  }

  getSelectedDateDisplay() { }
  getYesterdayDate() {
    this.setState({ date: moment().subtract(1, 'days') });
  }

  getTodayDate() {
    this.setState({ date: moment() });
  }

  formatDate(dateType) {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = dateType == 'InvoiceDate' ? this.state.date : this.state.dueDate;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();
    const diffMonth = new Date().getMonth() - dt.getMonth();
    if (diffYears === 0 && diffDays === 0) {
      return 'Today';
    } else if (diffYears === 0 && diffDays === 1) {
      return 'Yesterday';
    } else if (diffYears === 0 && diffDays === -1) {
      return 'Tomorrow';
    } else if (diffYears === 0 && diffMonth === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else if (diffYears !== 0) {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + ' ' + date;
    }
  }

  hideDatePicker = () => {
    this.setState({ showDatePicker: false });
  };

  handleConfirm = (date) => {
    // console.log('A date has been picked: ', date);
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState({ date: moment(date), dueDate: moment(date).add(10, 'day') });
    this.hideDatePicker();
  };

  handleDueDateConfirm = (dueDate) => {
    this.setState({ dueDate: moment(dueDate) });
    this.hideDueDatePicker();
  }

  hideDueDatePicker = () => {
    this.setState({ showDueDatePicker: false });
  };

  _renderDateView() {
    const { date, displayedDate } = this.state;

    return (
      // <DateRangePicker
      // onChange={this.onDateChange}
      //   date={date}
      //   open={this.state.showDatePicker}
      //   displayedDate={displayedDate}
      //   buttonStyle={style.dateView}>
      //   <View style={style.dateView}>
      //     <View style={{flexDirection: 'row'}}>
      //       <Icon name={'Calendar'} color={'#229F5F'} size={16} />
      //       <Text style={style.selectedDateText}>{this.formatDate()}</Text>
      //     </View>
      //     <TouchableOpacity
      //       style={{borderColor: '#D9D9D9', borderWidth: 1, backgroundColor: 'pink'}}
      //       onPress={() =>
      //         this.state.date.startOf('day').isSame(moment().startOf('day'))
      //           ? this.getYesterdayDate()
      //           : this.getTodayDate()
      //       }>
      //       <Text style={{color: '#808080'}}>
      //         {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
      //       </Text>
      //     </TouchableOpacity>
      //   </View>
      // </DateRangePicker>
      <View>
        <View style={style.dateView}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ showDatePicker: true })}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{'Invoice Date - ' + this.formatDate('InvoiceDate')}</Text>
            {/* <Text style={style.selectedDateText}>{"Invoice Date "}</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2 }}
            onPress={() =>
              this.state.date.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate()
            }>
            <Text style={{ color: '#808080' }}>
              {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={style.dueDateView}>
          <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ showDueDatePicker: true })}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{'Due Date - ' + this.formatDate('DueDate')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  billingAddressArray() {
    const addressArray = this.state.partyBillingAddress;
    if (this.state.partyBillingAddress.selectedCountry == null) {
      addressArray.selectedCountry =
        this.state.invoiceType == INVOICE_TYPE.credit ? this.state.countryDeatils : this.state.companyCountryDetails;
    }
    return addressArray;
  }

  selectBillingAddressFromEditAdress = async (address) => {
    console.log(JSON.stringify(address));
    const countryCode = address.selectedCountry.currency
      ? address.selectedCountry.currency.code
      : address.selectedCountry.countryCode;
    await this.setState({
      partyBillingAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode
    });
    if (this.state.billSameAsShip) {
      this.setState({ partyShippingAddress: address });
    }
  };

  shippingAddressArray() {
    const addressArray = this.state.partyShippingAddress;
    if (this.state.partyShippingAddress.selectedCountry == null) {
      addressArray.selectedCountry =
        this.state.invoiceType == INVOICE_TYPE.credit ? this.state.countryDeatils : this.state.companyCountryDetails;
    }
    return addressArray;
  }

  selectShippingAddressFromEditAdress = (address) => {
    console.log(address);
    const countryCode = address.selectedCountry.currency
      ? address.selectedCountry.currency.code
      : address.selectedCountry.countryCode;
    this.setState({
      partyShippingAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode
    });
  };

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'8'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => {
                this.state.invoiceType == INVOICE_TYPE.cash
                  ? this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.billingAddressArray(),
                    selectAddress: this.selectBillingAddressFromEditAdress.bind(this),
                    statusBarColor: '#0E7942'
                  })
                  : !this.state.partyName
                    ? alert('Please select a party.')
                    : this.props.navigation.navigate('SelectAddress', {
                      addressArray: this.state.addressArray,
                      activeAddress: this.state.partyBillingAddress,
                      type: 'address',
                      selectAddress: this.selectBillingAddress,
                      statusBarColor: '#0E7942',
                      partyBillingAddress: this.state.partyBillingAddress
                    });
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Billing Address'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%' }}
              onPress={() => {
                if (!this.state.partyName && this.state.invoiceType != INVOICE_TYPE.cash) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.billingAddressArray(),
                    selectAddress: this.selectBillingAddressFromEditAdress.bind(this),
                    statusBarColor: '#0E7942'
                  });
                }
              }}>
              {this.state.invoiceType == INVOICE_TYPE.cash
                ? (
                  <AntDesign name={'right'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
                )
                : (
                  <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
                )}
            </TouchableOpacity>
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              this.state.invoiceType == INVOICE_TYPE.cash
                ? this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry: true,
                  address: this.billingAddressArray(),
                  selectAddress: this.selectBillingAddressFromEditAdress.bind(this),
                  statusBarColor: '#0E7942'
                })
                : !this.state.partyName
                  ? alert('Please select a party.')
                  : this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    activeAddress: this.state.partyBillingAddress,
                    type: 'address',
                    selectAddress: this.selectBillingAddress,
                    statusBarColor: '#0E7942',
                    partyBillingAddress: this.state.partyBillingAddress
                  });
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.partyBillingAddress.address
                ? this.state.partyBillingAddress.address
                : this.state.partyBillingAddress.stateName
                  ? this.state.partyBillingAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : 'Select Billing Address'}
            </Text>
          </TouchableOpacity>
          {/* Sender Address View */}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            checkBoxColor={'#5773FF'}
            uncheckedCheckBoxColor={'#808080'}
            style={{ marginLeft: -3 }}
            onClick={() => {
              this.setState({
                billSameAsShip: !this.state.billSameAsShip,
                partyShippingAddress: this.state.partyBillingAddress
              });
            }}
            isChecked={this.state.billSameAsShip}
          />
          <Text style={style.addressSameCheckBoxText}>Shipping Address Same as Billing</Text>
          {/* <Text style={{ color: "#E04646", marginTop: 4 }}>*</Text> */}
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => {
                this.state.invoiceType == INVOICE_TYPE.cash
                  ? !this.state.billSameAsShip
                    ? this.props.navigation.navigate('EditAddress', {
                      dontChangeCountry: true,
                      address: this.shippingAddressArray(),
                      selectAddress: this.selectShippingAddressFromEditAdress.bind(this),
                      statusBarColor: '#0E7942'
                    })
                    : null
                  : !this.state.partyName
                    ? alert('Please select a party.')
                    : (!this.state.billSameAsShip
                      ? this.props.navigation.navigate('SelectAddress', {
                        addressArray: this.state.addressArray,
                        activeAddress: this.state.partyShippingAddress,
                        type: 'address',
                        selectAddress: this.selectShippingAddress,
                        statusBarColor: '#0E7942',
                        partyShippingAddress: this.state.partyShippingAddress
                      }) : null)
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Shipping Address'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%' }}
              onPress={() => {
                if (!this.state.partyName && this.state.invoiceType != INVOICE_TYPE.cash) {
                  alert('Please select a party.');
                } else {
                  !this.state.billSameAsShip
                    ? this.props.navigation.navigate('EditAddress', {
                      dontChangeCountry: true,
                      address: this.shippingAddressArray(),
                      selectAddress: this.selectShippingAddressFromEditAdress.bind(this),
                      statusBarColor: '#0E7942'
                    })
                    : null;
                }
              }}>
              {!this.state.billSameAsShip ?
                this.state.invoiceType == INVOICE_TYPE.cash
                  ? (
                    <AntDesign name={'right'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
                  )
                  : (
                    <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
                  ) : <View />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              this.state.invoiceType == INVOICE_TYPE.cash
                ? !this.state.billSameAsShip
                  ? this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.shippingAddressArray(),
                    selectAddress: this.selectShippingAddressFromEditAdress.bind(this),
                    statusBarColor: '#0E7942'
                  })
                  : null
                : !this.state.partyName
                  ? alert('Please select a party.')
                  : (!this.state.billSameAsShip
                    ? this.props.navigation.navigate('SelectAddress', {
                      addressArray: this.state.addressArray,
                      activeAddress: this.state.partyShippingAddress,
                      type: 'address',
                      selectAddress: this.selectShippingAddress,
                      statusBarColor: '#0E7942',
                      partyShippingAddress: this.state.partyShippingAddress
                    }) : null)
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.partyShippingAddress.address
                ? this.state.partyShippingAddress.address
                : this.state.partyShippingAddress.stateName
                  ? this.state.partyShippingAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : 'Select Shipping Address'}
            </Text>
          </TouchableOpacity>
          {/* Shipping Address View */}
        </View>
      </View>
    );
  }

  // https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice = async () => {
    await this.resetState();
    await this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    await this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false });
  };

  setCreditTypeInvoice = async () => {
    await this.resetState();
    await this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    await this.setState({ invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false });
  };

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false
    });
  };

  updateAddedItems = async (addedItems) => {
    const updateAmountToCurrentCurrency = addedItems;
    if (this.state.currency.toString() != this.state.companyCountryDetails.currency.code.toString()) {
      try {
        const results = await InvoiceService.getExchangeRate(
          moment().format('DD-MM-YYYY'),
          this.state.currency,
          this.state.companyCountryDetails.currency.code
        );
        if (results.body && results.status == 'success') {
          for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
            const item = updateAmountToCurrentCurrency[i];
            if (updateAmountToCurrentCurrency[i].currency.code.toString() != this.state.currency.toString()) {
              updateAmountToCurrentCurrency[i].currency = await {
                code: this.state.currency,
                symbol: this.state.currencySymbol
              };
              updateAmountToCurrentCurrency[i].rate = await (Number(item.rate) * results.body);
            }
          }
        }
      } catch (e) { }
    }

    for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
      if (updateAmountToCurrentCurrency[i].isNew == undefined || updateAmountToCurrentCurrency[i].isNew == true) { this.DefaultStockAndAccountTax(updateAmountToCurrentCurrency[i]) }
    }

    await this.setState({ addedItems: updateAmountToCurrentCurrency });
    await this.setState({
      totalAmountInINR: (Math.round(this.getTotalAmount() * this.state.exchangeRate * 100) / 100).toFixed(2)
    });
    await this.updateTCSAndTDSTaxAmount(updateAmountToCurrentCurrency);
  };

  async DefaultStockAndAccountTax(itemDetails) {
    let editItemDetails = itemDetails
    let taxDetailsArray = editItemDetails.taxDetailsArray ? editItemDetails.taxDetailsArray : []
    let selectedTaxArray = editItemDetails.selectedArrayType ? editItemDetails.selectedArrayType : []
    let discountDetailsArray = editItemDetails.percentDiscountArray ? editItemDetails.percentDiscountArray : []

    // Stock taxes 
    if (itemDetails.stock) {
      // Stock taxes
      if (itemDetails.stock.taxes) {
        for (var i = 0; i < itemDetails.stock.taxes.length; i++) {
          var taxDetails = this.getTaxDeatilsForUniqueName(itemDetails.stock.taxes[i])
          if (taxDetails) {
            taxDetailsArray.push(taxDetails)
            selectedTaxArray.push(taxDetails.taxType)
          }
        }
      }
      // Stock group taxes
      if (itemDetails.stock.groupTaxes) {
        for (var i = 0; i < itemDetails.stock.groupTaxes.length; i++) {
          var taxDetails = this.getTaxDeatilsForUniqueName(itemDetails.stock.groupTaxes[i])
          if (!((selectedTaxArray.includes(taxDetails.taxType) && !selectedTaxArray.includes(taxDetails)) ||
            ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
              taxDetails.taxType == 'tcspay') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tcsrc')) &&
                taxDetails.taxType == 'tdsrc') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcspay')) &&
                  taxDetails.taxType == 'tcsrc') || ((selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
                    taxDetails.taxType == 'tdspay'))) {
            taxDetailsArray.push(taxDetails)
            selectedTaxArray.push(taxDetails.taxType)
          }
        }
      }
    } else if (itemDetails.taxes) {
      // sales taxes
      for (var i = 0; i < itemDetails.taxes.length; i++) {
        var taxDetails = this.getTaxDeatilsForUniqueName(itemDetails.taxes[i])
        if (taxDetails) {
          taxDetailsArray.push(taxDetails)
          selectedTaxArray.push(taxDetails.taxType)
        }
      }
    }

    // hsnNumber
    if (itemDetails.stock && editItemDetails.hsnNumber == null) {
      if (itemDetails.stock.hsnNumber) {
        editItemDetails.hsnNumber = itemDetails.stock.hsnNumber
      }
    }
    // SacNumber
    if (itemDetails.stock && editItemDetails.sacNumber == null) {
      if (itemDetails.stock.sacNumber) {
        editItemDetails.sacNumber = itemDetails.stock.sacNumber
      }
    }

    // Account tax
    if (this.state.defaultAccountTax) {
      for (var i = 0; i < this.state.defaultAccountTax.length; i++) {
        var taxDetails = this.getTaxDeatilsForUniqueName(this.state.defaultAccountTax[i])
        if (!((selectedTaxArray.includes(taxDetails.taxType) && !selectedTaxArray.includes(taxDetails)) ||
          ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
            taxDetails.taxType == 'tcspay') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tcsrc')) &&
              taxDetails.taxType == 'tdsrc') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcspay')) &&
                taxDetails.taxType == 'tcsrc') || ((selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
                  taxDetails.taxType == 'tdspay'))) {
          taxDetailsArray.push(taxDetails)
          selectedTaxArray.push(taxDetails.taxType)
        }
      }
    }

    // Account group taxes 
    if (itemDetails.groupTaxes) {
      for (var i = 0; i < itemDetails.groupTaxes.length; i++) {
        var taxDetails = this.getTaxDeatilsForUniqueName(itemDetails.groupTaxes[i])
        if (!((selectedTaxArray.includes(taxDetails.taxType) && !selectedTaxArray.includes(taxDetails)) ||
          ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
            taxDetails.taxType == 'tcspay') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tcsrc')) &&
              taxDetails.taxType == 'tdsrc') || ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcspay')) &&
                taxDetails.taxType == 'tcsrc') || ((selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
                  taxDetails.taxType == 'tdspay'))) {
          taxDetailsArray.push(taxDetails)
          selectedTaxArray.push(taxDetails.taxType)
        }
      }
    }

    // Account default discount
    if (this.state.defaultAccountDiscount) {
      for (var i = 0; i < this.state.defaultAccountDiscount.length; i++) {
        var discountDetails = this.getDiscountDeatilsForUniqueName(this.state.defaultAccountDiscount[i])
        discountDetails ? discountDetailsArray.push(discountDetails) : null
      }
    }

    editItemDetails.taxDetailsArray = taxDetailsArray
    editItemDetails.selectedArrayType = selectedTaxArray
    editItemDetails.quantityText = editItemDetails.quantity
    editItemDetails.rateText = editItemDetails.rate
    editItemDetails.percentDiscountArray = discountDetailsArray
    editItemDetails.unitText = editItemDetails.stock ? editItemDetails.stock.unitRates.stockUnitCode : ""
    editItemDetails.amountText = editItemDetails.rate
    editItemDetails.stock ? (editItemDetails.stock.taxes = []) : (null)
    editItemDetails.discountValue = this.calculateDiscountedAmount(editItemDetails)
    editItemDetails.isNew = false

    console.log("FINAL ITEM " + JSON.stringify(editItemDetails))
  }


  renderAddItemButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
            this.props.navigation.navigate('AddInvoiceItemScreen', {
              updateAddedItems: (this.updateAddedItems).bind(this),
              addedItems: this.state.addedItems,
              currencySymbol: this.state.invoiceType == INVOICE_TYPE.cash ? this.state.companyCountryDetails.currency.symbol : this.state.currencySymbol
            });
          } else {
            alert('Please select a party.');
          }
        }}
        // onPress={() => console.log(this.state.partyShippingAddress)}
        style={{
          marginVertical: 16,
          paddingVertical: 10,
          flexDirection: 'row',
          borderColor: '#229F5F',
          borderWidth: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '90%'
        }}>
        <AntDesign name={'plus'} color={'#229F5F'} size={18} style={{ marginHorizontal: 8 }} />
        <Text style={style.addItemMain}> Add Item</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'Path-13016'} color="#229F5F" size={18} />
            <Text style={{ marginLeft: 10 }}>Select Product/Service</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('AddInvoiceItemScreen', {
                updateAddedItems: (this.updateAddedItems).bind(this),
                addedItems: this.state.addedItems,
                currencySymbol: this.state.invoiceType == INVOICE_TYPE.cash ? this.state.companyCountryDetails.currency.symbol : this.state.currencySymbol
              });
            }}>
            <Icon name={'path-15'} color="#808080" size={18} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.addedItems}
          style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          renderItem={({ item }) => this.renderStockItem(item)}
        />
      </View>
    );
  }

  addItem = (item) => {
    let newItems = this.state.addedItems

    let uniqueName = item.stock ? item.stock.uniqueName : item.uniqueName
    var uniqueNumber = uniqueName.match(/\d+$/) != null ? Number(uniqueName.match(/\d+$/)[0]) + 1 : 1
    uniqueName = uniqueName.replace(/\d+$/, "") + uniqueNumber.toString();

    console.log("UniqueName " + uniqueName)

    item["newUniqueName"] = uniqueName
    newItems.push(item);
    this.setState({ addedItems: newItems });

    this.updateTCSAndTDSTaxAmount(newItems);
    if (item.rate) {
      const totalAmount = this.getTotalAmount();
      this.setState({
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2)
      });
    }
  };

  deleteItem = (item) => {
    const addedArray = this.state.addedItems;
    const itemUniqueName = item.newUniqueName ? item.newUniqueName : (item.stock ? item.stock.uniqueName : item.uniqueName);
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.newUniqueName ? e.newUniqueName : (e.stock ? e.stock.uniqueName : e.uniqueName);
        return ouniqueName == itemUniqueName;
      },
      0
    );
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray, showItemDetails: false }, () => { });
    this.updateTCSAndTDSTaxAmount(addedArray);
    if (item.rate) {
      const totalAmount = this.getTotalAmount();
      this.setState({
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2)
      });
    }
  };

  renderRightAction(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.deleteItem(item);
        }}
        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <AntDesign name={'delete'} size={16} color="#E04646" />
        <Text style={{ color: '#E04646', marginLeft: 10 }}>Delete</Text>
      </TouchableOpacity>
    );
  }

  renderStockItem(item) {
    // console.log('item is ', item);
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          style={{ backgroundColor: '#E0F2E9', padding: 10, borderRadius: 2, marginBottom: 10 }}
          onPress={() => {
            this.setState({
              showItemDetails: true,
              itemDetails: item,
              editItemDetails: {
                quantityText: item.quantity,
                rateText: item.rate,
                unitText: '',
                amountText: '',
                discountValueText: '',
                discountPercentageText: '',
                discountType: '',
                taxType: '',
                taxText: '',
                warehouse: '',
                total: 0
              }
            });
          }}>
          <View style={{ flexDirection: 'row', paddingVertical: 10, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: '#1C1C1C' }}>{item.name} </Text>
              {item.stock && (
                <Text numberOfLines={1} style={{ color: '#1C1C1C' }}>
                  ( {item.stock.name} ) :
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => this.addItem({ ...item })} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AntDesign name={'plus'} color={'#808080'} size={15} />
              <Text style={{ color: '#808080' }}>Add again</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#808080' }}>
                {String(item.quantity)} x {this.state.currencySymbol}
                {String(item.rate)}
              </Text>
            </View>
          </View>

          <Text style={{ marginTop: 5, color: '#808080' }}>
            Tax : {this.state.currencySymbol}
            {this.calculatedTaxAmount(item, 'taxAmount')}
          </Text>
          <Text style={{ marginTop: 5, color: '#808080' }}>
            Discount : {this.state.currencySymbol}
            {item.discountValue ? item.discountValue : 0}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  onChangeTextBottomItemSheet(text, field) {
    const editItemDetails = this.state.editItemDetails;
    switch (field) {
      case 'Quantity':
        editItemDetails.quantityText = text;
        break;

      case 'Unit':
        editItemDetails.unitText = text;
        break;

      case 'Rate':
        editItemDetails.rateText = text;
        break;

      case 'Amount':
        editItemDetails.amountText = text;
        break;

      case 'Discount Value':
        editItemDetails.discountValueText = text;
        break;

      case 'Discount Percentage':
        editItemDetails.discountPercentageText = text;
        break;
    }
    this.setState({ editItemDetails });
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }

  calculateDiscountedAmount(itemDetails) {
    let totalDiscount = 0;
    let percentDiscount = 0;
    // if (itemDetails.fixedDiscount.discountValue != undefined) {
    //   totalDiscount = totalDiscount + itemDetails.fixedDiscount.discountValue;
    // }
    if (itemDetails.percentDiscountArray && itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
      }
      // console.log(percentDiscount, 'total % discount');
      const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      // console.log('amt is ', amt);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    console.log(totalDiscount, 'is the discount');
    return totalDiscount;
  }

  calculatedTaxAmount(itemDetails, calculateFor) {
    let totalTax = 0;
    console.log('rate', itemDetails.rate);
    const taxArr = this.state.taxArray;
    if (
      (this.state.invoiceType == INVOICE_TYPE.credit && calculateFor == 'totalAmount' &&
        this.state.currency != this.state.companyCountryDetails.currency.code &&
        this.state.companyCountryDetails.currency.code == 'INR') || (this.state.partyType == "SEZ" && calculateFor == 'totalAmount')) {
      return 0;
    }
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        // console.log("Item Details taxDetailsArray " + JSON.stringify(item))
        if (this.state.partyType == "SEZ" || (this.state.companyCountryDetails.currency.code == 'INR' && this.state.currency != this.state.companyCountryDetails.currency.code
          && this.state.invoiceType != INVOICE_TYPE.cash)) {
          // In case of company country india, if any foriegn country customer exist then invoice due only contains tcs/tds tax
          // And in case of tax calculation we only add taxes (tds/tcs excluded).
          const taxPercent = Number(item.taxDetail[0].taxValue);
          const taxAmount = (taxPercent * Number(amt)) / 100;
          if ((item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') && calculateFor != 'taxAmount') {
            totalTax = item.taxType == 'tdspay' || item.taxType == 'tdsrc' ? totalTax - taxAmount : totalTax + taxAmount;
          } else if (calculateFor == 'taxAmount') {
            totalTax = (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') ? totalTax : totalTax + taxAmount;
          }
        } else {
          const taxPercent = Number(item.taxDetail[0].taxValue);
          const taxAmount = (taxPercent * Number(amt)) / 100;
          // In normal case, for tax and invoice due we calculate all taxes( including tds/tcs),
          // But when we calculating total amount we did not include tcs/tds tax.
          if (calculateFor == 'InvoiceDue') {
            totalTax = item.taxType == 'tdspay' || item.taxType == 'tdsrc' ? totalTax - taxAmount : totalTax + taxAmount;
          } else {
            totalTax = (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') ? totalTax : totalTax + taxAmount;
          }
        }
      }
    }
    if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            // console.log("Item Deatils stocks " + JSON.stringify(taxArr[j]))
            if (this.state.partyType == "SEZ" || (this.state.companyCountryDetails.currency.code == 'INR' && this.state.currency != this.state.companyCountryDetails.currency.code
              && this.state.invoiceType != INVOICE_TYPE.cash)) {
              const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
              const taxAmount = (taxPercent * Number(amt)) / 100;
              if ((taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tcspay' || taxArr[j].taxType == 'tcsrc' || taxArr[j].taxType == 'tdsrc') && calculateFor != 'taxAmount') {
                totalTax = taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tdsrc' ? totalTax - taxAmount : totalTax + taxAmount;
              } else if (calculateFor == 'taxAmount') {
                totalTax = (taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tcspay' || taxArr[j].taxType == 'tcsrc' || taxArr[j].taxType == 'tdsrc') ? totalTax : totalTax + taxAmount;
              }
              break;
            } else {
              const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
              const taxAmount = (taxPercent * Number(amt)) / 100;
              if (calculateFor == 'InvoiceDue') {
                totalTax = (taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tdsrc') ? totalTax - taxAmount : totalTax + taxAmount;
              } else {
                totalTax = (taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tcspay' || taxArr[j].taxType == 'tcsrc' || taxArr[j].taxType == 'tdsrc') ? totalTax : totalTax + taxAmount;
              }
              break;
            }
          }
        }
      }
    }

    console.log('calculated tax is ', totalTax);
    return Number(totalTax.toFixed(2));
  }

  calculatedTdsOrTcsTaxAmount(itemDetails) {
    let totalTcsorTdsTax = 0;
    let totalTcsorTdsTaxName = '';

    const taxArr = this.state.taxArray;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        if (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') {
          totalTcsorTdsTax = taxAmount;
          totalTcsorTdsTaxName = item.taxType;
          break;
        }
      }
    }
    if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
            const taxAmount = (taxPercent * Number(amt)) / 100;
            if ((taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tcspay' || taxArr[j].taxType == 'tcsrc' || taxArr[j].taxType == 'tdsrc')) {
              totalTcsorTdsTax = taxAmount;
              totalTcsorTdsTaxName = taxArr[j].taxType;
            }
            break;
          }
        }
      }
    }
    console.log('TCS Or TDS Tax is ' + totalTcsorTdsTax);
    if (totalTcsorTdsTaxName != '' && totalTcsorTdsTax != 0) {
      const tdsOrTcsTaxObj = { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2) };
      return tdsOrTcsTaxObj;
    } else {
      return null;
    }
  }

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item, 'totalAmount');
      const amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
    return total.toFixed(2);
  }

  getInvoiceDueTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item, 'InvoiceDue');
      const amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
    return total.toFixed(2);
  }


  generatePdf = async () => {
    try {
      const html = '<h1>PDF TEST PDF TEST PDF TEST PDF TESTPDF TEST PDF TEST PDF TEST PDF TESTPDF TESTPDF TESTPDF TESTPDF TESTPDF TESTPDF TESTPDF TESTPDF TEST</h1>';
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: 'test',
        directory: Platform.OS == 'ios' ? 'Documents' : 'Download'
      });
      console.log(file);
      Share.open({
        title: 'This is the report',
        //message: 'Message:',
        url: `file://${file.filePath}`,
        subject: 'Transaction report'
      }).then((val) => {
        console.log(val);
      });
    } catch (_err) {
      console.log(_err);
    }
  }


  downloadFile = async (voucherName, voucherNo, partyUniqueName) => {
    try {
      if (Platform.OS == "ios") {
        await this.onShare(voucherName, voucherNo, partyUniqueName);
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          // await this.onShare(voucherName, voucherNo, partyUniqueName);
          this.generatePdf();
        } else {
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onShare = async (voucherName, voucherNo, partyUniqueName) => {
    try {
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'POST',
        `https://api.giddh.com/company/${activeCompany}/accounts/${partyUniqueName}/vouchers/download-file?fileType=pdf`,
        {
          'session-id': `${token}`,
          'Content-Type': 'application/json'
        },
        JSON.stringify({
          voucherNumber: [`${voucherNo}`],
          voucherType: `${voucherName}`
        })
      )
        .then((res) => {
          const base64Str = res.base64();
          const pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          if (Platform.OS === "ios") {
            RNFetchBlob.ios.previewDocument(pdfLocation)
          }
          this.setState({ loading: false });
        })
        .then(() => {
          Share.open({
            title: 'This is the report',
            //message: 'Message:',
            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`,
            subject: 'Transaction report'
          })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              // err && console.log(err);
            });
        });
    } catch (e) {
      this.setState({ loading: false });
      console.log(e);
      console.log(e);
    }
  };

  _renderDetails() {
    return (<View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
      <TouchableOpacity
        onPress={() => { this.setState({ showDetails: !this.state.showDetails }) }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: this.state.showBankDetails ? 'rgba(80,80,80,0.05)' : 'white' }}>
        <AntDesign
          name="pluscircle"
          size={16}
          color="#229F5F"
          style={{ transform: [{ rotate: this.state.showDetails ? '45deg' : '0deg' }] }} />
        <View style={{ alignItems: 'flex-start', flex: 1, paddingLeft: 16 }}>
          <Text style={{ color: '#1C1C1C' }}>Details</Text>
        </View>
        <Icon
          style={{ transform: [{ rotate: this.state.showDetails ? '180deg' : '0deg' }] }}
          name={'9'}
          size={12}
          color="#808080"
        />
      </TouchableOpacity>
      {this.state.showDetails
        ? <View style={{ paddingHorizontal: 35 }}>
          <Text style={{ width: '100%', color: '#1c1c1c', marginTop: 10 }}>Attention to</Text>
          <TextInput
            style={{
              borderBottomColor: '#808080',
              borderBottomWidth: 0.55
            }}
            placeholder={'Type Here'}
            multiline={true}
            onChangeText={(text) => this.setState({ attentionTo: text })} />
          <Text style={{ width: '100%', color: '#1c1c1c', marginTop: 10 }}>Mobile Number</Text>
          <TextInput
            style={{
              borderBottomColor: '#808080',
              borderBottomWidth: 0.55
            }}
            placeholder={'0 6263474042'}
            multiline={true}
            onChangeText={(text) => this.setState({ mobileNo: text })} />
          <Text style={{ width: '100%', color: '#1c1c1c', marginTop: 10 }}>Email ID</Text>
          <TextInput
            style={{
              borderBottomColor: '#808080',
              borderBottomWidth: 0.55
            }}
            placeholder={'someone@gmail.com'}
            multiline={true}
            onChangeText={(text) => this.setState({ email: text })} />
        </View>
        : <View></View>
      }
    </View>);
  }

  _renderOtherDetails() {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 8,
          paddingHorizontal: 16,
          marginTop: 8
        }}
        onPress={() => {
          this.props.navigation.navigate('InvoiceOtherDetailScreen', {
            warehouseArray: this.state.warehouseArray,
            setOtherDetails: this.setOtherDetails,
            otherDetails: this.state.otherDetails
          });
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Icon style={{ marginRight: 16 }} name={'Sections'} size={16} color="#229F5F" />
          <Text style={{ color: '#1C1C1C' }}>Other Details</Text>
        </View>
        <AntDesign name={'right'} size={18} color={'#808080'} />
      </TouchableOpacity>
    );
  }

  _renderPaymentMode() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showPaymentModePopup}
        onRequestClose={() => {
          this.setState({ showPaymentModePopup: false });
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center'
          }}
          onPress={() => {
            this.setState({ showPaymentModePopup: false });
          }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10, alignSelf: 'center' }}>
            {this.state.invoiceType == 'sales' && (
              <TextInput
                value={this.state.amountPaidNowText}
                keyboardType="number-pad"
                placeholder="Enter Amount"
                onChangeText={(text) => {
                  if (Number(text) > Number(this.getTotalAmount())) {
                    Alert.alert('Alert', 'deposit amount should not be more than invoice amount');
                  } else {
                    this.setState({ amountPaidNowText: text });
                  }
                }}
              />
            )}
            <FlatList
              data={this.state.modesArray}
              style={{ paddingLeft: 5, paddingRight: 10, paddingBottom: 10, maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    borderBottomWidth: this.state.selectedPayMode.uniqueName == item.uniqueName ? 2 : 0,
                    borderColor: '#229F5F',
                    alignSelf: 'flex-start',
                    // backgroundColor: 'pink',
                    width: '100%'
                  }}
                  onFocus={() => this.onChangeText('')}
                  onPress={async () => {
                    this.setState({ selectedPayMode: item });
                    if (this.state.amountPaidNowText != 0) {
                      this.setState({ showPaymentModePopup: false });
                    }
                  }}>
                  <Text style={{ color: '#1C1C1C', paddingVertical: 10, textAlign: 'left' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  _renderTotalAmount() {
    return (
      <View>
        <View
          style={{
            backgroundColor: '#E6E6E6',
            flexDirection: 'row',
            paddingVertical: 9,
            paddingHorizontal: 16,
            justifyContent: 'space-between'
          }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color="#229F5F" />
            <Text style={{ color: '#1C1C1C' }}>Balance</Text>
          </View>
          <Icon
            style={{ transform: [{ rotate: this.state.expandedBalance ? '180deg' : '0deg' }] }}
            name={'9'}
            size={16}
            color="#808080"
            onPress={() => {
              this.setState({ expandedBalance: !this.state.expandedBalance });
            }}
          />
        </View>

        {this.state.expandedBalance && (
          <View style={{ margin: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#1C1C1C' }}>{'Total Amount ' + this.state.currencySymbol}</Text>
              <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + this.getTotalAmount()}</Text>
            </View>
            {this.state.currency != this.state.companyCountryDetails.currency.code &&
              this.state.invoiceType != INVOICE_TYPE.cash
              ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ color: '#1C1C1C', textAlignVertical: 'center' }}>
                    {'Total Amount ' + this.state.companyCountryDetails.currency.symbol}
                  </Text>
                  <TextInput
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: '#808080',
                      color: '#1C1C1C',
                      textAlign: 'center',
                      marginRight: 0
                    }}
                    placeholder={'Amount'}
                    returnKeyType={'done'}
                    keyboardType="number-pad"
                    onChangeText={async (text) => {
                      await this.setState({ totalAmountInINR: Number(text) });
                    }}>
                    {this.state.totalAmountInINR}
                  </TextInput>
                </View>)
              : null}
            {
              this.state.tdsOrTcsArray.length != 0
                ? <FlatList
                  data={this.state.tdsOrTcsArray}
                  renderItem={({ item }) => {
                    return (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
                        <Text style={{ color: '#1C1C1C' }}>{item.name}</Text>
                        <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + item.amount}</Text>
                      </View>
                    )
                  }} />
                : null
            }

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: this.state.invoiceType == 'cash' ? 10 : 4,
                // backgroundColor: 'pink',
                alignItems: 'center'
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (this.state.modesArray.length > 0) {
                    this.setState({ showPaymentModePopup: true });
                  }
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#808080', borderBottomWidth: 1, borderBottomColor: '#808080', marginRight: 5 }}>
                    {this.state.selectedPayMode.name}
                  </Text>
                  <Icon style={{ transform: [{ rotate: '0deg' }] }} name={'9'} size={16} color="#808080"></Icon>
                </View>
              </TouchableOpacity>
              {this.state.invoiceType == 'cash' ? (
                <Text style={{ color: '#1C1C1C' }}>{this.getInvoiceDueTotalAmount()}</Text>
              ) : (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ showPaymentModePopup: true });
                    }}>
                    <Text style={{ color: '#1C1C1C' }}>
                      {this.state.addedItems.length > 0 && this.state.currencySymbol + this.state.amountPaidNowText}
                    </Text>
                    {/* <TextInput
                    style={{borderBottomWidth: 1, borderBottomColor: '#808080', padding: 5}}
                    placeholder={`${this.state.addedItems.length > 0 && this.state.addedItems[0].currency.symbol}0.00`}
                    returnKeyType={'done'}
                    editable={false}
                    keyboardType="number-pad"
                    value={this.state.addedItems.length > 0 && this.state.addedItems[0].currency.symbolthis.state.amountPaidNowText}
                    onChangeText={(text) => {
                      this.setState({amountPaidNowText: text});
                    }}
                  /> */}
                  </TouchableOpacity>
                )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: '#1C1C1C' }}>Invoice Due</Text>
              <Text style={{ color: '#1C1C1C' }}>
                {this.state.addedItems.length > 0 && this.state.currencySymbol}
                {this.state.invoiceType == 'cash'
                  ? 0
                  : String(this.getInvoiceDueTotalAmount()) - this.state.amountPaidNowText}
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            marginTop: 20,
            margin: 16,
            alignItems: 'center'
          }}>
          <View>
            <TouchableOpacity
              style={
                {
                  // backgroundColor: '#5773FF',
                  // paddingVertical: 8,
                  // paddingHorizontal: 7,
                  // justifyContent: 'center',
                  // alignItems: 'center',
                  // borderRadius: 10,
                  // marginBottom: 3,
                }
              }
              onPress={() => {
                this.genrateInvoice('new');
              }}>
              <Text style={{ color: '#808080', fontSize: 13 }}>Create and New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginTop: 10
              }}
              onPress={() => {
                this.downloadFile();
                // this.genrateInvoice('share');
              }}>
              <Text style={{ color: '#808080', fontSize: 13 }}>Create and Share</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.genrateInvoice('navigate');
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  genrateInvoice(type) {
    if (!this.state.partyName) {
      alert('Please select a party.');
    } else if (this.state.addedItems.length == 0) {
      alert('Please select entries to proceed.');
    } else if (
      this.state.currency != this.state.companyCountryDetails.currency.code &&
      this.state.totalAmountInINR <= 0 &&
      this.getTotalAmount() > 0
    ) {
      Alert.alert('Error', 'Exchange rate/Total Amount in INR can not zero/negative', [
        { style: 'destructive', onPress: () => console.log('alert destroyed') }
      ]);
    } else if (
      (this.state.currency == this.state.companyCountryDetails.currency.code ||
        this.state.invoiceType == INVOICE_TYPE.cash) &&
      (!this.state.partyBillingAddress.stateName ||
        !this.state.partyBillingAddress.stateCode ||
        !this.state.partyBillingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Billing From', [
        { style: 'destructive', text: 'Okay' }
      ]);
    } else if (
      (this.state.currency == this.state.companyCountryDetails.currency.code ||
        this.state.invoiceType == INVOICE_TYPE.cash) &&
      (!this.state.partyShippingAddress.stateName ||
        !this.state.partyShippingAddress.stateCode ||
        !this.state.partyShippingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Shipping From', [
        { style: 'destructive', text: 'Okay' }
      ]);
    } else {
      this.createInvoice(type);
    }
  }

  updateEditedItem(details, selectedArrayType, selectedCode) {
    const itemUniqueName = details.item.newUniqueName ? details.item.newUniqueName : (details.item.stock ? details.item.stock.uniqueName : details.item.uniqueName);

    const addedArray = this.state.addedItems;
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.newUniqueName ? e.newUniqueName : (e.stock ? e.stock.uniqueName : e.uniqueName);
        return ouniqueName == itemUniqueName;
      },
      0
    );
    const item = this.state.addedItems[index];
    item.quantity = Number(details.quantityText);
    item.description = details.description;
    console.log(item.description);
    item.rate = Number(details.rateText);
    item.unit = Number(details.unitText);
    item.total = Number(details.total);
    item.amount = Number(details.amountText);
    item.discountPercentage = Number(details.discountPercentageText);
    item.discountValue = Number(details.discountValueText);
    item.discountType = Number(details.discountType);
    item.taxType = Number(details.taxType);
    item.tax = Number(details.taxText);
    item.hsnNumber = selectedCode == 'hsn' ? details.hsnNumber : '';
    item.sacNumber = selectedCode == 'sac' ? details.sacNumber : '';
    item.warehouse = Number(details.warehouse);
    item.discountDetails = details.discountDetails ? details.discountDetails : undefined;
    item.taxDetailsArray = details.taxDetailsArray;
    item.percentDiscountArray = details.percentDiscountArray ? details.percentDiscountArray : [];
    item.fixedDiscount = details.fixedDiscount ? details.fixedDiscount : { discountValue: 0 };
    item.fixedDiscountUniqueName = details.fixedDiscountUniqueName ? details.fixedDiscountUniqueName : '';
    item.selectedArrayType = selectedArrayType;
    // Replace item at index using native splice
    addedArray.splice(index, 1, item);
    this.setState({ showItemDetails: false, addedItems: addedArray }, () => { });

    const totalAmount = this.getTotalAmount();
    this.setState({ totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2) });

    this.updateTCSAndTDSTaxAmount(addedArray);
    // this.setState({ addedItems: addedItems })
    // this.setState({showItemDetails:false})
  }

  updateTCSAndTDSTaxAmount(addedArray) {
    const alltdsOrTcsTaxArr = [];
    const tcsTaxObj = { name: 'TCS', amount: 0 };
    const tdsTaxObj = { name: 'TDS', amount: 0 };
    for (let i = 0; i < addedArray.length; i++) {
      const tdsOrTcsTaxObj = this.calculatedTdsOrTcsTaxAmount(addedArray[i]);
      if (tdsOrTcsTaxObj != null) {
        tdsTaxObj.amount = tdsOrTcsTaxObj.name == 'tdspay' || tdsOrTcsTaxObj.name == 'tdsrc' ? (Number(tdsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2) : tdsTaxObj.amount
        tcsTaxObj.amount = tdsOrTcsTaxObj.name == 'tcspay' || tdsOrTcsTaxObj.name == 'tcsrc' ? (Number(tcsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2) : tcsTaxObj.amount
      }
    }
    tcsTaxObj.amount != 0 ? alltdsOrTcsTaxArr.push(tcsTaxObj) : null;
    tdsTaxObj.amount != 0 ? alltdsOrTcsTaxArr.push(tdsTaxObj) : null;
    this.setState({ tdsOrTcsArray: alltdsOrTcsTaxArr });
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          style={[{ flex: 1, backgroundColor: 'white' }, { marginBottom: this.keyboardMargin }]}
          bounces={false}>
          <View style={style.container}>
            {this.FocusAwareStatusBar(this.props.isFocused)}
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderSelectPartyName()}
              {this.renderAmount()}
            </View>
            {this._renderDateView()}
            {this._renderAddress()}
            {this._renderDetails()}
            {this._renderOtherDetails()}
            {this.state.addedItems.length > 0 ? this._renderSelectedStock() : this.renderAddItemButton()}
            {this.state.addedItems.length > 0 && this._renderTotalAmount()}
            {this.state.showInvoiceModal && this.renderInvoiceTypeModal()}
            {this.state.showPaymentModePopup && this._renderPaymentMode()}
            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />
            <DateTimePickerModal
              isVisible={this.state.showDueDatePicker}
              mode="date"
              onConfirm={this.handleDueDateConfirm}
              onCancel={this.hideDueDatePicker}
            />
            {/* <TouchableOpacity
              style={{height: 60, width: 60, backgroundColor: 'pink'}}
              onPress={() => console.log(this.state.partyBillingAddress)}></TouchableOpacity> */}
          </View>

          {/* {this.state.searchResults.length > 0 && this._renderSearchList()} */}
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
                top: 0
              }}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          )}
        </Animated.ScrollView>
        {this.state.showItemDetails && (
          <EditItemDetail
            currencySymbol={this.state.currencySymbol}
            notIncludeTax={((this.state.invoiceType == INVOICE_TYPE.credit &&
              this.state.currency != this.state.companyCountryDetails.currency.code &&
              this.state.companyCountryDetails.currency.code == 'INR') || (this.state.partyType == "SEZ")) ? false : true}
            discountArray={this.state.discountArray}
            taxArray={this.state.taxArray}
            goBack={() => {
              this.setState({ showItemDetails: false });
            }}
            // selectedArrayType={this.state.itemDetails.selectedArrayType}
            itemDetails={this.state.itemDetails}
            updateItems={(details, selectedArr, selectedCode) => {
              this.updateEditedItem(details, selectedArr, selectedCode);
            }}
          />
        )}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <SalesInvoice {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
