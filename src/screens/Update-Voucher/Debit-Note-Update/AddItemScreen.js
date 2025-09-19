import React, { createRef } from 'react';
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
  Platform
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import _ from 'lodash';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import { APP_EVENTS } from '@/utils/constants';
import Fontisto from 'react-native-vector-icons/Fontisto';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';
const { SafeAreaOffsetHelper } = NativeModules;

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide'
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide'
};
interface Props {
  navigation: any;
}
class AddItemScreen extends React.Component<Props> {
  constructor (props) {
    super(props);
    this.variantsBottomSheetRef = createRef();
    this.state = {
      loading: false,
      itemList: [],
      searchItemName: '',
      searchResults: [],
      allStockVariants: {},
      selectedStock: {},
      addedItems: [],
      isSearchingParty: false,
      searchError: '',
      bottomOffset: 0
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  componentDidMount () {
    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
    this.searchUser();
  }

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

  componentWillUnmount () {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

  renderHeader () {
    return (
      <View style={style.header}>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 10,
            alignItems: 'center',
            flex: 1
          }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TextInput
            placeholder={'Search Product/Service'}
            placeholderTextColor={'#fff'}
            returnKeyType={'done'}
            onChangeText={(text) =>
              this.setState({ searchItemName: text }, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
        <View style={{ marginRight: 10 }}>
          <Text style={style.footerItemsTotalText}>{this.props.route.params.currencySymbol+`${formatAmount(this.performCalulations())}`}</Text>
          <Text style={{ color: 'white' }}>{`Items: ${this.state.addedItems.length}`}</Text>
        </View>
      </View>
    );
  }

  searchCalls = _.debounce(this.searchUser, 200);

  _renderSearchList () {
    return (
      <View style={{}}>
        <FlatList
          data={this.state.itemList}
          keyExtractor={(item, index) => index.toString()}
          // ListFooterComponentStyle={{flex: 1, justifyContent: 'flex-end'}}
          // contentContainerStyle={{flexGrow: 1}}
          // ListFooterComponent={}
          // style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              {item.stock ? this._renderStockView(item) : this._renderServiceView(item)}
              <View style={{ height: 8, width: '100%', bottom: 0, alignSelf: 'center' }} />

              <View
                style={{
                  height: 0.5,
                  backgroundColor: '#808080',
                  width: '100%',
                  bottom: 0,
                  position: 'absolute',
                  alignSelf: 'center'
                }}
              />
            </View>
          )}
        />
      </View>
    );
  }

  serviceRateValueChange (item, text) {
    const itemUniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    const addedArray = this.state.addedItems;
    // var index = _.findIndex(addedArray, { uniqueName: item.uniqueName });
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.stock ? e.stock.uniqueName : e.uniqueName;
        return ouniqueName == itemUniqueName;
      },
      0
    );
    item.rate = text;

    // Replace item at index using native splice
    addedArray.splice(index, 1, item);
    this.setState({ addedItems: addedArray });
  }

  _variantsBottomSheet (){
    const renderItem = ({item}) => {
      const filtered = this.state.addedItems.filter((obj) => obj?.stock?.uniqueName == this.state.selectedStock?.stock?.uniqueName);
      const index = filtered.findIndex((itemObj) => itemObj?.stock?.variant?.uniqueName === item.uniqueName)

      return (
        <TouchableOpacity 
          style={style.button}
          onPress={() => {
            if(index == -1){
              this.addItem(this.state.selectedStock, item?.uniqueName);
            } else{
              this.updateQuantityOfItem(this.state.selectedStock, 'remove', item?.uniqueName);
            }            
          }}
        >
          { index !== -1
            ?  <AntDesign name="checksquare" size={20} color={"#ff6961"} />
            :  <Fontisto name="checkbox-passive" size={20} color={'#CCCCCC'} />
          }
          <Text style={style.buttonText}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )
    }
    return(
      <BottomSheet
        bottomSheetRef={this.variantsBottomSheetRef}
        headerText={`Select Variants`}
        headerTextColor='#ff6961'
        onClose={() => {
          this.setState({ selectedStock: {}});
        }}
        flatListProps={{
          data: this.state.allStockVariants[this.state?.selectedStock?.stock?.uniqueName],
          renderItem: renderItem
        }}
      />
    )
  }

