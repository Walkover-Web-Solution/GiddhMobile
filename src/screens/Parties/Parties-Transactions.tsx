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

import Icon from '@/core/components/custom-icon/custom-icon';
import {CommonService} from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {Bars} from 'react-native-loader';
import colors from '@/utils/colors';
import httpInstance from '@/core/services/http/http.service';
import {commonUrls} from '@/core/services/common/common.url';
import moment from 'moment';
import Foundation from 'react-native-vector-icons/Foundation';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

class PartiesTransactionScreen extends React.Component {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLoader: true,
      transactionsData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 0,
      totalPages: 0,
      loadingMore: false,
    };
  }
  componentDidMount() {
    this.getTransactions();
  }

  func1 = async () => {
    const v1 = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(v1);
  };
  async getTransactions() {
    try {
      //   console.log('got called', this.state.startDate, this.state.endDate);
      const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      await httpInstance
        .post(
          `https://api.giddh.com/company/${companyName}/daybook?page=${this.state.page}&count=25&from=${this.state.startDate}&to=${this.state.endDate}&branchUniqueName=${branchName}`,
          {
            includeParticulars: true,
            particulars: [this.props.route.params.item.uniqueName],
          },
        )
        .then((res) => {
          this.setState(
            {
              transactionsData: res.data.body.entries,

              showLoader: false,
            },
            // () => console.log(this.state.transactionsData),
          );
        });
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false});
    }
  }
  async handleLoadMore() {
    try {
      // const transactions = await CommonService.getTransactions();
      const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      await httpInstance
        .post(
          `https://api.giddh.com/company/${companyName}/daybook?page=${this.state.page}&count=25&from=${this.state.startDate}&to=${this.state.endDate}&branchUniqueName=${branchName}`,
          {},
        )
        .then((res) => {
          this.setState({
            transactionsData: [...this.state.transactionsData, ...res.data.body.entries],
          });
        });
      this.setState({showLoader: false, loadingMore: false});
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false, loadingMore: false});
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
      this.setState(
        {
          endDate: moment(ED).format('DD-MM-YYYY'),
        },
        () => this.getTransactions(),
      );
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
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <View
            style={{
              height: Dimensions.get('window').height * 0.08,
              backgroundColor: '#864DD3',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Icon name={'Backward'} color="#fff" size={18} />
            </TouchableOpacity>

            <Text style={{fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF'}}>
              {this.props.route.params.item.name}
            </Text>
          </View>
          <View style={{marginTop: Dimensions.get('window').height * 0.02}} />
          {/* <GDRoundedDateRangeInput
            label="Select Date"
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onChangeDate={this.changeDate}
          />
          <TouchableOpacity
            style={{
              height: 38,
              width: 38,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 19,
              position: 'absolute',
              marginTop: Dimensions.get('window').height * 0.1,
              right: 10,
              borderWidth: 1,
              borderColor: '#D9D9D9',
            }}
            onPress={() => console.log(this.state.startDate, this.state.endDate)}>
            <Foundation name="filter" size={22} color={'#808080'} />
          </TouchableOpacity> */}

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
              <Text style={{fontFamily: 'OpenSans-Bold', fontSize: 25, marginTop: 10}}>No Transactions</Text>
            </View>
          ) : (
            // <View style={{paddingHorizontal: 10, marginTop: 20, flex: 1}}>
            <FlatList
              style={{paddingHorizontal: 10, marginTop: 20}}
              data={this.state.transactionsData}
              renderItem={({item}) => <TransactionList item={item} />}
              keyExtractor={(item) => item.createdAt}
              //   onEndReachedThreshold={0.2}
              //   onEndReached={() => this.handleRefresh()}
              //   ListFooterComponent={this._renderFooter}
            />
            // </View>
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
export default connect(mapStateToProps, mapDispatchToProps)(PartiesTransactionScreen);
