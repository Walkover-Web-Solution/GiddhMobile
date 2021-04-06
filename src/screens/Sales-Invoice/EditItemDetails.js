import React, {Component} from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  Animated,
  TextInput,
  NativeModules,
  Platform,
  FlatList,
} from 'react-native';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import _ from 'lodash';
const {SafeAreaOffsetHelper} = NativeModules;

import style from './style';

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};

/**
 * UI For Create account screen
 */
class EditItemDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bottomOffset: 0,
      itemDetails: this.props.itemDetails,
      showDiscountPopup: false,
      showTaxPopup: false,
      editItemDetails: {
        quantityText: this.props.itemDetails.quantity,
        rateText: this.props.itemDetails.rate,
        unitText: this.props.itemDetails.unit ? this.props.itemDetails.unit : '',
        amountText: this.props.itemDetails.amount ? this.props.itemDetails.amount : '0',
        discountValueText: this.props.itemDetails.discountValue ? this.props.itemDetails.discountValue : '',
        discountPercentageText: this.props.itemDetails.discountPercentage
          ? this.props.itemDetails.discountPercentage
          : '',
        discountType: this.props.itemDetails.discountType ? this.props.itemDetails.discountType : '',
        taxType: this.props.itemDetails.taxType ? this.props.itemDetails.taxType : '',
        taxText: this.props.itemDetails.tax ? this.props.itemDetails.tax : '',
        warehouse: this.props.itemDetails.warehouse ? this.props.itemDetails.warehouse : '',
        total: this.props.itemDetails.total ? this.props.itemDetails.total : '',
        discountDetails: this.props.itemDetails.discountDetails ? this.props.itemDetails.discountDetails : undefined,
        taxDetailsArray: this.props.itemDetails.taxDetailsArray ? this.props.itemDetails.taxDetailsArray : [],
      },
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.caluclateTotalAmount();
    if (Platform.OS == 'ios') {
      //Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        let {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }
  }

  renderHeader() {
    return (
      <View style={style.header}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: '#229F5F',
            width: '100%',
          }}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.props.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{color: 'white', fontSize: 16}}>{this.state.itemDetails.name}</Text>
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
      </View>
    );
  }

  _renderTax() {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%',
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{backgroundColor: 'black', opacity: 0.5, width: '100%', height: '100%', position: 'absolute'}}
          onPress={() => {
            this.setState({showTaxPopup: false});
          }}
        />
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            alignSelf: 'center',
            maxHeight: 300,
            paddingVertical: 10,
          }}>
          <FlatList
            data={this.props.taxArray}
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            renderItem={({item}) => {
              let selectedTaxArray = this.state.editItemDetails.taxDetailsArray;
              var filtered = _.filter(selectedTaxArray, function (o) {
                if (o.uniqueName == item.uniqueName) return o;
              });
              return (
                <TouchableOpacity
                  style={{}}
                  onFocus={() => this.onChangeText('')}
                  onPress={async () => {
                    let itemDetails = this.state.editItemDetails;
                    var filtered = _.filter(selectedTaxArray, function (o) {
                      if (o.uniqueName == item.uniqueName) return o;
                    });
                    if (filtered.length == 0) {
                      selectedTaxArray.push(item);
                      itemDetails.taxDetailsArray = selectedTaxArray;
                      let tax = this.calculatedTaxAmount(itemDetails);
                      itemDetails.taxText = String(tax);
                      let total = this.calculateFinalAmount(itemDetails);
                      itemDetails.total = total;
                      this.setState({itemDetails});
                    } else {
                      var filtered = _.filter(selectedTaxArray, function (o) {
                        if (o.uniqueName !== item.uniqueName) return o;
                      });
                      itemDetails.taxDetailsArray = filtered;
                      let tax = this.calculatedTaxAmount(itemDetails);
                      itemDetails.taxText = String(tax);
                      let total = this.calculateFinalAmount(itemDetails);
                      itemDetails.total = total;
                      this.setState({itemDetails});
                    }
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
                      }}>
                      {filtered.length > 0 && (
                        <AntDesign name={'check'} size={10} color={filtered.length == 0 ? '#CCCCCC' : '#1C1C1C'} />
                      )}
                    </View>

                    <Text
                      style={{color: '#1C1C1C', paddingVertical: 4, fontSize: 12, textAlign: 'center', marginLeft: 10}}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    );
  }

  caluclateTotalAmount() {
    let amount = Number(this.state.editItemDetails.rateText) * Number(this.state.editItemDetails.quantityText);
    return amount;
  }
  calculateDiscountedAmount(itemDetails) {
    if (itemDetails.discountDetails) {
      let discountType = itemDetails.discountDetails.discountType;
      if (discountType == 'FIX_AMOUNT') {
        let discountAmount = Number(itemDetails.discountValueText);
        return discountAmount;
      } else {
        let amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
        let discountAmount = (Number(itemDetails.discountValueText) * amt) / 100;
        return Number(discountAmount);
      }
    }
  }
  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    let amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
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

  calculateFinalAmount(editItemDetails) {
    let discountAmount = this.calculateDiscountedAmount(editItemDetails);

    let totalTax = this.calculatedTaxAmount(editItemDetails);

    let amt = Number(this.state.editItemDetails.rateText) * Number(editItemDetails.quantityText);
    let finalAmt = amt;

    if (discountAmount) {
      finalAmt = finalAmt - discountAmount;
    }
    if (totalTax) {
      finalAmt = finalAmt + totalTax;
    }
    return finalAmt;
  }
  _renderDiscounts() {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%',
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{backgroundColor: 'black', opacity: 0.5, width: '100%', height: '100%', position: 'absolute'}}
          onPress={() => {
            this.setState({showDiscountPopup: false});
          }}
        />
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            alignSelf: 'center',
            maxHeight: 300,
            paddingVertical: 10,
          }}>
          <FlatList
            data={this.props.discountArray}
            style={{paddingHorizontal: 20, paddingVertical: 10}}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{}}
                onFocus={() => this.onChangeText('')}
                onPress={async () => {
                  let itemDetails = this.state.editItemDetails;
                  itemDetails.discountDetails = item;
                  itemDetails.discountValueText = String(item.discountValue);
                  itemDetails.discountType = item.discountType == 'FIX_AMOUNT' ? 'Fixed' : 'Percentage %';
                  let discount = this.calculateDiscountedAmount(itemDetails);
                  itemDetails.discountPercentageText = String(discount);
                  let total = this.calculateFinalAmount(itemDetails);
                  itemDetails.total = total;
                  this.setState({editItemDetails: itemDetails, showDiscountPopup: false}, () => {});
                }}>
                <Text style={{color: '#1C1C1C', paddingTop: 10}}>{item.name}</Text>

                <View style={{flexDirection: 'row'}}>
                  <Text style={{color: '#808080', paddingVertical: 4, fontSize: 12}}>
                    {(item.discountType == 'FIX_AMOUNT' ? 'Fixed' : 'Percentage') + ' -'}
                  </Text>
                  <Text style={{color: '#808080', paddingVertical: 4, fontSize: 12}}>
                    {item.discountValue + (item.discountType !== 'FIX_AMOUNT' ? '%' : '')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    let editDetails = this.state.editItemDetails;
    editDetails.total = this.calculateFinalAmount(editDetails);
    this.setState({editItemDetails: editDetails});
    // if (Platform.OS == 'ios') {
    //     //Native Bridge for giving the bottom offset //Our own created
    //     SafeAreaOffsetHelper.getBottomOffset().then(offset => {
    //         let { bottomOffset } = offset;
    //         this.setState({ bottomOffset })
    //     })
    // }
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

  _renderHsn() {
    return (
      <>
        <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10}}>
          <Icon name={'Product'} size={12} color="#808080" />

          <Text style={{marginLeft: 10}}>HSN Number</Text>
        </View>

        <TextInput
          placeholder={this.props.itemDetails.hsnNumber}
          placeholderTextColor={'#808080'}
          // value={field2Value}
          keyboardType={'number-pad'}
          style={{borderColor: '#D9D9D9', borderBottomWidth: 1, width: '50%', marginLeft: 20}}
          editable={false}
          // onChangeText={(text) => {
          //   this.onChangeTextBottomItemSheet(text, field2);
          // }}
        />
      </>
    );
  }
  _renderFinalTotal() {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between', margin: 16}}>
        <Text>Total Amount</Text>
        <Text style={style.finalItemAmount}>{`₹${this.state.editItemDetails.total}`}</Text>
      </View>
    );
  }

  render() {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          position: 'absolute',
          backgroundColor: 'white',
          flex: 1,
        }}>
        {this.renderHeader()}

        <Animated.ScrollView
          keyboardShouldPersistTaps="always"
          style={[{flex: 1}, {marginBottom: this.keyboardMargin}]}
          bounces={false}>
          {this._renderScreenElements()}
        </Animated.ScrollView>
        {this.state.showDiscountPopup && this._renderDiscounts()}
        {this.state.showTaxPopup && this._renderTax()}
      </View>
    );
  }
  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
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
    editItemDetails.amountText = this.caluclateTotalAmount(editItemDetails);
    editItemDetails.total = this.calculateFinalAmount(editItemDetails);

    this.setState({editItemDetails});
  }
  _renderTwoFieldsTextInput(
    field1,
    field1Value,
    field2,
    field2Value,
    icon1,
    icon2,
    keyboardType1,
    keyboardType2,
    editable1,
    editable2,
  ) {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{marginHorizontal: 16, paddingVertical: 10, flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={icon1} size={12} color="#808080" />
            <Text style={{marginLeft: 10}}>{field1}</Text>
          </View>
          <TextInput
            placeholder={field1}
            placeholderTextColor={'#808080'}
            value={field1Value}
            keyboardType={keyboardType1}
            editable={editable1}
            returnKeyType={'done'}
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1}}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, field1);
            }}
          />
          {/* {this._renderBottomSeprator()} */}
        </View>
        <View style={{marginHorizontal: 16, paddingVertical: 10, flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={icon2} size={12} color="#808080" />
            <Text style={{marginLeft: 10}}>{field2}</Text>
          </View>
          <TextInput
            placeholder={field2}
            placeholderTextColor={'#808080'}
            value={field2Value}
            keyboardType={keyboardType2}
            style={{borderColor: '#D9D9D9', borderBottomWidth: 1}}
            editable={editable2}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, field2);
            }}
          />
          {/* {this._renderBottomSeprator()} */}
        </View>
      </View>
    );
  }
  _renderScreenElements() {
    return (
      <View style={{backgroundColor: 'transparent', width: '100%', height: '100%', justifyContent: 'flex-end'}}>
        <View style={{backgroundColor: 'white', width: '100%'}}>
          {/*
            Render Header with title back & delete 
          */}
          {/* <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, paddingBottom: 16 }}>
            <TouchableOpacity onPress={() => { this.setState({ showItemDetails: false }) }}>
              <Icon name={'Backward-arrow'} size={18} color={'#808080'} />
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 10, fontSize: 12, flex: 1 }}>{this.state.itemDetails.name}</Text>
            <TouchableOpacity onPress={() => { this.deleteItem(this.state.itemDetails) }}>
              <AntDesign name={'delete'} size={16} color='#E04646' />
            </TouchableOpacity>
            {this._renderBottomSeprator()}
          </View> */}

          {/*
            Render Quantity & Unit 
          */}

          {this._renderTwoFieldsTextInput(
            'Quantity',
            String(this.state.editItemDetails.quantityText),
            'Unit',
            String(this.state.editItemDetails.unitText),
            'Product',
            'Product',
            'number-pad',
            'default',
            this.props.itemDetails.stock ? true : false,
            true,
          )}
          {/*
            Render Rate & Amount 
          */}
          {this._renderTwoFieldsTextInput(
            'Rate',
            String(this.state.editItemDetails.rateText),
            'Amount',
            String(this.state.editItemDetails.amountText),
            'Product',
            'Product',
            'decimal-pad',
            'decimal-pad',
            true,
            false,
          )}

          {/*
            Render Discount & Amount 
          */}
          {this._renderBottomItemSheetDiscountRow()}
          {this._renderBottomSheetTax()}
          {this._renderHsn()}
          {this._renderFinalTotal()}
          {/* <TouchableOpacity
            style={{height: 50, width: 50, backgroundColor: 'pink'}}
            onPress={() => console.log(this.props.itemDetails)}></TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => {
              let editItemDetails = this.state.editItemDetails;
              editItemDetails.item = this.props.itemDetails;
              this.props.updateItems(editItemDetails);
            }}
            style={{
              marginHorizontal: 16,
              backgroundColor: '#5773FF',
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 15,
            }}>
            <Text style={{alignSelf: 'center', color: 'white', fontSize: 20}}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderBottomItemSheetDiscountRow() {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          style={{marginHorizontal: 16, paddingVertical: 10, flex: 1}}
          onPress={() => this.setState({showDiscountPopup: true})}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon name={'path-7'} size={12} />
            <Text style={{marginLeft: 10}}>Discount</Text>
          </View>
          <Text style={style.bottomSheetSelectTaxText}>
            {this.state.editItemDetails.discountType ? this.state.editItemDetails.discountType : 'Select Discount'}
          </Text>
          {this._renderBottomSeprator(0)}
        </TouchableOpacity>
        <View style={{marginHorizontal: 16, flex: 1, alignItems: 'flex-start', width: '50%', flex: 1}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 13}}>
            <View style={{alignItems: 'center', flex: 1, paddingVertical: 10}}>
              <TextInput
                placeholder={'00'}
                placeholderTextColor={'#808080'}
                style={{paddingTop: 8, paddingBottom: 6, flex: 1}}
                value={this.state.editItemDetails.discountValueText}
                returnKeyType={'done'}
                onChangeText={(text) => {
                  this.onChangeTextBottomItemSheet(text, 'Discount Value');
                }}
              />
              {this._renderBottomSeprator(8)}
            </View>

            <View style={{alignItems: 'center', flex: 1, paddingVertical: 10}}>
              <TextInput
                placeholder={'00.00'}
                placeholderTextColor={'#808080'}
                style={{paddingTop: 8, paddingBottom: 6, flex: 1}}
                // style={{borderColor: '#D9D9D9', borderBottomWidth: 1}}
                returnKeyType={'done'}
                value={this.state.editItemDetails.discountPercentageText}
                onChangeText={(text) => {
                  this.onChangeTextBottomItemSheet(text, 'Discount Percentage');
                }}
              />
              {this._renderBottomSeprator(8)}
            </View>
          </View>
        </View>
      </View>
    );
  }

  _renderBottomSheetTax() {
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{marginHorizontal: 16, flex: 1, paddingVertical: 10}}>
          <TouchableOpacity
            onPress={() => {
              this.setState({showTaxPopup: true});
            }}>
            <View style={{flexDirection: 'row'}}>
              <Icon name={'Union-65'} size={12} />
              <Text style={{marginLeft: 10}}>Tax</Text>
            </View>
            <Text style={style.bottomSheetSelectTaxText}>Select Tax</Text>
          </TouchableOpacity>
          {this._renderBottomSeprator()}
        </View>
        <View style={{marginHorizontal: 16, flex: 1, paddingTop: 16, paddingBottom: 8}}>
          <TextInput
            placeholder={'00.00'}
            placeholderTextColor={'#808080'}
            style={{paddingTop: 16}}
            returnKeyType={'done'}
            value={this.state.editItemDetails.taxText}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, 'Discount Percentage');
            }}
          />
          {this._renderBottomSeprator()}
        </View>
      </View>
    );
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }
}

export default EditItemDetails;
