import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
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
} from 'react-native';
// import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useIsFocused} from '@react-navigation/native';

import PurchaseItemEdit from './PurchaseItemEdit';
import style from './style';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {ScrollView} from 'react-native-gesture-handler';

const {SafeAreaOffsetHelper} = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash',
};
// interface Props {
//   navigation: any;
// }

const {width, height} = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class PurchaseBill extends React.Component {
  constructor(props) {
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
      fetechingWarehouseList: false,

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
    };
    this.keyboardMargin = new Animated.Value(0);
  }
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#ef6c00" barStyle="light-content" /> : null;
  };

  setOtherDetails = (data) => {
    this.setState({otherDetails: data});
  };

  selectBillToAddress = (address) => {
    console.log(address);
    this.setState({BillToAddress: address});
  };
  selectBillFromAddress = (address) => {
    console.log('bill from', address);
    this.setState({BillFromAddress: address});
  };
  selectShipToAddress = (address) => {
    console.log('shipping to', address);
    this.setState({shipToAddress: address});
  };
  selectShipFromAddress = (address) => {
    console.log('shipping from', address);
    this.setState({shipFromAddress: address});
  };
  // func1 = async () => {
  //   const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
  //   console.log(activeCompany);
  // };

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
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

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.getAllTaxes();
      this.getAllDiscounts();
      this.getAllWarehouse();
      this.getAllAccountsModes();
    });

    if (Platform.OS == 'ios') {
      //Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        let {bottomOffset} = offset;
        this.setState({bottomOffset});
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
            <Text style={style.invoiceType}>Purchase Bill</Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderSelectPartyName() {
    return (
      <View onLayout={this.onLayout} style={{flexDirection: 'row', minHeight: 50}} onPress={() => {}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center'}}> */}
          <Icon name={'Profile'} color={'#fff'} style={{margin: 16}} size={16} />
          <TextInput
            placeholderTextColor={'#fff'}
            placeholder={'Search Vendor Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) =>
              this.setState({searchPartyName: text}, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
          {/* </View> */}
        </View>
      </View>
    );
  }
  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y,
    });
  };
  searchCalls = _.debounce(this.searchUser, 2000);

  async getAllDiscounts() {
    this.setState({fetechingDiscountList: true});
    try {
      const results = await InvoiceService.getDiscounts();
      if (results.body && results.status == 'success') {
        this.setState({discountArray: results.body, fetechingDiscountList: false});
      }
    } catch (e) {
      this.setState({fetechingDiscountList: false});
    }
  }

  async getAllWarehouse() {
    this.setState({fetechingWarehouseList: true});
    try {
      const results = await InvoiceService.getWarehouse();
      if (results.body && results.status == 'success') {
        this.setState({warehouseArray: results.body.results, fetechingWarehouseList: false});
      }
    } catch (e) {
      this.setState({fetechingWarehouseList: false});
    }
  }
  async getAllAccountsModes() {
    try {
      const results = await InvoiceService.getBriefAccount();
      if (results.body && results.status == 'success') {
        this.setState({modesArray: results.body.results});
      }
    } catch (e) {}
  }

  async getAllTaxes() {
    this.setState({fetechingTaxList: true});
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        this.setState({taxArray: results.body, fetechingTaxList: false});
      }
    } catch (e) {
      this.setState({fetechingTaxList: false});
    }
  }

  getTaxDeatilsForUniqueName(uniqueName) {
    var filtered = _.filter(this.state.taxArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0].taxDetail;
    }
    return undefined;
  }

  getDiscountDeatilsForUniqueName(uniqueName) {
    var filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
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
      <View style={[style.searchResultContainer, {top: height * 0.12}]}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-end',
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
          {/* <Text style={{marginLeft: 3}}>Close</Text> */}
        </TouchableOpacity>
        <FlatList
          data={this.state.searchResults}
          style={{paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5}}
          renderItem={({item}) => (
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
                    isSearchingParty: false,
                  },
                  () => {
                    this.searchAccount();
                    this.getAllAccountsModes();
                    Keyboard.dismiss();
                  },
                );
              }}>
              <Text style={{color: '#1C1C1C', paddingVertical: 10}}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      //   </TouchableOpacity>
      // </Modal>
    );
  }

  async searchUser() {
    this.setState({isSearchingParty: true});
    try {
      // console.log('Creditors called');
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
        this.setState({
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          addressArray: results.body.addresses,
          BillFromAddress: results.body.addresses[0],
          BillToAddress: results.body.addresses[0],
          shipFromAddress: results.body.addresses[0],
          shipToAddress: results.body.addresses[0],
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
      fetechingWarehouseList: false,
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
    });
  };
  getDiscountForEntry(item) {
    // console.log('item is', item);

    // if (item.discountDetails) {
    //   return [
    //     {
    //       amount: {type: item.discountDetails.linkAccount.openingBalanceType, amountForAccount: 10},
    //       calculationMethod: item.discountType,
    //       // discountValue: item.discountPercentage,
    //       name: item.name,
    //       particular: '',
    //     },
    //   ];
    // }
    return [{calculationMethod: 'FIX_AMOUNT', amount: {type: 'DEBIT', amountForAccount: 0}, name: '', particular: ''}];
  }

  getTaxesForEntry(item) {
    let taxArr = [];
    // console.log(' tax item is', item);
    if (item.taxDetailsArray) {
      for (let i = 0; i < item.taxDetailsArray.length; i++) {
        let tax = item.taxDetailsArray[i];
        let taxItem = {uniqueName: tax.uniqueName, calculationMethod: 'OnTaxableAmount'};
        taxArr.push(taxItem);
      }
      return taxArr;
    }
    return [];
  }
  getEntries() {
    let entriesArray = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      console.log('item is', item);
      let entry = {
        date: moment(this.state.date).format('DD-MM-YYYY'),
        discounts: this.getDiscountForEntry(item),
        // discounts: [
        //   {calculationMethod: 'FIX_AMOUNT', amount: {type: 'DEBIT', amountForAccount: 0}, name: '', particular: ''},
        // ],
        hsnNumber: item.hsnNumber == null ? '' : item.hsnNumber,
        purchaseOrderItemMapping: {uniqueName: '', entryUniqueName: ''},
        sacNumber: item.sacNumber == null ? '' : item.sacNumber,
        taxes: this.getTaxesForEntry(item),
        // taxes: [],
        transactions: [
          {
            account: {uniqueName: item.uniqueName, name: item.name},
            amount: {type: 'DEBIT', amountForAccount: Number(item.rate) * Number(item.quantity)},
          },
        ],
        voucherNumber: '',
        voucherType: 'purchase',
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  async createPurchaseBill() {
    this.setState({loading: true});
    try {
      console.log('came to this');
      let postBody = {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.BillFromAddress.address],
            countryName: 'India',
            gstNumber: this.state.BillFromAddress.gstNumber,
            panNumber: '',
            state: {code: this.state.BillFromAddress.state.code, name: this.state.BillFromAddress.state.name},
            stateCode: this.state.BillFromAddress.stateCode,
            stateName: this.state.BillFromAddress.stateName,
          },
          contactNumber: '',
          country: {countryName: 'India', countryCode: 'IN'},
          currency: {code: 'INR'},
          currencySymbol: '₹',
          email: '',
          mobileNumber: '',
          name: this.state.partyName.name,
          // shippingDetails: this.state.partyShippingAddress,
          shippingDetails: {
            address: [this.state.BillToAddress.address],
            countryName: 'India',
            gstNumber: this.state.BillToAddress.gstNumber,
            panNumber: '',
            state: {code: this.state.BillToAddress.state.code, name: this.state.BillToAddress.state.name},
            stateCode: this.state.BillToAddress.stateCode,
            stateName: this.state.BillToAddress.stateName,
          },
          uniqueName: this.state.partyName.uniqueName,
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: moment(this.state.date).format('DD-MM-YYYY'),
        // deposit: {
        //   type: 'DEBIT',
        //   accountUniqueName: this.state.selectedPayMode.uniqueName,
        //   amountForAccount: this.state.invoiceType == 'cash' ? 0 : this.state.amountPaidNowText,
        // },
        entries: this.getEntries(),
        // exchangeRate: 1,
        // passportNumber: '',
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
        // touristSchemeApplicable: false,
        type: 'purchase',
        attachedFiles: [],
        subVoucher: '',
        purchaseOrders: [],
        // updateAccountDetails: false,
        // voucherAdjustments: {adjustments: []},
        company: {
          billingDetails: {
            address: [this.state.shipFromAddress.address],
            countryName: 'India',
            gstNumber: this.state.shipFromAddress.gstNumber,
            panNumber: '',
            state: {code: this.state.shipFromAddress.state.code, name: this.state.shipFromAddress.state.name},
            stateCode: this.state.shipFromAddress.stateCode,
            stateName: this.state.shipFromAddress.stateName,
          },
          shippingDetails: {
            address: [this.state.shipToAddress.address],
            countryName: 'India',
            gstNumber: this.state.shipToAddress.gstNumber,
            panNumber: '',
            state: {code: this.state.shipToAddress.state.code, name: this.state.shipToAddress.state.name},
            stateCode: this.state.shipToAddress.stateCode,
            stateName: this.state.shipToAddress.stateName,
          },
        },
      };
      console.log('purchase bill postBody is', JSON.stringify(postBody));
      const results = await InvoiceService.createPurchaseBill(postBody, this.state.partyName.uniqueName);
      this.setState({loading: false});
      if (results.body) {
        // this.setState({loading: false});
        alert('Purchase Bill created successfully!');
        this.resetState();
        this.getAllTaxes();
        this.getAllDiscounts();
        this.getAllWarehouse();
        this.getAllAccountsModes();
        this.props.navigation.goBack();
        DeviceEventEmitter.emit(APP_EVENTS.PurchaseBillCreated, {});
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({isSearchingParty: false, loading: false});
    }
  }

  renderAmount() {
    return (
      <View style={{paddingVertical: 10, paddingHorizontal: 40}}>
        <Text style={style.invoiceAmountText}>{'₹' + this.getTotalAmount()}</Text>
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
    var fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let someDateTimeStamp = this.state.date;
    var dt = (dt = new Date(someDateTimeStamp)),
      date = dt.getDate(),
      month = months[dt.getMonth()],
      timeDiff = someDateTimeStamp - Date.now(),
      diffDays = new Date().getDate() - date,
      diffYears = new Date().getFullYear() - dt.getFullYear();

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

  handleConfirm = (date) => {
    // console.log('A date has been picked: ', date);
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState({date: moment(date)});
    this.hideDatePicker();
  };
  _renderDateView() {
    const {date, displayedDate} = this.state;

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
        <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => this.setState({showDatePicker: true})}>
          <Icon name={'Calendar'} color={'#FC8345'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{borderColor: '#D9D9D9', borderWidth: 1}}
          onPress={() =>
            this.state.date.startOf('day').isSame(moment().startOf('day'))
              ? this.getYesterdayDate()
              : this.getTodayDate()
          }>
          <Text style={{color: '#808080'}}>
            {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'8'} color={'#FC8345'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.props.navigation.navigate('SelectAddress', {
                addressArray: this.state.addressArray,
                type: 'address',
                selectAddress: this.selectBillFromAddress,
                color: '#FC8345',
              });
            }
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Billing From'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.BillFromAddress.address
              ? this.state.BillFromAddress.address
              : this.state.BillFromAddress.stateName
              ? this.state.BillFromAddress.stateName
              : 'Select Billing Address'}
          </Text>
          {/*Sender Address View*/}
        </TouchableOpacity>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.props.navigation.navigate('SelectAddress', {
                addressArray: this.state.addressArray,
                type: 'address',
                selectAddress: this.selectBillToAddress,
                color: '#FC8345',
              });
            }
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Billing To'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.BillToAddress.address
              ? this.state.BillToAddress.address
              : this.state.BillToAddress.stateName
              ? this.state.BillToAddress.stateName
              : 'Select Billing Address'}
          </Text>

          {/*Shipping Address View*/}
        </TouchableOpacity>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.props.navigation.navigate('SelectAddress', {
                addressArray: this.state.addressArray,
                type: 'address',
                selectAddress: this.selectShipFromAddress,
                color: '#FC8345',
              });
            }
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Shipping From'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.shipFromAddress.address
              ? this.state.shipFromAddress.address
              : this.state.shipFromAddress.stateName
              ? this.state.shipFromAddress.stateName
              : 'Select Shipping Address'}
          </Text>

          {/*Shipping Address View*/}
        </TouchableOpacity>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert('Please select a party.');
            } else {
              this.props.navigation.navigate('SelectAddress', {
                addressArray: this.state.addressArray,
                type: 'address',
                selectAddress: this.selectShipToAddress,
                color: '#FC8345',
              });
            }
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Shipping To'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.shipToAddress.address
              ? this.state.shipToAddress.address
              : this.state.shipToAddress.stateName
              ? this.state.shipToAddress.stateName
              : 'Select Shipping Address'}
          </Text>

          {/*Shipping Address View*/}
        </TouchableOpacity>
      </View>
    );
  }

  //https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice() {
    this.setState({invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false});
  }
  setCreditTypeInvoice() {
    this.setState({invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false});
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false,
    });
  };
  updateAddedItems = (addedItems) => {
    this.setState({addedItems: addedItems});
  };

  renderAddItemButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('PurchaseAddItem', {
            updateAddedItems: this.updateAddedItems,
            addedItems: this.state.addedItems,
          });
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
          width: '90%',
        }}>
        <AntDesign name={'plus'} color={'#FC8345'} size={18} style={{marginHorizontal: 8}} />
        <Text style={style.addItemMain}> Add Item</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Icon name={'Path-13016'} color="#FC8345" size={18} />
            <Text style={{marginLeft: 10}}>Select Product/Service</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('PurchaseAddItem', {
                updateAddedItems: this.updateAddedItems,
                addedItems: this.state.addedItems,
              });
            }}>
            <Icon name={'path-15'} color="#808080" size={18} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.addedItems}
          style={{paddingHorizontal: 10, paddingVertical: 10}}
          renderItem={({item}) => this.renderStockItem(item)}
        />
      </View>
    );
  }

  deleteItem = (item) => {
    let addedArray = this.state.addedItems;
    let itemUniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    let index = _.findIndex(
      addedArray,
      (e) => {
        let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    addedArray.splice(index, 1);
    this.setState({addedItems: addedArray, showItemDetails: false}, () => {});
  };

  renderRightAction(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.deleteItem(item);
        }}
        style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20}}>
        <AntDesign name={'delete'} size={16} color="#E04646" />
        <Text style={{color: '#E04646', marginLeft: 10}}>Delete</Text>
      </TouchableOpacity>
    );
  }

  renderStockItem(item) {
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          style={{backgroundColor: '#ffe0b2', padding: 10, borderRadius: 2, marginBottom: 10}}
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
          <Text style={{color: '#1C1C1C', paddingVertical: 10}}>{item.name} : </Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={{color: '#808080'}}>
                {String(item.quantity)} x {String(item.rate)}
              </Text>
            </View>
          </View>

          <Text style={{marginTop: 5, color: '#808080'}}>Tax : {this.calculatedTaxAmount(item)}</Text>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  onChangeTextBottomItemSheet(text, field) {
    let editItemDetails = this.state.editItemDetails;
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
    this.setState({editItemDetails});
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }

  calculateDiscountedAmount(itemDetails) {
    if (itemDetails.discountDetails) {
      let discountType = itemDetails.discountDetails.discountType;
      if (discountType == 'FIX_AMOUNT') {
        let discountAmount = Number(itemDetails.discountValue);
        return discountAmount;
      } else {
        let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
        let discountAmount = (Number(itemDetails.discountValue) * amt) / 100;
        return Number(discountAmount);
      }
    }
    return 0;
  }
  // calculatedTaxAmount(itemDetails) {
  //   let totalTax = 0;
  //   console.log('rate', itemDetails.rate);
  //   let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
  //   if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
  //     for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
  //       let item = itemDetails.taxDetailsArray[i];
  //       let taxPercent = Number(item.taxDetail[0].taxValue);
  //       let taxAmount = (taxPercent * Number(amt)) / 100;
  //       totalTax = totalTax + taxAmount;
  //     }
  //   }
  //   console.log('calculated tax is ', totalTax);
  //   return Number(totalTax);
  // }
  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    let taxArr = this.state.taxArray;
    if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        let item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            // console.log('tax value is ', taxArr[j].taxDetail[0].taxValue);
            let taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
            let taxAmount = (taxPercent * Number(amt)) / 100;
            totalTax = totalTax + taxAmount;
            break;
          }
        }
      }
    }
    // console.log('calculated tax is ', totalTax);
    return Number(totalTax);
  }

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      let discount = this.calculateDiscountedAmount(item);
      let tax = this.calculatedTaxAmount(item);

      //do inventory calulations

      let amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
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
          this.props.navigation.navigate('PurchaseBillOtherDetails', {
            warehouseArray: this.state.warehouseArray,
            setOtherDetails: this.setOtherDetails,
          });
        }}>
        <View style={{flexDirection: 'row'}}>
          <Icon style={{marginRight: 16}} name={'Sections'} size={16} color="#FC8345" />
          <Text style={{color: '#1C1C1C'}}>Other Details</Text>
        </View>
        <AntDesign name={'right'} size={18} color={'#808080'} />
      </TouchableOpacity>
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
          <View style={{flexDirection: 'row'}}>
            <Icon style={{marginRight: 10}} name={'Path-12190'} size={16} color="#FC8345" />
            <Text style={{color: '#1C1C1C'}}>Balance</Text>
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
              <Text style={{color: '#1C1C1C'}}>Total Amount</Text>
              <Text style={{color: '#1C1C1C'}}>{this.getTotalAmount()}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
              <Text style={{color: '#1C1C1C'}}>Balance Due</Text>
              <Text style={{color: '#1C1C1C'}}>{String(this.getTotalAmount()) - this.state.amountPaidNowText}</Text>
            </View>
          </View>
        )}

        <View style={{justifyContent: 'flex-end', flexDirection: 'row', marginTop: 20, margin: 16}}>
          <TouchableOpacity
            onPress={() => {
              this.genrateInvoice();
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  genrateInvoice() {
    if (!this.state.partyName) {
      alert('Please select a party.');
    } else if (this.state.addedItems.length == 0) {
      alert('Please select entries to proceed.');
    } else {
      this.createPurchaseBill();
    }
  }

  updateEditedItem(details) {
    let itemUniqueName = details.item.stock ? details.item.stock.uniqueName : details.item.uniqueName;

    let addedArray = this.state.addedItems;
    let index = _.findIndex(
      addedArray,
      (e) => {
        let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    let item = this.state.addedItems[index];
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
    item.warehouse = Number(details.warehouse);
    item.discountDetails = details.discountDetails ? details.discountDetails : undefined;
    item.taxDetailsArray = details.taxDetailsArray;

    // Replace item at index using native splice
    addedArray.splice(index, 1, item);
    this.setState({showItemDetails: false, addedItems: addedArray}, () => {});
    // this.setState({ addedItems: addedItems })
    // this.setState({showItemDetails:false})
  }
  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      //   <View style={{flex: 1, backgroundColor: 'lightBlue', justifyContent: 'center', alignItems: 'center'}}>
      //     <Text>Hello</Text>
      //   </View>
      <View style={{flex: 1}}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          style={[{flex: 1, backgroundColor: 'white'}, {marginBottom: this.keyboardMargin}]}
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
            onPress={() => console.log(this.state.otherDetails)}></TouchableOpacity> */}
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
                top: 0,
              }}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          )}
        </Animated.ScrollView>
        {this.state.showItemDetails && (
          <PurchaseItemEdit
            discountArray={this.state.discountArray}
            taxArray={this.state.taxArray}
            goBack={() => {
              this.setState({showItemDetails: false});
            }}
            itemDetails={this.state.itemDetails}
            updateItems={(details) => {
              this.updateEditedItem(details);
            }}
          />
        )}
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

  return <PurchaseBill {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
