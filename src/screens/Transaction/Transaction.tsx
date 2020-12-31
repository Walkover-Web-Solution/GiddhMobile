import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {View, TouchableOpacity, DeviceEventEmitter} from 'react-native';
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
      startDate: '01-04-2020',
      endDate: '25-12-2020',
    };
  }
  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.getTransactions();
    });
    this.getTransactions();
  }

  func1 = async () => {
    const v1 = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(v1);
  };
  async getTransactions() {
    try {
      // const transactions = await CommonService.getTransactions();
      const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      await httpInstance
        .post(
          `https://apitest.giddh.com/company/${companyName}/daybook?page=0&count=20&from=${this.state.startDate}&to=${this.state.endDate}&branchUniqueName=${branchName}`,
          {},
        )
        .then((res) => {
          this.setState({
            transactionsData: res.data.body.entries,
          });
        });
      // console.log(transactions);

      // this.setState({
      //   transactionsData: transactions.body.entries,
      // });
      // console.log(this.state.transactionsData);
      this.setState({showLoader: false});
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false});
    }
  }

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
  render() {
    if (this.state.showLoader) {
      return (
        <View style={styles.container}>
          <View style={style.alignLoader}>
            <Bars size={15} color={colors.PRIMARY_NORMAL} />
          </View>
        </View>
      );
    } else {
      return (
        <View style={style.container}>
          <GDRoundedDateRangeInput
            label="Select Date"
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onChangeDate={this.changeDate}
          />
          <View style={style.filterStyle}>
            <TouchableOpacity style={style.iconCard} delayPressIn={0} onPress={() => console.log(this.state.endDate)}>
              <GdSVGIcons.download style={styles.iconStyle} width={18} height={18} />
            </TouchableOpacity>
            <View style={{width: 15}} />
            <TouchableOpacity style={style.iconCard} delayPressIn={0} onPress={this.func1}>
              <GdSVGIcons.sort style={styles.iconStyle} width={18} height={18} />
            </TouchableOpacity>
          </View>
          <View style={{marginTop: 10}} />
          <TransactionList transactions={this.state.transactionsData} />
        </View>
      );
    }
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
