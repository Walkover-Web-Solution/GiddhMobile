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
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import style from './AdjustLinkInvoice.style';
import { connect } from 'react-redux';
import Icon from '@/core/components/custom-icon/custom-icon';
import _ from 'lodash';
import { useIsFocused } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import { FONT_FAMILY } from '@/utils/constants';
import { getInvoiceListRequest } from './accountHelper';
import { AccountsService } from '@/core/services/accounts/accounts.service';
import LoaderKit  from 'react-native-loader-kit';
import colors from '@/utils/colors';
import { withTranslation } from 'react-i18next';


const { SafeAreaOffsetHelper } = NativeModules;

const { height, width } = Dimensions.get('window');

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
class AdjustLinkInvoice extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      partyName: this.props.route.params.partyName,
      currencySymbol: this.props.route.params.currencySymbol,
      partyAmount: this.props.route.params.partyAmount,
      originalVoucherInvoices: [],
      navigatingAgain: this.props.route.params.navigatingAgain,
      totalInvoicePageCount: this.props.route.params.totalInvoicePageCount,
      invoicePageCount: this.props.route.params.invoicePageCount,
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
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
    if (this.props.route.params?.realVoucherInvoice?.length > 0) {
      this.setState({ originalVoucherInvoices: this.props.route.params?.realVoucherInvoice },
        () => {
          this.setVoucherInvoices();
        })
    } else {
      this.getVoucherAdjustmentInvoiceList()
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    // this.setVoucherInvoices();
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


  async setVoucherInvoices() {
    const arr = JSON.parse(JSON.stringify(this.state.originalVoucherInvoices));
    await this.setState({ voucherInvoice: [...arr] });
    this.state.navigatingAgain ? this.setMappedInvoices(arr) : await this.mappingInvoicesWithCheckBoxes();
    await this.handleUnadjustedAmount();
  }
  handleLoadMore = () => {
    if (this.state.invoicePageCount < this.state.totalInvoicePageCount) {
      this.setState(
        {
          invoicePageCount: this.state.invoicePageCount + 1,
        },
        () => {
          this.getVoucherAdjustmentInvoiceList();
        },
      );
    }
  };
  getVoucherAdjustmentInvoiceList = async () => {
    try {
      
      this.setState({
        loading: this.state?.invoicePageCount == 1 && true
      })
      const date = await this.props.route.params.date;
      let requestData = this.props.route.params.paginationHelperData?.requestData
      let request = await getInvoiceListRequest(requestData);
      // don't call api if it's invalid case
      if (!request) {
        return;
      }
      let payloadData = {
        accountUniqueName: request?.accountUniqueName,
        voucherType: request?.voucherType,
        number: "",
        page: this.state?.invoicePageCount,
        ...(this.props.route.params.paginationHelperData?.selectedVoucherType == 'Advance Receipt' && { subVoucher: "ADVANCE_RECEIPT" }),
        ...((this.props.route.params.paginationHelperData?.selectedVoucherType == 'Credit Note' || this.props.route.params.paginationHelperData?.selectedVoucherType == 'Debit Note') && { noteVoucherType: request?.noteVoucherType }),
        voucherBalanceType: this.state?.currentEntryType?.toLowerCase()
      }
      const response = await AccountsService.getAdjustmentInvoices(date, this.props.route.params.paginationHelperData?.companyVersionNumber, 1, payloadData);
      if (response.body && response.status == 'success') {
        if (this.state?.invoicePageCount == 1) {
          this.setState({
            originalVoucherInvoices: this.props.route.params.paginationHelperData?.companyVersionNumber == 1 ? response.body.results : response.body.items,
            totalInvoicePageCount: response.body?.totalPages
          },
            () => {
              this.setVoucherInvoices();
            }
          );
        } else {
          this.setState({
            originalVoucherInvoices: this.props.route.params.paginationHelperData?.companyVersionNumber == 1 ? [...this.state?.voucherInvoice, ...response.body.results] : [...this.state?.voucherInvoice, ...response.body.items],
          },
            () => {
              this.setVoucherInvoices();
            }
          );
        }
      } else {
        this.setState({
          originalVoucherInvoices: []
        });
      }
    } catch (e) {
      this.setState({
        originalVoucherInvoices: []
      });
      console.log('ERROR in adjustment invoices', e)
    } finally {
      this.setState({
        loading: false
      })
    }
  }

  setMappedInvoices(mappedInvoicesWithCheckBoxes) {
    this.setState({ allVoucherInvoice: mappedInvoicesWithCheckBoxes });
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
    const { t } = this.props;
    return (
      <View style={[style.header, { backgroundColor: '#229F5F' }]}>
        <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.linkInvoiceToReceipt()
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={style.invoiceType}>{t('adjustLinkInvoice.header')}</Text>
        </View>
      </View>
    );
  }

  renderPartyName() {
    return (
      <View
        style={{ backgroundColor: '#229F5F', flexDirection: 'row', minHeight: 50, alignItems: 'center' }}
       >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Icon name={'Profile'} color={'#fafafa'} style={{ margin: 16 }} size={16} />
          <Text style={style.searchTextInputStyle}>{this.state.partyName}</Text>
        </View>
      </View>
    );
  }

  renderAmount() {
    return (
      <View style={{ paddingHorizontal: 15, flexDirection: 'row', backgroundColor: '#229F5F' }}>
        <Text style={[style.invoiceAmountText, { paddingVertical: 10 }]}>
          {this.state.currencySymbol + ' ' + this.state.partyAmount}
        </Text>
      </View>
    );
  }

  editAdjustedAmount(data, text) {
    data.adjustedAmount = text.replace(/[^0-9]/g, '');
    var allVoucherInvoice = this.state.allVoucherInvoice;
    const index = allVoucherInvoice.findIndex((item) => item.voucherNumber === data.voucherNumber);
    allVoucherInvoice[index] = data;
    this.setState({
      allVoucherInvoice: allVoucherInvoice,
    });

  };


  handleUnadjustedAmount(item) {
    const { t } = this.props;
    let adjustedAmount = 0;
    const result = this.state.allVoucherInvoice.map((item) => {
      if (item.isSelect === true) {
        adjustedAmount = adjustedAmount + (parseInt(item.adjustedAmount) || 0);
      }
    });

    let totalUnadjustedAmount = parseInt(this.state.partyAmount) - adjustedAmount;
    if (totalUnadjustedAmount < 0) {
      alert(t('adjustLinkInvoice.adjustmentExceedReceipt'));
      this.editAdjustedAmount(item, '');
    } else {
      this.setState({ totalUnadjustedAmount: totalUnadjustedAmount });
      this.setState({ totalAdjustedAmount: adjustedAmount });
    }
  }

  renderAdjustedAmount() {
    const { t } = this.props;
    return (
      <View>
        <Text style={[style.invoiceText, { color: 'black', textAlign: 'center', margin: 10 }]}>
          {t('adjustLinkInvoice.unadjustedAmount')}{' '}
          {this.state.totalUnadjustedAmount == null ? this.state.partyAmount : this.state.totalUnadjustedAmount}
        </Text>
      </View>
    );
  }

  renderInvoice() {
    const { t } = this.props;
    const selectItem = (data) => {
      data.isSelect = !data.isSelect;
      if (data.isSelect == false) {
        const index = this.state.voucherInvoice.findIndex((item) => item.voucherNumber === data.voucherNumber);
        data.adjustedAmount = '';
        this.handleUnadjustedAmount();
      }

      var allVoucherInvoice = this.state.allVoucherInvoice;
      const index = allVoucherInvoice.findIndex((item) => item.voucherNumber === data.voucherNumber);
      allVoucherInvoice[index] = data;
      this.setState({
        allVoucherInvoice: allVoucherInvoice,
      });
    };


    const renderItems = ({ item }) => {
      return (
        <View style={{ flexDirection: 'row', backgroundColor: '#E7F8F4', padding: 10, marginBottom: 10 }}>
          <View>
            <CheckBox
              checkedCheckBoxColor={'#5773FF'}
              checkBoxColor={'white'}
              uncheckedCheckBoxColor={'#808080'}
              onClick={() => {
                this.setState({ checkBoxSelected: item.voucherNumber });
                selectItem(item);

                if (item.isSelect == true) {
                  if (parseInt(item.unadjustedAmount.amountForAccount) > this.state.partyAmount && this.state.totalUnadjustedAmount >= 0) {
                    alert(t('adjustLinkInvoice.adjustedExceedReceipt'));
                    this.editAdjustedAmount(item, '');
                    this.handleUnadjustedAmount();
                  } else {
                    this.editAdjustedAmount(item, item.unadjustedAmount.amountForAccount?.toString());
                    this.handleUnadjustedAmount(item);
                  }

                }
              }}
              isChecked={item.isSelect}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY.regular,
                  padding: 5,
                  backgroundColor: '#00a65c',
                  color: 'white',
                  marginHorizontal: 10,
                  paddingHorizontal: 20,
                }}>
                {item?.voucherType}
              </Text>
              <Text style={style.invoiceText}>{item.voucherNumber}</Text>
              <Text
                style={{ fontFamily: FONT_FAMILY.regular, padding: 5, color: '#808080', textAlign: 'right', flex: 1 }}>
                {item.voucherDate}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'column' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={style.invoiceText}>{t('adjustLinkInvoice.total')} </Text>
                  <Text style={style.invoiceText}>
                    {this.state.currencySymbol + ' ' + item.voucherTotal.amountForAccount}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={style.invoiceText}>{t('adjustLinkInvoice.due')} </Text>
                  <Text style={style.invoiceText}>
                    {this.state.currencySymbol + ' ' + item.unadjustedAmount.amountForAccount}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'column', flex: 1, alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={style.invoiceText}>{t('adjustLinkInvoice.adjustedAmt')}</Text>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <TextInput
                    value={item.adjustedAmount?.toString()}
                    keyboardType={'numeric'}
                    placeholder={'0'}
                    style={[style.invoiceText, { alignSelf: 'center', maxWidth: 100 }]}
                    onChangeText={(text) => {
                      if (!item.isSelect) {
                        alert(t('adjustLinkInvoice.pleaseSelectInvoice'));
                      }
                      else if (parseInt(text) > item.unadjustedAmount.amountForAccount) {
                        alert(t('adjustLinkInvoice.adjustedExceedDue'));
                        this.editAdjustedAmount(item, '');
                        this.handleUnadjustedAmount();
                      }
                      else {
                        if (parseInt(text) > this.state.partyAmount && this.state.totalUnadjustedAmount >= 0) {
                          alert(t('adjustLinkInvoice.adjustedExceedReceipt'));
                          this.editAdjustedAmount(item, '');
                          this.handleUnadjustedAmount();
                        } else {
                          this.editAdjustedAmount(item, text);
                          this.handleUnadjustedAmount(item);
                        }
                      }
                    }}
                  />
                  <View style={{ backgroundColor: 'black', width: 120, height: 1.2 }}></View>
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
        <View style={{ flex: 1 }}>
          <Text
            style={[
              style.invoiceText,
              { color: 'black', textAlign: 'center', margin: 10, flex: 1, alignSelf: 'center' },
            ]}>
            {t('adjustLinkInvoice.noInvoicesAvailable')}
          </Text>
        </View>
      );
    };

    return (
      <FlatList
        contentContainerStyle={{ paddingBottom: 50 }}
        data={this.state.allVoucherInvoice}
        showsVerticalScrollIndicator={false}
        renderItem={renderItems}
        keyExtractor={(item, index) => item?.uniqueName?.toString()}
        initialNumToRender={50}
        // extraData={this.state.allVoucherInvoice}
        ListEmptyComponent={renderEmptyContainer()}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          this.handleLoadMore();
        }}
      />
    );
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }

  linkInvoiceToReceipt() {
    const { t } = this.props;
    let isAdjustedAmountZeroForAnyInvoice = this.state.allVoucherInvoice.map((item) => {
      if (item.isSelect == true && (item.adjustedAmount == 0 || item.adjustedAmount == '')) {
        return true
      }
    })
    if (isAdjustedAmountZeroForAnyInvoice.includes(true)) {
      alert(t('adjustLinkInvoice.adjustmentCannotBeZero'))
    } else {
      this.props.route.params.getLinkedInvoicesAdjustedAmount(this.state.totalAdjustedAmount, this.state.allVoucherInvoice, this.state?.invoicePageCount, this.state?.totalInvoicePageCount);
      this.props.navigation.goBack();
    }
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? (
      <StatusBar backgroundColor="#0E7942" barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} />
    ) : null;
  };

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} behavior={ Platform.OS == 'ios' ? "padding" : "height" }>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              backgroundColor: '#5773FF',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              position: 'absolute',
              bottom: height * 0.01,
            }}
            onPress={() => {
              this.linkInvoiceToReceipt()
            }}>
            <Text
              style={{
                fontFamily: 'AvenirLTStd-Black',
                color: '#fff',
                fontSize: 20,
              }}>
              {this.props.t('adjustLinkInvoice.link')}
            </Text>
          </TouchableOpacity>
        )}
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
                color={colors.PRIMARY_NORMAL}
            />
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
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

function Screen(props) {
  const isFocused = useIsFocused();

  return <AdjustLinkInvoice {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Screen));
export default MyComponent;
