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
} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import DateRangePicker from 'react-native-daterange-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {ScrollView} from 'react-native-gesture-handler';
import EditItemDetail from './EditItemDetails';
const {SafeAreaOffsetHelper} = NativeModules;
const INVOICE_TYPE = {
  credit: 'Sales',
  cash: 'Cash',
};
interface Props {
  navigation: any;
}

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class SalesInvoice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
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
      showDatePicker: true,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: '',
      itemDetails: undefined,
      warehouseArray: [],
      fetechingWarehouseList: false,
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
      otherDetails: {},
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setOtherDetails = (data) => {
    this.setState({otherDetails: data});
  };

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
      this.updateAddedItems(data);
      // fire logout action
      // store.dispatch.auth.logout();
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
          <TouchableOpacity
            style={style.invoiceTypeButton}
            onPress={() => {
              if (this.state.invoiceType == INVOICE_TYPE.credit) {
                this.setCashTypeInvoice();
              } else {
                this.setCreditTypeInvoice();
              }
              // this.setState({ showInvoiceModal: true })
            }}>
            <Text style={style.invoiceType}>
              {this.state.invoiceType == INVOICE_TYPE.credit ? 'Sales Invoice' : 'Cash Invoice'}
            </Text>
            <Icon style={{marginLeft: 4}} name={'9'} color={'white'} />
          </TouchableOpacity>
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
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
          <View style={{backgroundColor: 'white', marginTop: 70, marginHorizontal: 40, borderRadius: 10}}>
            <TouchableOpacity
              style={{height: 50, justifyContent: 'center', paddingHorizontal: 20}}
              onPress={() => this.setCashTypeInvoice()}>
              <Text style={{color: this.state.invoiceType == 'Cash' ? '#5773FF' : 'black'}}>Cash Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{height: 50, justifyContent: 'center', paddingHorizontal: 20}}
              onPress={() => this.setCreditTypeInvoice()}>
              <Text style={{color: this.state.invoiceType == 'Credit' ? '#5773FF' : 'black'}}>Credit Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderSelectPartyName() {
    return (
      <View onLayout={this.onLayout} style={{flexDirection: 'row', minHeight: 50}} onPress={() => {}}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={'Profile'} color={'#A6D8BF'} style={{margin: 16}} size={16} />
            <TextInput
              placeholderTextColor={'#A6D8BF'}
              placeholder={'Search Party Name'}
              returnKeyType={'done'}
              value={this.state.searchPartyName}
              onChangeText={(text) =>
                this.setState({searchPartyName: text}, () => {
                  this.searchCalls();
                })
              }
              style={style.searchTextInputStyle}
            />
          </View>
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
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
      <View style={[style.searchResultContainer, {top: this.state.searchTop + 6}]}>
        <FlatList
          data={this.state.searchResults}
          style={{paddingHorizontal: 20, paddingVertical: 10}}
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
                    Keyboard.dismiss();
                  },
                );
              }}>
              <Text style={{color: '#1C1C1C', paddingVertical: 10}}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  async searchUser() {
    this.setState({isSearchingParty: true});
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrydebtors', false);

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
          partyBillingAddress: results.body.addresses[0],
          partyShippingAddress: results.body.addresses[0],
        });
      }
    } catch (e) {
      this.setState({searchResults: [], searchError: 'No Results', isSearchingParty: false});
    }
  }

  getDiscountForEntry(item) {
    return {
      amount: {type: item.discountDetails.linkAccount.openingBalanceType, amountForAccount: 10},
      calculationMethod: item.discountType,
      discountValue: item.discountPercentage,
      name: item.name,
      particular: '',
    };
  }

  getTaxesForEntry(item) {
    for (let i = 0; i < item.taxDetailsArray.length; i++) {
      let tax = itemDetails.taxDetailsArray[i];
      return {uniqueName: tax.uniqueName, calculationMethod: 'OnTaxableAmount'};
    }
  }
  getEntries() {
    let entriesArray = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      let entry = {
        date: moment(this.state.date).format('MM-DD-YYYY'),
        discounts: this.getDiscountForEntry(item),
        hsnNumber: itemDetails.hsnNumber,
        sacNumber: itemDetails.sacNumber,
        taxes: this.getTaxesForEntry(item),
        transactions: [
          {
            account: {uniqueName: item.uniqueName, name: item.name},
            amount: {type: 'DEBIT', amountForAccount: Number(item.rate) * Number(item.quantity)},
          },
        ],
        voucherNumber: '',
        voucherType: this.state.invoiceType,
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  async createInvoice() {
    this.setState({loading: true});
    try {
      let postBody = {
        account: {
          attentionTo: '',
          billingDetails: this.state.partyBillingAddress,
          contactNumber: '',
          country: {countryName: 'India', countryCode: 'IN'},
          currency: {code: 'INR'},
          currencySymbol: '₹',
          email: '',
          mobileNumber: '',
          billingDetails: this.state.partyShippingAddress,
          uniqueName: this.state.partyName.uniqueName,
          name: this.state.partyName.name,
        },
        date: moment(this.state.date).format('MM-DD-YYYY'),
        dueDate: '',
        deposit: {type: 'DEBIT', accountUniqueName: '', amountForAccount: 0},
        entiries: this.getEntries(),
        exchangeRate: 1,
        passportNumber: '',
        templateDetails: {
          other: {shippingDate: '', shippedVia: null, trackingNumber: null, customField1: null, customField2: null},
        },
        touristSchemeApplicable: false,
        type: this.state.invoiceType,
        updateAccountDetails: false,
        voucherAdjustments: {adjustments: []},
      };
      const results = await InvoiceService.createInvoice(postBody);
      this.setState({loading: false});

      debugger;
      if (results.body) {
        this.setState({loading: false});
        alert('Invoice created successfully!');
        this.props.navigation.goBack();
      }
    } catch (e) {
      this.setState({isSearchingParty: false});
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
  _renderDateView() {
    const {date, displayedDate} = this.state;

    return (
      <DateRangePicker
        onChange={this.onDateChange}
        date={date}
        open={this.state.showDatePicker}
        displayedDate={displayedDate}
        buttonStyle={style.dateView}>
        <View style={style.dateView}>
          <View style={{flexDirection: 'row'}}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{this.formatDate()}</Text>
          </View>
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
      </DateRangePicker>
    );
  }

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'8'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() =>
            this.props.navigation.navigate('SelectAddress', {
              addressArray: this.state.partyBillingAddress,
              type: 'address',
            })
          }>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Billing Address'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.partyBillingAddress.address ? this.state.partyBillingAddress.address : 'Select Billing Address'}
          </Text>
          {/*Sender Address View*/}
        </TouchableOpacity>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() =>
            this.props.navigation.navigate('SelectAddress', {
              addressArray: this.state.partyShippingAddress,
              type: 'address',
            })
          }>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Shipping Address'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.partyShippingAddress.address
              ? this.state.partyShippingAddress.address
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
          this.props.navigation.navigate('AddInvoiceItemScreen', {
            updateAddedItems: this.updateAddedItems,
            addedItems: this.state.addedItems,
          });
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
          width: '90%',
        }}>
        <AntDesign name={'plus'} color={'#229F5F'} size={18} style={{marginHorizontal: 8}} />
        <Text style={style.addItemMain}> Add Item</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Icon name={'Path-13016'} color="#229F5F" size={18} />
            <Text style={{marginLeft: 10}}>Select Product/Service</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('AddInvoiceItemScreen', {
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

  renderRightAction() {
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
        renderRightActions={() => this.renderRightAction()}>
        <TouchableOpacity
          style={{backgroundColor: '#E0F2E9', padding: 10, borderRadius: 2, marginBottom: 10}}
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
          <Text style={{color: '#1C1C1C', paddingVertical: 10}}>{item.name}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text>
                {item.stock
                  ? `${String(item.quantity)} pcs x ${String(item.rate)} `
                  : `${String(item.quantity)} x ${String(item.rate)}`}
              </Text>
            </View>
          </View>
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
  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        let item = itemDetails.taxDetailsArray[i];
        let taxPercent = Number(item.taxDetail[0].taxValue);
        let taxAmount = (taxPercent * Number(amt)) / 100;
        totalTax = totalTax + taxAmount;
      }
    }
    return Number(totalTax);
  }

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      let discount = this.calculateDiscountedAmount(item);
      let tax = this.calculatedTaxAmount(item);
      let amount = Number(item.rate) * Number(item.quantity);
      //do inventory calulations
      if (item.rate) {
        total = total + amount - discount + tax;
      }
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
          this.props.navigation.navigate('InvoiceOtherDetailScreen', {
            warehouseArray: this.state.warehouseArray,
            setOtherDetails: this.setOtherDetails,
          });
        }}>
        <View style={{flexDirection: 'row'}}>
          <Icon style={{marginRight: 16}} name={'Sections'} size={16} color="#229F5F" />
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
            <Icon style={{marginRight: 10}} name={'Path-12190'} size={16} color="#229F5F" />
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
              <Text style={{color: '#808080', borderBottomWidth: 1, borderBottomColor: '#808080'}}>Payment Mode</Text>
              <TextInput
                style={{borderBottomWidth: 1, borderBottomColor: '#808080'}}
                placeholder="00000.00"
                returnKeyType={'done'}
                keyboardType="number-pad"
                value={this.state.amountPaidNowText}
                onChangeText={(text) => {
                  this.setState({amountPaidNowText: text});
                }}
              />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
              <Text style={{color: '#1C1C1C'}}>Invoice Due</Text>
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
      this.createInvoice();
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
      <Animated.ScrollView
        keyboardShouldPersistTaps="always"
        style={[{flex: 1, backgroundColor: 'white'}, {marginBottom: this.keyboardMargin}]}
        bounces={false}>
        <View style={style.container}>
          <View style={style.headerConatiner}>
            {this.renderHeader()}
            {this.renderSelectPartyName()}
            {this.renderAmount()}
          </View>
          {this._renderDateView()}
          {this._renderAddress()}
          {this.state.addedItems.length > 0 ? this._renderSelectedStock() : this.renderAddItemButton()}
          {this.state.addedItems.length > 0 && this._renderTotalAmount()}
          {this._renderOtherDetails()}
          {this.state.showInvoiceModal && this.renderInvoiceTypeModal()}
          <TouchableOpacity
            style={{height: 60, width: 60, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.otherDetails)}></TouchableOpacity>
        </View>
        {this.state.showItemDetails && (
          <EditItemDetail
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
        {this.state.searchResults.length > 0 && this._renderSearchList()}
        {this.state.loading && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
            }}>
            <Bars size={15} color={color.PRIMARY_NORMAL} />
          </View>
        )}
      </Animated.ScrollView>
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

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(SalesInvoice);
export default MyComponent;
