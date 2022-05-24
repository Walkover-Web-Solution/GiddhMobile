import React from 'react';
import { connect } from 'react-redux';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {
  View,
  DeviceEventEmitter,
  FlatList,
  Image,
  Text
} from 'react-native';
import style from '@/screens/Transaction/style';
import { CommonService } from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { Bars } from 'react-native-loader';
import colors from '@/utils/colors';
import moment from 'moment';
import * as CommonActions from '@/redux/CommonAction';
import DownloadModal from '@/screens/Parties/components/downloadingModal';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;
export let previousItem = null

export class TransactionScreen extends React.Component {
  constructor(props: Props) {
    super(props);

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
    this.getTransactions();
  }

  downloadModalVisible = (value) => {
    this.setState({ DownloadModal: value });
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
        this.state.page
      );
      // console.log("ALL  Transaction " + JSON.stringify(transactions.body))
      //await this.sort(transactions.body.entries);
      this.setState(
        {
          transactionsData: transactions.body.entries,
          totalPages: transactions.body.totalPages,
          showLoader: false
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
        this.state.page
      );
      // console.log("ALL  Transaction on load more " + JSON.stringify([...this.state.transactionsData, ...transactions.body.entries]))
      // await this.sort([...this.state.transactionsData, ...transactions.body.entries]);
      // this.setState({
      // transactionsData: [...this.state.transactionsData, ...transactions.body.entries],
      // showLoader: false,
      // loadingMore: false
      // });
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

  handleRefresh = async () => {
    if (this.state.page < this.state.totalPages && !this.state.loadingMore) {
      await this.setState(
        {
          page: this.state.page + 1,
          loadingMore: true
        },
        // () => {
        //   this.handleLoadMore();
        // }
      );
      await this.handleLoadMore();
    }
  };

  changeDate = (SD, ED) => {
    if (SD) {
      this.setState({
        startDate: moment(SD).format('DD-MM-YYYY')
      });
    }
    if (ED) {
      this.setState({
        endDate: moment(ED).format('DD-MM-YYYY')
      });
      this.getTransactions();
    }
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
      <TransactionList item={item} downloadModal={this.downloadModalVisible}
        showDate={Number(moment(item.entryDate, 'DD-MM-YYYY')) == Number(moment(PreviousItem != null ? PreviousItem.entryDate : "", 'DD-MM-YYYY')) ? false : true} />
    );
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
              <View>
                {/* {this.state.dataLoadedTime.length > 0 ?
                  <LastDataLoadedTime
                    paddingHorizontal={10}
                    text={this.state.dataLoadedTime} /> : null} */}
                <FlatList
                  ref={this.state.flatListRef}
                  data={this.state.transactionsData}
                  renderItem={({ item, index }) => this.renderItem(item, index)}
                  keyExtractor={(item) => item.createdAt}
                  onEndReachedThreshold={0.2}
                  onEndReached={() => this.handleRefresh()}
                  ListFooterComponent={this._renderFooter}
                //extraData={this.state.refreshlist}
                />
              </View>
            )}
          <DownloadModal modalVisible={this.state.DownloadModal} />
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
export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
