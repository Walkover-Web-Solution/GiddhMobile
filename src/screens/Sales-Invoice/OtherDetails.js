import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  TextInput,
  StatusBar,
  Keyboard,
  NativeModules,
  Dimensions
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import Icon from '@/core/components/custom-icon/custom-icon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import _ from 'lodash';
import { InvoiceService } from '@/core/services/invoice/invoice.service';

const { SafeAreaOffsetHelper } = NativeModules;

const { height, width } = Dimensions.get('window');

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
class OtherDetails extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      OtherDetailsHeadingNames :{
        shipDateName: 'Ship Date',
        shippedViaName: 'Shipped Via',
        trackingNumberName: 'Tracking no',
        customField1Name: 'Custom Field 1',
        customField2Name: 'Custom Field 2',
        customField3Name: 'Custom Field 3'
      },
      otherDetail: {
        shipDate: this.props.route.params.otherDetails.shipDate,
        shippedVia: this.props.route.params.otherDetails.shippedVia,
        trackingNumber: this.props.route.params.otherDetails.trackingNumber,
        customField1: this.props.route.params.otherDetails.customField1,
        customField2: this.props.route.params.otherDetails.customField2,
        customField3: this.props.route.params.otherDetails.customField3
      },

      isDatePickerVisible: false,
      bottomOffset: 0,
      keyboard: false
    }; 
    this.keyboardMargin = new Animated.Value(0);
  }

  async setHeadingName() {
    try {
      const results = await InvoiceService.getInvoiceTemplate();
      if (results.body && results.status == 'success') {
        const data = results.body
        for (let i = 0; i < data.length; i++) {
          if (data[i].isDefault) {
            let headerdata = data[i].sections.header.data
            await this.setState({
              OtherDetailsHeadingNames: {
                shipDateName: headerdata.shippingDate.label,
                shippedViaName: headerdata.shippedVia.label,
                trackingNumberName: headerdata.trackingNumber.label,
                customField1Name: headerdata.customField1.label,
                customField2Name: headerdata.customField2.label,
                customField3Name: headerdata.customField3.label
              }
            });
          }
        }      }
    } catch (e) { }
  }


  componentDidMount() {   

    this.setHeadingName()
    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }

    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
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

  _keyboardDidShow = () => {
    this.setState({ keyboard: true });
  };

  _keyboardDidHide = () => {
    this.setState({ keyboard: false });
  };

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  showDatePicker = () => {
    this.setState({ isDatePickerVisible: true });
  };

  hideDatePicker = () => {
    this.setState({ isDatePickerVisible: false });
  };

  handleConfirm = (date) => {
    console.warn('A date has been picked: ', date);
    this.hideDatePicker();
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState((prevState) => ({
      otherDetail: {
        ...prevState.otherDetail,
        shipDate: moment(date).format('DD-MM-YYYY')
      }
    }));
  };

  renderHeader() {
    return (
      <View style={[style.header, { backgroundColor: '#229F5F' }]}>
        <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: 'white' }}>Other Details</Text>
        </View>
      </View>
    );
  }

  _renderSelectWareHouse() {
    return (
      // this.props.route.params.warehouseArray
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('SelectAddress', {
            type: 'warehouse',
            warehouseArray: this.props.route.params.warehouseArray
          })
        }>
        <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 4, paddingHorizontal: 16 }}>
          <Icon name={'path-8'} size={16} color={'#808080'} />

          <Text style={{ color: '#808080', marginLeft: 10 }}>Warehouse</Text>
        </View>
        <Text style={{ color: '#808080', marginLeft: 10 }}>
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
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }

  _renderShippedViaTextField(name, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10
          }}>
          {icon}
          <Text style={{ color: '#808080', marginLeft: 10 }}>{name}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginHorizontal: 16,
            marginTop:5,
            height: 20
            // backgroundColor: 'pink',
          }}
          value={this.state.otherDetail.shippedVia}
          onChangeText={(text) => {
            this.setState((prevState) => ({
              otherDetail: {
                ...prevState.otherDetail,
                shippedVia: text
              }
            }));
          }}></TextInput>
      </>
    );
  }

  _renderTrackingNoTextField(name, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10
          }}>
          {icon}
          <Text style={{ color: '#808080', marginLeft: 10 }}>{name}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            marginTop:5,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginHorizontal: 16,
            height: 20
            // backgroundColor: 'pink',
          }}
          value={this.state.otherDetail.trackingNumber}
          onChangeText={(text) => {
            this.setState((prevState) => ({
              otherDetail: {
                ...prevState.otherDetail,
                trackingNumber: text
              }
            }));
          }}></TextInput>
      </>
    );
  }

  _renderCustomTextField1(name, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10
          }}>
          {icon}
          <Text style={{ color: '#808080', marginLeft: 10 }}>{name}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginTop:5,
            marginHorizontal: 16,
            height: 20
            // backgroundColor: 'pink',
          }}
          value={this.state.otherDetail.customField1}
          onChangeText={(text) => {
            this.setState((prevState) => ({
              otherDetail: {
                ...prevState.otherDetail,
                customField1: text
              }
            }));
          }}></TextInput>
      </>
    );
  }
  _renderCustomTextField2(name, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10
          }}>
          {icon}
          <Text style={{ color: '#808080', marginLeft: 10 }}>{name}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginTop:5,
            marginHorizontal: 16,
            height: 20
            // backgroundColor: 'pink',
          }}
          value={this.state.otherDetail.customField2}
          onChangeText={(text) => {
            this.setState((prevState) => ({
              otherDetail: {
                ...prevState.otherDetail,
                customField2: text
              }
            }));
          }}></TextInput>
      </>
    );
  }

  _renderCustomTextField3(name, icon) {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            paddingBottom: 4,
            paddingHorizontal: 16,
            // backgroundColor: 'pink',
            marginTop: 10
          }}>
          {icon}
          <Text style={{ color: '#808080', marginLeft: 10 }}>{name}</Text>
        </View>
        <TextInput
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#D9D9D9',
            padding: 0,
            marginTop:5,
            marginHorizontal: 16,
            height: 20
            // backgroundColor: 'pink',
          }}
          value={this.state.otherDetail.customField3}
          onChangeText={(text) => {
            this.setState((prevState) => ({
              otherDetail: {
                ...prevState.otherDetail,
                customField3: text
              }
            }));
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
          marginTop: 10
        }}
        onPress={this.showDatePicker}>
        <Icon name={'Calendar'} size={16} color={'#808080'} />
        <Text style={{ color: '#808080', marginLeft: 10 }}>
          {this.state.otherDetail.shipDate ? this.state.otherDetail.shipDate : this.state.OtherDetailsHeadingNames.shipDateName}
        </Text>
        {this._renderBottomSeprator(16)}
      </TouchableOpacity>
    );
  }

  render() {
    const sDate = moment(this.state.otherDetail.shipDate, 'DD-MM-YYYY');
    return (
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: 'white' }}>
          <StatusBar backgroundColor="#0E7942" barStyle="light-content" />
          {this.renderHeader()}
          {/* {this._renderSelectWareHouse()} */}
          {this._renderShipDate()}
          {this._renderShippedViaTextField(this.state.OtherDetailsHeadingNames.shippedViaName, <MaterialCommunityIcons name={'truck'} size={20} color={'#808080'} />)}
          {this._renderTrackingNoTextField( this.state.OtherDetailsHeadingNames.trackingNumberName,<Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
          {this._renderCustomTextField1(this.state.OtherDetailsHeadingNames.customField1Name, <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
          {this._renderCustomTextField2(this.state.OtherDetailsHeadingNames.customField2Name, <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
          {this._renderCustomTextField3(this.state.OtherDetailsHeadingNames.customField3Name, <Icon name={'Polygon-3'} size={16} color={'#808080'} />)}
        </KeyboardAwareScrollView>
        {!this.state.keyboard && (
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
              bottom: height * 0.01
            }}
            onPress={() => {
              this.props.route.params.setOtherDetails(this.state.otherDetail);
              this.props.navigation.navigate('SalesInvoiceScreen');
            }}>
            <Text
              style={{
                fontFamily: 'AvenirLTStd-Black',
                color: '#fff',
                fontSize: 20
              }}>
              Save
            </Text>
          </TouchableOpacity>
        )}
        <DateTimePickerModal
          isVisible={this.state.isDatePickerVisible}
          mode="date"
          date={this.state.otherDetail.shipDate == '' ? new Date() : new Date(sDate)}
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
        />
        {/* <TouchableOpacity
          style={{height: 50, width: 100, backgroundColor: 'pink'}}
          onPress={() => console.log(this.state.otherDetail)}></TouchableOpacity> */}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(OtherDetails);
export default MyComponent;
