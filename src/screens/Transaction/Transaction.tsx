import React from 'react';
import { connect } from 'react-redux';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {
  View,
  DeviceEventEmitter,
  FlatList,
  Image,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import style from '@/screens/Transaction/style';
import { CommonService } from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { Bars } from 'react-native-loader';
import colors from '@/utils/colors';
import moment from 'moment';
import _ from 'lodash';
import * as CommonActions from '@/redux/CommonAction';
import DownloadModal from '@/screens/Parties/components/downloadingModal';
import StickyDay from './components/StickyDay';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Foundation from 'react-native-vector-icons/Foundation';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import VoucherModal from '../Parties/components/voucherModal'
type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;
export let previousItem = null

export class TransactionScreen extends React.Component<Props, {}> {
  private stickyDayRef: React.RefObject<any>;
  constructor(props: Props) {
    super(props);
    this.stickyDayRef = React.createRef();
    this.state = {
      showLoader: false,
      transactionsData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      totalPages: 0,
      onEndReachedCalledDuringMomentum: true,
      loadingMore: false,
      DownloadModal: false,
      dataLoadedTime: 'Time and Date',
      dateMode: 'defaultDates',
      activeDateFilter: '',
      voucherModal: false,
      vouchers: [],
      transactionsLoader: true,
      totalItems: 0
      //refreshlist: false
      // Realm: Realm
    };
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CreditNoteCreated, () => {
      this.getTransactions()
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.getTransactions();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InvoiceCreated, () => {
      this.getTransactions();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.PurchaseBillCreated, () => {
      this.getTransactions();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.DebitNoteCreated, () => {
      this.getTransactions();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.ReceiptCreated, () => {
      this.getTransactions();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.PaymentCreated, () => {
      this.getTransactions();
    });
    this.getTransactions();
  }

  downloadModalVisible = (value) => {
    this.setState({ DownloadModal: value });
  };
  modalVisible = () => {
    this.setState({ voucherModal: false });
  };
  func1 = async () => {
    const v1 = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(v1);
  };

  async sort(array: any) {
    await this.setState({ transactionsData: [] })
    // const sortedArray = await array.sort((a: any, b: any) => { return Number(moment(a.entryDate, 'DD-MM-YYYY')) - Number(moment(b.entryDate, 'DD-MM-YYYY')) }).reverse()
    const sortedArray = await array.sort((a: any, b: any) => { return Number(moment(b.entryDate, 'DD-MM-YYYY')) - Number(moment(a.entryDate, 'DD-MM-YYYY')) })
    await this.setState({
      transactionsData: sortedArray,
      //refreshlist: !this.state.refreshlist,
      showLoader: false,
      loadingMore: false,
    })
    // console.log("Sorted Array " + JSON.stringify(sortedArray))
  }

  async getTransactions() {
    if (this.state.transactionsData.length == 0) {
      this.setState({
        showLoader: true
      })
    }
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.state.vouchers,
      );
      // console.log("ALL  Transaction " + JSON.stringify(transactions.body))
      //await this.sort(transactions.body.entries);
      this.setState(
        {
          transactionsData: transactions.body.entries,
          totalPages: transactions.body.totalPages,
          showLoader: false,
          totalItems : transactions.body.totalItems
        },
      );
    } catch (e) {
      console.log(e);
      this.setState({ showLoader: false });
    }
  }

  async handleLoadMore() {
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.state.vouchers,
      );
    
      await this.setState({
        transactionsData: [...this.state.transactionsData, ...transactions.body.entries],
        showLoader: false,
        loadingMore: false,
      })
    } catch (e) {
      console.log(e);
      this.setState({ showLoader: false });
    }
  }

  debounceLoadMore = _.debounce(this.handleLoadMore, 200);

  handleRefresh = async () => {
    if(this.state.transactionsData.length < this.state.totalItems && this.state.page < this.state.totalPages && !this.state.loadingMore){
      await this.setState(
            {
              page: this.state.page + 1,
              loadingMore: true
            },
          );
          // await this.handleLoadMore();
      await this.debounceLoadMore();
    }
    // if (this.state.page < this.state.totalPages && !this.state.loadingMore) {
    //   await this.setState(
    //     {
    //       page: this.state.page + 1,
    //       loadingMore: true
    //     },
    //     // () => {
    //     //   this.handleLoadMore();
    //     // }
    //   );
    //   await this.handleLoadMore();
    // }
  };
  setActiveDateFilter = (activeDateFilter, dateMode) => {
    this.setState({
      activeDateFilter: activeDateFilter,
      dateMode: dateMode,
    });
  };
  changeDate = (SD, ED) => {
    if (SD) {
      this.setState({
        startDate: SD,
      });
    }
    if (ED) {
      this.setState(
        {
          endDate: ED,
          page: 1,
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    }
  };
  filterCall = _.debounce(this.getTransactions, 2000);
  dateShift = (button) => {
    if (this.state.dateMode == 'default' && button == 'left') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .subtract(1, 'month')
            .startOf('month')
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY').subtract(1, 'month').endOf('month').format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'default' && button == 'right') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY').add(1, 'month').startOf('month').format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY').add(1, 'month').endOf('month').format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'defaultDates' && button == 'left') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY').subtract(30, 'days').format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY').subtract(30, 'days').format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'defaultDates' && button == 'right') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY').add(30, 'days').format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY').add(30, 'days').format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'TQ' && button == 'left') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .subtract(1, 'quarter')
            .startOf('quarter')
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY')
            .subtract(1, 'quarter')
            .endOf('quarter')
            .format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'TQ' && button == 'right') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .add(1, 'quarter')
            .startOf('quarter')
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY').add(1, 'quarter').endOf('quarter').format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'custom' && button == 'left') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .subtract(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days',
            )
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY')
            .subtract(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days',
            )
            .format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    } else if (this.state.dateMode == 'custom' && button == 'right') {
      this.setState(
        {
          startDate: moment(this.state.startDate, 'DD-MM-YYYY')
            .add(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days',
            )
            .format('DD-MM-YYYY'),
          endDate: moment(this.state.endDate, 'DD-MM-YYYY')
            .add(
              moment(this.state.endDate, 'DD-MM-YYYY').diff(moment(this.state.startDate, 'DD-MM-YYYY'), 'days'),
              'days',
            )
            .format('DD-MM-YYYY'),
          activeDateFilter: '',
          transactionsLoader: true,
        },
        () => this.filterCall(),
      );
    }
  };
  filter = (filterType) => {
    if (filterType == 'sales') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['sales']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rsales') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'sales'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'purchase') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['purchase']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rpurchase') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'purchase'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'creditnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['credit note']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rcreditnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'credit note'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'debitnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['debit note']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rdebitnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'debit note'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'receipt') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['receipt']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rreceipt') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'receipt'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'payment') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['payment']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rpayment') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'payment'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'journal') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['journal']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rjournal') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'journal'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'contra') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['contra']),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'Rcontra') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'contra'),
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    } else if (filterType == 'clearall') {
      this.setState(
        {
          vouchers: [],
          page: 1,
        },
        () => {
          this.filterCall();
        },
      );
    }
  };

  transactionsLoader = () => {
    this.setState({ transactionsLoader: true });
  };


  _renderFooter = () => {
    if (!this.state.loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: 100,
          bottom: 10,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <Bars size={15} color={colors.PRIMARY_NORMAL} />
      </View>
    );
  };

  renderItem = (item: any, index: any) => {
    if (index == 0) {
      previousItem = null
    }
    let PreviousItem = previousItem
    // console.log("Time "+item.entryDate+" "+Number(moment(item.entryDate,'DD-MM-YYYY')))
    // console.log("Previos Item Time "+Number(moment(PreviousItem!=null?PreviousItem.entryDate:"",'DD-MM-YYYY')))
    previousItem = item
    return (
      <TransactionList item={item} index={index} downloadModal={this.downloadModalVisible}
        showDate={Number(moment(item.entryDate, 'DD-MM-YYYY')) == Number(moment(PreviousItem != null ? PreviousItem.entryDate : "", 'DD-MM-YYYY')) ? false : true} />
    );
  }

  onViewableItemsChanged = ({ viewableItems } : any) => {
    if(!viewableItems[0]?.item?.entryDate){
      return;
    }
    // Get the day of top most item present in the viewport and pass it to the pulicHandler of stickyDayRef
    this.stickyDayRef.current.publicHandler(moment(viewableItems[0]?.item?.entryDate, 'DD-MM-YYYY').format('DD MMM YYYY'));
  }

  render() {
    if (this.state.showLoader) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical:10
                  }}>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={{
                      height: 40,
                      width: Dimensions.get('window').width * 0.5,
                      borderRadius: 20,
                      borderWidth: 1,
                      justifyContent: 'center',
                      borderColor: '#D9D9D9',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}
                    onPress={() =>
                      this.props.navigation.navigate('AppDatePicker', {
                        selectDate: this.changeDate,
                        startDate: this.state.startDate,
                        endDate: this.state.endDate,
                        activeDateFilter: this.state.activeDateFilter,
                        setActiveDateFilter: this.setActiveDateFilter,
                      })
                    }
                  >

                    {/* <View style={{ marginLeft: 10 }} /> */}
                    <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
                    <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 5 }}>
                      {moment(this.state.startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                        ' - ' +
                        moment(this.state.endDate, 'DD-MM-YYYY').format('DD MMM YY')}
                    </Text>

                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row',width:'20%',justifyContent:'space-between' }}>
                    <TouchableOpacity style={{ padding: 5 }} onPress={() => this.dateShift('left')}>
                      <Entypo name="chevron-left" size={22} color={'#808080'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() => this.dateShift('right')}
                    // onPress={this.tryDate}
                    >
                      <Entypo name="chevron-right" size={22} color={'#808080'} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      height: 38,
                      width: 38,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 19,
                      borderWidth: 1,
                      borderColor: '#D9D9D9',
                    }}
                    onPress={() => this.setState({ voucherModal: true })}
                  >
                    <Foundation name="filter" size={22} color={'#808080'} />
                  </TouchableOpacity>
                </View>
          {this.state.transactionsData.length == 0
            ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                <Image
                  source={require('@/assets/images/noTransactions.png')}
                  style={{ resizeMode: 'contain', height: 250, width: 300 }}
                />
                <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10 }}>No Transactions</Text>
              </View>
            )
            : (
              <View style={{flex:1}}>
                
                  <StickyDay stickyDayRef={this.stickyDayRef}/>
                  <FlatList
                    ref={this.state.flatListRef}
                    initialNumToRender={this.state.totalItems}
                    data={this.state.transactionsData}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                    keyExtractor={(item,index) => index.toString()}
                    onEndReachedThreshold={0.1}
                    onEndReached={() => this.handleRefresh()}
                    ListFooterComponent={this._renderFooter}
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    disableVirtualization = {true}
                  //extraData={this.state.refreshlist}
                  />
                 
              </View>
            )}
          <DownloadModal modalVisible={this.state.DownloadModal} />
          <VoucherModal
            modalVisible={this.state.voucherModal}
            setModalVisible={this.modalVisible}
            filter={this.filter}
            loader={this.transactionsLoader}
          />
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch(CommonActions.logout());
    }
  };
};
function Tscreen (props) {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  return <TransactionScreen {...props} isFocused={isFocused} navigation={navigation} />;
}
export default connect(mapStateToProps, mapDispatchToProps)(Tscreen);
