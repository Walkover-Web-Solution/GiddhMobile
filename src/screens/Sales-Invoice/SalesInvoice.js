import React from 'react';
import { GDContainer } from '@/core/components/container/container.component';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, Keyboard, ActivityIndicator, DeviceEventEmitter, Animated, Dimensions, Alert } from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateRangePicker from 'react-native-daterange-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ScrollView } from 'react-native-gesture-handler';

const INVOICE_TYPE = {
  credit: 'Credit',
  cash: 'Cash'
}
interface Props {
  navigation: any;
}

export class SalesInvoice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
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
      itemDetails: undefined,
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
      fetechingDiscountList:false,
      fetechingTaxList:false,
      discountArray:[],
      taxArray:[]

    };
  }

  componentDidMount() {
    this.getAllTaxes();
    this.getAllDiscounts();
    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
      this.updateAddedItems(data)
      // fire logout action
      // store.dispatch.auth.logout();
    });
  }

  renderHeader() {
    return (
      <View style={[style.header, { paddingTop: 10, }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={{ padding: 10 }} onPress={() => {
            this.props.navigation.goBack()
          }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton} onPress={() => {
            this.setState({ showInvoiceModal: true })
          }}>
            <Text style={style.invoiceType}>{'Sales Invoice'}</Text>
            <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} />
          </TouchableOpacity>
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
      </View>
    )
  }

  renderInvoiceTypeModal() {
    return (
      <Modal
        isVisible={this.state.showInvoiceModal}
        backdropColor={'black'}
        animationIn='fadeIn'
        transparent={true}

        animationOut='fadeOut'
        style={{ position: 'absolute', elevation: 10, justifyContent: 'center', alignItems: 'center', right: 0, left: 0, bottom: 0, top: 0, }}>
        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'hidden', alignSelf: 'center', width: '100%', height: '100%' }}>
          <View style={{ backgroundColor: 'white', marginTop: 70, marginHorizontal: 40, borderRadius: 10 }}>
            <TouchableOpacity style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }} onPress={() => this.setCashTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Cash' ? '#5773FF' : 'black' }}>Cash Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }} onPress={() => this.setCreditTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Credit' ? '#5773FF' : 'black' }}>Credit Invoice</Text>
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

    )
  }

  renderSelectPartyName() {
    return (
      <View onLayout={this.onLayout} style={{ flexDirection: 'row', minHeight: 50 }} onPress={() => {

      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', }}>
            <Icon name={'Profile'} color={'#A6D8BF'} style={{ margin: 16 }} size={16} />
            <TextInput
              placeholderTextColor={'#A6D8BF'}
              placeholder={'Search Party Name'}

              value={this.state.searchPartyName}
              onChangeText={text => this.setState({ searchPartyName: text }, () => {
                this.searchCalls();
              })}
              style={style.searchTextInputStyle} />
          </View>
          <ActivityIndicator color={'white'} size='small' animating={this.state.isSearchingParty} />

        </View>
      </View>
    )
  }
  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y
    })
  }
  searchCalls = _.debounce(this.searchUser, 2000);


  async getAllDiscounts(){
    this.setState({ fetechingDiscountList: true })
    try {
      const results = await InvoiceService.getDiscounts();
      debugger
      if (results.body && results.status == 'success') {
        this.setState({ discountArray: results.body, fetechingDiscountList: false, })
      }
    } catch (e) {
      this.setState({ fetechingDiscountList: false });
    }
  }

  async getAllTaxes() {
    this.setState({ fetechingTaxList: true })
    try {
      const results = await InvoiceService.getTaxes();
      debugger
      if (results.body && results.status == 'success') {
        this.setState({ taxArray: results.body, fetechingTaxList: false, })
      }
    } catch (e) {
      this.setState({ fetechingTaxList: false });
    }
  }


  getTaxDeatilsForUniqueName(uniqueName){
    var filtered = _.filter(this.state.taxArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
      });
      if (filtered.length > 0){
        return filtered[0].taxDetail
      } 
      return undefined;
  }

  getDiscountDeatilsForUniqueName(uniqueName){
    var filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
      });
      if (filtered.length > 0){
        return filtered[0]
      } 
      return undefined;
  }
  _renderSearchList() {
    return (
      <View style={[style.searchResultContainer, { top: this.state.searchTop + 6 }]}>
        <FlatList
          data={this.state.searchResults}
          style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{}}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                this.setState({ partyName: item, searchResults: [], searchPartyName: item.name, searchError: '', isSearchingParty: false, }, () => {
                  this.searchAccount();
                  Keyboard.dismiss();
                })

              }}>
              <Text style={{ color: '#1C1C1C', paddingVertical: 10 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )
  }

  async searchUser() {
    this.setState({ isSearchingParty: true })
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrydebtors', false);
      debugger
      if (results.body && results.body.results) {
        this.setState({ searchResults: results.body.results, isSearchingParty: false, searchError: '' })
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });

    }
  }

  async searchAccount() {
    this.setState({ isSearchingParty: true })
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);
      debugger
      if (results.body) {
        this.setState({ partyDetails: results.body, isSearchingParty: false, searchError: '', partyBillingAddress: results.body.addresses[0], partyShippingAddress: results.body.addresses[0] })
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingParty: false });

    }
  }
  renderAmount() {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 40 }}>
        <Text style={style.invoiceAmountText}>{'₹' + this.state.invoiceAmount}</Text>
      </View>
    )
  }

  getSelectedDateDisplay() {

  }
  getYesterdayDate() {

    this.setState({ date: moment().subtract(1, 'days') })
  }

  formatDate() {
    var fulldays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let someDateTimeStamp = this.state.date;
    var dt = dt = new Date(someDateTimeStamp),
      date = dt.getDate(),
      month = months[dt.getMonth()],
      timeDiff = someDateTimeStamp - Date.now(),
      diffDays = new Date().getDate() - date,
      diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return "Today";
    } else if (diffYears === 0 && diffDays === 1) {
      return "Yesterday";
    } else if (diffYears === 0 && diffDays === -1) {
      return "Tomorrow";
    } else if (diffYears === 0 && (diffDays < -1 && diffDays > -7)) {
      return fulldays[dt.getDay()];
    } else if (diffYears >= 1) {
      return month + " " + date + ", " + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + " " + date;
    }
  }
  _renderDateView() {
    const { date, displayedDate } = this.state;

    return (
      <DateRangePicker
        onChange={this.onDateChange}
        date={date}
        open={this.state.showDatePicker}
        displayedDate={displayedDate}
        buttonStyle={style.dateView}
      >
        <View style={style.dateView}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'Calendar'} color={'#229F5F'} size={16} />
            <Text style={style.selectedDateText}>{this.formatDate()}</Text>
          </View>
          <TouchableOpacity style={{ borderColor: '#D9D9D9', borderWidth: 1 }} onPress={() => this.getYesterdayDate()}>
            <Text style={{ color: '#808080' }}>{'Yesterday'}</Text>

          </TouchableOpacity>
        </View>
      </DateRangePicker>


    )
  }

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'8'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Address'}</Text>
        </View>
        <TouchableOpacity style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={2} style={style.senderAddressText}>{'Billing Address'}</Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <Text numberOfLines={2} style={style.selectedAddressText}>{this.state.partyBillingAddress.address ? this.state.partyBillingAddress.address : 'Select Billing Address'}</Text>
          {/*Sender Address View*/}
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={2} style={style.senderAddressText}>{'Shipping Address'}</Text>
            <AntDesign name={'right'} size={18} color={'#808080'} />
          </View>
          <Text numberOfLines={2} style={style.selectedAddressText}>{this.state.partyShippingAddress.address ? this.state.partyShippingAddress.address : 'Select Shipping Address'}</Text>

          {/*Shipping Address View*/}
        </TouchableOpacity>
      </View>
    )
  }

  //https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false })
  }
  setCreditTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.credit, showInvoiceModal: false })
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false
    });
  };
  updateAddedItems = (addedItems) => {
    this.setState({ addedItems: addedItems })
  }

  renderAddItemButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('AddInvoiceItemScreen', { updateAddedItems: this.updateAddedItems, addedItems: this.state.addedItems })
        }}
        style={{ marginVertical: 16, paddingVertical: 10, flexDirection: 'row', borderColor: '#229F5F', borderWidth: 1, alignSelf: 'center', justifyContent: 'center', width: '90%' }}>
        <AntDesign name={'plus'} color={'#229F5F'} size={18} style={{ marginHorizontal: 10 }} />
        <Text>Add Item</Text>
      </TouchableOpacity>
    )
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', }}>
            <Icon name={'Path-13016'} color="#229F5F" size={18} />
            <Text style={{ marginLeft: 10 }}>Select Product/Service</Text>
          </View>
          <TouchableOpacity onPress={() => {
            this.props.navigation.navigate('AddInvoiceItemScreen', { updateAddedItems: this.updateAddedItems, addedItems: this.state.addedItems })
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
    )
  }

  deleteItem = (item) => {
    let addedArray = this.state.addedItems;
    let itemUniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    let index = _.findIndex(addedArray, (e) => {
      let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
      return ouniqueName == itemUniqueName;
    }, 0);
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray, showItemDetails: false }, () => { })
  }

  renderRightAction() {
    return (
      <TouchableOpacity onPress={() => {
        this.deleteItem(item)
      }} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <AntDesign name={'delete'} size={16} color='#E04646' />
        <Text style={{ color: '#E04646', marginLeft: 10 }}>Delete</Text>
      </TouchableOpacity>
    )
  }

  renderStockItem(item) {
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction()}
      >
        <TouchableOpacity style={{ backgroundColor: '#E0F2E9', padding: 10, borderRadius: 2, marginBottom: 10 }} onPress={() => {
          this.setState({
            showItemDetails: true, itemDetails: item, editItemDetails: {
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
          })
        }}>
          <Text style={{ color: '#1C1C1C', paddingVertical: 10 }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text>{item.stock ? `${item.quantity} pcs x ${item.rate} ` : `1 x ${item.rate}`}</Text>
            </View>

          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }


  onChangeTextBottomItemSheet(text, field) {
    let editItemDetails = this.state.editItemDetails;
    switch (field) {
      case 'Quantity':
        editItemDetails.quantityText = text;
        this.setState({ editItemDetails })
        break;

      case 'Unit':
        editItemDetails.unitText = text;
        this.setState({ editItemDetails })
        break;

      case 'Rate':
        editItemDetails.rateText = text;
        this.setState({ editItemDetails })
        break;

      case 'Amount':
        editItemDetails.amountText = text;
        this.setState({ editItemDetails })
        break;

      case 'Discount Value':
        editItemDetails.discountValueText = text;
        this.setState({ editItemDetails })
        break;

      case 'Discount Percentage':
        editItemDetails.discountPercentageText = text;
        this.setState({ editItemDetails })
        break;
    }
  }
  _renderTwoFieldsTextInput(field1, field1Value, field2, field2Value, icon1, icon2) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
        <View style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={icon1} size={12} color='#808080' />
            <Text style={{ marginLeft: 10 }}>{field1}</Text>
          </View>
          <TextInput
            placeholder={field1}
            placeholderTextColor={'#808080'}
            value={field1Value}
            style={{ marginLeft: 22 }}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, field1)
            }}
          />
          {this._renderBottomSeprator()}
        </View>
        <View style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={icon2} size={12} color='#808080' />
            <Text style={{ marginLeft: 10 }}>{field2}</Text>
          </View>
          <TextInput
            placeholder={field2}
            placeholderTextColor={'#808080'}
            value={field2Value}
            style={{ marginLeft: 22 }}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, field2)
            }}
          />
          {this._renderBottomSeprator()}

        </View>

      </View>
    )
  }
  _renderBottomSheetForItemDetails() {
    return (
      <View style={{ backgroundColor: 'transparent', width: '100%', height: '100%', position: 'absolute', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ backgroundColor: 'black', opacity: 0.5, width: '100%', height: '100%', position: 'absolute' }} onPress={() => { this.setState({ showItemDetails: false }) }} />
        <View style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: 'white', minHeight: 300, width: '100%' }}>
          {/*
            Render Header with title back & delete 
          */}
          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, paddingBottom: 16 }}>
            <TouchableOpacity onPress={() => { this.setState({ showItemDetails: false }) }}>
              <Icon name={'Backward-arrow'} size={18} color={'#808080'} />
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 10, fontSize: 12, flex: 1 }}>{this.state.itemDetails.name}</Text>
            <TouchableOpacity onPress={() => { this.deleteItem(this.state.itemDetails) }}>
              <AntDesign name={'delete'} size={16} color='#E04646' />
            </TouchableOpacity>
            {this._renderBottomSeprator()}
          </View>

          {/*
            Render Quantity & Unit 
          */}

          {this._renderTwoFieldsTextInput('Quantity', this.state.editItemDetails.quantityText, 'Unit', this.state.editItemDetails.unitText, 'Product', 'Product')}
          {/*
            Render Rate & Amount 
          */}
          {this._renderTwoFieldsTextInput('Rate', this.state.editItemDetails.rateText, 'Amount', this.state.editItemDetails.amountText, 'Product', 'Product')}


          {/*
            Render Discount & Amount 
          */}
          {this._renderBottomItemSheetDiscountRow()}
          {this._renderBottomSheetTax()}
          <TouchableOpacity style={{ marginHorizontal: 16, backgroundColor: '#5773FF', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
            <Text style={{ alignSelf: 'center', color: 'white', fontSize: 20 }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderBottomItemSheetDiscountRow() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'path-7'} size={12} />
            <Text style={{ marginLeft: 10 }} >Discount</Text>
          </View>
          <Text style={style.bottomSheetSelectTaxText} >Select Discount</Text>
          {this._renderBottomSeprator(0)}
        </TouchableOpacity>
        <View style={{ marginHorizontal: 16, flex: 1, alignItems: 'flex-start', width: '50%', flex: 1, }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 }}>
            <View style={{ alignItems: 'center', flex: 1, paddingVertical: 10 }}>
              <TextInput
                placeholder={'00'}
                placeholderTextColor={'#808080'}
                style={{ paddingTop: 8, paddingBottom: 6, flex: 1 }}
                value={this.state.editItemDetails.discountValueText}
                onChangeText={(text) => {
                  this.onChangeTextBottomItemSheet(text, 'Discount Value')
                }}
              />
              {this._renderBottomSeprator(8)}
            </View>

            <View style={{ alignItems: 'center', flex: 1, paddingVertical: 10 }}>
              <TextInput
                placeholder={'00.00'}
                placeholderTextColor={'#808080'}
                style={{ paddingTop: 8, paddingBottom: 6, flex: 1 }}
                value={this.state.editItemDetails.discountPercentageText}
                onChangeText={(text) => {
                  this.onChangeTextBottomItemSheet(text, 'Discount Percentage')
                }}
              />
              {this._renderBottomSeprator(8)}
            </View>

          </View>
        </View>
      </View>
    )
  }

  _renderBottomSheetTax() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ marginHorizontal: 16, flex: 1, paddingVertical: 10 }}>
          <TouchableOpacity  >
            <View style={{ flexDirection: 'row', }}>
              <Icon name={'Union-65'} size={12} />
              <Text style={{ marginLeft: 10 }} >Tax</Text>
            </View>
            <Text style={style.bottomSheetSelectTaxText} >Select Tax</Text>

          </TouchableOpacity>
          {this._renderBottomSeprator()}
        </View>
        <View style={{ marginHorizontal: 16, flex: 1, paddingTop: 16, paddingBottom: 8 }}>
          <TextInput
            placeholder={'00.00'}
            placeholderTextColor={'#808080'}
            style={{ paddingTop: 16 }}
            value={this.state.editItemDetails.discountPercentageText}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, 'Discount Percentage')
            }}
          />
          {this._renderBottomSeprator()}
        </View>
      </View>
    )
  }

  _renderBottomSeprator(margin = 0) {
    return (<View style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }} />)
  }
  
  getTotalAmount() {
    let total = 0
    for (let i = 0; i < this.state.addedItems.length; i++) {
        let item = this.state.addedItems[i];
        if (item.stock) {
            //do inventory calulations
            if (item.rate) {
                total = total + Number(item.rate * item.quantity);
            }
        }
        else {
            // do sales calulation
            if (item.rate) {
                total = total + Number(item.rate);
            }
        }
    }
    return total;
  }


  _renderTotalAmount() {
    return (
      <View>
        <View style={{ backgroundColor: '#E6E6E6', flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 16, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color='#229F5F' />
            <Text style={{ color: '#1C1C1C' }}>Balance</Text>
          </View>
          <Icon style={{transform: [{ rotate: this.state.expandedBalance ? '180deg' : '0deg'}]}} name={'9'} size={16} color='#808080' onPress={()=> {
            this.setState({expandedBalance: !this.state.expandedBalance})
          }}/>
        </View>

        {this.state.expandedBalance && <View style={{ margin: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={{ color: '#1C1C1C' }}>Total Amount</Text>
            <Text style={{ color: '#1C1C1C' }}>{this.getTotalAmount()}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ color: '#808080', borderBottomWidth: 1, borderBottomColor: '#808080' }}>Payment Mode</Text>
            <TextInput
              style={{ borderBottomWidth: 1, borderBottomColor: '#808080' }}
              placeholder='00000.00'
              keyboardType='number-pad'
              value={this.state.amountPaidNowText}
              onChangeText={(text) => { this.setState({ amountPaidNowText: text }) }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ color: '#1C1C1C' }}>Invoice Due</Text>
            <Text style={{ color: '#1C1C1C' }}>{this.getTotalAmount()}</Text>
          </View>
        </View>}

        <View style={{ justifyContent: 'flex-end', flexDirection: 'row', marginTop: 20, margin: 16 }}>
            <TouchableOpacity >
              <Icon name={'path-18'} size={48} color={'#5773FF'} />
            </TouchableOpacity>
          </View>
      </View>
    )
  }
  render() {
    return (
      <ScrollView style={{ backgroundColor: 'white', flex: 1 }}>
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

          {this.state.showInvoiceModal && this.renderInvoiceTypeModal()}
        </View>
        {this.state.showItemDetails && this._renderBottomSheetForItemDetails()}
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
      </ScrollView>
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

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(SalesInvoice);
export default MyComponent;
