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
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment, { Moment } from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import _, { result } from 'lodash';
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { NavigationProp, ParamListBase, useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EditItemDetail from './EditItemDetails';
import routes from '@/navigation/routes';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import CheckBox from 'react-native-check-box';
import Dropdown from 'react-native-modal-dropdown';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';
import { CommonService } from '@/core/services/common/common.service';

const { SafeAreaOffsetHelper } = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash'
};
interface Props {
  navigation: NavigationProp<ParamListBase>;
  route?: {
    params: {
      accountUniqueName: string, 
      voucherUniqueName: string,
      voucherNumber: string,
      voucherName: string
      isSalesCashInvoice: boolean
      /**
       * Used trigger componentDidMount to refresh page data when navigated from voucher screen 
       */
      refetchDataOnNavigation: string
    }
  } 
}

type State = {
  isSearchingParty: boolean
  loading: boolean
  searchPartyName: string
  partyName: any
  searchResults: Array<any>
  searchError: string
  voucherUniqueName: string
  companyVersionNumber: number
  addedItems: Array<any>
  countryDeatils: {
    countryName: string,
    countryCode: string
  },
  currency: string,
  currencySymbol: string
  totalAmountInINR: number
  amountPaidNowText: number
  roundOffTotal: number
  date: Moment
  dueDate: Moment | null
  taxArray: Array<any>
  allStockVariants: { [index: string]: any }
  exchangeRate: number
  adjustments: Array<any>
  billSameAsShip: boolean
  addressArray: Array<any>
  partyBillingAddress: {
    address: string,
    gstNumber: string,
    state: {
      code: string,
      name: string
    },
    stateCode: string,
    stateName: string,
    pincode: string
  },
  partyShippingAddress: {
    address: string,
    gstNumber: string,
    state: {
      code: string,
      name: string
    },
    stateCode: string,
    stateName: string,
    pincode: string
  },
  otherDetails: {
    shipDate: '',
    shippedVia: null,
    trackingNumber: null,
    customField1: null,
    customField2: null,
    customField3: null
  }
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
export class SalesInvoice extends React.Component<Props, State> {
  private isVoucherUpdate: boolean
  constructor(props) {
    super(props);
    this.paymentModeBottomSheetRef = React.createRef();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.searchCalls = this.searchCalls.bind(this);
    this.isVoucherUpdate = !!this.props.route?.params
    this.state = {
      searchNamesOnly: [],
      test: Dropdown,
      loading: false,
      invoiceType: this.props.route?.params?.isSalesCashInvoice ? INVOICE_TYPE.cash : INVOICE_TYPE.credit,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
      searchResults: [],
      searchPartyName: this.props.route?.params?.accountUniqueName ?? '',
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
      roundOffTotal: 0,
      tempAmountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash'
      },
      tempSelectedPayMode: {
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
      companyVersionNumber: 1,
      allStockVariants: {}
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
    return isFocused ? <StatusBar backgroundColor="#0E7942" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
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
    } catch (e) {
      console.error(e)
    }
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);

    if(this.isVoucherUpdate){
      this.getPartyDataForUpdateVoucher(this.state.searchPartyName)
    } else {
      this.searchCalls();
    }
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
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
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

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (prevProps?.route?.params?.refetchDataOnNavigation !== this.props?.route?.params?.refetchDataOnNavigation) {
      console.log('---------- REFRESH VOUCHER DATA --------------')
      this.clearAll();
    }
  }
  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber)
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      this.setState({ companyVersionNumber })
    }
  }

  clearAll = () => {
    this.resetState();
    this.getCompanyVersionNumber()
    if(this.isVoucherUpdate){
      this.getPartyDataForUpdateVoucher(this.props?.route?.params?.accountUniqueName)
    } else {
      this.searchCalls();
    }
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
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
            <Text style={style.invoiceType}>
              {this.state.invoiceType == INVOICE_TYPE.credit ? 'Sales Invoice' : 'Cash Invoice'}
            </Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginRight: 16, alignSelf: 'center', display: this.isVoucherUpdate ? 'none' : 'flex' }}
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
        style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 10 }}
        onPress={() => { }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}> */}
          <Icon name={'Profile'} color={'#229F5F'} style={{ margin: 16 }} size={16} />
          <TextInput
            placeholderTextColor={'#808080'}
            placeholder={this.state.invoiceType == 'cash' ? 'Enter Party Name' : 'Search Party Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) => {
              this.state.invoiceType == INVOICE_TYPE.credit
                ? (this.setState({ searchPartyName: text }), this.searchCalls())
                : this.setState({ searchPartyName: text, partyName: { name: text, uniqueName: 'cash' } });
            }}
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'#5773FF'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity style={{ display: this.isVoucherUpdate ? 'none' : 'flex' }} onPress={() => this.clearAll()}>
          <Text style={{ color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y
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
        this.state.companyCountryDetails?.currency?.code,
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
      // <Modal animationType="none" transparent={true} visible={true}>
      <View style={[style.searchResultContainer, { top: height * 0.15 }]}>

        <FlatList
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={this.state.searchResults.length == 0 ? ["Result Not found"] : this.state.searchResults}
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
                      this.searchAccount(true);
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
      // </Modal>
    );
  }

  async getParticularServiceStockVariants(
    accountUniqueName: string,
    stockUniqueName?: string,
    variantUniqueName?: string
    ) {
    try {
      // ----- If the item is a Stock -----
      if (!!stockUniqueName) {
        if(!this.state.allStockVariants[stockUniqueName]){
          const stockVariantsResult = await InvoiceService.getStockVariants(stockUniqueName);
          if(stockVariantsResult.status == 'success' && stockVariantsResult.body){
            this.setState({
              allStockVariants: {
                ...this.state.allStockVariants,
                [stockUniqueName]: stockVariantsResult.body
              }
            });
          }
        }
        const results = await InvoiceService.getStockDetails(accountUniqueName, stockUniqueName, variantUniqueName ?? this.state.allStockVariants[stockUniqueName][0].uniqueName);
        if (results && results.body) {
          // const addedItems = this.state.addedItems;
          // if (!this.checkIfItemIsSelcted(results.body)) {
            const data = results.body;
            if(!!data?.stock?.variant){
              data.rate = data.stock.variant.unitRates[0].rate;
              data.stock.rate = data.stock.variant.unitRates[0].rate;
              data.stock.stockUnitCode = data.stock.variant.unitRates[0].stockUnitCode;
              data.stock.stockUnitName = data.stock.variant.unitRates[0].stockUnitName;
              data.stock.stockUnitUniqueName = data.stock.variant.unitRates[0].stockUnitUniqueName;
            } else {
              data.rate = data.stock.unitRates[0].rate;
              data.stock.rate = data.stock.unitRates[0].rate;
              data.stock.stockUnitCode = data.stock.unitRates[0].stockUnitCode;
              data.stock.stockUnitName = data.stock.unitRates[0].stockUnitName;
              data.stock.stockUnitUniqueName = data.stock.unitRates[0].stockUnitUniqueName;
            }
            data.quantity = 1;
            // data.rate = results.body.stock.rate;
            if(this.state.companyVersionNumber == 2){ 
              const variantObj = this.state.allStockVariants[stockUniqueName].find((variant) => variant?.uniqueName == variantUniqueName); 
              data.stock.variant.name = variantObj?.name ?? this.state.allStockVariants[stockUniqueName][0].name;
              data.stock.isMultiVariant = this.state.allStockVariants[stockUniqueName]?.length > 1;
            }
            data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Used to identify and Edit multiple same entries
            // addedItems.push(this.createNewEntry(data));
          // }
          return data;
        }

        // ----- If the item is a Service -----
      } else {
        const results = await InvoiceService.getSalesDetails(accountUniqueName);
        if (results && results.body) {

            const data = results.body;
            data.quantity = 1;
            data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Used to identify and Edit multiple same entries

            return data;
        }
      }
    } catch (e) {
      console.warn('----- Error in getParticularServiceStockVariants -----', e)
    }
  }

  async mapEntriesToUIData (entries: Array<any>) {
    let addedItems: Array<any> = [];

    // Prepare the entries according to 'addedItems' existing data structure.
    await Promise.all(entries.map(async (entry) => {

      const accountUniqueName = entry.transactions[0].account?.uniqueName;
      const stockUniqueName = entry.transactions[0].stock?.uniqueName;
      const variantUniqueName = entry.transactions[0].stock?.variant?.uniqueName;

      const particularData = await this.getParticularServiceStockVariants(accountUniqueName, stockUniqueName, variantUniqueName);

      // Inserting Tax accoring to the tax present in voucher.
      let taxDetailsArray : Array<any> = [];
      // selectedArrayType container of tax types like ['gst', 'tds'] etc.
      let selectedArrayType : Array<string> = [];

      entry?.taxes?.forEach((entryTax: any) => { 
        if(selectedArrayType.includes(entryTax?.taxType)){
          return;
        }

        const tax = this.state.taxArray.find(tax => tax.uniqueName === entryTax.uniqueName);
        if(tax) taxDetailsArray.push(tax);
        if(!selectedArrayType.includes(entryTax?.taxType)) selectedArrayType.push(entryTax?.taxType);
      })

      const isStock = !!particularData?.stock;

      // Prepare 'percentDiscountArray' from the discount present in voucher data.
      let percentDiscountArray : Array<any> = [];
      // Prepare 'fixedDiscount' from the discount present in voucher data.
      let fixedDiscount = {
        discountValue:  0,
        discountType: '',
        name: undefined,
        uniqueName: undefined,
        linkAccount: {
          name: undefined,
          uniqueName: undefined
        }
      };

      entry?.discounts?.forEach((_discount: any) => {
        const discount = {
          name: _discount?.name,
          uniqueName: _discount?.uniqueName,
          discountValue: _discount?.discountValue,
          discountType: _discount?.calculationMethod,
          linkAccount: {
            name: _discount?.accountName,
            uniqueName: _discount?.accountUniqueName
          }
        }

        if(_discount?.calculationMethod === 'FIX_AMOUNT'){
          fixedDiscount = discount;
        } else if (_discount?.calculationMethod === 'PERCENTAGE') {
          percentDiscountArray.push(discount)
        }
      }) 

      const modifiedEntryObj = {
        ...particularData,
        "hsnNumber": entry?.hsnNumber,
        "sacNumber": entry?.sacNumber,
        "quantity": isStock ? entry.transactions[0].stock.quantity : (entry?.usedQuantity !== 0 ? entry?.usedQuantity  : 1),
        "quantityText": isStock ? entry.transactions[0].stock.quantity : (entry?.usedQuantity !== 0 ? entry?.usedQuantity  : 1),
        "rate": isStock ? entry.transactions[0].stock.rate.rateForAccount : entry?.subTotal?.amountForAccount,
        "rateText": isStock ? entry.transactions[0].stock.rate.rateForAccount : entry?.subTotal?.amountForAccount,
        "taxDetailsArray": taxDetailsArray,
        "selectedArrayType": selectedArrayType,
        
        "unitText": isStock ? entry.transactions[0].stock.quantity : '',
        "amount": entry?.subTotal?.amountForAccount,
        "amountText": entry?.subTotal?.amountForAccount,
        "isNew": false,
        "description": entry?.description,
        "unit": isStock ? entry.transactions[0].stock.quantity : '',
        "total": entry?.subTotal?.amountForAccount,
        "taxType": 0,
        "tax": entry?.taxTotal?.amountForAccount ?? 0,
        "warehouse":0,
        "discountDetails":{
        },
        "discountPercentage": percentDiscountArray[0]?.discountValue,
        "discountPercentageText": percentDiscountArray[0]?.discountValue,
        "percentDiscountArray": percentDiscountArray,
        "discountValue": 0,
        "discountType": null,
        "fixedDiscount": fixedDiscount,
        "fixedDiscountUniqueName": fixedDiscount?.uniqueName
      }

      modifiedEntryObj.discountValue = this.calculateDiscountedAmount(modifiedEntryObj)
      addedItems.push(modifiedEntryObj);
    }))

    return addedItems;
  }

  mapAddressFromVoucherData(voucherBillingDetails: any, voucherShippingDetails: any) {
    let partyBillingAddress = {
      address: '',
      gstNumber: '',
      state: {
        code: '',
        name: ''
      },
      stateCode: '',
      stateName: '',
      pincode: ''
    }

    let partyShippingAddress = { ...partyBillingAddress }

    const formateVoucherAddress = (details: any) => ({
      address: details.address[0] ?? '',
      gstNumber: details.gstNumber ?? '',
      state: {
        code: details.state.code ?? '',
        name: details.state.name ?? ''
      },
      stateCode: details.state.code ?? '',
      stateName: details.state.name ?? '',
      pincode: details.pincode ?? ''
    })

    partyBillingAddress = formateVoucherAddress(voucherBillingDetails);
    partyShippingAddress = formateVoucherAddress(voucherShippingDetails);

    return { partyBillingAddress, partyShippingAddress } as const
  }

  async getPartyDataForUpdateVoucher(_name: string) {
    const name = (_name ?? this.state.searchPartyName).toLocaleLowerCase()
    this.setState({ isSearchingParty: true });
    try {
      let addressArray : any = []

      // If it is Cash invoice, skip fetching account data and addresses
      if(!this.props.route?.params.isSalesCashInvoice){

        const results = await InvoiceService.search(name, 1, 'sundrydebtors', false);
        if (results.body && results.body.results) {
          const accountData = results.body.results.find((account: any) => account?.uniqueName === name);
          this.setState({
            partyName: accountData,
            searchResults: [],
            searchPartyName: accountData?.name,
            searchError: '',
            isSearchingParty: false,
          },
          () => {
            // this.searchAccount();
            this.getAllAccountsModes();
            Keyboard.dismiss();
          })
  
          // Get Addresses of the Accoount
          addressArray = await this.searchAccount();
        }
      }

      // Get the Voucher to Update
      const accountUniqueName = this.props.route?.params.isSalesCashInvoice ? 'cash' : (this.props?.route?.params?.accountUniqueName ?? '');
      const payload = {
        number: this.props?.route?.params?.voucherNumber ?? '',
        uniqueName: this.props?.route?.params?.voucherUniqueName ?? '',
        type: this.props?.route?.params?.voucherName ?? ''
      }

      const response = await CommonService.getVoucher(accountUniqueName, this.state.companyVersionNumber, payload)

      if(response?.status === 'success'){

        const { partyBillingAddress, partyShippingAddress } = this.mapAddressFromVoucherData(response?.body?.account?.billingDetails, response?.body?.account?.shippingDetails); 
        
        this.setState({
          countryDeatils: {
            countryName: response?.body?.account?.billingDetails?.country?.name,
            countryCode: response?.body?.account?.billingDetails?.country?.code
          },
          currency: response.body.account?.currency?.code,
          currencySymbol: response.body.account?.currency?.symbol,
          totalAmountInINR : response?.body?.voucherTotal?.amountForAccount,
          amountPaidNowText: response?.body?.voucherTotal?.amountForAccount - response?.body?.balanceTotal?.amountForAccount,
          roundOffTotal: response?.body?.roundOffTotal?.amountForAccount ?? 0,
          date: moment(response?.body?.date, 'DD-MM-YYYY'),
          dueDate: response?.body?.dueDate ? moment(response?.body?.dueDate, 'DD-MM-YYYY') : null,
          adjustments: response?.body?.adjustments,
          partyBillingAddress,
          partyShippingAddress,
          billSameAsShip: partyBillingAddress.address === partyShippingAddress.address && partyBillingAddress.stateCode === partyShippingAddress.stateCode,
          addressArray,
          otherDetails: {
            shipDate: response?.body?.templateDetails?.other?.shippingDate ?? '',
            shippedVia: response?.body?.templateDetails?.other?.shippedVia ?? null,
            trackingNumber: response?.body?.templateDetails?.other?.trackingNumber ?? null,
            customField1: response?.body?.templateDetails?.other?.customField1 ?? null,
            customField2: response?.body?.templateDetails?.other?.customField2 ?? null,
            customField3: response?.body?.templateDetails?.other?.customField3 ?? null
          }
        })
        
        const addedItems = await this.mapEntriesToUIData(response.body.entries);
        this.setState({ addedItems, loading: false });
      }
    } catch (e) {
      console.warn('----- Error in Get Party Data ------', e)
    } finally { 
      this.setState({ isSearchingParty: false });
    }
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
        // this.state.test.show();
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

  async searchAccount(isUpdateParty?: boolean) {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);

      if (results.body) {
        if(this.isVoucherUpdate && !isUpdateParty){ // Return addresses of customer to update, when not updating the party.
          return results.body.addresses.length < 1 ? [] : results.body.addresses
        }
        if (results.body.currency != this.state.companyCountryDetails?.currency?.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        console.log(JSON.stringify(results.body))
        this.setDefaultAccountTax(results.body.applicableTaxes)
        this.setDefaultDiscount(results.body.applicableDiscounts)
        this.getPartyTypeFromAddress(results.body.addresses)
        await this.setState({
          ...(!isUpdateParty && { addedItems: [] }),
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
    return [];
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
      tempAmountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash'
      },
      tempSelectedPayMode: {
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
      companyVersionNumber: 1,
      ...(this.isVoucherUpdate && {
        invoiceType: this.props.route?.params?.isSalesCashInvoice ? INVOICE_TYPE.cash : INVOICE_TYPE.credit,
        partyName: { name: this.props.route?.params?.accountUniqueName, uniqueName: 'cash' },
        searchPartyName: this.props.route?.params?.accountUniqueName
      })
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
        name: item.fixedDiscount?.name ?? '',
        particular: item.fixedDiscount?.linkAccount?.uniqueName ?? ''
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
              : undefined
          }
        ],
        voucherNumber: '',
        voucherType: "sales"
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  updateVoucherPayload() {
    const paylaod = {
      account: {
        billingDetails: {
          address: [this.state.partyBillingAddress.address],
          countryName: this.state.countryDeatils.countryName,
          gstNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
          taxNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
          panNumber: '',
          state: {
            code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
            name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName
          },
          country: {
            code: this.state.countryDeatils.countryCode,
            name: this.state.countryDeatils.countryName,
          },
          stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : this.state.partyBillingAddress?.state?.code,
          stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : this.state.partyBillingAddress?.state?.name,
          pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : ''
        },
        contactNumber: '',
        country: this.state.countryDeatils,
        currency: { code: this.state.currency, symbol: this.state.currencySymbol },
        currencySymbol: this.state.currencySymbol,
        email: '',
        mobileNumber: '',
        name: this.state.partyName.name,
        shippingDetails: {
          address: [this.state.partyShippingAddress.address],
          countryName: this.state.countryDeatils.countryName,
          gstNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
          panNumber: '',
          taxNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
          state: {
            code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
            name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName
          },
          country: {
            code: this.state.countryDeatils.countryCode,
            name: this.state.countryDeatils.countryName,
          },
          stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : this.state.partyShippingAddress?.state?.code,
          stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : this.state.partyShippingAddress?.state?.name,
          pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : ''
        },
        uniqueName: this.state.partyName.uniqueName,
        customerName: this.state.partyName.name,
      },

      date: moment(this.state.date).format('DD-MM-YYYY'),
      dueDate: this.state.dueDate ? moment(this.state.dueDate).format('DD-MM-YYYY') : null,
      ...(this.props.route?.params.isSalesCashInvoice && { 
          deposit: {
          type: 'DEBIT',
          accountUniqueName: 'cash',
          amountForCompany: 0
        }
      }),
      entries: this.getEntries(),
      exchangeRate: this.state.exchangeRate,
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
      type: 'sales',
      roundOffApplicable: true,
      updateAccountDetails: false,
      adjustments: this.state.adjustments,
      uniqueName: this.props.route?.params.voucherUniqueName,
      number: this.props.route?.params.voucherNumber
    }
    
    return paylaod;
  }

  async updateVoucher() {
    this.setState({ loading: true });
    try {
      const updateVoucherPayload = this.updateVoucherPayload();
      const accountUniqueName = this.props.route?.params?.accountUniqueName ?? '';
      const response = await CommonService.updateVoucher(accountUniqueName, this.state.companyVersionNumber, updateVoucherPayload);

      if(response?.status === 'success') {
        this.setState({ loading: false });
        DeviceEventEmitter.emit(APP_EVENTS.InvoiceCreated, {});
        alert('Invoice updated successfully!');
        this.props.navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', error?.data?.message ?? 'Something went wrong!');
    } finally {
      this.setState({ loading: false });
    }
  }

  async createInvoice(type) {
    this.setState({ loading: true });
    try {
      console.log('came to this');
      if (this.state.currency != this.state.companyCountryDetails?.currency?.code) {
        let exchangeRate = 1;
        (await this.getTotalAmount()) > 0
          ? (exchangeRate = Number(this.state.totalAmountInINR) / this.getTotalAmount())
          : (exchangeRate = 1);
        await this.setState({ exchangeRate: exchangeRate });
      }
      console.log('Response' + JSON.stringify(this.state.partyShippingAddress.state));
      const postBody = {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            taxNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName
            },
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : this.state.partyBillingAddress?.state?.code,
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : this.state.partyBillingAddress?.state?.name,
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : ''
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          // currency: { code: this.state.currency },
          currency: { code: this.state.currency, symbol: this.state.currencySymbol },
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
            taxNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName
            },
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : this.state.partyShippingAddress?.state?.code,
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : this.state.partyShippingAddress?.state?.name,
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
        type: this.state.companyVersionNumber == 1 && this.state.invoiceType == 'cash' ? 'cash' : 'sales',
        updateAccountDetails: false,
        voucherAdjustments: { adjustments: [] }
      };
      console.log('postBody is---------------', JSON.stringify(postBody));
      let uniqueName = this.state.invoiceType == 'sales' ? this.state.partyName.uniqueName : "cash"
      const results = await InvoiceService.createVoucher(
        postBody,
        uniqueName,
        this.state.companyVersionNumber)
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
        this.resetState();
        await this.setActiveCompanyCountry();
        await this.getAllTaxes();
        await this.getAllDiscounts();
        await this.getAllWarehouse();
        await this.getAllAccountsModes();
        await this.getCompanyVersionNumber();
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
          this.setState({ loading: true });
          this.downloadFile(
            results.body?.uniqueName,
            this.state.companyVersionNumber == 1 ? results.body.entries[0].voucherNumber : results.body.number,
            partyUniqueName,
            results.body?.type
          );
        }
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ isSearchingParty: false, loading: false });
    }
  }

  renderAmount() {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Text style={style.invoiceAmountText}>{`${this.state.currencySymbol} ${formatAmount(this.state.isSearchingParty ? 0 : Number(this.getTotalAmount()) + this.state.roundOffTotal)}`}</Text>
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
          <TouchableOpacity
            disabled={this.isVoucherUpdate}
            style={{ flexDirection: 'row' }} 
            onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                this.setState({ showDatePicker: true })
              }
            }}
          >
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{'Invoice Date - ' + this.formatDate('InvoiceDate')}</Text>
            {/* <Text style={style.selectedDateText}>{"Invoice Date "}</Text> */}
          </TouchableOpacity>
          <TouchableOpacity
            disabled={this.isVoucherUpdate}
            style={{ borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2, display: this.isVoucherUpdate ? 'none' : 'flex' }}
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
        { !!this.state.dueDate &&
          <View style={style.dueDateView}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else { this.setState({ showDueDatePicker: true }) }
            }}>
              <Icon name={'Calendar'} color={'#229F5F'} size={16} />
              <Text style={style.selectedDateText}>{'Due Date - ' + this.formatDate('DueDate')}</Text>
            </TouchableOpacity>
          </View>
        }
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
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
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
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
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
    await this.getCompanyVersionNumber()
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    await this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false });
  };

  setCreditTypeInvoice = async () => {
    await this.resetState();
    await this.setActiveCompanyCountry();
    await this.getCompanyVersionNumber()
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
    if (this.state.currency.toString() != this.state.companyCountryDetails?.currency?.code.toString()) {
      try {
        const results = await InvoiceService.getExchangeRate(
          moment().format('DD-MM-YYYY'),
          this.state.currency,
          this.state.companyCountryDetails?.currency?.code
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

    await this.setState({ addedItems: [...this.state.addedItems, ...updateAmountToCurrentCurrency] });
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
            style={{
              borderColor: '#229F5F',
              flexDirection: 'row',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems:'center',
              paddingHorizontal:5,
              borderRadius:2
            }}
            onPress={() => {
              this.props.navigation.navigate('AddInvoiceItemScreen', {
                updateAddedItems: (this.updateAddedItems).bind(this),
                addedItems: this.state.addedItems,
                currencySymbol: this.state.invoiceType == INVOICE_TYPE.cash ? this.state.companyCountryDetails.currency.symbol : this.state.currencySymbol
              });
            }}>
            <AntDesign name={'plus'} color={'#229F5F'} size={16}  />
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
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          activeOpacity={0.8}
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
          <View style={{ flexDirection: 'row', paddingBottom: 5, justifyContent: 'space-between' }}>
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

  // calculateDiscountedAmount(itemDetails) {
  //   if (itemDetails.discountDetails) {
  //     let discountType = itemDetails.discountDetails.discountType;
  //     if (discountType == 'FIX_AMOUNT') {
  //       let discountAmount = Number(itemDetails.discountValue);
  //       return discountAmount;
  //     } else {
  //       let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
  //       let discountAmount = (Number(itemDetails.discountValue) * amt) / 100;
  //       return Number(discountAmount);
  //     }
  //   }
  //   return 0;
  // }
  calculateDiscountedAmount(itemDetails) {
    let totalDiscount = 0;
    let percentDiscount = 0;
    if (itemDetails?.fixedDiscount?.discountValue > 0) {
      totalDiscount = totalDiscount + itemDetails.fixedDiscount.discountValue;
    }
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
        this.state.currency != this.state.companyCountryDetails?.currency?.code &&
        this.state.companyCountryDetails?.currency?.code == 'INR') || (this.state.partyType == "SEZ" && calculateFor == 'totalAmount')) {
      return 0;
    }
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        // console.log("Item Details taxDetailsArray " + JSON.stringify(item))
        if (this.state.partyType == "SEZ" || (this.state.companyCountryDetails?.currency?.code == 'INR' && this.state.currency != this.state.companyCountryDetails?.currency?.code
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
    else if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            // console.log("Item Deatils stocks " + JSON.stringify(taxArr[j]))
            if (this.state.partyType == "SEZ" || (this.state.companyCountryDetails?.currency?.code == 'INR' && this.state.currency != this.state.companyCountryDetails?.currency?.code
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
      const tax = this.calculatedTaxAmount(item, 'totalAmount');
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
    
  downloadFile = async (voucherUniqueName, voucherNo, partyUniqueName, voucherType) => {
    try {
      if (Platform.OS == "android" && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if(granted !== PermissionsAndroid.RESULTS.GRANTED){
          this.setState({ ShareModal: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
      await this.onShare(voucherUniqueName, voucherNo, partyUniqueName,voucherType);
    } catch (err) {
      console.warn(err);
    }
  };

  onShare = async (voucherUniqueName, voucherNo, partyUniqueName, voucherType) => {
    try {
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'POST',
        this.state.companyVersionNumber == 1 ? `https://api.giddh.com/company/${activeCompany}/accounts/${partyUniqueName}/vouchers/download-file?fileType=pdf` :
          `https://api.giddh.com/company/${activeCompany}/download-file?voucherVersion=${this.state.companyVersionNumber}&fileType=pdf&downloadOption=VOUCHER`,
        {
          'session-id': `${token}`,
          'Content-Type': 'application/json'
        },
        JSON.stringify({
          voucherType: `${voucherType}`,
          uniqueName: voucherUniqueName,
        })
      )
        .then((res) => {
          console.log(res)
          const base64Str = res.base64();
          const pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          if (Platform.OS === "ios") {
            RNFetchBlob.ios.previewDocument(pdfLocation)
          }
          // this.setState({ loading: false });
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
              this.setState({ loading: false });
            })
            .catch((err) => {
              this.setState({ loading: false });
              // err && console.log(err);
            });
        });
    } catch (e) {
      this.setState({ loading: false });
      console.log(e);
      console.log(e);
    }
  };

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
          if (!this.state.partyName) {
            alert('Please select a party.');
          } else {
            this.props.navigation.navigate('InvoiceOtherDetailScreen', {
              warehouseArray: this.state.warehouseArray,
              setOtherDetails: this.setOtherDetails,
              otherDetails: this.state.otherDetails
            })
          }
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
    const renderFooter = () => {
      return (
        <TouchableOpacity style={{ backgroundColor: '#229F5F', width: "30%", margin: 10, padding: 5, paddingVertical: 10, borderRadius: 10, alignItems: "center", alignSelf: "flex-end" }}
          onPress={() => {
            this.setState({ amountPaidNowText: isNaN(Number(this.state.tempAmountPaidNowText)) ? 0 : Number(this.state.tempAmountPaidNowText), selectedPayMode: this.state.tempSelectedPayMode });
            this.setBottomSheetVisible(this.paymentModeBottomSheetRef, false);
          }}>
          <Text style={[style.boldText, {color: '#FFFFFF'}]}>Done</Text>
        </TouchableOpacity>
      )
    }
        return (
      <BottomSheet
        bottomSheetRef={this.paymentModeBottomSheetRef}
        headerText='Payment'
        headerTextColor='#229F5F'
        FooterComponent={renderFooter}
        onClose={() => Keyboard.dismiss()}
      >
        <Text style={[style.boldText, {marginLeft: 20, marginTop: 10}]}>Amount</Text>
        {this.state.invoiceType == 'sales' && (
          <TextInput
            style={[style.regularText, { borderWidth: 0.5, borderColor: "#D9D9D9", borderRadius: 5, padding: 5, marginVertical: 10, marginHorizontal: 20, height: 40 }]}
            value={String(this.state.tempAmountPaidNowText)}
            keyboardType="number-pad"
            returnKeyType={'done'}
            placeholder="Enter Amount"
            placeholderTextColor="#808080"
            onChangeText={(text) => {
              if (Number(text) > Number(this.getTotalAmount())) {
                Alert.alert('Alert', 'deposit amount should not be more than invoice amount');
              } else {
                this.setState({tempAmountPaidNowText:text})
              }
            }}
          />
        )}
        
        <Text style={[style.boldText, {marginLeft: 20}]}>Payment Mode</Text>
        <FlatList
          data={this.state.modesArray}
          style={{ marginHorizontal: 20,  marginTop: 10}}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: this.state.tempSelectedPayMode.uniqueName == item.uniqueName ? '#E0F2E9' : null,
                borderRadius: 5,
                paddingVertical: 10
              }}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                this.setState({ tempSelectedPayMode: item });
              }}>
              <Text style={[style.regularText, { marginLeft: 5}]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </BottomSheet>
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
              <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(Number(this.getTotalAmount()) + this.state.roundOffTotal)}</Text>
            </View>
            {this.state.currency != this.state.companyCountryDetails?.currency?.code &&
              this.state.invoiceType != INVOICE_TYPE.cash
              ? (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ color: '#1C1C1C', textAlignVertical: 'center' }}>
                    {'Total Amount ' + this.state.companyCountryDetails?.currency?.symbol}
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
                        <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(item.amount)}</Text>
                      </View>
                    )
                  }} />
                : null
            }

            {this.state.invoiceType !== 'cash' && !this.isVoucherUpdate && <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: this.state.invoiceType == 'cash' ? 10 : 4,
                // backgroundColor: 'pink',
                alignItems: 'center'
              }}>
              <TouchableOpacity
                style={{ width: "40%" }}
                onPress={() => {
                  if (this.state.modesArray.length > 0) {
                    this.setBottomSheetVisible(this.paymentModeBottomSheetRef, true);
                    this.setState({ tempSelectedPayMode: this.state.selectedPayMode,tempAmountPaidNowText:this.state.amountPaidNowText})
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
                <Text style={{ color: '#1C1C1C' }}>{formatAmount(this.getInvoiceDueTotalAmount())}</Text>
              ) : (
                <TouchableOpacity
                  style={{ width: "50%", alignItems: "flex-end" }}
                  onPress={() => {
                    this.setBottomSheetVisible(this.paymentModeBottomSheetRef, true);
                    this.setState({ tempSelectedPayMode: this.state.selectedPayMode,tempAmountPaidNowText:this.state.amountPaidNowText })
                  }}>
                  <Text style={{ color: '#1C1C1C' }}>
                    {this.state.addedItems.length > 0 && this.state.currencySymbol + formatAmount(Number(this.state.amountPaidNowText))}
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
            </View>}

            {this.state.invoiceType !== 'cash' && <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ color: '#1C1C1C' }}>Invoice Due</Text>
              <Text style={{ color: '#1C1C1C' }}>
                {this.state.addedItems.length > 0 && this.state.currencySymbol}
                {formatAmount(Number(this.getInvoiceDueTotalAmount()) + this.state.roundOffTotal - this.state.amountPaidNowText)}
              </Text>
            </View>}
          </View>
        )}
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            marginTop: 20,
            margin: 16,
            alignItems: 'center',
            display: this.isVoucherUpdate ? 'none' : 'flex' 
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
                // backgroundColor: '#5773FF',
                // paddingVertical: 8,
                // paddingHorizontal: 7,
                // justifyContent: 'center',
                // alignItems: 'center',
                // borderRadius: 10,
              }}
              onPress={() => {
                this.genrateInvoice('share');
              }}>
              <Text style={{ color: '#808080', fontSize: 13 }}>Create and Share</Text>
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity
            onPress={() => {
              this.genrateInvoice('navigate');
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  _renderSaveButton() {
    return (
      <TouchableOpacity
        style={{ flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60 }}
        onPress={() => {
          this.genrateInvoice('navigate');
        }}>
        <Icon name={'path-18'} size={48} color={'#5773FF'} />
      </TouchableOpacity>
    );
  }

  genrateInvoice(type) {
    if (!this.state.partyName) {
      alert('Please select a party.');
    } else if (this.state.addedItems.length == 0) {
      alert('Please select entries to proceed.');
    } else if (
      this.state.currency != this.state.companyCountryDetails?.currency?.code &&
      this.state.totalAmountInINR <= 0 &&
      this.getTotalAmount() > 0
    ) {
      Alert.alert('Error', 'Exchange rate/Total Amount in INR can not zero/negative', [
        { style: 'destructive', onPress: () => console.log('alert destroyed') }
      ]);
    } else if (
      (this.state.currency == this.state.companyCountryDetails?.currency?.code ||
        this.state.invoiceType == INVOICE_TYPE.cash) &&
      (!this.state.partyBillingAddress.stateName ||
        !this.state.partyBillingAddress.stateCode ||
        !this.state.partyBillingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Billing From', [
        { style: 'destructive', text: 'Okay' }
      ]);
    } else if (
      (this.state.currency == this.state.companyCountryDetails?.currency?.code ||
        this.state.invoiceType == INVOICE_TYPE.cash) &&
      (!this.state.partyShippingAddress.stateName ||
        !this.state.partyShippingAddress.stateCode ||
        !this.state.partyShippingAddress.state)
    ) {
      Alert.alert('Empty state details', 'Please add state details for Shipping From', [
        { style: 'destructive', text: 'Okay' }
      ]);
    } else {
      if(this.isVoucherUpdate){
        this.updateVoucher();
        return
      }

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
        <_StatusBar statusBar='#0E7942' />
        <Animated.ScrollView
          keyboardShouldPersistTaps="never"
          style={[{ flex: 1, backgroundColor: 'white' }, { marginBottom: this.keyboardMargin }]}
          contentContainerStyle={{ paddingBottom: 70 }}
          bounces={false}>
          <View style={style.container}>
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderSelectPartyName()}
              {this.renderAmount()}
            </View>
            {this._renderDateView()}
            {this._renderAddress()}
            {this._renderOtherDetails()}
            {this.state.addedItems.length > 0 ? this._renderSelectedStock() : this.renderAddItemButton()}
            {this.state.addedItems.length > 0 && this._renderTotalAmount()}
            {this.state.showInvoiceModal && this.renderInvoiceTypeModal()}
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
            notIncludeTax={((this.state.invoiceType == INVOICE_TYPE.credit &&
              this.state.currency != this.state.companyCountryDetails?.currency?.code &&
              this.state.companyCountryDetails?.currency?.code == 'INR') || (this.state.partyType == "SEZ")) ? false : true}
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
        {this._renderPaymentMode()}
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
const _StatusBar = ({ statusBar }: { statusBar: string }) => {
  const isFocused = useIsFocused();
  return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={ Platform.OS === 'ios' ? "dark-content" : "light-content"}/> : null
}
function Screen(props) {
  const isFocused = useIsFocused();

  return <SalesInvoice {...props} isFocused={isFocused} />;

}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
