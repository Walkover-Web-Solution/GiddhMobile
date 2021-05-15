import React from 'react';
import {GDContainer} from '@/core/components/container/container.component';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  TextInput,
  DeviceEventEmitter,
  Keyboard,
  ActivityIndicator,
  NativeModules,
  StatusBar,
} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import {useIsFocused} from '@react-navigation/native';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
const {SafeAreaOffsetHelper} = NativeModules;

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
const INVOICE_TYPE = {
  credit: 'Credit',
  cash: 'Cash',
};
interface Props {
  navigation: any;
}
class PurchaseAddItem extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      itemList: [],
      searchItemName: '',
      searchResults: [],
      isSearchingParty: false,
      searchError: '',
      addedItems: this.props.route.params.addedItems,
      bottomOffset: 0,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#ef6c00" barStyle="light-content" /> : null;
  };
  componentDidMount() {
    if (Platform.OS == 'ios') {
      //Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        let {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }
    this.searchUser();
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
  }
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
  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  renderHeader() {
    return (
      <View style={style.header}>
        <View
          style={{
            flexDirection: 'row',

            paddingVertical: 10,
            alignItems: 'center',
            // backgroundColor: 'pink',
            flex: 1,
          }}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TextInput
            placeholder={'Search Product/Service'}
            placeholderTextColor={'#fafafa'}
            returnKeyType={'done'}
            onChangeText={(text) =>
              this.setState({searchItemName: text}, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
        <View style={{marginRight: 10}}>
          <Text style={style.footerItemsTotalText}>{`₹${this.performCalulations()}`}</Text>
          <Text style={{color: 'white'}}>{`Items: ${this.state.addedItems.length}`}</Text>
        </View>
      </View>
    );
  }

  searchCalls = _.debounce(this.searchUser, 2000);

  _renderSearchList() {
    return (
      <View style={{}}>
        <FlatList
          data={this.state.itemList}
          keyExtractor={(item, index) => index.toString()}
          // ListFooterComponentStyle={{flex: 1, justifyContent: 'flex-end'}}
          // contentContainerStyle={{flexGrow: 1}}
          // ListFooterComponent={}
          // style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          renderItem={({item, index}) => (
            <View style={{paddingHorizontal: 20, paddingTop: 20}}>
              {item.stock ? this._renderStockView(item) : this._renderServiceView(item)}
              <View style={{height: 8, width: '100%', bottom: 0, alignSelf: 'center'}} />

              <View
                style={{
                  height: 0.5,
                  backgroundColor: '#808080',
                  width: '100%',
                  bottom: 0,
                  position: 'absolute',
                  alignSelf: 'center',
                }}
              />
            </View>
          )}
        />
      </View>
    );
  }

  serviceRateValueChange(item, text) {
    let itemUniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    let addedArray = this.state.addedItems;
    // var index = _.findIndex(addedArray, { uniqueName: item.uniqueName });
    let index = _.findIndex(
      addedArray,
      (e) => {
        let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    item.rate = text;

    // Replace item at index using native splice
    addedArray.splice(index, 1, item);
    this.setState({addedItems: addedArray});
  }
  _renderStockView(item) {
    var filtered = _.filter(this.state.addedItems, function (o) {
      let ouniqueName = o.stock ? o.stock.uniqueName : o.uniqueName;

      if (ouniqueName == item.stock.uniqueName) return o;
    });
    let filteredItem = {};
    if (filtered && filtered.length > 0 && filtered[0]) {
      filteredItem = filtered[0];
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {!this.checkIfItemIsSelcted(item) ? (
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
            <Text style={style.inventoryNameText} numberOfLines={2}>
              {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
            </Text>
            <TouchableOpacity
              style={{backgroundColor: '#ffe0b2', height: 32, borderRadius: 16, justifyContent: 'center'}}
              onPress={() => {
                this.addItem(item);
              }}>
              <Text style={{paddingHorizontal: 14, alignSelf: 'center'}}>{'ADD'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={style.inventoryNameText}>
                {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
              </Text>
              {/* <View style={{backgroundColor: 'pink', alignItems: 'center'}}> */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    this.updateQuantityOfItem(filteredItem, 'minus');
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#FC8345',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name={'minus'} color={'white'} size={15} />
                </TouchableOpacity>
                <Text
                  style={{
                    minWidth: 80,
                    fontSize: 12,
                    color: '#1C1C1C',
                    borderWidth: 1,
                    padding: 4,

                    borderColor: '#D9D9D9',
                    marginHorizontal: 6,
                    textAlign: 'center',
                  }}>
                  {filteredItem.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.updateQuantityOfItem(filteredItem, 'add');
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: '#FC8345',
                    borderRadius: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <AntDesign name={'plus'} color={'white'} size={15} />
                </TouchableOpacity>
              </View>
              {/* {filteredItem.stock && (
                  // <View style={{flexDirection: 'row', width: '50%', justifyContent: 'center'}}>
                  <Text style={{marginLeft: 10}}>
                    Unit : {filteredItem.stock.stockUnitCode !== undefined ? filteredItem.stock.stockUnitCode : ''}
                  </Text>
                )} */}
              {/* </View> */}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                // backgroundColor: 'pink',
                marginTop: 5,
              }}>
              <View style={{flexDirection: 'row', width: '50%'}}>
                <Text>Rate: </Text>
                <Text>{filteredItem.rate ? filteredItem.rate : '0'}</Text>
              </View>
              {filteredItem.stock && (
                <View style={{flexDirection: 'row', width: '50%', justifyContent: 'center'}}>
                  <Text style={{marginLeft: 20}}>
                    {filteredItem.stock.stockUnitCode !== undefined ? filteredItem.stock.stockUnitCode : ''}
                  </Text>
                </View>
              )}
              {/* <TouchableOpacity
                style={{height: 30, width: 30, backgroundColor: 'pink'}}
                onPress={() => console.log(filteredItem)}></TouchableOpacity> */}
              {/* <TextInput
                onChangeText={(text) => {
                  this.serviceRateValueChange(filteredItem, text);
                }}
                // value={filteredItem.stock.rate}
                placeholder={`${filteredItem.stock.rate}`}
                keyboardType={'decimal-pad'}
                returnKeyType={'done'}
                style={{
                  borderColor: '#D9D9D9',
                  fontSize: 12,
                  color: '#1C1C1C',
                  borderWidth: 1,
                  padding: 4,
                  marginLeft: 6,
                  minWidth: 100,
                }}
              /> */}
            </View>
          </View>
        )}
      </View>
    );
  }
  _renderServiceView(item) {
    var filtered = _.filter(this.state.addedItems, function (o) {
      if (o.uniqueName == item.uniqueName) return o;
    });
    let filteredItem = {};
    if (filtered && filtered.length > 0 && filtered[0]) {
      filteredItem = filtered[0];
    }
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {!this.checkIfItemIsSelcted(item) ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              // backgroundColor: 'pink',
              flex: 1,
            }}>
            <Text style={style.inventoryNameText} numberOfLines={2}>
              {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#ffe0b2',
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => {
                this.addItem(item);
              }}>
              <Text style={{paddingHorizontal: 14, alignSelf: 'center'}}>SELECT</Text>
              {/* <Icon style={{marginLeft: 10}} name={'path-18'} size={10} color={'#1C1C1C'} /> */}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={style.inventoryNameText}>
                {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.deleteItemFromList(item);
                }}>
                {this.checkIfItemIsSelcted(item) && (
                  <Icon style={{marginLeft: 10}} name={'path-14'} size={10} color={'white'} />
                )}

                <Text style={{paddingHorizontal: 14, alignSelf: 'center', color: 'white'}}>{'Remove'}</Text>
              </TouchableOpacity>
            </View>
            <View style={{width: 100}}>
              {/* <Text style={{}}>{`SAC: ${item.sacNumber && item.sacNumber !== 'null' ? item.sacNumber : ''}`}</Text> */}

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text>Rate : </Text>
                <Text>{filteredItem.rate ? filteredItem.rate : '0'}</Text>
                {/* <Text>{filteredItem.unit ? filteredItem.unit : '0'}</Text>
                <TouchableOpacity
                  style={{height: 30, width: 30, backgroundColor: 'pink'}}
                  onPress={() => console.log(filteredItem)}></TouchableOpacity> */}
                {/* <Text>{filteredItem}</Text> */}
                {/* <TextInput
                  placeholder={'Enter Rate'}
                  onChangeText={(text) => {
                    this.serviceRateValueChange(filteredItem, text);
                  }}
                  value={filteredItem.rate}
                  keyboardType={'decimal-pad'}
                  returnKeyType={'done'}
                  style={{
                    borderColor: '#D9D9D9',
                    fontSize: 12,
                    color: '#1C1C1C',
                    borderWidth: 1,
                    padding: 4,
                    marginLeft: 6,
                    minWidth: '100%',
                  }}
                /> */}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
  async searchUser() {
    this.setState({isSearchingParty: true});
    try {
      const results = await InvoiceService.search(
        this.state.searchItemName,
        1,
        'operatingcost%2C%20indirectexpenses',

        true,
      );
      if (results.body && results.body.results) {
        // console.log('results are', results);
        this.setState(
          {itemList: results.body.results, isSearchingParty: false, searchError: ''},
          // , () =>
          // console.log('item list updates'),
        );
      }
    } catch (e) {
      this.setState({itemList: [], searchError: 'No Results', isSearchingParty: false});
    }
  }

  async addItem(item) {
    this.setState({loading: true});
    try {
      if (item.stock) {
        const results = await InvoiceService.getStockDetails(item.uniqueName, item.stock.uniqueName);
        if (results && results.body) {
          let addedItems = this.state.addedItems;
          if (!this.checkIfItemIsSelcted(results.body)) {
            let data = results.body;
            data.quantity = 1;
            data.rate = results.body.stock.rate;
            addedItems.push(this.createNewEntry(data));
          }
          this.setState({addedItems, loading: false});
        } else {
          this.setState({searchError: 'No Results', loading: false});
        }
      } else {
        const results = await InvoiceService.getSalesDetails(item.uniqueName);
        if (results && results.body) {
          let addedItems = this.state.addedItems;
          if (!this.checkIfItemIsSelcted(results.body)) {
            let data = results.body;
            data.quantity = 1;
            data.rate = 0;
            addedItems.push(this.createNewEntry(data));
          }
          this.setState({addedItems, loading: false});
        } else {
          this.setState({searchError: 'No Results', loading: false});
        }
      }
    } catch (e) {
      alert(e);
      this.setState({searchError: 'No Results', loading: false});
    }
  }

  createNewEntry(item) {
    let entry = item;
    if (item.stock) {
      entry.quantity = 1;
    }
    return entry;
  }

  getItemFromAddedList(uniqueName) {
    var filtered = _.filter(this.state.addedItems, function (o) {
      if (o.uniqueName == uniqueName) return o;
    });
    return filtered[0];
  }

  updateQuantityOfItem(item, performedType) {
    if (performedType == 'add') {
      let addedArray = this.state.addedItems;
      let index = _.findIndex(
        addedArray,
        (e) => {
          let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
          return ouniqueName == item.stock.uniqueName;
        },
        0,
      );

      item.quantity = item.quantity + 1;

      // Replace item at index using native splice
      addedArray.splice(index, 1, item);
      this.setState({addedItems: addedArray}, () => {});
    } else if (performedType == 'minus') {
      if (item.quantity == 1) {
        let addedArray = this.state.addedItems;
        let index = _.findIndex(
          addedArray,
          (e) => {
            let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
            return ouniqueName == item.stock.uniqueName;
          },
          0,
        ); // Replace item at index using native splice
        addedArray.splice(index, 1);
        this.setState({addedItems: addedArray}, () => {});
        //del the item form selected list
      } else {
        let addedArray = this.state.addedItems;
        let index = _.findIndex(
          addedArray,
          (e) => {
            let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
            return ouniqueName == item.stock.uniqueName;
          },
          0,
        );
        item.quantity = item.quantity - 1;

        // Replace item at index using native splice
        addedArray.splice(index, 1, item);
        this.setState({addedItems: addedArray}, () => {});
      }
    }
  }

  deleteItemFromList(item) {
    let uniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;

    let addedArray = this.state.addedItems;
    let index = _.findIndex(
      addedArray,
      (e) => {
        let ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == uniqueName;
      },
      0,
    ); // Replace item at index using native splice
    addedArray.splice(index, 1);
    this.setState({addedItems: addedArray}, () => {});
  }
  checkIfItemIsSelcted(item) {
    let uniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    if (item)
      var filtered = _.filter(this.state.addedItems, function (o) {
        let ouniqueName = o.stock ? o.stock.uniqueName : o.uniqueName;

        if (ouniqueName == uniqueName) return o;
      });
    if (filtered.length > 0) {
      return true;
    }
    return false;
  }

  _renderSummaryFooter() {
    return (
      <Animated.View style={[style.footerAddItemConatiner, {marginBottom: this.keyboardMargin}]}>
        {/* <View>
          <Text style={style.footerItemsTotalText}>{`₹${this.performCalulations()}`}</Text>
          <Text>{`Items: ${this.state.addedItems.length}`}</Text>
        </View> */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.goBack();
            DeviceEventEmitter.emit(APP_EVENTS.updatedItemInPurchaseBill, this.state.addedItems);
          }}
          style={{
            height: 32,
            borderRadius: 16,
            backgroundColor: '#FC8345',
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={style.addItemDone}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
  performCalulations() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      let item = this.state.addedItems[i];
      if (item.stock) {
        //do inventory calulations
        if (item.rate) {
          total = total + Number(item.rate * item.quantity);
          console.log('stock rate changed');
        } else {
          total = total + Number(item.stock.rate * item.quantity);
          console.log('stock rate not changed');
        }
      } else {
        // do sales calulation
        if (item.rate) {
          total = total + Number(item.rate);
          console.log('sales');
        }
      }
    }
    return total;
  }
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {this.FocusAwareStatusBar(this.props.isFocused)}
        <View style={style.headerConatiner}>{this.renderHeader()}</View>

        <View style={{flex: 1}}>
          <View style={style.container}>{this.state.itemList.length > 0 && this._renderSearchList()}</View>

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
        </View>
        {/* <TouchableOpacity
          style={{height: 60, width: 60, backgroundColor: 'pink'}}
          onPress={() => console.log(JSON.stringify(this.state.itemList))}></TouchableOpacity> */}
        {this._renderSummaryFooter()}
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

  return <PurchaseAddItem {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
