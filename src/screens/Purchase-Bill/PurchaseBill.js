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
// import style from './style';
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
import PurchaseItemEdit from './PurchaseItemEdit';
import style from './style';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { FONT_FAMILY } from '../../utils/constants';
import CheckBox from 'react-native-check-box'

const { SafeAreaOffsetHelper } = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash'
};
// interface Props {
//   navigation: any;
// }

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide'
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide'
};
export class PurchaseBill extends React.Component {
  constructor (props) {
    super(props);
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
      displayedDate: moment(),
      showDatePicker: false,
      BillToAddress: {},
      BillFromAddress: {},
      shipToAddress: {},
      shipFromAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
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
      countryDeatils: {
        countryName: '',
        countryCode: ''
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.00,
      companyCountryDetails: '',
      selectedInvoice: '',
      allBillingToAddresses: [],
      billFromSameAsShipFrom: true,
      billToSameAsShipTo: false
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#ef6c00" barStyle="light-content" /> : null;
  };

  setOtherDetails = (data) => {
    this.setState({ otherDetails: data });
  };

  selectBillToAddress = (address) => {
    console.log(address);
    this.setState({ BillToAddress: address });
    if (this.state.billToSameAsShipTo) {
      this.setState({ shipToAddress: address })
    }
  };

  selectBillFromAddress = (address) => {
    console.log('bill from', address);
    this.setState({ BillFromAddress: address });
    if (this.state.billFromSameAsShipFrom) {
      this.setState({ shipFromAddress: address })
    }
  };

  selectShipToAddress = (address) => {
    console.log('shipping to', address);
    this.setState({ shipToAddress: address.addresses[0] });
  };

  selectShipToAddressFromEditAddressScreen = (address) => {
    console.log('shipping to', address);
    this.setState({ shipToAddress: address });
  };

  selectShipFromAddress = (address) => {
    console.log('shipping from', address);
    this.setState({ shipFromAddress: address });
  };

  async getExchangeRateToINR (currency) {
    try {
      const results = await InvoiceService.getExchangeRate(moment().format('DD-MM-YYYY'), this.state.companyCountryDetails.currency.code, currency);
      if (results.body && results.status == 'success') {
        await this.setState({
          totalAmountInINR: (Math.round(Number(this.getTotalAmount()) * (results.body) * 100) / 100).toFixed(2),
          exchangeRate: results.body
        })
      }
    } catch (e) { }
    return 1
  }

  async setActiveCompanyCountry () {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          companyCountryDetails: results.body.country
        })
      }
    } catch (e) { }
  }

  componentDidMount () {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow); this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide); this.setActiveCompanyCountry()
    this.setActiveCompanyCountry()
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInPurchaseBill, (data) => {
      this.updateAddedItems(data);
      // fire logout action
      // store.dispatch.auth.logout();
    });

    // this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
    //   await this.resetState();
    //   this.setActiveCompanyCountry()
    //   this.getAllTaxes();
    //   this.getAllDiscounts();
    //   this.getAllWarehouse();
    //   this.getAllAccountsModes();
    // });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry()
      this.getAllTaxes();
      this.getAllDiscounts();
      this.getAllWarehouse();
      this.getAllAccountsModes();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
  }

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

  renderHeader () {
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
            <Text style={style.invoiceType}>Purchase Bill</Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderSelectPartyName () {
    return (
      <View onLayout={this.onLayout} style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center' }} onPress={() => { }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center'}}> */}
          <Icon name={'Profile'} color={'#fafafa'} style={{ margin: 16 }} size={16} />
          <TextInput
            placeholderTextColor={'#fafafa'}
            placeholder={'Search Vendor Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) =>
              this.setState({ searchPartyName: text }, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
          {/* </View> */}
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

  async getAllDiscounts () {
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

  async getAllWarehouse () {
    this.setState({ fetechingWarehouseList: true });
    try {
      const results = await InvoiceService.getWareHouse();
      if (results.body && results.status == 'success') {
        this.setState({ warehouseArray: results.body.results, fetechingWarehouseList: false });
      }
    } catch (e) {
      this.setState({ fetechingWarehouseList: false });
    }
  }

  async getAllAccountsModes () {
    try {
      const results = await InvoiceService.getBriefAccount();
      if (results.body && results.status == 'success') {
        this.setState({ modesArray: results.body.results });
      }
    } catch (e) { }
  }

  async getAllTaxes () {
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

  async getCompanyAddress () {
    const result = await InvoiceService.getCompanyBranchesDetails()
    if (result.body && result.status == 'success') {
      await this.setState({ allBillingToAddresses: result.body.addresses })
      for (let i = 0; i < result.body.addresses.length; i++) {
        const adddressArray = await result.body.addresses[i]
        if (adddressArray.branches) {
          for (let j = 0; j < adddressArray.branches.length; j++) {
            const address = adddressArray.branches[j]
            if (address.isDefault && address.isHeadQuarter) {
              console.log('company address Array ' + JSON.stringify(adddressArray))
              await this.setState({ BillToAddress: adddressArray });
              await this.state.billToSameAsShipTo ? this.setState({ shipToAddress: adddressArray }) : null;
              break
            }
          }
        }
      }
    }
  }

  async getBillToAndShipToAddress () {
    await this.getCompanyAddress();
    if (!this.state.billToSameAsShipTo) {
      const wareHouse = await this.state.warehouseArray
      console.log('Ware house Array ' + JSON.stringify(wareHouse))
      for (let i = 0; i < wareHouse.length; i++) {
        if (wareHouse[i].isDefault) {
          const address = wareHouse[i].addresses[0]
          if (address) {
            await this.setState({ shipToAddress: address });
            break
          }
        }
      }
    }
  }

  getTaxDeatilsForUniqueName (uniqueName) {
    const filtered = _.filter(this.state.taxArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0].taxDetail;
    }
    return undefined;
  }

  getDiscountDeatilsForUniqueName (uniqueName) {
    const filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  _renderSearchList () {
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

  async searchUser () {
    this.setState({ isSearchingParty: true });
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.Pbsearch(this.state.searchPartyName, 1, 'sundrycreditors');

      if (results.body && results.body.results) {
        this.setState({ searchResults: results.body.results, isSearchingParty: false, searchError: '' });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });
    }
  }

  async searchAccount () {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);
      console.log('cash account is ', results);
      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency)
        }
        await this.setState({
          addedItems: [],
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          countryDeatils: results.body.country,
          currency: results.body.currency,
          currencySymbol: results.body.currencySymbol,
          addressArray: results.body.addresses.length < 1 ? [] : results.body.addresses,
          BillFromAddress: results.body.addresses.length < 1 ? {} : results.body.addresses[0],
          // BillToAddress: results.body.addresses.length < 1 ? {} : results.body.addresses[0],
          shipFromAddress: results.body.addresses.length < 1 ? {} : results.body.addresses[0]
          // shipToAddress: results.body.addresses.length < 1 ? {} : results.body.addresses[0],
        });
        await this.getBillToAndShipToAddress();
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
      displayedDate: moment(),
      showDatePicker: false,
      BillToAddress: {},
      BillFromAddress: {},
      shipToAddress: {},
      shipFromAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
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
      countryDeatils: {
        countryName: '',
        countryCode: ''
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.00,
      companyCountryDetails: '',
      selectedInvoice: '',
      allBillingToAddresses: [],
      billFromSameAsShipFrom: true,
      billToSameAsShipTo: false
    });
  };

  getDiscountForEntry (item) {
    // console.log('item is', item);
    const discountArr = [];
    if (item.fixedDiscount) {
      const discountItem = {
        calculationMethod: 'FIX_AMOUNT',
        amount: { type: 'DEBIT', amountForAccount: item.fixedDiscount.discountValue },
        discountValue: item.fixedDiscount.discountValue,
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
            amount: { type: 'DEBIT', amountForAccount: item.percentDiscountArray[i].discountValue },
            name: item.percentDiscountArray[i].name,
            uniqueName: item.percentDiscountArray[i].uniqueName,
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

  getTaxesForEntry (item) {
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

  getEntries () {
    const entriesArray = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      // console.log('item is', item);
      const entry = {
        date: moment(this.state.date).format('DD-MM-YYYY'),
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
        voucherType: 'purchase'
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  downloadFile = async (voucherName, voucherNo, partyUniqueName) => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.onShare(voucherName, voucherNo, partyUniqueName);
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
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
          const pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          this.setState({ loading: false });
        })
        .then(() => {
          Share.open({
            title: 'This is the report',
            message: 'Message:',
            url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`,
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

  async createPurchaseBill (type) {
    this.setState({ loading: true });
    try {
      console.log('came to this');
      if (this.state.currency != this.state.companyCountryDetails.currency.code) {
        let exchangeRate = 1
        await this.getTotalAmount() > 0 ? (exchangeRate = (Number(this.state.totalAmountInINR) / this.getTotalAmount())) : exchangeRate = 1
        await this.setState({ exchangeRate: exchangeRate })
      }
      const postBody = {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.BillFromAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.BillFromAddress.size != {} ? this.state.BillFromAddress.gstNumber : '',
            panNumber: '',
            state: { code: this.state.BillFromAddress.state ? this.state.BillFromAddress.state.code : '', name: this.state.BillFromAddress.state ? this.state.BillFromAddress.state.name : '' },
            stateCode: this.state.BillFromAddress.size != {} ? this.state.BillFromAddress.stateCode : '',
            stateName: this.state.BillFromAddress.size != {} ? this.state.BillFromAddress.stateName : '',
            pincode: this.state.BillFromAddress.size != {} ? this.state.BillFromAddress.pincode : ''
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          currency: { code: this.state.currency },
          currencySymbol: this.state.currencySymbol,
          email: '',
          mobileNumber: '',
          name: this.state.partyName.name,
          // shippingDetails: this.state.partyShippingAddress,
          shippingDetails: {
            address: [this.state.shipFromAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.shipFromAddress.size != {} ? this.state.shipFromAddress.gstNumber : '',
            panNumber: '',
            state: { code: this.state.shipFromAddress.state ? this.state.shipFromAddress.state.code : '', name: this.state.shipFromAddress.state ? this.state.shipFromAddress.state.name : '' },
            stateCode: this.state.shipFromAddress != {} ? this.state.shipFromAddress.stateCode : '',
            stateName: this.state.shipFromAddress != {} ? this.state.shipFromAddress.stateName : '',
            pincode: this.state.shipFromAddress.size != {} ? this.state.shipFromAddress.pincode : ''
          },
          uniqueName: this.state.partyName.uniqueName
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: moment(this.state.date).format('DD-MM-YYYY'),
        // deposit: {
        //   type: 'DEBIT',
        //   accountUniqueName: this.state.selectedPayMode.uniqueName,
        //   amountForAccount: this.state.invoiceType == 'cash' ? 0 : this.state.amountPaidNowText,
        // },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        // passportNumber: '',
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
        // touristSchemeApplicable: false,
        type: 'purchase',
        attachedFiles: [],
        subVoucher: '',
        purchaseOrders: [],
        // updateAccountDetails: false,
        // voucherAdjustments: {adjustments: []},
        company: {
          billingDetails: {
            address: [this.state.BillToAddress.address],
            countryName: this.state.companyCountryDetails.countryName,
            gstNumber: this.state.BillToAddress.gstNumber,
            panNumber: '',
            state: { code: this.state.BillToAddress.state ? this.state.BillToAddress.state.code : '', name: this.state.BillToAddress.state ? this.state.BillToAddress.state.name : '' },
            stateCode: this.state.BillToAddress.stateCode,
            stateName: this.state.BillToAddress.stateName,
            pincode: this.state.BillToAddress.pincode
          },
          shippingDetails: {
            address: [this.state.shipToAddress.address],
            countryName: this.state.companyCountryDetails.countryName,
            gstNumber: this.state.shipToAddress.gstNumber,
            panNumber: '',
            state: { code: this.state.shipToAddress.state ? this.state.shipToAddress.state.code : '', name: this.state.shipToAddress.state ? this.state.shipToAddress.state.name : '' },
            stateCode: this.state.shipToAddress.stateCode,
            stateName: this.state.shipToAddress.stateName,
            pincode: this.state.shipToAddress.pincode
          }
        }
      };

      if (this.state.selectedInvoice != '') {
        postBody.number = this.state.selectedInvoice
      }

      console.log('purchase bill postBody is', JSON.stringify(postBody));
      const results = await InvoiceService.createPurchaseBill(postBody, this.state.partyName.uniqueName);
      if (type != 'share') {
        this.setState({ loading: false });
      }
      if (results.body) {
        // this.setState({loading: false});
        alert('Purchase Bill created successfully!');
        const partyDetails = this.state.partyDetails;
        const partyUniqueName = this.state.partyDetails.uniqueName;
        this.resetState();
        this.setActiveCompanyCountry()
        this.getAllTaxes();
        this.getAllDiscounts();
        this.getAllWarehouse();
        this.getAllAccountsModes();
        this.props.navigation.goBack();
        DeviceEventEmitter.emit(APP_EVENTS.PurchaseBillCreated, {});
        if (type == 'navigate') {
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
        if (type == 'share') {
          console.log('sharing');
          this.downloadFile(results.body.entries[0].voucherType, results.body.entries[0].voucherNumber, partyUniqueName);
        }
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ isSearchingParty: false, loading: false });
    }
  }

  clearAll = () => {
    this.resetState();
    this.setActiveCompanyCountry()
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
  }

  renderAmount () {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Text style={style.invoiceAmountText}>{this.state.currencySymbol + this.getTotalAmount()}</Text>
      </View>
    );
  }

  getSelectedDateDisplay () { }
  getYesterdayDate () {
    this.setState({ date: moment().subtract(1, 'days') });
  }

  getTodayDate () {
    this.setState({ date: moment() });
  }

  formatDate () {
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

  hideDatePicker = () => {
    this.setState({ showDatePicker: false });
  };

  handleConfirm = (date) => {
    // console.log('A date has been picked: ', date);
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState({ date: moment(date) });
    this.hideDatePicker();
  };

  _renderDateView () {
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

      <View style={style.dateView}>
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ showDatePicker: true })}>
          <Icon name={'Calendar'} color={'#FC8345'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
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
    );
  }

  _renderSelectInvoice () {
    return (
      <View style={style.dateView}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={style.InvoiceHeading}>Invoice #</Text>
          <View style={{ flexDirection: 'row', width: '75%', marginHorizontal: 15, justifyContent: 'space-between' }}>
            <TextInput
              placeholder={'Enter Invoice name'}
              value={this.state.selectedInvoice}
              style={{ color: '#808080', fontSize: 14, fontFamily: FONT_FAMILY.regular, width: '100%', height: 40 }}
              onChangeText={(value) => {
                this.setState({ selectedInvoice: value })
              }}
            />
          </View>
        </View>
      </View>
    )
  }

  billingFromAddressArray () {
    const addressArray = this.state.BillFromAddress
    if (this.state.BillFromAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils
    }
    return addressArray
  };

  selectBillingFromAddressFromEditAdress = async (address) => {
    console.log(JSON.stringify(address));
    const countryCode = address.selectedCountry.currency ? address.selectedCountry.currency.code : address.selectedCountry.countryCode
    await this.setState({
      BillFromAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode
    });
    if (this.state.billFromSameAsShipFrom) {
      this.setState({ shipFromAddress: address })
    }
  };

  shippingFromAddressArray () {
    const addressArray = this.state.shipFromAddress
    if (this.state.shipFromAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils
    }
    return addressArray
  };

  selectShippingFromAddressFromEditAdress = (address) => {
    console.log(address);
    const countryCode = address.selectedCountry.currency ? address.selectedCountry.currency.code : address.selectedCountry.countryCode
    this.setState({
      shipFromAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode
    });
  };

  _renderAddress () {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'8'} color={'#FC8345'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <View
          style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    type: 'address',
                    selectAddress: this.selectBillFromAddress.bind(this),
                    color: '#FC8345',
                    statusBarColor: '#ef6c00'
                  });
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Billing From'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ height: '250%', width: '10%' }} onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry: true,
                  address: this.billingFromAddressArray(),
                  selectAddress: this.selectBillingFromAddressFromEditAdress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00',
                  headerColor: '#FC8345'
                })
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
                  type: 'address',
                  selectAddress: this.selectBillFromAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00'
                });
              }
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.BillFromAddress.address
                ? this.state.BillFromAddress.address
                : this.state.BillFromAddress.stateName
                  ? this.state.BillFromAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : 'Select Billing Address'}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <CheckBox
              checkBoxColor={'#5773FF'}
              uncheckedCheckBoxColor={'#808080'}
              style={{ marginLeft: -3 }}
              onClick={() => {
                this.setState({
                  billFromSameAsShipFrom: !this.state.billFromSameAsShipFrom,
                  shipFromAddress: this.state.BillFromAddress
                })
              }}
              isChecked={this.state.billFromSameAsShipFrom}
            />

            <Text style={style.addressSameCheckBoxText}>Shipping Address Same as Billing</Text>
            {/* <Text style={{ color: "#E04646", marginTop: 4 }}>*</Text> */}
          </View>
          {/* Sender Address View */}
        </View>
        <View
          style={{ paddingVertical: 6, marginTop: 0, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    type: 'address',
                    selectAddress: this.selectShipFromAddress.bind(this),
                    color: '#FC8345',
                    statusBarColor: '#ef6c00'
                  });
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Shipping From'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ height: '250%', width: '10%' }} onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else if (!this.state.billFromSameAsShipFrom) {
                this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry: true,
                  address: this.shippingFromAddressArray(),
                  selectAddress: this.selectShippingFromAddressFromEditAdress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00',
                  headerColor: '#FC8345'
                })
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
                this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.addressArray,
                  type: 'address',
                  selectAddress: this.selectShipFromAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00'
                });
              }
            }}
          >
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.shipFromAddress.address
                ? this.state.shipFromAddress.address
                : this.state.shipFromAddress.stateName
                  ? this.state.shipFromAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : 'Select Shipping Address'}
            </Text>
          </TouchableOpacity>
          {/* Shipping Address View */}
        </View>
        <View
          style={{ paddingVertical: 6, marginTop: 0, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else {
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.allBillingToAddresses,
                    type: 'address',
                    selectAddress: this.selectBillToAddress.bind(this),
                    color: '#FC8345',
                    statusBarColor: '#ef6c00'
                  });
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Billing To'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ height: '250%', width: '10%' }} onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry: true,
                  address: this.state.BillToAddress,
                  selectAddress: this.selectBillToAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00',
                  headerColor: '#FC8345'
                })
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
                this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.allBillingToAddresses,
                  type: 'address',
                  selectAddress: this.selectBillToAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00'
                });
              }
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.BillToAddress.address
                ? this.state.BillToAddress.address
                : this.state.BillToAddress.stateName
                  ? this.state.BillToAddress.stateName
                  : this.state.companyCountryDetails.countryName
                    ? this.state.companyCountryDetails.countryName
                    : 'Select Billing Address'}
            </Text>
          </TouchableOpacity>
          {/* Shipping Address View */}
          <View style={{ flexDirection: 'row' }}>
            <CheckBox
              checkBoxColor={'#5773FF'}
              uncheckedCheckBoxColor={'#808080'}
              style={{ marginLeft: -3 }}
              onClick={() => {
                this.setState({
                  billToSameAsShipTo: !this.state.billToSameAsShipTo,
                  shipToAddress: this.state.BillToAddress
                })
              }}
              isChecked={this.state.billToSameAsShipTo}
            />
            <Text style={style.addressSameCheckBoxText}>Shipping Address Same as Billing</Text>
            {/* <Text style={{ color: "#E04646", marginTop: 4 }}>*</Text> */}
          </View>
        </View>
        <View
          style={{ paddingVertical: 6, marginTop: 0, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else {
                this.props.navigation.navigate('SelectAddress', {
                  warehouseArray: this.state.warehouseArray,
                  type: 'warehouse',
                  selectAddress: this.selectShipToAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00'
                });
              }
            }} style={{ width: '90%' }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {'Shipping To'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ height: '200%', width: '10%' }} onPress={() => {
              if (!this.state.partyName) {
                alert('Please select a party.');
              } else if (!this.state.billToSameAsShipTo) {
                this.props.navigation.navigate('EditAddress', {
                  dontChangeCountry: true,
                  address: this.state.shipToAddress,
                  selectAddress: this.selectShipToAddressFromEditAddressScreen.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00',
                  headerColor: '#FC8345'
                })
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
                this.props.navigation.navigate('SelectAddress', {
                  warehouseArray: this.state.warehouseArray,
                  type: 'warehouse',
                  selectAddress: this.selectShipToAddress.bind(this),
                  color: '#FC8345',
                  statusBarColor: '#ef6c00'
                });
              }
            }} >
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.shipToAddress.address
                ? this.state.shipToAddress.address
                : this.state.shipToAddress.stateName
                  ? this.state.shipToAddress.stateName
                  : this.state.companyCountryDetails.countryName
                    ? this.state.companyCountryDetails.countryName
                    : 'Select Shipping Address'}
            </Text>
          </TouchableOpacity>

          {/* Shipping Address View */}
        </View>
      </View>
    );
  }

  // https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice () {
    this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false });
  }

  setCreditTypeInvoice () {
    this.setState({ invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false });
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false
    });
  };

  updateAddedItems = async (addedItems) => {
    const updateAmountToCurrentCurrency = addedItems
    if ((this.state.currency).toString() != (this.state.companyCountryDetails.currency.code).toString()) {
      try {
        const results = await InvoiceService.getExchangeRate(moment().format('DD-MM-YYYY'), this.state.currency, this.state.companyCountryDetails.currency.code);
        if (results.body && results.status == 'success') {
          for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
            const item = updateAmountToCurrentCurrency[i];
            if ((updateAmountToCurrentCurrency[i].currency.code).toString() != (this.state.currency).toString()) {
              updateAmountToCurrentCurrency[i].currency = await { code: this.state.currency, symbol: this.state.currencySymbol }
              updateAmountToCurrentCurrency[i].rate = await (Number(item.rate) * results.body)
            }
          }
        }
      } catch (e) { }
    }
    await this.setState({ addedItems: updateAmountToCurrentCurrency });
    await this.setState({
      totalAmountInINR:
        (Math.round(this.getTotalAmount() * this.state.exchangeRate * 100) / 100).toFixed(2)
    });
  };

  renderAddItemButton () {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
            this.props.navigation.navigate('PurchaseAddItem', {
              updateAddedItems: (this.updateAddedItems).bind(this),
              addedItems: this.state.addedItems
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
          borderColor: '#FC8345',
          borderWidth: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '90%'
        }}>
        <AntDesign name={'plus'} color={'#FC8345'} size={18} style={{ marginHorizontal: 8 }} />
        <Text style={style.addItemMain}> Add Item</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock () {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'Path-13016'} color="#FC8345" size={18} />
            <Text style={{ marginLeft: 10 }}>Select Product/Service</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('PurchaseAddItem', {
                updateAddedItems: (this.updateAddedItems).bind(this),
                addedItems: this.state.addedItems
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
    const newItems = this.state.addedItems;
    newItems.push(item);
    this.setState({ addedItems: newItems });
    if (item.rate) {
      const totalAmount = this.getTotalAmount()
      this.setState({
        totalAmountInINR:
          (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2)
      });
    }
  }

  deleteItem = (item) => {
    const addedArray = this.state.addedItems;
    const itemUniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0
    );
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray, showItemDetails: false }, () => { });
    if (item.rate) {
      const totalAmount = this.getTotalAmount()
      this.setState({
        totalAmountInINR:
          (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2)
      });
    }
  };

  renderRightAction (item) {
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

  renderStockItem (item) {
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          style={{ backgroundColor: '#ffe0b2', padding: 10, borderRadius: 2, marginBottom: 10 }}
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
            <TouchableOpacity
              onPress={() => this.addItem(item)}
              style={{ flexDirection: 'row', alignItems: 'center' }} >
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
            Tax :{this.state.currencySymbol}
            {this.calculatedTaxAmount(item)}
          </Text>
          <Text style={{ marginTop: 5, color: '#808080' }}>
            Discount : {this.state.currencySymbol}
            {item.discountValue ? item.discountValue : 0}
          </Text>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  onChangeTextBottomItemSheet (text, field) {
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

  _renderBottomSeprator (margin = 0) {
    return (
      <View
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }

  calculateDiscountedAmount (itemDetails) {
    if (itemDetails.discountDetails) {
      const discountType = itemDetails.discountDetails.discountType;
      if (discountType == 'FIX_AMOUNT') {
        const discountAmount = Number(itemDetails.discountValue);
        return discountAmount;
      } else {
        const amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
        const discountAmount = (Number(itemDetails.discountValue) * amt) / 100;
        return Number(discountAmount);
      }
    }
    return 0;
  }

  calculatedTaxAmount (itemDetails) {
    let totalTax = 0;
    const taxArr = this.state.taxArray;
    console.log('rate', itemDetails.rate);
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        totalTax = totalTax + taxAmount;
      }
    }
    if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            // console.log('tax value is ', taxArr[j].taxDetail[0].taxValue);
            const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
            const taxAmount = (taxPercent * Number(amt)) / 100;
            totalTax = totalTax + taxAmount;
            break;
          }
        }
      }
    }
    console.log('calculated tax is ', totalTax);
    return Number(totalTax.toFixed(2));
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

  getTotalAmount () {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item);

      // do inventory calulations

      const amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
    return total;
  }

  _renderOtherDetails () {
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
          this.props.navigation.navigate('PurchaseBillOtherDetails', {
            warehouseArray: this.state.warehouseArray,
            setOtherDetails: this.setOtherDetails,
            otherDetails: this.state.otherDetails
          });
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Icon style={{ marginRight: 16 }} name={'Sections'} size={16} color="#FC8345" />
          <Text style={{ color: '#1C1C1C' }}>Other Details</Text>
        </View>
        <AntDesign name={'right'} size={18} color={'#808080'} />
      </TouchableOpacity>
    );
  }

  _renderTotalAmount () {
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
            <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color="#FC8345" />
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
            { this.state.currency != this.state.companyCountryDetails.currency.code && this.state.invoiceType != INVOICE_TYPE.cash
              ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
              <Text style={{ color: '#1C1C1C', textAlignVertical: 'center' }}>{'Total Amount ' + this.state.companyCountryDetails.currency.symbol}</Text>
              <TextInput
                style={{ borderBottomWidth: 1, borderBottomColor: '#808080', color: '#1C1C1C', textAlign: 'center', marginRight: -10 }}
                placeholder={'Amount'}
                returnKeyType={'done'}
                keyboardType="number-pad"
                onChangeText={async (text) => {
                  await this.setState({ totalAmountInINR: Number(text) });
                }}
              >{this.state.totalAmountInINR}</TextInput>
            </View>
              : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: '#1C1C1C' }}>Balance Due</Text>
              <Text style={{ color: '#1C1C1C' }}>
                {this.state.addedItems.length > 0 && this.state.currencySymbol}
                {String(this.getTotalAmount()) - this.state.amountPaidNowText}
              </Text>
            </View>
          </View>
        )}

        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 20, margin: 16, alignItems: 'center' }}>
          <View>
            <TouchableOpacity style={{
              // backgroundColor: '#5773FF',
              // paddingVertical: 8,
              // paddingHorizontal: 7,
              // justifyContent: 'center',
              // alignItems: 'center',
              // borderRadius: 10,
              // marginBottom: 3
            }}
              onPress={() => {
                this.genrateInvoice('new');
              }}>
              <Text style={{ color: '#808080', fontSize: 13 }}>Create and New</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginTop: 10
              // backgroundColor: '#5773FF', paddingVertical: 8, paddingHorizontal: 7, justifyContent: 'center', alignItems: 'center', borderRadius: 10
            }}
              onPress={() => {
                this.genrateInvoice('share');
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

  genrateInvoice (type) {
    if (!this.state.partyName) {
      alert('Please select a party.');
    } else if (this.state.addedItems.length == 0) {
      alert('Please select entries to proceed.');
    } else if (this.state.currency != this.state.companyCountryDetails.currency.code && this.state.totalAmountInINR <= 0 && this.getTotalAmount() > 0) {
      Alert.alert('Error', 'Exchange rate/Total Amount in INR can not zero/negative', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
    } else {
      this.createPurchaseBill(type);
    }
  }

  updateEditedItem (details, selectedArrayType, selectedCode) {
    const itemUniqueName = details.item.stock ? details.item.stock.uniqueName : details.item.uniqueName;

    const addedArray = this.state.addedItems;
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0
    );
    const item = this.state.addedItems[index];
    item.quantity = Number(details.quantityText);
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

    const totalAmount = this.getTotalAmount()
    this.setState({ totalAmountInINR: (Math.round((totalAmount) * this.state.exchangeRate * 100) / 100).toFixed(2) })
    // this.setState({ addedItems: addedItems })
    // this.setState({showItemDetails:false})
  }

  componentWillUnmount () {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render () {
    return (
      //   <View style={{flex: 1, backgroundColor: 'lightBlue', justifyContent: 'center', alignItems: 'center'}}>
      //     <Text>Hello</Text>
      //   </View>
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
            {this._renderSelectInvoice()}
            {this._renderOtherDetails()}
            {this.state.addedItems.length > 0 ? this._renderSelectedStock() : this.renderAddItemButton()}
            {this.state.addedItems.length > 0 && this._renderTotalAmount()}

            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />
            {/* <TouchableOpacity
              style={{height: 60, width: 60, backgroundColor: 'pink'}}
              onPress={() => console.log(this.state.addressArray)}></TouchableOpacity> */}
            {/* <View style={{flexDirection: 'row'}}>

            <TouchableOpacity
              style={{height: 60, width: 60, backgroundColor: 'pink', marginLeft: 8}}
              onPress={() => console.log(this.state.BillToAddress)}></TouchableOpacity>
            <TouchableOpacity
              style={{height: 60, width: 60, backgroundColor: 'pink', marginLeft: 8}}
              onPress={() => console.log(this.state.shipToAddress)}></TouchableOpacity>
            <TouchableOpacity
              style={{height: 60, width: 60, backgroundColor: 'pink', marginLeft: 8}}
              onPress={() => console.log(this.state.shipFromAddress)}></TouchableOpacity>
          </View> */}
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
                top: 0
              }}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          )}
        </Animated.ScrollView>
        {this.state.showItemDetails && (
          <PurchaseItemEdit
            currencySymbol={this.state.currencySymbol}
            discountArray={this.state.discountArray}
            taxArray={this.state.taxArray}
            goBack={() => {
              this.setState({ showItemDetails: false });
            }}
            // selectedArrayType={this.state.selectedArrayType}
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

function mapStateToProps (state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps (dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

function Screen (props) {
  const isFocused = useIsFocused();

  return <PurchaseBill {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
