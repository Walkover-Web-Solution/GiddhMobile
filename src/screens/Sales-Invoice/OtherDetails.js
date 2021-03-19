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
  Dimensions,
} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Bars} from 'react-native-loader';
import color from '@/utils/colors';
import _ from 'lodash';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {SafeAreaView} from 'react-native-safe-area-context';
const {SafeAreaOffsetHelper} = NativeModules;

const {height, width} = Dimensions.get('window');

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
class OtherDetails extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      otherDetail: {},

      bottomOffset: 0,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  componentDidMount() {
    if (Platform.OS == 'ios') {
      //Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        let {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }
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
      <View style={[style.header, {backgroundColor: '#229F5F'}]}>
        <View style={{flexDirection: 'row', paddingVertical: 10, alignItems: 'center'}}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{fontSize: 16, color: 'white'}}>Other Details</Text>
        </View>
      </View>
    );
  }

  _renderSelectWareHouse() {
    return (
      //this.props.route.params.warehouseArray
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('SelectAddress', {
            type: 'warehouse',
            warehouseArray: this.props.route.params.warehouseArray,
          })
        }>
        <View style={{flexDirection: 'row', paddingTop: 10, paddingBottom: 4, paddingHorizontal: 16}}>
          <Icon name={'path-8'} size={16} color={'#808080'} />

          <Text style={{color: '#808080', marginLeft: 10}}>Warehouse</Text>
        </View>
        <Text style={{color: '#808080', marginLeft: 10}}>
          {' '}
          {this.props.route.params.selectedWareHouse
            ? this.props.route.params.selectedWareHouse.address
            : 'Select Warehouse'}
        </Text>

        {this._renderBottomSeprator(16)}
      </TouchableOpacity>
    );
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }
  _renderTextField(text, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10,
          }}>
          {icon}
          <Text style={{color: '#808080', marginLeft: 10}}>{text}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginHorizontal: 16,
            height: 20,
            // backgroundColor: 'pink',
          }}></TextInput>
      </>
    );
  }
  _renderShipDate() {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          paddingTop: 10,
          paddingBottom: 4,
          paddingHorizontal: 16,
          //   backgroundColor: 'pink',
          marginTop: 10,
        }}>
        <Icon name={'Calendar'} size={16} color={'#808080'} />
        <Text style={{color: '#808080', marginLeft: 10}}>Ship Date</Text>
        {this._renderBottomSeprator(16)}
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        {this.renderHeader()}
        {this._renderSelectWareHouse()}
        {/* {this._renderShipDate()} */}
        {this._renderTextField('Shipped Via', <MaterialCommunityIcons name={'truck'} size={20} color={'#808080'} />)}
        {this._renderTextField('Custom Field 1', <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
        {this._renderTextField('Custom Field 2', <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
        {this._renderTextField('Custom Field 3', <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
        <TouchableOpacity
          style={{
            height: height * 0.06,
            width: width * 0.9,
            borderRadius: 25,
            backgroundColor: '#5773FF',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            position: 'absolute',
            bottom: height * 0.01,
          }}
          onPress={() => this.props.navigation.navigate('SalesInvoiceScreen')}>
          <Text
            style={{
              fontFamily: 'AvenirLTStd-Black',
              color: '#fff',
              fontSize: 20,
            }}>
            Save
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={{height: 50, width: 100, backgroundColor: 'pink'}}
          onPress={() => console.log(this.props.route.params.selectedWareHouse)}></TouchableOpacity> */}
      </SafeAreaView>
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

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(OtherDetails);
export default MyComponent;
