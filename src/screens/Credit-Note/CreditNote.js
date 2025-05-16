import React, { createRef } from 'react';
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
  Alert,
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EditItemDetail from './EditItemDetails';
import { FONT_FAMILY } from '../../utils/constants';
import CheckBox from 'react-native-check-box';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';

const { SafeAreaOffsetHelper } = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash',
  creditNote: 'credit note',
};
interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class CreditNote extends React.Component<Props> {
  // private invoiceBottomSheetRef: React.Ref<BottomSheet>;
  constructor(props) {
    super(props);
    this.invoiceBottomSheetRef = createRef();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.state = {
      invoiceType: INVOICE_TYPE.creditNote,
      loading: false,
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
      showDatePicker: false,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
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
        total: 0,
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
        customField3: null,
      },
      linkedInvoices: '',
      showAllInvoice: false,
      allVoucherInvoice: [],
      selectedInvoice: '',
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      companyCountryDetails: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

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
    return isFocused ? <StatusBar backgroundColor="#2e80d1" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
  };

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    this.getCompanyVersionNumber();
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      this.getCompanyVersionNumber();
      if (this.state.searchPartyName == "") {
        this.searchCalls();
      }
    });

    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updateItemInCreditNote, (data) => {
      this.updateAddedItems(data);
      // fire logout action
      // store.dispatch.auth.logout();
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry();
      this.getAllTaxes();
      this.getAllDiscounts();
      this.getAllWarehouse();
      this.getAllAccountsModes();
      this.getCompanyVersionNumber();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
  }

  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber)
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      this.setState({ companyVersionNumber })
    }
  }

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
      <View style={style.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>Credit Note</Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
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
          top: 0,
        }}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            overflow: 'hidden',
            alignSelf: 'center',
            width: '100%',
            height: '100%',
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
        style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 10 }}
        onPress={() => { }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}> */}
          <Icon name={'Profile'} color={'#3497FD'} style={{ margin: 16 }} size={16} />
          <TextInput
             placeholderTextColor={'#808080'}
            placeholder={'Search Company Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) =>
              this.setState({ searchPartyName: text }, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          {/* </View> */}
          <ActivityIndicator color={'#5773FF'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{ color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }

  clearAll = async () => {
    await this.resetState();
    await this.searchCalls();
    await this.setActiveCompanyCountry();
    await this.getAllTaxes();
    await this.getAllDiscounts();
    await this.getAllWarehouse();
    await this.getAllAccountsModes();
    await this.getCompanyVersionNumber();
  };

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y,
    });
  };

  searchCalls = _.debounce(this.searchUser, 200);

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
      if (o.uniqueName == uniqueName) {
        return o;
      }
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  getDiscountDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) {
        return o;
      }
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  async getAllInvoice() {
    try {
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const payload = await {
        accountUniqueNames: [this.state.partyName.uniqueName, 'sales'],
        accountUniqueName: this.state.partyName.uniqueName,
        voucherType: INVOICE_TYPE.creditNote,
        noteVoucherType: 'sales'
      };
      const results = await InvoiceService.getVoucherInvoice(date, payload, this.state.companyVersionNumber);
      if (results.body && results.status == 'success') {
        let allVoucherInvoice = this.state.companyVersionNumber == 1 ? results.body.results : results.body.items
        this.setState({ allVoucherInvoice });
      }
    } catch (e) {
      this.setState({ allVoucherInvoice: [] });
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
          totalAmountInINR: (Math.round(Number(this.getTotalAmount()) * results.body * 100) / 100).toFixed(2),
          exchangeRate: results.body,
        });
      }
    } catch (e) { }
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
    } catch (e) { }
  }

  _renderSearchList() {
    return (
      // <Modal animationType="none" transparent={true} visible={true}>
      //   <TouchableOpacity
      //     style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)'}}
      //     onPress={() =>
      //       this.setState({
      //         searchResults: [],

      //         searchError: '',
      //         isSearchingParty: false,
      //       })
      //     }>
      <View style={[style.searchResultContainer, { top: height * 0.15 }]}>
       
        <FlatList
          nestedScrollEnabled={true}
          data={this.state.searchResults.length == 0 ? ["Result Not found"] : this.state.searchResults}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{}}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                if (item != "Result Not found") {
                  this.setState(
                    {
                      partyName: item,
                      searchResults: [],
                      searchPartyName: item.name,
                      searchError: '',
                      isSearchingParty: false,
                    },
                    () => {
                      this.getAllInvoice();
                      this.searchAccount();
                      this.getAllAccountsModes();
                      Keyboard.dismiss();
                    },
                  );
                } else {
                  this.setState({ isSearchingParty: false, searchResults: [] })
                }
              }}>
              <Text style={style.searchItemText}>{item.name ? item.name : "Result Not found"}</Text>
            </TouchableOpacity>
          )}
        />
         <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            padding: 10,
            alignItems: 'center',
          }}
          onPress={() =>
            this.setState({
              searchResults: [],
              searchError: '',
              isSearchingParty: false,
            })
          }>
          <AntDesign name="closecircleo" size={15} color={'#424242'} />
          {/* <Text style={{marginLeft: 3}}>Close</Text> */}
        </TouchableOpacity>
      </View>
      //   </TouchableOpacity>
      // </Modal>
    );
  }

  async searchUser() {
    this.setState({ isSearchingParty: true });
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrydebtors', false);
      if (results.body && results.body.results) {
        this.setState({ searchResults: results.body.results, isSearchingParty: false, searchError: '' });
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

  async searchAccount() {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);
      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        this.setDefaultAccountTax(results.body.applicableTaxes)
        this.setDefaultDiscount(results.body.applicableDiscounts)
        await this.setState({
          addedItems: [],
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          countryDeatils: results.body.country,
          currency: results.body.currency,
          currencySymbol: results.body.currencySymbol,
          addressArray: results.body.addresses,
          partyBillingAddress: results.body.addresses[0],
          partyShippingAddress: results.body.addresses[0],
        });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });
    }
  }

  resetState = () => {
    this.setState({
      loading: false,
      invoiceType: INVOICE_TYPE.creditNote,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
      searchResults: [],
      searchPartyName: '',
      searchTop: 0,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
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
        total: 0,
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
        customField3: null,
      },
      linkedInvoices: '',
      showAllInvoice: false,
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      companyCountryDetails: '',
      selectedInvoice: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1
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
        particular: '',
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
            particular: item.percentDiscountArray[i].linkAccount.uniqueName,
          };
          discountArr.push(discountItem);
        }
      }
    }
    if (discountArr.length > 0) {
      return discountArr;
    } else {
      return [
        { calculationMethod: 'FIX_AMOUNT', amount: { type: 'DEBIT', amountForAccount: 0 }, name: '', particular: '' },
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
                  rateForAccount: Number(item.rate)
                },
                stockUnit: {
                  code: item.stock.stockUnitCode
                },
                ...(item?.stock?.variant && {
                  variant: {
                  name: item.stock.variant.name,
                  uniqueName: item.stock.variant.uniqueName
                  }
                })
              }
              : undefined,
          },
        ],
        voucherNumber: '',
        voucherType: this.state.invoiceType,
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  async createCreditNote() {
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
      const postBody = this.state.companyVersionNumber == 1 ? {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName,
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : this.state.partyBillingAddress?.state?.code ,
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName :  this.state.partyBillingAddress?.state?.name,
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : '',
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          currency: { code: this.state.currency },
          currencySymbol: this.state.currencySymbol,
          email: "",
          mobileNumber: '',
          name: this.state.partyName.name,
          // shippingDetails: this.state.partyShippingAddress,
          shippingDetails: {
            address: [this.state.partyShippingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName,
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : this.state.partyShippingAddress?.state?.code,
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : this.state.partyShippingAddress?.state?.name,
            pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : '',
          },
          uniqueName: this.state.partyName.uniqueName,
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        //dueDate: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: "",
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.amountPaidNowText,
        },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        templateDetails: {
          other: {
            shippingDate: this.state.otherDetails.shipDate,
            shippedVia: this.state.otherDetails.shippedVia,
            trackingNumber: this.state.otherDetails.trackingNumber,
            customField1: this.state.otherDetails.customField1,
            customField2: this.state.otherDetails.customField2,
            customField3: this.state.otherDetails.customField3,
          },
        },
        type: this.state.invoiceType,
        updateAccountDetails: false,
      } : {
        account: {
          attentionTo: '',
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            taxNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : '',
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : '',
            },
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : '',
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : '',
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : '',
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          currency: { code: this.state.currency, symbol: this.state.currencySymbol },
          currencySymbol: this.state.currencySymbol,
          email: "",
          mobileNumber: '',
          name: this.state.partyName.name,
          uniqueName: this.state.partyName.uniqueName,
          shippingDetails: {
            address: [this.state.partyShippingAddress.address],
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            taxNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : '',
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : '',
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : '',
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : '',
            pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : '',
          },
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: "",
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.amountPaidNowText,
        },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        templateDetails: {
          other: {
            shippingDate: this.state.otherDetails.shipDate,
            shippedVia: this.state.otherDetails.shippedVia,
            trackingNumber: this.state.otherDetails.trackingNumber,
            customField1: this.state.otherDetails.customField1,
            customField2: this.state.otherDetails.customField2,
            customField3: this.state.otherDetails.customField3,
          },
        },
        type: this.state.invoiceType,
        updateAccountDetails: false,
        // Not having option to choose warehouse in mobile
        // "warehouse": {
        //   "name": "",
        //   "uniqueName": ""
        // },
      }

      if (this.state.selectedInvoice != '') {
        this.state.companyVersionNumber == 1 ? postBody.invoiceLinkingRequest = { linkedInvoices: [this.state.linkedInvoices] }
          : postBody.referenceVoucher = this.state.linkedInvoices
      }

      console.log('postBody is', JSON.stringify(postBody));
      const results = await InvoiceService.createVoucher(
        postBody,
        this.state.partyName.uniqueName,
        this.state.companyVersionNumber
      );
      this.setState({ loading: false });
      console.log(results);
      if (results.body) {
        // this.setState({loading: false});
        alert('Credit Note created successfully!');
        this.resetState();
        this.setActiveCompanyCountry();
        this.getAllTaxes();
        this.getAllDiscounts();
        this.getAllWarehouse();
        this.getAllAccountsModes();
        this.getCompanyVersionNumber();
        this.props.navigation.goBack();
        DeviceEventEmitter.emit(APP_EVENTS.CreditNoteCreated, {});
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ isSearchingParty: false, loading: false });
    }
  }

  renderAmount() {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Text style={style.invoiceAmountText}>{`${this.state.currencySymbol} ${formatAmount(this.getTotalAmount())}`}</Text>
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
    } else {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    }
  }

  hideDatePicker = () => {
    this.setState({ showDatePicker: false });
  };

  handleConfirm = (date) => {
    // console.log('A date has been picked: ', date);
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState({ date: moment(date), selectedInvoice: '' });
    this.hideDatePicker();
    this.getAllInvoice();
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
      //       <Icon name={'Calendar'} color={'#3497FD'} size={16} />
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

      <View style={style.dateView}>
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
          if (!this.state.partyName) {
            alert('Please select a party.');
          } else {
            this.setState({ showDatePicker: true })
          }
        }}>
          <Icon name={'Calendar'} color={'#3497FD'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderColor: '#D9D9D9', borderWidth: 1 }}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.state.date.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate()
            }
          }
          }>
          <Text style={{ color: '#808080' }}>
            {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  invoiceBottomSheet(){
    const ListEmptyComponent = () => {
      return (
        <View style={{height: height * 0.3, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={style.regularText}>
            No Invoice Exist
          </Text>
        </View>
      )
    }
    const renderItem = ({item}) => {
      return (
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          onPress={() => {
            this.state.allVoucherInvoice.length != 0
              ? this.setState({
                selectedInvoice: item.voucherNumber == null ? ' NA ' : item.voucherNumber,
                linkedInvoices: {
                  uniqueName: item.uniqueName,
                  voucherType: item.voucherType,
                  invoiceUniqueName: item.uniqueName,
                },
              })
              : null;
            this.setBottomSheetVisible(this.invoiceBottomSheetRef, false);
          }}
        >
        <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.regular }}>
          {this.state.allVoucherInvoice.length == 0
            ? item
            : item.voucherNumber == null
              ? 'NA'
              : item.voucherNumber}
        </Text>
        {this.state.allVoucherInvoice.length != 0 ? (
          <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
            {'(Dated : ' + item.voucherDate + ')'}
          </Text>
        ) : null}
        {this.state.allVoucherInvoice.length != 0 ? (
          <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
            {'(Due : ' + item.voucherTotal.amountForAccount + ')'}
          </Text>
        ) : null}
      </TouchableOpacity>
      )
    }
    return(
      <BottomSheet
        bottomSheetRef={this.invoiceBottomSheetRef}
        headerText='Select Invoice'
        headerTextColor='#084EAD'
        flatListProps={{
          data: this.state.allVoucherInvoice,
          renderItem: renderItem,
          ListEmptyComponent: <ListEmptyComponent/>
        }}
      />
    )
  }

  _renderSelectInvoice() {
    return (
      <View style={style.dateView}>
        <View style={{ flexDirection: 'row' }}>
          {/* <Icon name={'Calendar'} color={'#ff6961'} size={16} /> */}
          <Text style={style.InvoiceHeading}>Invoice #</Text>
          <View style={{ flexDirection: 'row', width: '80%', marginHorizontal: 15, justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                this.setBottomSheetVisible(this.invoiceBottomSheetRef, true);
              }}
            >
              <Text style={{ color: '#808080', fontSize: 14, fontFamily: FONT_FAMILY.regular }}>
                {
                  this.state.selectedInvoice != '' ? this.state.selectedInvoice : 'Select Account'
                }
              </Text>
            </TouchableOpacity>
            {this.state.selectedInvoice != '' ? (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  marginHorizontal: 15,
                  marginTop: -2,
                }}
                onPress={() => {
                    this.setState({
                      selectedInvoice: '',
                      linkedInvoices: '',
                    });
                }}>
                <AntDesign name="closecircleo" size={15} color={'grey'} />
                {/* <Text style={{marginLeft: 3}}>Close</Text> */}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  billingAddressArray() {
    const addressArray = this.state.partyBillingAddress;
    if (this.state.partyBillingAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils;
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
      currency: countryCode,
    });
    if (this.state.billSameAsShip) {
      this.setState({ partyShippingAddress: address });
    }
  };

  shippingAddressArray() {
    const addressArray = this.state.partyShippingAddress;
    if (this.state.partyShippingAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils;
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
      currency: countryCode,
    });
  };

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'8'} color={'#3497FD'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    activeAddress: this.state.partyBillingAddress,
                    type: 'address',
                    selectAddress: this.selectBillingAddress.bind(this),
                    color: '#3497FD',
                    statusBarColor: '#2e80d1',
                    partyBillingAddress: this.state.partyBillingAddress
                  });
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Billing Address'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.billingAddressArray(),
                    selectAddress: this.selectBillingAddressFromEditAdress.bind(this),
                    statusBarColor: '#2e80d1',
                    headerColor: '#3497FD',
                  });
                }
              }}>
              <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
            </TouchableOpacity>
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.addressArray,
                  activeAddress: this.state.partyBillingAddress,
                  type: 'address',
                  selectAddress: this.selectBillingAddress.bind(this),
                  color: '#3497FD',
                  statusBarColor: '#2e80d1',
                  partyBillingAddress: this.state.partyBillingAddress
                });
              }
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
                partyShippingAddress: this.state.partyBillingAddress,
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
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  !this.state.billSameAsShip ?
                    this.props.navigation.navigate('SelectAddress', {
                      addressArray: this.state.addressArray,
                      activeAddress: this.state.partyShippingAddress,
                      type: 'address',
                      selectAddress: this.selectShippingAddress.bind(this),
                      color: '#3497FD',
                      statusBarColor: '#2e80d1',
                      partyShippingAddress: this.state.partyShippingAddress
                    }) : null
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Shipping Address'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else if (!this.state.billSameAsShip) {
                  this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.shippingAddressArray(),
                    selectAddress: this.selectShippingAddressFromEditAdress.bind(this),
                    statusBarColor: '#2e80d1',
                    headerColor: '#3497FD',
                  });
                }
              }}>
              <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                !this.state.billSameAsShip ?
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    activeAddress: this.state.partyShippingAddress,
                    type: 'address',
                    selectAddress: this.selectShippingAddress.bind(this),
                    color: '#3497FD',
                    statusBarColor: '#2e80d1',
                    partyShippingAddress: this.state.partyShippingAddress
                  }) : null
              }
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
  setCashTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false });
  }

  setCreditTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false });
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false,
    });
  };

  updateAddedItems = async (addedItems) => {
    const updateAmountToCurrentCurrency = addedItems;
    if (this.state.currency.toString() != this.state.companyCountryDetails.currency.code.toString()) {
      try {
        const results = await InvoiceService.getExchangeRate(
          moment().format('DD-MM-YYYY'),
          this.state.currency,
          this.state.companyCountryDetails.currency.code,
        );
        if (results.body && results.status == 'success') {
          for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
            const item = updateAmountToCurrentCurrency[i];
            if (updateAmountToCurrentCurrency[i].currency.code.toString() != this.state.currency.toString()) {
              updateAmountToCurrentCurrency[i].currency = await {
                code: this.state.currency,
                symbol: this.state.currencySymbol,
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

    await this.setState({ addedItems: [...this.state.addedItems, ...updateAmountToCurrentCurrency] });
    await this.setState({
      totalAmountInINR: (Math.round(this.getTotalAmount() * this.state.exchangeRate * 100) / 100).toFixed(2),
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
    editItemDetails.amountText = editItemDetails.quantityText > 1 ? editItemDetails.quantityText * editItemDetails.rate : editItemDetails.rate
    editItemDetails.amount = editItemDetails.quantityText > 1 ? editItemDetails.quantityText * editItemDetails.rate : editItemDetails.rate
    editItemDetails.stock ? (editItemDetails.stock.taxes = []) : (null)
    editItemDetails.discountValue = this.calculateDiscountedAmount(editItemDetails)
    editItemDetails.isNew = false
    if(editItemDetails?.stock?.variant){
      editItemDetails.unitText = editItemDetails?.stock?.variant?.stockUnitCode;
    } else if(editItemDetails?.stock){
      editItemDetails.unitText = editItemDetails?.stock?.stockUnitCode;
    }
    editItemDetails.tax = this.calculatedTaxAmount(editItemDetails, 'taxAmount')

    console.log("FINAL ITEM " + JSON.stringify(editItemDetails))
  }

  addItem = (item) => {
    let newItems = this.state.addedItems;

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
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2),
      });
    }
  };

  renderAddItemButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
            this.props.navigation.navigate('CreditNoteAddItem', {
              updateAddedItems: this.updateAddedItems.bind(this),
              addedItems: this.state.addedItems,
              currencySymbol: this.state.currencySymbol,
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
          borderColor: '#3497FD',
          borderWidth: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '90%',
        }}>
        <AntDesign name={'plus'} color={'#3497FD'} size={18} style={{ marginHorizontal: 8 }} />
        <Text style={style.addItemMain}> Add Item</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'Path-13016'} color="#3497FD" size={18} />
            <Text style={{ marginLeft: 10 }}>Select Product/Service</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderColor: '#3497FD',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems:'center',
              paddingHorizontal:5,
              borderRadius:2
            }}
            onPress={() => {
              this.props.navigation.navigate('CreditNoteAddItem', {
                updateAddedItems: this.updateAddedItems.bind(this),
                addedItems: this.state.addedItems,
                currencySymbol: this.state.currencySymbol,
              });
            }}>
            <AntDesign name={'plus'} color={'#3497FD'} size={16} />
          <Text style={[style.addItemMain,{fontFamily:FONT_FAMILY.regular,fontSize:14}]}> Add Item</Text>
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

  deleteItem = (item) => {
    const addedArray = this.state.addedItems;
    const itemUniqueName = item.newUniqueName ? item.newUniqueName : (item.stock ? item.stock.uniqueName : item.uniqueName);
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.newUniqueName ? e.newUniqueName : (e.stock ? e.stock.uniqueName : e.uniqueName);
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray, showItemDetails: false }, () => { });
    this.updateTCSAndTDSTaxAmount(addedArray);
    if (item.rate) {
      const totalAmount = this.getTotalAmount();
      this.setState({
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2),
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
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          style={{ backgroundColor: '#EBF4FA', padding: 10, borderRadius: 2, marginBottom: 10 }}
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
                total: 0,
              },
            });
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5 }}>
            <View style={{ flexDirection: 'row', width: "75%", }}>
              <Text numberOfLines={1} style={{ color: '#1C1C1C' }}>{item.name}</Text>
              {item.stock && (
                <Text numberOfLines={1} style={{ color: '#1C1C1C', flex: 1 }}>
                  ( {`${item.stock.name}`} ) {item?.stock?.isMultiVariant ? `- ${item?.stock?.variant?.name}` : ''}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{width: '50%', flexWrap: 'wrap'}}>
              <Text style={{ color: '#808080' }}>
                {String(item.quantity)} x {this.state.currencySymbol}
                {String(item.rate)}
              </Text>
            </View>
            <View style={{width: '50%', flexWrap: 'wrap', alignContent: 'flex-end', alignContent: 'flex-end', alignItems: 'center' }}>
              <Text style={{ color: '#808080' }}>
                Tax : {this.state.currencySymbol}
                {formatAmount(this.calculatedTaxAmount(item, 'taxAmount'))}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
            <View style={{width: '50%', flexWrap: 'wrap'}}>
              <Text style={{ color: '#808080' }}>
                Discount : {this.state.currencySymbol}
                {formatAmount(item.discountValue ? item.discountValue : 0)}
              </Text>
            </View>
            <View style={{width: '50%', flexWrap: 'wrap', alignContent: 'flex-end', alignItems: 'center'}}>
              <Text style={{ color: '#808080' }}>
                Total : {this.state.currencySymbol}
                {formatAmount(this.getTotalAmountOfCard(item))}
              </Text>
            </View>
          </View>
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
    if (itemDetails.percentDiscountArray && itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
      }
      const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    console.log(totalDiscount, 'is the discount');
    return totalDiscount;
  }

  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    console.log('rate', itemDetails.rate);
    const taxArr = this.state.taxArray;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        totalTax =
          item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc'
            ? totalTax
            : totalTax + taxAmount;
      }
    }
    else if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            // console.log('tax value is ', taxArr[j].taxDetail[0].taxValue);
            const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
            const taxAmount = (taxPercent * Number(amt)) / 100;
            totalTax =
              taxArr[j].taxType == 'tdspay' ||
                taxArr[j].taxType == 'tcspay' ||
                taxArr[j].taxType == 'tcsrc' ||
                taxArr[j].taxType == 'tdsrc'
                ? totalTax
                : totalTax + taxAmount;
            break;
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
        if (
          item.taxType == 'tdspay' ||
          item.taxType == 'tcspay' ||
          item.taxType == 'tcsrc' ||
          item.taxType == 'tdsrc'
        ) {
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
            if (
              taxArr[j].taxType == 'tdspay' ||
              taxArr[j].taxType == 'tcspay' ||
              taxArr[j].taxType == 'tcsrc' ||
              taxArr[j].taxType == 'tdsrc'
            ) {
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
      let tdsOrTcsTaxObj = { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2) };
      return tdsOrTcsTaxObj;
    } else {
      return null;
    }
  }

  // calculatedTaxAmount(itemDetails) {
  //   let totalTax = 0;
  //   let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
  //   let taxArr = this.state.taxArray;
  //   if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
  //     for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
  //       let item = itemDetails.stock.taxes[i];
  //       for (let j = 0; j < taxArr.length; j++) {
  //         if (item == taxArr[j].uniqueName) {
  //           // console.log('tax value is ', taxArr[j].taxDetail[0].taxValue);
  //           let taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
  //           let taxAmount = (taxPercent * Number(amt)) / 100;
  //           totalTax = totalTax + taxAmount;
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   // console.log('calculated tax is ', totalTax);
  //   return Number(totalTax);
  // }

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item);
      const amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
    return total.toFixed(2);
  }

  getTotalAmountOfCard(item){
    const discount = item.discountValue ? item.discountValue : 0;
    const tax = this.calculatedTaxAmount(item, 'InvoiceDue');
    const amount = Number(item.rate) * Number(item.quantity);
    const total = amount - discount + tax;
    return total;
  }

  _renderOtherDetails() {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 8,
          paddingHorizontal: 16,
          marginTop: 8,
        }}
        onPress={() => {
          if (!this.state.partyName) {
            alert('Please select a party.');
          } else {
            this.props.navigation.navigate('CreditNoteOtherDetails', {
              enteredDetails: this.state.otherDetails,
              warehouseArray: this.state.warehouseArray,
              setOtherDetails: this.setOtherDetails,
            })
          }
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Icon style={{ marginRight: 16 }} name={'Sections'} size={16} color="#3497FD" />
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
            justifyContent: 'center',
          }}
          onPress={() => {
            this.setState({ showPaymentModePopup: false });
          }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10, alignSelf: 'center' }}>
            {this.state.invoiceType == 'sales' && (
              <TextInput
                value={this.state.amountPaidNowText}
                keyboardType="number-pad"
                returnKeyType={'done'}
                placeholder="Enter Amount"
                placeholderTextColor="black"
                onChangeText={(text) => {
                  this.setState({ amountPaidNowText: text });
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
                    borderColor: '#3497FD',
                    alignSelf: 'flex-start',
                    // backgroundColor: 'pink',
                    width: '100%',
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
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color="#3497FD" />
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
              <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(this.getTotalAmount())}</Text>
            </View>
          </View>
        )}
        {this.state.tdsOrTcsArray.length != 0 ? (
          <FlatList
            data={this.state.tdsOrTcsArray}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 16,
                    marginVertical: 6,
                  }}>
                  <Text style={{ color: '#1C1C1C' }}>{item.name}</Text>
                  <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(item.amount)}</Text>
                </View>
              );
            }}
          />
        ) : null}
        {/* <View style={{ justifyContent: 'flex-end', flexDirection: 'row', marginTop: 20, margin: 16 }}>
          <TouchableOpacity
            onPress={() => {
              this.genrateCreditNote();
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }

  _renderSaveButton() {
    return (
      <TouchableOpacity
        style={{flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60}}
        onPress={() => {
         this.genrateCreditNote();
        }}>
        <Icon name={'path-18'} size={48} color={'#5773FF'} />
      </TouchableOpacity>
    );
  }

  genrateCreditNote() {
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
        { style: 'destructive', onPress: () => console.log('alert destroyed') },
        ,
      ]);
    } else if (
      this.state.currency == this.state.companyCountryDetails.currency.code &&
      (!this.state.partyBillingAddress.stateName ||
        !this.state.partyBillingAddress.stateCode ||
        !this.state.partyBillingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Billing From', [
        { style: 'destructive', text: 'Okay' },
        ,
      ]);
    } else if (
      this.state.currency == this.state.companyCountryDetails.currency.code &&
      (!this.state.partyShippingAddress.stateName ||
        !this.state.partyShippingAddress.stateCode ||
        !this.state.partyShippingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Shipping From', [
        { style: 'destructive', text: 'Okay' },
        ,
      ]);
    } else {
      this.createCreditNote();
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
      0,
    );
    const item = this.state.addedItems[index];
    item.quantity = Number(details.quantityText);
    item.description = details.description;
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
    if(item?.stock?.variant){
      item.stock.variant.stockUnitCode = details.unitText;
    } else if(item?.stock){
      item.stock.stockUnitCode = details.unitText;
    }
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
    let alltdsOrTcsTaxArr = [];
    let tcsTaxObj = { name: 'TCS', amount: 0 };
    let tdsTaxObj = { name: 'TDS', amount: 0 };
    for (let i = 0; i < addedArray.length; i++) {
      let tdsOrTcsTaxObj = this.calculatedTdsOrTcsTaxAmount(addedArray[i]);
      if (tdsOrTcsTaxObj != null) {
        tdsTaxObj.amount =
          tdsOrTcsTaxObj.name == 'tdspay' || tdsOrTcsTaxObj.name == 'tdsrc'
            ? (Number(tdsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2)
            : tdsTaxObj.amount;
        tcsTaxObj.amount =
          tdsOrTcsTaxObj.name == 'tcspay' || tdsOrTcsTaxObj.name == 'tcsrc'
            ? (Number(tcsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2)
            : tcsTaxObj.amount;
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
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="never"
          style={[{ flex: 1, backgroundColor: 'white' }, { marginBottom: this.keyboardMargin }]}
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
            {this._renderSelectInvoice()}
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
            {/* <TouchableOpacity
            style={{height: 60, width: 60, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.otherDetails)}></TouchableOpacity> */}
          </View>

          {this.state.searchResults.length > 0 && this._renderSearchList()}
          <Modal
            visible={this.state.loading}
            transparent
            statusBarTranslucent
          >
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)'}}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          </Modal>
        </Animated.ScrollView>
        {this.state.showItemDetails && (
          <EditItemDetail
            currencySymbol={this.state.currencySymbol}
            notIncludeTax={
              (this.state.invoiceType == INVOICE_TYPE.credit &&
                this.state.currency != this.state.companyCountryDetails.currency.code &&
                this.state.companyCountryDetails.currency.code == 'INR')
                ? false
                : true
            }
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

        {this.state.addedItems.length > 0 && !this.state.showItemDetails && this._renderSaveButton()}
        {this.invoiceBottomSheet()}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
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

  return <CreditNote {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
