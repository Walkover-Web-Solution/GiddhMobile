import React, { Component } from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableOpacity,
  Animated,
  TextInput,
  NativeModules,
  Platform,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import _ from 'lodash';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import style from './style';
const { SafeAreaOffsetHelper } = NativeModules;

const { width, height } = Dimensions.get('window');

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
      showUnitPopup: false,
      selectedArrayType: this.props.itemDetails.selectedArrayType ? this.props.itemDetails.selectedArrayType : [],
      fixedDiscountSelected: false,
      unitArray: this.props.itemDetails.stock ? this.props.itemDetails.stock.unitRates : [],
      selectedCode: this.props.itemDetails.hsnNumber != '' ? 'hsn' : 'sac',
      editItemDetails: {
        description: this.props.itemDetails.description,
        quantityText: this.props.itemDetails.quantity,
        hsnNumber: this.props.itemDetails.hsnNumber,
        sacNumber: this.props.itemDetails.sacNumber,
        rateText: this.props.itemDetails.rate,
        unitText: this.props.itemDetails.stock ? this.props.itemDetails.stock.unitRates[0].stockUnitCode : '',
        amountText: this.props.itemDetails.rate ? this.props.itemDetails.rate : '0',
        discountValueText: this.props.itemDetails.discountValue ? this.props.itemDetails.discountValue : '',
        discountPercentageText: this.props.itemDetails.discountPercentage
          ? this.props.itemDetails.discountPercentage
          : '',
        discountType: this.props.itemDetails.discountType ? this.props.itemDetails.discountType : '',
        taxType: this.props.itemDetails.taxType ? this.props.itemDetails.taxType : '',
        taxText: this.props.itemDetails.tax ? this.props.itemDetails.tax : 0,
        warehouse: this.props.itemDetails.warehouse ? this.props.itemDetails.warehouse : '',
        total: this.props.itemDetails.total ? this.props.itemDetails.total : 0,
        discountDetails: this.props.itemDetails.discountDetails ? this.props.itemDetails.discountDetails : {},
        taxDetailsArray: this.props.itemDetails.taxDetailsArray ? this.props.itemDetails.taxDetailsArray : [],
        percentDiscountArray: this.props.itemDetails.percentDiscountArray
          ? this.props.itemDetails.percentDiscountArray
          : [],
        fixedDiscount: this.props.itemDetails.fixedDiscount ? this.props.itemDetails.fixedDiscount : { discountValue: 0 },
        fixedDiscountUniqueName: this.props.itemDetails.fixedDiscountUniqueName
          ? this.props.itemDetails.fixedDiscountUniqueName
          : '',
      },
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  getTaxDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.props.taxArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  getDiscountDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.props.discountArray, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.caluclateTotalAmount();
    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
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
            backgroundColor: '#3497FD',
            width: '100%',
          }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 16 }}>{this.props.itemDetails.name}</Text>
          {/* <TouchableOpacity
            style={{height: 60, width: 60, backgroundColor: 'pink'}}
            onPress={() => console.log(JSON.stringify(this.state.selectedArrayType))}></TouchableOpacity> */}
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
      </View>
    );
  }

  // _checkTax = (item) => {
  //   console.log(item);
  //   let var1 = true;
  //   // for (let obj1 of this.state.itemDetails.taxDetailsArray) {
  //   //   if (item.taxType == obj1.taxType) {
  //   //     var1 = true;
  //   //     break;
  //   //   } else {
  //   //     var1 = false;
  //   //   }
  //   // }

  //   return true;
  // };

  _renderTax() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showTaxPopup}
        onRequestClose={() => {
          this.setState({ showTaxPopup: false });
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
            this.setState({ showTaxPopup: false });
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 10,
              height: Dimensions.get('window').height * 0.5,
              alignSelf: 'center',
            }}>
            <FlatList
              data={this.props.taxArray}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              renderItem={({ item }) => {
                const selectedTaxArray = [...this.state.editItemDetails.taxDetailsArray];
                const selectedTaxTypeArr = [...this.state.selectedArrayType];
                const filtered = _.filter(selectedTaxArray, function (o) {
                  if (o.uniqueName == item.uniqueName) {
                    return o;
                  }
                });
                // let disable = this._checkTax(item);
                return (
                  <TouchableOpacity
                    style={{}}
                    onFocus={() => this.onChangeText('')}
                    // disabled={true}
                    // style={{backgroundColor: 'pink'}}
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
                        const itemDetails = this.state.editItemDetails;
                        var filtered = _.filter(selectedTaxArray, function (o) {
                          if (o.uniqueName == item.uniqueName) {
                            return o;
                          }
                        });
                        if (filtered.length == 0) {
                          selectedTaxArray.push(item);
                          itemDetails.taxDetailsArray = selectedTaxArray;
                          const tax = this.calculatedTaxAmount(itemDetails);
                          itemDetails.taxText = tax;
                          const arr1 = [...selectedTaxTypeArr, item.taxType];
                          const total = this.calculateFinalAmount(itemDetails);
                          itemDetails.total = total;
                          this.setState({ itemDetails, selectedArrayType: arr1 });
                        } else {
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
                          const tax = this.calculatedTaxAmount(itemDetails);
                          itemDetails.taxText = tax;
                          const total = this.calculateFinalAmount(itemDetails);
                          itemDetails.total = total;
                          this.setState({ itemDetails, selectedArrayType: arr2 });
                        }
                      }
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
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
                        style={{
                          color: '#1C1C1C',
                          paddingVertical: 4,
                          fontSize: 12,
                          textAlign: 'center',
                          marginLeft: 10,
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

  _renderUnit() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showUnitPopup}
        onRequestClose={() => {
          this.setState({ showUnitPopup: false });
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
            this.setState({ showUnitPopup: false });
          }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10, alignSelf: 'center' }}>
            <FlatList
              data={this.state.unitArray}
              style={{ paddingHorizontal: 20, paddingVertical: 10, maxHeight: 150 }}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{}}
                    onFocus={() => this.onChangeText('')}
                    onPress={async () => {
                      const itemDetails = this.state.editItemDetails;
                      itemDetails.unitText = item.stockUnitCode;
                      this.setState({ editItemDetails: itemDetails });
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                      <View
                        style={{
                          borderRadius: 1,
                          borderWidth: 1,
                          borderColor:
                            item.stockUnitCode == this.state.editItemDetails.unitText ? '#1C1C1C' : '#CCCCCC',
                          width: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {item.stockUnitCode == this.state.editItemDetails.unitText && (
                          <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
                        )}
                      </View>

                      <Text
                        style={{
                          color: '#1C1C1C',
                          paddingVertical: 4,
                          fontSize: 12,
                          textAlign: 'center',
                          marginLeft: 10,
                        }}>
                        {item.stockUnitName}
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

  caluclateTotalAmount() {
    const amount = Number(this.state.editItemDetails.rateText) * Number(this.state.editItemDetails.quantityText);
    return amount;
  }

  // calculateDiscountedAmount(itemDetails) {
  //   if (itemDetails.discountDetails) {
  //     let discountType = itemDetails.discountDetails.discountType;
  //     if (discountType == 'FIX_AMOUNT') {
  //       let discountAmount = Number(itemDetails.discountValueText);
  //       return discountAmount;
  //     } else {
  //       let amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
  //       let discountAmount = (Number(itemDetails.discountValueText) * amt) / 100;
  //       return Number(discountAmount);
  //     }
  //   }
  // }
  calculateDiscountedAmount(itemDetails) {
    let totalDiscount = 0;
    let percentDiscount = 0;
    const item = this.state.editItemDetails;
    if (itemDetails.fixedDiscount.discountValue > 0) {
      totalDiscount = totalDiscount + Number(itemDetails.fixedDiscount.discountValue);
    }
    if (itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
        console.log(percentDiscount, '%');
      }
      const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      // console.log('amt is ', amt);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    console.log(totalDiscount, 'is the discount');
    item.discountValueText = totalDiscount;
    this.setState({ editDetails: item });
    return totalDiscount;
  }

  calculatedTaxAmount(itemDetails) {
    let totalTax = 0;
    const totalDiscount = this.calculateDiscountedAmount(itemDetails);
    const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText) - Number(totalDiscount);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        // totalTax = totalTax + taxAmount;
        totalTax =
          item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc'
            ? totalTax
            : totalTax + taxAmount;
      }
    }
    return Number(totalTax);
  }

  calculateFinalAmount(editItemDetails) {
    // console.log('this did not run');
    const discountAmount = this.calculateDiscountedAmount(editItemDetails);
    const totalTax = this.calculatedTaxAmount(editItemDetails);
    const amt = Number(this.state.editItemDetails.rateText) * Number(editItemDetails.quantityText);
    let finalAmt = amt;
    if (discountAmount) {
      finalAmt = finalAmt - discountAmount;
    }
    if (totalTax) {
      finalAmt = finalAmt + totalTax;
    }
    return finalAmt;
  }

  calculateDiscountedAmountToDisplayTotalAmount(itemDetails) {
    let totalDiscount = 0;
    let percentDiscount = 0;
    if (itemDetails.fixedDiscount.discountValue > 0) {
      totalDiscount = totalDiscount + Number(itemDetails.fixedDiscount.discountValue);
    }
    if (itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
        console.log(percentDiscount, '%');
      }
      const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      // console.log('amt is ', amt);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    console.log(totalDiscount, 'is the discount');
    return totalDiscount;
  }

  calculatedTaxAmountToDisplayTotalAmount(itemDetails) {
    let totalTax = 0;
    const totalDiscount = this.calculateDiscountedAmountToDisplayTotalAmount(itemDetails);
    const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText) - Number(totalDiscount);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        // totalTax = totalTax + taxAmount;
        totalTax =
          item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc'
            ? totalTax
            : totalTax + taxAmount;
      }
    }
    return Number(totalTax);
  }

  calculateFinalAmountToDisplay(editItemDetails) {
    // console.log('this did not run');
    const discountAmount = this.calculateDiscountedAmountToDisplayTotalAmount(editItemDetails);
    let totalTax = 0;
    if (this.props.notIncludeTax) {
      totalTax = this.calculatedTaxAmountToDisplayTotalAmount(editItemDetails);
    }
    const amt = Number(this.state.editItemDetails.rateText) * Number(editItemDetails.quantityText);
    let finalAmt = amt;
    if (discountAmount) {
      finalAmt = finalAmt - discountAmount;
    }
    if (totalTax) {
      finalAmt = finalAmt + totalTax;
    }
    return finalAmt;
  }

  _renderDescriptionField() {
    return (
      <TextInput
        placeholder='Add Description'
        multiline={true}
        numberOfLines={10}
        value={this.state.editItemDetails.description}
        onChangeText={(text) => {
          this.setState({
            editItemDetails: {
              ...this.state.editItemDetails,
              description:text
            }
          })
        }}
        style={{
          marginHorizontal: 16,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#5773FF',
          textAlignVertical: 'top',
          padding: 8
        }}
      />
    );
  }

  _renderDiscounts() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showDiscountPopup}
        onRequestClose={() => {
          this.setState({ showDiscountPopup: false });
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
            this.setState({ showDiscountPopup: false });
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 10,
              alignSelf: 'center',
              height: Dimensions.get('window').height * 0.5,
            }}>
            <FlatList
              data={this.props.discountArray}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              renderItem={({ item }) => {
                const selectedDiscountArray = this.state.editItemDetails.percentDiscountArray;
                const filtered = _.filter(selectedDiscountArray, function (o) {
                  if (o.uniqueName == item.uniqueName) {
                    return o;
                  }
                });
                return (
                  <TouchableOpacity
                    style={{}}
                    // onFocus={() => this.onChangeText('')}
                    onPress={async () => {
                      if (item.discountType == 'FIX_AMOUNT') {
                        if (this.state.fixedDiscountSelected == true) {
                          if (this.state.editItemDetails.fixedDiscount == item) {
                            const itemDetails = this.state.editItemDetails;
                            const tax = this.calculatedTaxAmount(itemDetails);
                            itemDetails.taxText = tax;
                            itemDetails.fixedDiscount = { discountValue: 0 };
                            itemDetails.fixedDiscountUniqueName = '';
                            const total = this.calculateFinalAmount(itemDetails);
                            itemDetails.total = total;
                            // console.log('unselected');
                            this.setState({ fixedDiscountSelected: false, editItemDetails: itemDetails });
                          }
                          // console.log('didnt select');
                        } else {
                          const itemDetails = this.state.editItemDetails;
                          const tax = this.calculatedTaxAmount(itemDetails);
                          itemDetails.taxText = tax;
                          itemDetails.fixedDiscount = item;
                          itemDetails.fixedDiscountUniqueName = item.uniqueName;
                          const total = this.calculateFinalAmount(itemDetails);
                          itemDetails.total = total;
                          // itemDetails.discountType = item.discountType == 'FIX_AMOUNT' ? 'Fixed' : 'Percentage %';
                          // let discount = this.calculateDiscountedAmount(itemDetails);
                          // itemDetails.discountPercentageText = String(discount);
                          // let total = this.calculateFinalAmount(itemDetails);
                          // itemDetails.total = total;
                          this.setState({ editItemDetails: itemDetails, fixedDiscountSelected: true }, () => { });
                        }
                      } else {
                        const selectedDiscountArray = this.state.editItemDetails.percentDiscountArray;
                        const filtered = _.filter(selectedDiscountArray, function (o) {
                          if (o.uniqueName == item.uniqueName) {
                            return o;
                          }
                        });
                        if (filtered.length == 0) {
                          console.log('this should run');
                          const itemDetails = this.state.editItemDetails;
                          itemDetails.percentDiscountArray.push(item);
                          const tax = this.calculatedTaxAmount(itemDetails);
                          itemDetails.taxText = tax;
                          const total = this.calculateFinalAmount(itemDetails);
                          itemDetails.total = total;
                          // itemDetails.discountDetails = item;
                          // itemDetails.discountValueText = String(item.discountValue);
                          // itemDetails.discountType = item.discountType == 'FIX_AMOUNT' ? 'Fixed' : 'Percentage %';
                          // let discount = this.calculateDiscountedAmount(itemDetails);
                          // itemDetails.discountPercentageText = String(discount);
                          // let total = this.calculateFinalAmount(itemDetails);
                          // itemDetails.total = total;
                          this.setState({ editItemDetails: itemDetails }, () => { });
                        } else {
                          const newArr = _.filter(selectedDiscountArray, function (o) {
                            if (o.uniqueName !== item.uniqueName) {
                              return o;
                            }
                          });
                          const itemDetails = this.state.editItemDetails;
                          itemDetails.percentDiscountArray = newArr;
                          const tax = this.calculatedTaxAmount(itemDetails);
                          itemDetails.taxText = tax;
                          const total = this.calculateFinalAmount(itemDetails);
                          itemDetails.total = total;
                          this.setState({ editItemDetails: itemDetails }, () => { });
                        }
                      }
                      this.calculatedTaxAmount(this.state.editItemDetails);
                      this.calculateFinalAmount(this.state.editItemDetails);
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          borderRadius: 1,
                          borderWidth: 1,
                          borderColor:
                            filtered.length > 0 || this.state.editItemDetails.fixedDiscountUniqueName == item.uniqueName
                              ? '#1C1C1C'
                              : '#CCCCCC',
                          width: 18,
                          height: 18,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {/* {this.state.editItemDetails.discountDetails.uniqueName == item.uniqueName && (
                        <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
                      )} */}
                        {filtered.length > 0 ||
                          this.state.editItemDetails.fixedDiscountUniqueName == item.uniqueName ? (
                          <AntDesign name={'check'} size={10} color={'#1C1C1C'} />
                        ) : null}
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={{ color: '#1C1C1C', paddingTop: 10 }}>{item.name}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ color: '#808080', paddingVertical: 4, fontSize: 12 }}>
                            {(item.discountType == 'FIX_AMOUNT' ? 'Fixed' : 'Percentage') + ' -'}
                          </Text>
                          <Text style={{ color: '#808080', paddingVertical: 4, fontSize: 12 }}>
                            {item.discountValue}
                            {item.discountType !== 'FIX_AMOUNT' ? '%' : ''}
                          </Text>
                        </View>
                      </View>
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
      <View
        style={{
          flexDirection: 'row',
          // backgroundColor: 'pink',
          justifyContent: 'space-between',
          marginTop: 10,
          alignItems: 'center',
        }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10 }}>
            <TouchableOpacity
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: '#c4c4c4',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => this.setState({ selectedCode: 'hsn' })}>
              {this.state.selectedCode == 'hsn' && (
                <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#3497FD' }} />
              )}
            </TouchableOpacity>

            <Text style={{ marginLeft: 10 }}>HSN Code</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 15 }}>
            <TouchableOpacity
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: '#c4c4c4',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => this.setState({ selectedCode: 'sac' })}>
              {this.state.selectedCode == 'sac' && (
                <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#3497FD' }} />
              )}
            </TouchableOpacity>

            <Text style={{ marginLeft: 10 }}>SAC Code</Text>
          </View>
        </View>
        <TextInput
          // placeholder={ this.state.selectedCode=='hsn'?this.props.itemDetails.hsnNumber:this.props.itemDetails.sacNumber}
          placeholderTextColor={'#808080'}
          value={
            this.state.selectedCode == 'hsn'
              ? this.state.editItemDetails.hsnNumber
              : this.state.editItemDetails.sacNumber
          }
          keyboardType={'number-pad'}
          style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width: '42%', marginRight: 16 }}
          // editable={false}
          onChangeText={(text) => {
            const item = this.state.editItemDetails;
            if (this.state.selectedCode == 'hsn') {
              item.hsnNumber = text;
              this.setState({ editItemDetails: item });
            } else {
              item.sacNumber = text;
              this.setState({ editItemDetails: item });
            }
          }}
        />
      </View>
    );
  }

  _renderFinalTotal() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 16 }}>
        <Text>Total Amount</Text>
        <Text style={style.finalItemAmount}>{`${(this.props.currencySymbol ? this.props.currencySymbol : '') +
          '' +
          this.calculateFinalAmountToDisplay(this.state.editItemDetails).toFixed(2)
          }`}</Text>
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
        <StatusBar backgroundColor="#2e80d1" barStyle={Platform.OS=='ios'?"dark-content":"light-content"} />
        {this.renderHeader()}

        <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: 'white' }}>
          {this._renderScreenElements()}
          {/* <TouchableOpacity
            style={{height: 60, width: 60, backgroundColor: 'pink'}}
            onPress={() => console.log(this.props.taxArray)}></TouchableOpacity> */}
        </KeyboardAwareScrollView>
        {this.state.showDiscountPopup && this._renderDiscounts()}
        {this.state.showTaxPopup && this._renderTax()}
        {this.state.showUnitPopup && this._renderUnit()}
        {/* s */}
      </View>
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
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
        if (text > 99999999999) {
          Alert.alert('', 'the value should be less than 99999999999');
        } else {
          editItemDetails.rateText = text;
        }

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
    editItemDetails.taxText = this.calculatedTaxAmount(editItemDetails);
    editItemDetails.total = this.calculateFinalAmount(editItemDetails);
    editItemDetails.taxText = this.calculatedTaxAmount(editItemDetails);

    this.setState({ editItemDetails });
  }

  fixedDiscountValueChange = (text) => {
    const editItemDetails = this.state.editItemDetails;
    const selectedTaxArray = this.state.editItemDetails.taxDetailsArray;
    editItemDetails.fixedDiscount.discountValue = text;
    console.log('changed discount value ', text);
    editItemDetails.taxDetailsArray = selectedTaxArray;
    const tax = this.calculatedTaxAmount(editItemDetails);
    editItemDetails.taxText = tax;
    const total = this.calculateFinalAmount(editItemDetails);
    editItemDetails.total = total;
    this.setState({ editItemDetails });
  };

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={icon1} size={12} color="#808080" />
            <Text style={{ marginLeft: 10 }}>{field1}</Text>
          </View>
          <TextInput
            placeholder={field1}
            placeholderTextColor={'#808080'}
            value={field1Value}
            keyboardType={keyboardType1}
            editable={editable1}
            returnKeyType={'done'}
            style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, field1);
            }}
          />
          {/* {this._renderBottomSeprator()} */}
        </View>
        {field2 == 'Unit' ? (
          <View style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', width: width * 0.5 }}
              onPress={() => {
                if (this.state.unitArray.length > 1) {
                  this.setState({ showUnitPopup: true });
                } else {
                  console.log('didnt open');
                }
              }}
            // onPress={() => console.log(this.state.unitArray)}
            >
              <Icon name={icon2} size={12} color="#808080" />
              <Text style={{ marginLeft: 10 }}>{field2}</Text>
            </TouchableOpacity>
            <TextInput
              placeholder={field2}
              placeholderTextColor={'#808080'}
              value={field2Value}
              keyboardType={keyboardType2}
              style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
              editable={false}
              onChangeText={(text) => {
                this.onChangeTextBottomItemSheet(text, field2);
              }}
            />
          </View>
        ) : (
          <View style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={icon2} size={12} color="#808080" />
              <Text style={{ marginLeft: 10 }}>{field2}</Text>
            </View>
            <TextInput
              placeholder={field2}
              placeholderTextColor={'#808080'}
              value={field2Value}
              keyboardType={keyboardType2}
              style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
              editable={editable2}
              onChangeText={(text) => {
                this.onChangeTextBottomItemSheet(text, field2);
              }}
            />
            {/* {this._renderBottomSeprator()} */}
          </View>
        )}
      </View>
    );
  }

  _renderScreenElements() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
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

        {this.props.itemDetails.stock &&
          this._renderTwoFieldsTextInput(
            'Quantity',
            String(this.state.editItemDetails.quantityText),
            'Unit',
            String(this.state.editItemDetails.unitText),
            'Product',
            'Product',
            'number-pad',
            'default',
            !!this.props.itemDetails.stock,
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
        {this._renderDescriptionField()}
        {/* <TouchableOpacity
          style={{height: 50, width: 50, backgroundColor: 'pink'}}
          onPress={() => console.log(this.props.itemDetails)}
          // onPress={() => this.calculateDiscountedAmount(this.state.editItemDetails)}
        ></TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => {
            const editItemDetails = this.state.editItemDetails;
            editItemDetails.item = this.props.itemDetails;
            if (editItemDetails.item.stock) { editItemDetails.item.stock.taxes = this.state.selectedArrayType } else { editItemDetails.item.taxes = this.state.selectedArrayType }
            this.props.updateItems(editItemDetails, this.state.selectedArrayType, this.state.selectedCode);
          }}
          style={{
            marginHorizontal: 16,
            backgroundColor: '#5773FF',
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 15,
            marginBottom: 20,
          }}>
          <Text style={{ alignSelf: 'center', color: 'white', fontSize: 20 }}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderBottomItemSheetDiscountRow() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          disabled={!(this.props.discountArray.length > 0)}
          style={{ marginHorizontal: 16, paddingVertical: 10, flex: 1 }}
          onPress={() => this.setState({ showDiscountPopup: true })}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={'path-7'} size={12} />

            <Text style={{ marginLeft: 10, color: this.props.discountArray.length > 0 ? 'black' : '#808080' }}>
              Discount
            </Text>
          </View>
          {this.state.editItemDetails.percentDiscountArray.length > 0 ? (
            <Text style={style.TaxText} numberOfLines={2}>
              {this.state.editItemDetails.percentDiscountArray.map((item) => `${item.discountValue}%  `)}
            </Text>
          ) : (
            <Text style={style.bottomSheetSelectTaxText}>Select Discount</Text>
          )}
          {/* <Text style={style.bottomSheetSelectTaxText}>
            {this.state.editItemDetails.discountType ? this.state.editItemDetails.discountType : 'Select Discount'}
          </Text> */}
          {this._renderBottomSeprator(0)}
        </TouchableOpacity>
        <View style={{ marginHorizontal: 16, flex: 1, alignItems: 'flex-start', width: '50%', flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 }}>
            <View style={{ flex: 1 }}>
              <Text>Fixed Discount :</Text>
              <TextInput
                placeholder={`${this.state.editItemDetails.fixedDiscount.discountValue}`}
                keyboardType={'number-pad'}
                placeholderTextColor={'#808080'}
                style={{ paddingTop: 8, paddingBottom: 6, flex: 1 }}
                value={this.state.editItemDetails.fixedDiscount.discountValue}
                // returnKeyType={'done'}
                onChangeText={(text) => {
                  this.fixedDiscountValueChange(text);
                }}
              />
              {this._renderBottomSeprator(8)}
            </View>

            {/* <View style={{alignItems: 'center', flex: 1, paddingVertical: 10}}>
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
            </View> */}
          </View>
        </View>
      </View>
    );
  }

  _renderBottomSheetTax() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ marginHorizontal: 16, flex: 1, paddingVertical: 10 }}>
          <TouchableOpacity
            disabled={!(this.props.taxArray.length > 0)}
            onPress={() => {
              this.setState({ showTaxPopup: true });
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={'Union-65'} size={12} />
              <Text style={{ marginLeft: 10, color: this.props.taxArray.length > 0 ? 'black' : '#808080' }}>Tax</Text>
            </View>
            {this.state.editItemDetails.taxDetailsArray.length > 0 ? (
              <Text style={style.TaxText} numberOfLines={2}>
                {this.state.editItemDetails.taxDetailsArray.map((item) => `${item.name}  `)}
              </Text>
            ) : (
              <Text style={style.bottomSheetSelectTaxText}>Select Tax</Text>
            )}
            {/* <Text style={style.bottomSheetSelectTaxText}>Select Tax</Text> */}
          </TouchableOpacity>
          {this._renderBottomSeprator()}
        </View>
        <View style={{ marginHorizontal: 16, flex: 1, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ paddingTop: 16 }}>{this.state.editItemDetails.taxText.toFixed(2)}</Text>

          {/* <TextInput
            placeholder={'00.00'}
            placeholderTextColor={'#808080'}
            style={{paddingTop: 16}}
            returnKeyType={'done'}
            value={this.state.editItemDetails.taxText}
            onChangeText={(text) => {
              this.onChangeTextBottomItemSheet(text, 'Discount Percentage');
            }}
          /> */}
          {this._renderBottomSeprator()}
        </View>
      </View>
    );
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }
}

export default EditItemDetails;
