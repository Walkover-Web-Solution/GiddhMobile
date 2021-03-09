import React, { Component } from 'react';
import {
    View,
    Text,
    Keyboard,
    TouchableOpacity,
    Animated,
    TextInput,
    NativeModules,
    Platform
} from 'react-native';
import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign'

import style from './style'


export const KEYBOARD_EVENTS = {
    IOS_ONLY: {
        KEYBOARD_WILL_SHOW: 'keyboardWillShow',
        KEYBOARD_WILL_HIDE: 'keyboardWillHide',
    },
    KEYBOARD_DID_SHOW: 'keyboardDidShow',
    KEYBOARD_DID_HIDE: 'keyboardDidHide'
}

/**
 * UI For Create account screen
 */
class EditItemDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bottomOffset:0,
            itemDetails: this.props.itemDetails,
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
      
          
        }
        this.keyboardMargin = new Animated.Value(0);

    }

    renderHeader() {
        return (
            <View style={style.header}>
                <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center', backgroundColor: '#229F5F', width: '100%' }}>
                    <TouchableOpacity style={{ padding: 10 }} onPress={() => { this.props.goBack() }}>
                        <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
                    </TouchableOpacity>
                    <Text style={{color: 'white', fontSize:16}}>{this.state.itemDetails.name}</Text>
                </View>
                <Text style={style.invoiceTypeTextRight}>{this.state.invoiceType}</Text>
            </View>
        )
    }

    componentDidMount() {
        this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
        this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
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

  

    render() {
        return (
            <View style={{width: '100%', height: '100%', top:0, bottom: 0, left:0, right:0, position: 'absolute', backgroundColor: 'white', flex:1}}>
                                 {this.renderHeader()}

                <Animated.ScrollView keyboardShouldPersistTaps='always' style={[{ flex: 1 }, { marginBottom: this.keyboardMargin }]} bounces={false}>
                <View style={style.container}>
                 {this._renderScreenElements()}
                </View>
            </Animated.ScrollView>
                </View>
            
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
  _renderTwoFieldsTextInput(field1, field1Value, field2, field2Value, icon1, icon2, keyboardType1, keyboardType2) {
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
            keyboardType={keyboardType1}
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
            keyboardType={keyboardType2}
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
  _renderScreenElements() {
    return (
      <View style={{ backgroundColor: 'transparent', width: '100%', height: '100%', justifyContent: 'flex-end' }}>
        <View style={{  backgroundColor: 'white',width: '100%' }}>
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

          {this._renderTwoFieldsTextInput('Quantity', this.state.editItemDetails.quantityText, 'Unit', this.state.editItemDetails.unitText, 'Product', 'Product', 'number-pad', 'default')}
          {/*
            Render Rate & Amount 
          */}
          {this._renderTwoFieldsTextInput('Rate', this.state.editItemDetails.rateText, 'Amount', this.state.editItemDetails.amountText, 'Product', 'Product', 'decimal-pad', 'decimal-pad')}


          {/*
            Render Discount & Amount 
          */}
          {this._renderBottomItemSheetDiscountRow()}
          {this._renderBottomSheetTax()}
          <TouchableOpacity onPress={()=> {this.props.updateItems(this.state.editItemDetails)}} style={{ marginHorizontal: 16, backgroundColor: '#5773FF', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 15 }}>
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
  
}

export default (EditItemDetails);