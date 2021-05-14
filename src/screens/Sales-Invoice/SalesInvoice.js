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
  PermissionsAndroid,
  Alert,
} from 'react-native';
import style from './style';
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
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {ScrollView} from 'react-native-gesture-handler';
import EditItemDetail from './EditItemDetails';
import routes from '@/navigation/routes';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';

const {SafeAreaOffsetHelper} = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash',
};
interface Props {
  navigation: any;
}

const {width, height} = Dimensions.get('window');

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
      partyBillingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: '',
        },
        stateCode: '',
        stateName: '',
      },
      partyShippingAddress: {
        address: '',
        gstNumber: '',
        state: {
          code: '',
          name: '',
        },
        stateCode: '',
        stateName: '',
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
      ShareModal: false,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setOtherDetails = (data) => {
    this.setState({otherDetails: data});
  };

  selectBillingAddress = (address) => {
    console.log(address);
    this.setState({partyBillingAddress: address});
  };
  selectShippingAddress = (address) => {
    console.log('shipping add', address);
    this.setState({partyShippingAddress: address});
  };
  // func1 = async () => {
  //   const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
  //   console.log(activeCompany);
  // };
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#0E7942" barStyle="light-content" /> : null;
  };

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      await this.resetState();
    });

    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
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
            <Text style={style.invoiceType}>
              {this.state.invoiceType == INVOICE_TYPE.credit ? 'Sales Invoice' : 'Cash Invoice'}
            </Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{marginRight: 16, alignSelf: 'center'}}
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
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}> */}
          <Icon name={'Profile'} color={'#A6D8BF'} style={{margin: 16}} size={16} />
          <TextInput
            placeholderTextColor={'#A6D8BF'}
            placeholder={this.state.invoiceType == 'cash' ? 'Enter Party Name' : 'Search Party Name'}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) => {
              this.state.invoiceType == INVOICE_TYPE.credit
                ? (this.setState({searchPartyName: text}), this.searchCalls())
                : this.setState({searchPartyName: text, partyName: {name: text, uniqueName: 'cash'}});
            }}
            style={style.searchTextInputStyle}
          />
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
      <Modal animationType="none" transparent={true} visible={true}>
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
      </Modal>
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
          addressArray: results.body.addresses,
          partyBillingAddress: results.body.addresses[0],
          partyShippingAddress: results.body.addresses[0],
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
      // selectedArrayType: [],
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
      ShareModal: false,
    });
  };
  getDiscountForEntry(item) {
    // console.log('item is', item);
    let discountArr = [];
    if (item.fixedDiscount) {
      let discountItem = {
        calculationMethod: 'FIX_AMOUNT',
        amount: {type: 'DEBIT', amountForAccount: item.fixedDiscount.discountValue},
        discountValue: item.fixedDiscount.discountValue,
        name: '',
        particular: '',
      };
      discountArr.push(discountItem);
    }
    if (item.percentDiscountArray) {
      if (item.percentDiscountArray.length > 0) {
        for (let i = 0; i < item.percentDiscountArray.length; i++) {
          let discountItem = {
            calculationMethod: 'PERCENTAGE',
            amount: {type: 'DEBIT', amountForAccount: item.percentDiscountArray[i].discountValue},
            name: item.percentDiscountArray[i].name,
            uniqueName: item.percentDiscountArray[i].uniqueName,
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
        {calculationMethod: 'FIX_AMOUNT', amount: {type: 'DEBIT', amountForAccount: 0}, name: '', particular: ''},
      ];
    }
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
            stock: item.stock
              ? {
                  quantity: item.quantity,
                  sku: item.stock.skuCode,
                  name: item.stock.name,

                  uniqueName: item.stock.uniqueName,
                  rate: {
                    amountForAccount: Number(item.rate),
                  },
                  stockUnit: {
                    code: item.stock.stockUnitCode,
                  },
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

  async createInvoice(type) {
    this.setState({loading: true});
    try {
      console.log('came to this');
      let postBody = {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: 'India',
            gstNumber: this.state.partyBillingAddress.gstNumber,
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.size > 0 ? this.state.partyBillingAddress.state.code : '',
              name: this.state.partyBillingAddress.size > 0 ? this.state.partyBillingAddress.state.name : '',
            },
            stateCode: this.state.partyBillingAddress.stateCode,
            stateName: this.state.partyBillingAddress.stateName,
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
            address: [this.state.partyShippingAddress.address],
            countryName: 'India',
            gstNumber: this.state.partyShippingAddress.gstNumber,
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.size > 0 ? this.state.partyShippingAddress.state.code : '',
              name: this.state.partyShippingAddress.size > 0 ? this.state.partyShippingAddress.state.name : '',
            },
            stateCode: this.state.partyShippingAddress.stateCode,
            stateName: this.state.partyShippingAddress.stateName,
          },
          uniqueName: this.state.partyName.uniqueName,
          customerName: this.state.partyName.name,
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: moment(this.state.date).format('DD-MM-YYYY'),
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.invoiceType == 'cash' ? 0 : this.state.amountPaidNowText,
        },
        entries: this.getEntries(),
        exchangeRate: 1,
        passportNumber: '',
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
        touristSchemeApplicable: false,
        type: this.state.invoiceType,
        updateAccountDetails: false,
        voucherAdjustments: {adjustments: []},
      };
      console.log('postBody is', JSON.stringify(postBody));
      const results = await InvoiceService.createInvoice(
        postBody,
        this.state.partyName.uniqueName,
        this.state.invoiceType,
      );
      if (type != 'share') {
        this.setState({loading: false});
      }
      if (results.body) {
        // this.setState({loading: false});
        alert('Invoice created successfully!');
        const partyDetails = this.state.partyDetails;
        const invoiceType = this.state.invoiceType;
        // Here for cash invoice party detail is empty {}
        this.resetState();
        await this.getAllTaxes();
        await this.getAllDiscounts();
        await this.getAllWarehouse();
        await this.getAllAccountsModes();
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
                  country: {code: partyDetails.country.countryCode},
                  mobileNo: partyDetails.mobileNo,
                },
                type: 'Creditors',
              },
            });
          }
        }
        if (type == 'share') {
          console.log('sharing');
          this.downloadFile(results.body.entries[0].voucherType, results.body.entries[0].voucherNumber);
        }
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
          <Icon name={'Calendar'} color={'#229F5F'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2}}
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
          <Icon name={'8'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            this.state.invoiceType == INVOICE_TYPE.cash
              ? this.props.navigation.navigate('EditAddress', {
                  addressArray: this.state.partyBillingAddress,
                  selectAddress: this.selectBillingAddress.bind(this),
                  statusBarColor: '#0E7942',
                })
              : !this.state.partyName
              ? alert('Please select a party.')
              : this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.addressArray,
                  type: 'address',
                  selectAddress: this.selectBillingAddress,
                  statusBarColor: '#0E7942',
                });
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Billing Address'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.partyBillingAddress.address
              ? this.state.partyBillingAddress.address
              : this.state.partyBillingAddress.stateName
              ? this.state.partyBillingAddress.stateName
              : 'Select Billing Address'}
          </Text>
          {/*Sender Address View*/}
        </TouchableOpacity>
        <TouchableOpacity
          style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}
          onPress={() => {
            this.state.invoiceType == INVOICE_TYPE.cash
              ? this.props.navigation.navigate('EditAddress', {
                  addressArray: this.state.partyShippingAddress,
                  selectAddress: this.selectShippingAddress.bind(this),
                  statusBarColor: '#0E7942',
                })
              : !this.state.partyName
              ? alert('Please select a party.')
              : this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.addressArray,
                  type: 'address',
                  selectAddress: this.selectShippingAddress,
                  statusBarColor: '#0E7942',
                });
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text numberOfLines={2} style={style.senderAddressText}>
              {'Shipping Address'}
            </Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>
            {this.state.partyShippingAddress.address
              ? this.state.partyShippingAddress.address
              : this.state.partyShippingAddress.stateName
              ? this.state.partyShippingAddress.stateName
              : 'Select Shipping Address'}
          </Text>

          {/*Shipping Address View*/}
        </TouchableOpacity>
      </View>
    );
  }

  //https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice = async () => {
    await this.resetState();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    await this.setState({invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false});
  };
  setCreditTypeInvoice = async () => {
    await this.resetState();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    await this.setState({invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false});
  };

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
    // console.log('item is ', item);
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
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
          <View style={{flexDirection: 'row', paddingVertical: 10}}>
            <Text style={{color: '#1C1C1C'}}>{item.name} </Text>
            {item.stock && (
              <Text numberOfLines={1} style={{color: '#1C1C1C', width: '75%'}}>
                ( {item.stock.name} ) :
              </Text>
            )}
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={{color: '#808080'}}>
                {String(item.quantity)} x {item.currency.symbol}
                {String(item.rate)}
              </Text>
            </View>
          </View>

          <Text style={{marginTop: 5, color: '#808080'}}>
            Tax : {item.currency.symbol}
            {this.calculatedTaxAmount(item)}
          </Text>
          <Text style={{marginTop: 5, color: '#808080'}}>
            Discount : {item.currency.symbol}
            {item.discountValue ? item.discountValue : 0}
          </Text>
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
    // if (itemDetails.fixedDiscount.discountValue != undefined) {
    //   totalDiscount = totalDiscount + itemDetails.fixedDiscount.discountValue;
    // }
    if (itemDetails.percentDiscountArray && itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
      }
      // console.log(percentDiscount, 'total % discount');
      let amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      // console.log('amt is ', amt);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    console.log(totalDiscount, 'is the discount');
    return totalDiscount;
  }

  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    console.log('rate', itemDetails.rate);
    let taxArr = this.state.taxArray;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        let item = itemDetails.taxDetailsArray[i];
        let taxPercent = Number(item.taxDetail[0].taxValue);
        let taxAmount = (taxPercent * Number(amt)) / 100;
        totalTax = totalTax + taxAmount;
      }
    }
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

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      let discount = item.discountValue ? item.discountValue : 0;
      let tax = this.calculatedTaxAmount(item);
      let amount = Number(item.rate) * Number(item.quantity);
      total = total + amount - discount + tax;
    }
    return total.toFixed(2);
  }

  downloadFile = async (voucherName, voucherNo) => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.onShare(voucherName, voucherNo);
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onShare = async (voucherName, voucherNo) => {
    try {
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'POST',
        `https://api.giddh.com/company/${activeCompany}/accounts/${this.state.partyDetails.uniqueName}/vouchers/download-file?fileType=pdf`,
        {
          'session-id': `${token}`,
          'Content-Type': 'application/json',
        },
        JSON.stringify({
          voucherNumber: [`${voucherNo}`],
          voucherType: `${voucherName}`,
        }),
      )
        .then((res) => {
          let base64Str = res.base64();
          let pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          this.setState({loading: false});
        })
        .then(() => {
          Share.open({
            title: 'This is the report',
            message: 'Message:',
            url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${voucherNo}.pdf`,
            subject: 'Transaction report',
          })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              // err && console.log(err);
            });
        });
    } catch (e) {
      this.setState({loading: false});
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
          marginTop: 8,
        }}
        onPress={() => {
          this.props.navigation.navigate('InvoiceOtherDetailScreen', {
            warehouseArray: this.state.warehouseArray,
            setOtherDetails: this.setOtherDetails,
            otherDetails: this.state.otherDetails,
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

  _renderPaymentMode() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showPaymentModePopup}
        onRequestClose={() => {
          this.setState({showPaymentModePopup: false});
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
            this.setState({showPaymentModePopup: false});
          }}>
          <View style={{backgroundColor: 'white', borderRadius: 10, padding: 10, alignSelf: 'center'}}>
            {this.state.invoiceType == 'sales' && (
              <TextInput
                value={this.state.amountPaidNowText}
                keyboardType="number-pad"
                placeholder="Enter Amount"
                onChangeText={(text) => {
                  if (Number(text) > Number(this.getTotalAmount())) {
                    Alert.alert('Alert', 'deposit amount should not be more than invoice amount');
                  } else {
                    this.setState({amountPaidNowText: text});
                  }
                }}
              />
            )}
            <FlatList
              data={this.state.modesArray}
              style={{paddingLeft: 5, paddingRight: 10, paddingBottom: 10, maxHeight: 300}}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={{
                    borderBottomWidth: this.state.selectedPayMode.uniqueName == item.uniqueName ? 2 : 0,
                    borderColor: '#229F5F',
                    alignSelf: 'flex-start',
                    // backgroundColor: 'pink',
                    width: '100%',
                  }}
                  onFocus={() => this.onChangeText('')}
                  onPress={async () => {
                    this.setState({selectedPayMode: item});
                    if (this.state.amountPaidNowText != 0) {
                      this.setState({showPaymentModePopup: false});
                    }
                  }}>
                  <Text style={{color: '#1C1C1C', paddingVertical: 10, textAlign: 'left'}}>{item.name}</Text>
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
              <Text style={{color: '#1C1C1C'}}>
                {this.state.addedItems.length > 0 && this.state.addedItems[0].currency.symbol}
                {this.getTotalAmount()}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: this.state.invoiceType == 'cash' ? 10 : 4,
                // backgroundColor: 'pink',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (this.state.modesArray.length > 0) {
                    this.setState({showPaymentModePopup: true});
                  }
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{color: '#808080', borderBottomWidth: 1, borderBottomColor: '#808080', marginRight: 5}}>
                    {this.state.selectedPayMode.name}
                  </Text>
                  <Icon style={{transform: [{rotate: '0deg'}]}} name={'9'} size={16} color="#808080"></Icon>
                </View>
              </TouchableOpacity>
              {this.state.invoiceType == 'cash' ? (
                <Text style={{color: '#1C1C1C'}}>{this.getTotalAmount()}</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({showPaymentModePopup: true});
                  }}>
                  <Text style={{color: '#1C1C1C'}}>
                    {this.state.addedItems.length > 0 &&
                      this.state.addedItems[0].currency.symbol + this.state.amountPaidNowText}
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

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
              <Text style={{color: '#1C1C1C'}}>Invoice Due</Text>
              <Text style={{color: '#1C1C1C'}}>
                {this.state.addedItems.length > 0 && this.state.addedItems[0].currency.symbol}
                {this.state.invoiceType == 'cash' ? 0 : String(this.getTotalAmount()) - this.state.amountPaidNowText}
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
            alignItems: 'center',
          }}>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: '#5773FF',
                paddingVertical: 8,
                paddingHorizontal: 7,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginBottom: 3,
              }}
              onPress={() => {
                this.genrateInvoice('new');
              }}>
              <Text style={{color: 'white'}}>Create and New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#5773FF',
                paddingVertical: 8,
                paddingHorizontal: 7,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
              }}
              onPress={() => {
                this.genrateInvoice('share');
              }}>
              <Text style={{color: 'white'}}>Create and Share</Text>
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
    } else {
      this.createInvoice(type);
    }
  }

  updateEditedItem(details, selectedArrayType) {
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
    item.hsnNumber = details.hsnNumber;
    item.sacNumber = details.sacNumber;
    item.warehouse = Number(details.warehouse);
    item.discountDetails = details.discountDetails ? details.discountDetails : undefined;
    item.taxDetailsArray = details.taxDetailsArray;
    item.percentDiscountArray = details.percentDiscountArray ? details.percentDiscountArray : [];
    item.fixedDiscount = details.fixedDiscount ? details.fixedDiscount : {discountValue: 0};
    item.fixedDiscountUniqueName = details.fixedDiscountUniqueName ? details.fixedDiscountUniqueName : '';
    item.selectedArrayType = selectedArrayType;
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
              onPress={() => console.log(this.state.partyBillingAddress)}></TouchableOpacity> */}
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
          <EditItemDetail
            discountArray={this.state.discountArray}
            taxArray={this.state.taxArray}
            goBack={() => {
              this.setState({showItemDetails: false});
            }}
            // selectedArrayType={this.state.itemDetails.selectedArrayType}
            itemDetails={this.state.itemDetails}
            updateItems={(details, selectedArr) => {
              this.updateEditedItem(details, selectedArr);
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

  return <SalesInvoice {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
