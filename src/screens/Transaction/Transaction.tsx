import React from 'react';
import {connect} from 'react-redux';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
} from 'react-native';
import style from '@/screens/Transaction/style';
import styles from '@/screens/Transaction/components/styles';
import {GdSVGIcons} from '@/utils/icons-pack';
import {CommonService} from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {Bars} from 'react-native-loader';
import colors from '@/utils/colors';
import httpInstance from '@/core/services/http/http.service';
import {commonUrls} from '@/core/services/common/common.url';
import moment from 'moment';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class TransactionScreen extends React.Component {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLoader: true,
      transactionsData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      totalPages: 0,
      onEndReachedCalledDuringMomentum: true,
      loadingMore: false,
    };
  }
  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.setState(
        {
          showLoader: true,
        },
        () => this.getTransactions(),
      );
    });
    this.getTransactions();
  }

  func1 = async () => {
    const v1 = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(v1);
  };
  // async getTransactions() {
  //   try {
  //     const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
  //     const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
  //     await httpInstance
  //       .post(
  //         `https://api.giddh.com/company/${companyName}/daybook?page=${this.state.page}&count=25&from=${this.state.startDate}&to=${this.state.endDate}&branchUniqueName=${branchName}`,
  //         {},
  //       )
  //       .then((res) => {
  //         this.setState({
  //           transactionsData: res.data.body.entries,
  //           totalPages: res.data.body.totalPages,
  //         });
  //       });

  //     this.setState({showLoader: false, loadingMore: false});
  //   } catch (e) {
  //     console.log(e);
  //     this.setState({showLoader: false});
  //   }
  // }

  async getTransactions() {
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
      );
      this.setState(
        {
          transactionsData: transactions.body.entries,
          totalPages: transactions.body.totalPages,
          showLoader: false,
        },
        // () => console.log(JSON.stringify(transactions)),
      );
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false});
    }
  }

  async handleLoadMore() {
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
      );
      this.setState({
        transactionsData: [...this.state.transactionsData, ...transactions.body.entries],
        showLoader: false,
        loadingMore: false,
      });
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false});
    }
  }
  handleRefresh = () => {
    if (this.state.page < this.state.totalPages) {
      this.setState(
        {
          page: this.state.page + 1,
          loadingMore: true,
        },
        () => {
          this.handleLoadMore();
        },
      );
    }
  };

  changeDate = (SD, ED) => {
    if (SD) {
      this.setState({
        startDate: moment(SD).format('DD-MM-YYYY'),
      });
    }
    if (ED) {
      this.setState({
        endDate: moment(ED).format('DD-MM-YYYY'),
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
          // backgroundColor: 'pink',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Bars size={15} color={colors.PRIMARY_NORMAL} />
      </View>
    );
  };
  render() {
    if (this.state.showLoader) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          {/* <GDRoundedDateRangeInput
            label="Select Date"
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onChangeDate={this.changeDate}
          /> */}
          {/* <View style={style.filterStyle}>
            <TouchableOpacity style={style.iconCard} delayPressIn={0} onPress={() => console.log(this.state.endDate)}>
              <GdSVGIcons.download style={styles.iconStyle} width={18} height={18} />
            </TouchableOpacity>
            <View style={{width: 15}} />
            <TouchableOpacity style={style.iconCard} delayPressIn={0} onPress={this.func1}>
              <GdSVGIcons.sort style={styles.iconStyle} width={18} height={18} />
            </TouchableOpacity>
          </View> */}
          {this.state.transactionsData.length == 0 ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 30}}>
              <Image
                source={require('@/assets/images/noTransactions.png')}
                style={{resizeMode: 'contain', height: 250, width: 300}}
              />
              <Text style={{fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10}}>No Transactions</Text>
            </View>
          ) : (
            <FlatList
              data={this.state.transactionsData}
              renderItem={({item}) => <TransactionList item={item} />}
              keyExtractor={(item) => item.createdAt}
              onEndReachedThreshold={0.2}
              onEndReached={() => this.handleRefresh()}
              ListFooterComponent={this._renderFooter}
            />
          )}
        </View>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = () => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
