import React, { Component } from 'react';
import {
  Animated,
  TouchableHighlight,
  View,
  Dimensions,
  FlatList,
  Text,
  Modal,
  TouchableOpacity,
  DeviceEventEmitter
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from '@/core/components/custom-icon/custom-icon';
import SalesInvoice from '@/assets/images/icons/options/SalesInvoice.svg'
import CreditNote from '@/assets/images/icons/options/CreditNote.svg'
import PurchaseBill from '@/assets/images/icons/options/PurchaseBill.svg'
import DebitNote from '@/assets/images/icons/options/DebitNote.svg'
import Payment from '@/assets/images/icons/options/Payment.svg'
import Receipt from '@/assets/images/icons/options/Receipt.svg'
import Customer from '@/assets/images/icons/options/Customer.svg'
import Vendor from '@/assets/images/icons/options/Vendor.svg'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { connect } from 'react-redux';
import { APP_EVENTS, FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';

const arrButtons = [
  { name: 'Sales Invoice', navigateTo: 'InvoiceScreens', icon: <SalesInvoice/>, color: '#229F5F' },
  { name: 'Credit Note', navigateTo: 'CreditNoteScreens', icon: <CreditNote/>, color: '#3497FD' },
  { name: 'Purchase Bill', navigateTo: 'PurchaseBillScreens', icon: <PurchaseBill/>, color: '#FC8345' },
  { name: 'Debit Note', navigateTo: 'DebitNoteScreens', icon: <DebitNote/>, color: '#ff6961' },
  { name: 'Payment', navigateTo: 'PaymentScreens', icon: <Payment/>, color: '#084EAD' },
  { name: 'Receipt', navigateTo: 'ReceiptScreens', icon: <Receipt/>, color: '#00B795' },
  { name: 'Customer', navigateTo: 'CustomerVendorScreens', icon: <Customer/>, color: '#864DD3' },
  { name: 'Vendor', navigateTo: 'CustomerVendorScreens', icon: <Vendor/>, color: '#FF72BE' },
  // { name: 'Advance Rcpt', navigateTo: 'AdvanceReceiptScreens', icon: 'Group-6188', color: '#51C445' }
  // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
  // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
  // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
  // {name: 'Sales Invoice', navigateTo: 'Sales_Invoice', icon: 'shopping-bag', color: '#229F5F'},
  // {name: 'Purchase Bill', navigateTo: 'Purchase_Bill', icon: 'Purchase_Bill', color: '#FC8345'},
  // {name: 'Receipt', navigateTo: 'Receipt', icon: 'Receipt', color: '#00B795'},
  // {name: 'Payment', navigateTo: 'Payment', icon: 'Payment', color: '#084EAD'},
];
const SIZE = 48;
const padding = 10;
const { height, width } = Dimensions.get('window');
const itemWidth = (Dimensions.get('window').width - (SIZE + padding * 10)) / (width > 550 ? 5 : 4);
type Props = {
  navigation: any;
  isDisabled: any;
}

class AddButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
      buttonsDisabled: false
    };
  }

  mode = new Animated.Value(0);
  toggleView = () => {
    Animated.timing(this.mode, {
      toValue: this.mode._value === 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  render() {
    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg']
    });

    return (
      <SafeAreaInsetsContext.Consumer>
        {(insets) => <View
          style={{
            // position: 'absolute',

            alignItems: 'center'
            // bottom: Dimensions.get('window').height * 0.08,
            // left: 0,
            // right: 0,
          }}>
          <Modal
            // style={{position: 'absolute', bottom: Dimensions.get('window').height * 0.08, backgroundColor: 'pink'}}
            visible={this.state.modalVisible}
            animationType="none"
            transparent={true}
            onRequestClose={() => this.setState({ modalVisible: false })}>
            <TouchableOpacity
              activeOpacity={1.0}
              style={{
                position: 'absolute',
                top: 0,
                // bottom: Dimensions.get('window').height * 0.08,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}
              onPress={() => this.setState({ modalVisible: false })}>
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  // bottom: 0,
                  // height: Dimensions.get('window').width * 0.7,
                  paddingVertical: 20,
                  width: width * 0.9,
                  bottom: height * 0.06 + SIZE + insets?.bottom,
                  borderTopEndRadius: 8,
                  borderBottomEndRadius: 8,
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  elevation: 3
                }}>
                {/* <TouchableOpacity
              style={{height: 30, width: 30, backgroundColor: 'pink'}}
              onPress={() => console.log(this.state.buttonsDisabled)}></TouchableOpacity> */}
                <FlatList
                  numColumns={4} // set number of columns
                  data={arrButtons}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1, alignSelf: 'center', marginBottom: 0, }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        width: itemWidth,
                        alignItems: 'center',
                        margin: padding
                      }}
                      // disabled={this.state.buttonsDisabled}
                      // onPress={() => console.log('this works')}
                      onPress={async () => {
                        if (item.name == 'Customer') {
                          await this.props.navigation.navigate(item.navigateTo, { screen: 'CustomerVendorScreens', params: { index: 0, uniqueName: null } });
                          await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                        } else if (item.name == 'Vendor') {
                          await this.props.navigation.navigate(item.navigateTo, { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: null } });
                          await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                        } else {
                          await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                          await this.props.navigation.navigate(item.navigateTo);
                        }
                        await this.setState({ modalVisible: false });
                      }}>
                      <View
                        style={{
                          width: itemWidth,
                          backgroundColor: item.color,
                          borderRadius: itemWidth / 2,
                          height: itemWidth,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                        {item.icon}
                      </View>
                      <Text style={{fontFamily: FONT_FAMILY.semibold, fontSize: GD_FONT_SIZE.small, textAlign: 'center', marginTop: 5 }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.name}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.setState({ modalVisible: false })}
                style={{
                  position: 'absolute',
                  bottom: (height * 0.08) / 2 + insets?.bottom,
                  width: SIZE,
                  height: SIZE,
                  borderRadius: SIZE / 2,
                  backgroundColor: '#5773FF',
                  transform: [{ rotate: '90deg' }],
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center'
                }}>
                <Entypo name="cross" size={24} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          <TouchableHighlight
            disabled={this.props.isDisabled}
            onPress={() => { this.setState({ modalVisible: !this.state.modalVisible }) }}
            underlayColor="#2882D8"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              backgroundColor: this.props.isDisabled ? 'rgba(00,00,00,0.1)' : '#5773FF',
              bottom: SIZE / 2
            }}>
            <Animated.View
              style={{
                transform: [{ rotate: rotation }]
              }}>
              <Entypo name="plus" size={24} color={this.props.isDisabled ? 'rgba(00,00,00,0.1)' : '#fff'} />
            </Animated.View>
          </TouchableHighlight>
        </View>}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

function mapStateToProps(state: any) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}

const MyComponent = connect(mapStateToProps)(AddButton);
export default MyComponent;