  _renderStockView (item) {
    const filtered = _.filter(this.state.addedItems, function (o) {
      const ouniqueName = o.stock ? o.stock.uniqueName : o.uniqueName;

      if (ouniqueName == item.stock.uniqueName) {
        return o;
      }
    });
    let filteredItem = {};
    if (filtered && filtered.length > 0 && filtered[0]) {
      filteredItem = filtered[0];
    }
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {!this.checkIfItemIsSelcted(item)
          ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <Text style={style.inventoryNameText} numberOfLines={2}>
                {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
              </Text>
              <TouchableOpacity
              style={{ backgroundColor: 'rgba(255, 99, 71, 0.1)', height: 32, borderRadius: 16, justifyContent: 'center' }}
              onPress={() => {
                this.addItem(item);
              }}>
              <Text style={[{ paddingHorizontal: 14, alignSelf: 'center' }, style.regularText]}>{'ADD'}</Text>
            </TouchableOpacity>
          </View>
            )
          : 
            this.state.allStockVariants[filteredItem?.stock?.uniqueName]?.length > 1 
            ? 
            <View style={{flex: 1}}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingBottom: 5 }}>
              <Text style={style.inventoryNameText} numberOfLines={2}>
                {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: 'rgba(255, 99, 71, 0.1)', height: 32, borderRadius: 16, justifyContent: 'center' }}
                onPress={() => {
                  this.setState({selectedStock: item});
                  this.setBottomSheetVisible(this.variantsBottomSheetRef, true);
                }}>
                <Text style={[{ paddingHorizontal: 14, alignSelf: 'center' }, style.regularText]}>{'Select Variants'}</Text>
              </TouchableOpacity>
            </View>
            {filtered.map((item) => {
              return (
                <View style={{flex: 1, paddingTop: 10}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={style.regularText}>                                      
                      {item?.stock?.variant?.name}
                    </Text>
                    <Text style={style.smallText}>
                    {item?.stock?.rate ? item?.stock?.rate : '0'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    onPress={() => {
                      this.updateQuantityOfItem(item, 'minus');
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: '#ff6961',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <AntDesign name={'minus'} color={'white'} size={15} />
                  </TouchableOpacity>
                  <Text
                    style={[{
                      minWidth: 80,
                      fontSize: 12,
                      color: '#1C1C1C',
                      borderWidth: 1,
                      padding: 4,

                      borderColor: '#D9D9D9',
                      marginHorizontal: 6,
                      textAlign: 'center'
                    }, style.regularText
                  ]}>
                    {item?.quantity} {item?.stock?.stockUnitCode !== undefined ? item?.stock?.stockUnitCode : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.updateQuantityOfItem(item, 'add');
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: '#ff6961',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <AntDesign name={'plus'} color={'white'} size={15} />
                  </TouchableOpacity>
                  </View>
                </View>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                </View>
                </View>
              )
            })}
            </View>
            : 
            (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{flex: 1}}>
                  <Text style={style.inventoryNameText}>
                    {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
                  </Text>
                  <Text style={style.smallText}>
                  Rate: {filteredItem?.stock?.rate ? filteredItem?.stock?.rate : '0'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.updateQuantityOfItem(filteredItem, 'minus');
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: '#ff6961',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <AntDesign name={'minus'} color={'white'} size={15} />
                  </TouchableOpacity>
                  <Text
                    style={[{
                      minWidth: 80,
                      fontSize: 12,
                      color: '#1C1C1C',
                      borderWidth: 1,
                      padding: 4,

                      borderColor: '#D9D9D9',
                      marginHorizontal: 6,
                      textAlign: 'center'
                    }, style.regularText]}>
                    {filteredItem.quantity} {filteredItem.stock.stockUnitCode !== undefined ? filteredItem.stock.stockUnitCode : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      this.updateQuantityOfItem(filteredItem, 'add');
                    }}
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: '#ff6961',
                      borderRadius: 12,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <AntDesign name={'plus'} color={'white'} size={15} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        )}
      </View>
    );
  }

  _renderServiceView (item) {
    const filtered = _.filter(this.state.addedItems, function (o) {
      if(o?.stock) return;
      if (o.uniqueName == item.uniqueName) {
        return o;
      }
    });
    let filteredItem = {};
    if (filtered && filtered.length > 0 && filtered[0]) {
      filteredItem = filtered[0];
    }
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {!this.checkIfItemIsSelcted(item)
          ? (
            <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              // backgroundColor: 'pink',
              flex: 1
            }}>
            <Text style={style.inventoryNameText} numberOfLines={2}>
              {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 99, 71, 0.1)',
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => {
                this.addItem(item);
              }}>
              <Text style={[{ paddingHorizontal: 14, alignSelf: 'center' }, style.regularText]}>SELECT</Text>
              {/* <Icon style={{marginLeft: 10}} name={'path-18'} size={10} color={'#1C1C1C'} /> */}
            </TouchableOpacity>
          </View>
          ) 
          : (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{flex: 1}}>
                <Text style={style.inventoryNameText}>
                  {item.stock && item.stock.name ? item.name + ' (' + item.stock.name + ')' : item.name}
                </Text>
                <Text style={style.smallText}>
                  Rate : {filteredItem.rate ? filteredItem.rate : '0'}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: 'red',
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => {
                  this.deleteItemFromList(item);
                }}>
                {this.checkIfItemIsSelcted(item) && (
                  <Icon style={{ marginLeft: 10 }} name={'path-14'} size={10} color={'white'} />
                )}

                <Text style={[style.regularText, { paddingHorizontal: 14, alignSelf: 'center', color: 'white' }]}>{'Remove'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  async searchUser () {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.search(
        this.state.searchItemName,
        1,
        this.props.companyVoucherVersion == 1 ? 'operatingcost%2C%20indirectexpenses' : 'operatingcost%2C%20indirectexpenses%2C%20fixedassets',
        true
      );
      if (results.body && results.body.results) {
        // console.log('results are', results);
        this.setState(
          { itemList: results.body.results, isSearchingParty: false, searchError: '' }
          // , () =>
          // console.log('item list updates'),
        );
      }
    } catch (e) {
      this.setState({ itemList: [], searchError: 'No Results', isSearchingParty: false });
    }
  }

  async addItem(item, variantUniqueName) {
    this.setState({ loading: true });
    try {
      if (item.stock) {
        let tempAllStockVariantsResults = {
          ...this.state.allStockVariants
        };
        if(!this.state.allStockVariants[item.stock.uniqueName]){
          const stockVariantsResult = await InvoiceService.getStockVariants(item.stock.uniqueName);
          if(stockVariantsResult.status == 'success' && stockVariantsResult.body){
            tempAllStockVariantsResults = {
              ...this.state.allStockVariants,
              [item.stock.uniqueName]: stockVariantsResult.body
            }
            this.setState({
              allStockVariants: {
                ...this.state.allStockVariants,
                [item.stock.uniqueName]: stockVariantsResult.body
              }
            });
          }
        }
        const results = await InvoiceService.getStockDetails(item.uniqueName, item.stock.uniqueName, variantUniqueName ?? tempAllStockVariantsResults[item.stock.uniqueName][0].uniqueName);
        if (results && results.body) {
          const addedItems = this.state.addedItems;
          // if (!this.checkIfItemIsSelcted(results.body)) {
            const data = results.body;
            if(data?.stock?.variant){
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
            data.tdsTcsTaxCalculationMethod = 'OnTaxableAmount'
            // data.rate = results.body.stock.rate;
            if(this.props.companyVoucherVersion == 2){ 
              const variantObj = this.state.allStockVariants[item.stock.uniqueName].find((variant) => variant.uniqueName == variantUniqueName); 
              data.stock.variant.name = variantObj?.name ?? this.state.allStockVariants[item.stock.uniqueName][0].name;
              data.stock.isMultiVariant = this.state.allStockVariants[item.stock.uniqueName]?.length > 1;
            }
            data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Used to identify and Edit multiple same entries
            addedItems.push(this.createNewEntry(data));
          // }
          this.setState({ addedItems, loading: false });
          if(this.props.companyVoucherVersion == 2){ 
            if(this.state.allStockVariants[item.stock.uniqueName]?.length > 1){
              this.setState({selectedStock: item});
              this.setBottomSheetVisible(this.variantsBottomSheetRef, true);
            }
          }
        } else {
          this.setState({ searchError: 'No Results', loading: false });
        }
      } else {
        const results = await InvoiceService.getSalesDetails(item.uniqueName);
        if (results && results.body) {
          const addedItems = this.state.addedItems;
          if (!this.checkIfItemIsSelcted(results.body)) {
            const data = results.body;
            data.quantity = 1;
            data.rate = 0;
            data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Used to identify and Edit multiple same entries
            addedItems.push(this.createNewEntry(data));
          }
          this.setState({ addedItems, loading: false });
        } else {
          this.setState({ searchError: 'No Results', loading: false });
        }
      }
    } catch (e) {
      alert(e);
      this.setState({ searchError: 'No Results', loading: false });
    }
  }

  createNewEntry (item) {
    const entry = item;
    if (item.stock) {
      entry.quantity = 1;
    }
    return entry;
  }

  getItemFromAddedList (uniqueName) {
    const filtered = _.filter(this.state.addedItems, function (o) {
      if (o.uniqueName == uniqueName) {
        return o;
      }
    });
    return filtered[0];
  }

  updateQuantityOfItem(item, performedType, variantUniqueName) {
    if (performedType == 'add') {
      const addedArray = this.state.addedItems;
      const index = _.findIndex(
        addedArray,
        (e) => {
          const ouniqueName = e.stock ? (e.stock?.variant ? e.stock?.variant.uniqueName : e.stock?.uniqueName) : e.uniqueName;
          return ouniqueName == (item.stock?.variant ? item.stock?.variant.uniqueName : item.stock?.uniqueName);
        },
        0
      );

      item.quantity = item.quantity + 1;

      // Replace item at index using native splice
      addedArray.splice(index, 1, item);
      this.setState({ addedItems: addedArray }, () => { });
    } else if (performedType == 'minus') {
      if (item.quantity == 1) {
        const addedArray = this.state.addedItems;
        const index = _.findIndex(
          addedArray,
          (e) => {
            const ouniqueName = e.stock ? (e.stock?.variant ? e.stock?.variant.uniqueName : e.stock?.uniqueName) : e.uniqueName;
            return ouniqueName == (item.stock?.variant ? item.stock?.variant.uniqueName : item.stock?.uniqueName);
          },
          0
        ); // Replace item at index using native splice
        addedArray.splice(index, 1);
        this.setState({ addedItems: addedArray }, () => { });
        // del the item form selected list
      } else {
        const addedArray = this.state.addedItems;
        const index = _.findIndex(
          addedArray,
          (e) => {
            const ouniqueName = e.stock ? (e.stock?.variant ? e.stock?.variant.uniqueName : e.stock?.uniqueName) : e.uniqueName;
            return ouniqueName == (item.stock?.variant ? item.stock?.variant.uniqueName : item.stock?.uniqueName);
          },
          0
        );
        item.quantity = item.quantity - 1;

        // Replace item at index using native splice
        addedArray.splice(index, 1, item);
        this.setState({ addedItems: addedArray }, () => { });
      }
    } else if(performedType == 'remove'){
      const addedArray = this.state.addedItems;
      const index = _.findIndex(
        addedArray,
        (e) => {
          const ouniqueName = e.stock ? e.stock.variant.uniqueName : e.uniqueName;
          return ouniqueName == variantUniqueName;
        },
        0
      ); // Replace item at index using native splice
      addedArray.splice(index, 1);
      this.setState({ addedItems: addedArray }, () => {});
      // del the item form selected list
    }
  }

  deleteItemFromList(item) {
    const uniqueName = item.stock ? (e.stock?.variant ? e.stock?.variant.uniqueName : e.stock?.uniqueName) : item.uniqueName;
    const addedArray = this.state.addedItems;
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.stock ? (e.stock?.variant ? e.stock?.variant.uniqueName : e.stock?.uniqueName) : e.uniqueName;
        return ouniqueName == uniqueName;
      },
      0
    ); // Replace item at index using native splice
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray }, () => { });
  }

  checkIfItemIsSelcted (item) {
    const uniqueName = item.stock ? item.stock.uniqueName : item.uniqueName;
    if (item) {
      var filtered = _.filter(this.state.addedItems, function (o) {
        const ouniqueName = o.stock ? o.stock.uniqueName : o.uniqueName;

        if (ouniqueName == uniqueName) {
          return o;
        }
      });
    }
    if (filtered.length > 0) {
      return true;
    }
    return false;
  }

  _renderSummaryFooter () {
    return (
      <Animated.View style={[style.footerAddItemConatiner, { marginBottom: this.keyboardMargin }]}>
        {/* <View>
          <Text style={style.footerItemsTotalText}>{`₹${this.performCalulations()}`}</Text>
          <Text>{`Items: ${this.state.addedItems.length}`}</Text>
        </View> */}
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.goBack();
            DeviceEventEmitter.emit(APP_EVENTS.updatedItemInInvoice, this.state.addedItems);
          }}
          style={{
            height: 32,
            borderRadius: 16,
            backgroundColor: '#ff6961',
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <Text style={style.addItemDone}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  performCalulations () {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      if (item.stock) {
        // do inventory calulations
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

  render () {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={style.headerConatiner}>{this.renderHeader()}</View>

        <View style={{ flex: 1 }}>
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
                top: 0
              }}>
              <LoaderKit
                  style={{ width: 45, height: 45 }}
                  name={'LineScale'}
                  color={color.PRIMARY_NORMAL}
              />
            </View>
          )}
        </View>
        {/* <TouchableOpacity
          style={{height: 60, width: 60, backgroundColor: 'pink'}}
          onPress={() => console.log(JSON.stringify(this.state.itemList))}></TouchableOpacity> */}
        {this._renderSummaryFooter()}
        {this._variantsBottomSheet()}
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

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(AddItemScreen);
export default MyComponent;
