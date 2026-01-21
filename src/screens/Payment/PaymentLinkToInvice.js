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
  Dimensions,
  Platform,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import style from './style';
import {connect} from 'react-redux';
import { withTranslation } from 'react-i18next';
import Icon from '@/core/components/custom-icon/custom-icon';
import _ from 'lodash';
import {useIsFocused} from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import {FONT_FAMILY} from '@/utils/constants';

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

interface Props {
  navigation: any;
}
class PaymentLinkToInvice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      partyName: this.props.route.params.partyName,
      currencySymbol: this.props.route.params.currencySymbol,
      partyAmount: this.props.route.params.partyAmount,
      originalVoucherInvoices: this.props.route.params.realVoucherInvoice,
      navigatingAgain: this.props.route.params.navigatingAgain,
      voucherInvoice: [],
      allVoucherInvoice: [],
      bottomOffset: 0,
      keyboard: false,
      checkBoxSelected: null,
      totalUnadjustedAmount: null,
      totalAdjustedAmount: null,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  componentDidMount() {
    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    this.setVoucherInvoices();
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

  _keyboardDidShow = () => {
    this.setState({keyboard: true});
  };

  _keyboardDidHide = () => {
    this.setState({keyboard: false});
  };

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  async setVoucherInvoices() {
    const arr = JSON.parse(JSON.stringify(this.state.originalVoucherInvoices));
    await this.setState({voucherInvoice: [...arr]});
    this.state.navigatingAgain ? this.setMappedInvoices(arr) : await this.mappingInvoicesWithCheckBoxes();
    await this.handleUnadjustedAmount();
  }

  setMappedInvoices(mappedInvoicesWithCheckBoxes) {
    this.setState({allVoucherInvoice: mappedInvoicesWithCheckBoxes});
  }

  mappingInvoicesWithCheckBoxes() {
    const mappedInvoicesWithCheckBoxes = this.state.voucherInvoice.map((item) => {
      item.isSelect = false;
      item.adjustedAmount = '';
      return item;
    });
    this.setMappedInvoices(mappedInvoicesWithCheckBoxes);
  }

  renderHeader() {
    return (
      <View style={style.header}>
        <View style={{flexDirection: 'row', paddingVertical: 10, alignItems: 'center'}}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              this.linkInvoiceToReceipt()
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={style.invoiceType}>{this.props.t('paymentLink.linkPaymentToInvoice')}</Text>
        </View>
      </View>
    );
  }

  renderPartyName() {
    return (
      <View
        style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}
        onPress={() => {}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Icon name={'Profile'} color={'#084EAD'} style={{margin: 16}} size={16} />
          <Text style={style.searchTextInputStyle}>{this.state.partyName}</Text>
        </View>
      </View>
    );
  }

  renderAmount() {
    return (
        <View style={{paddingHorizontal: 15, flexDirection: 'row'}}>
          <Text style={[style.invoiceAmountText, {paddingVertical: 10}]}>
            {this.state.currencySymbol + ' ' + this.state.partyAmount}
          </Text>
        </View>
      // </View>
    );
  }

  editAdjustedAmount(data, text) {
    data.adjustedAmount = text.replace(/[^0-9]/g, '');
    var allVoucherInvoice = this.state.allVoucherInvoice;
    const index = allVoucherInvoice.findIndex((item) => item.uniqueName === data.uniqueName);
    allVoucherInvoice[index] = data;
    this.setState({
      allVoucherInvoice: allVoucherInvoice,
    });
    
  };


  handleUnadjustedAmount(item) {
    let adjustedAmount = 0;
    const result = this.state.allVoucherInvoice.map((item) => {
      if (item.isSelect === true) {
        adjustedAmount = adjustedAmount + (parseInt(item.adjustedAmount) || 0);
      }
    });

    let totalUnadjustedAmount = parseInt(this.state.partyAmount) - adjustedAmount;
    if (totalUnadjustedAmount < 0) {
      alert(this.props.t('paymentLink.adjustmentCannotExceedReceipt'));
      this.editAdjustedAmount(item, '');
    } else {
      this.setState({totalUnadjustedAmount: totalUnadjustedAmount});
      this.setState({totalAdjustedAmount: adjustedAmount});
    }
  }

  renderAdjustedAmount() {
    return (
      <View>
        <Text style={[style.invoiceText, {color: 'black', textAlign: 'center', margin: 10}]}>
          {this.props.t('paymentLink.unadjustedAmount')}:{' '}
          {this.state.totalUnadjustedAmount == null ? this.state.partyAmount : this.state.totalUnadjustedAmount}
        </Text>
      </View>
    );
  }

  renderInvoice() {
    const selectItem = (data) => {
      data.isSelect = !data.isSelect;
      if (data.isSelect == false) {
        const index = this.state.voucherInvoice.findIndex((item) => item.uniqueName === data.uniqueName);
        data.adjustedAmount =  '';
        this.handleUnadjustedAmount();
      }
      var allVoucherInvoice = this.state.allVoucherInvoice;
      const index = allVoucherInvoice.findIndex((item) => item.uniqueName === data.uniqueName);
      allVoucherInvoice[index] = data;
      this.setState({
        allVoucherInvoice: allVoucherInvoice,
      });
    };

    const renderItems = ({item}) => {
      return (
        <View style={{flexDirection: 'row', backgroundColor: '#E7F8F4', padding: 10, marginBottom: 10}}>
          <View>
            <CheckBox
              checkedCheckBoxColor={'#084EAD'}
              checkBoxColor={'white'}
              uncheckedCheckBoxColor={'#808080'}
              onClick={() => {
                this.setState({checkBoxSelected: item.uniqueName});
                selectItem(item);
                if(item.isSelect == true){
                        if (parseInt(item.unadjustedAmount.amountForAccount) > this.state.partyAmount && this.state.totalUnadjustedAmount >= 0) {
                          alert(this.props.t('paymentLink.adjustedCannotExceedReceipt'));
                          this.editAdjustedAmount(item, '');
                          this.handleUnadjustedAmount();
                        } else {
                          this.editAdjustedAmount(item, item.unadjustedAmount.amountForAccount.toString());
                          this.handleUnadjustedAmount(item);
                        }
                      
              }
              }}
              isChecked={item.isSelect}
            />
          </View>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', flex: 1}}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.regular,
                  padding: 5,
                  backgroundColor: '#084EAD',
                  color: 'white',
                  marginHorizontal: 10,
                  paddingHorizontal: 20,
                }}>
                {this.props.t('paymentLink.purchase')}
              </Text>
              <Text style={style.invoiceText}>{item.voucherNumber ? item.voucherNumber : this.props.t('common.na')}</Text>
              <Text
                style={{fontFamily: FONT_FAMILY.regular, padding: 5, color: '#808080', textAlign: 'right', flex: 1}}>
                {item.voucherDate}
              </Text>
            </View>
            <View style={{flexDirection: 'row', flex: 1, marginTop: 10, marginHorizontal: 10}}>
              <View style={{flexDirection: 'column'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={style.invoiceText}>{this.props.t('payment.total')}: </Text>
                  <Text style={style.invoiceText}>
                    {this.state.currencySymbol + ' ' + item.voucherTotal.amountForAccount}
                  </Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Text style={style.invoiceText}>{this.props.t('paymentLink.due')}: </Text>
                  <Text style={style.invoiceText}>
                    {this.state.currencySymbol + ' ' + item.unadjustedAmount.amountForAccount}
                  </Text>
                </View>
              </View>
              <View style={{flexDirection: 'column', flex: 1, alignItems: 'flex-end'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={style.invoiceText}>{this.props.t('payment.adjustedAmt')}</Text>
                </View>
                <View style={{flexDirection: 'column'}}>
                  {/* <Text style={[style.invoiceText, {alignSelf: 'center'}]}>{item.amount.amountForAccount}</Text> */}
                  <TextInput
                    value={item.adjustedAmount.toString()}
                    keyboardType={'numeric'}
                    placeholder={'0'}
                    style={[style.invoiceText, {alignSelf: 'center', maxWidth: 100}]}
                    onChangeText={(text) => {
                      if (!item.isSelect) {
                        alert(this.props.t('paymentLink.pleaseSelectInvoice'));
                      }
                      else if(parseInt(text) > item.unadjustedAmount.amountForAccount){
                        alert(this.props.t('paymentLink.adjustedCannotExceedDue'));
                        this.editAdjustedAmount(item, '');
                        this.handleUnadjustedAmount();
                      } 
                      else {
                        if (parseInt(text) > this.state.partyAmount && this.state.totalUnadjustedAmount >= 0) {
                          alert(this.props.t('paymentLink.adjustedCannotExceedReceipt'));
                          this.editAdjustedAmount(item, '');
                          this.handleUnadjustedAmount();
                        } else {
                          this.editAdjustedAmount(item, text);
                          this.handleUnadjustedAmount(item);
                        }
                      }
                    }}
                  />
                  <View style={{backgroundColor: 'black', width: 120, height: 1.2}}></View>
                </View>
              </View>
              <View></View>
            </View>
          </View>
        </View>
      );
    };

    const renderEmptyContainer = () => {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={style.invoiceText}>{this.props.t('paymentLink.noInvoicesAvailable')}</Text>
        </View>
      );
    };
    return (
      <FlatList
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
        data={this.state.allVoucherInvoice}
        showsVerticalScrollIndicator={false}
        renderItem={renderItems}
        keyExtractor={(item, index) => index}
        extraData={this.state.allVoucherInvoice}
        ListEmptyComponent={renderEmptyContainer()}
      />
    );
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }

  linkInvoiceToReceipt() {
                  let isAdjustedAmountZeroForAnyInvoice =   this.state.allVoucherInvoice.map((item) => {
                    if(item.isSelect == true && (item.adjustedAmount == 0 || item.adjustedAmount == '')){
                      return true
                    }
                  })
                    if(isAdjustedAmountZeroForAnyInvoice.includes(true)){
                      alert(this.props.t('paymentLink.adjustmentCannotBeZero'))
                    } else {
                      this.props.route.params.getLinkedInvoicesAdjustedAmount(this.state.totalAdjustedAmount, this.state.allVoucherInvoice);
                      this.props.navigation.goBack();
                    }
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? (
      <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} />
    ) : null;
  };

  render() {
    return (
        <KeyboardAvoidingView style={{flex: 1, backgroundColor: 'white'}} behavior={ Platform.OS == 'ios' ? "padding" : "height" }>
          {this.renderHeader()}
          {this.renderPartyName()}
          {this.renderAmount()}
          {this.state.allVoucherInvoice.length == 0 ? null : this.renderAdjustedAmount()}
          {this.renderInvoice()}
        {!this.state.keyboard && !this.state.allVoucherInvoice.length == 0 && (
          <TouchableOpacity
            style={{
              height: height * 0.06,
              width: width * 0.9,
              borderRadius: 25,
              backgroundColor: '#084EAD',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              position: 'absolute',
              bottom: height * 0.01,
            }}
            onPress={ () => {
              this.linkInvoiceToReceipt()
            }}>
            <Text
              style={{
                fontFamily: 'AvenirLTStd-Black',
                color: '#fff',
                fontSize: 20,
              }}>
              {this.props.t('paymentLink.link')}
            </Text>
          </TouchableOpacity>
        )}
        </KeyboardAvoidingView>
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

const PaymentLinkToInviceWithTranslation = withTranslation()(PaymentLinkToInvice);

function Screen(props) {
  const isFocused = useIsFocused();

  return <PaymentLinkToInviceWithTranslation {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
