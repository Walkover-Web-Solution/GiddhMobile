import React from 'react';
import {Dispatch, RootState} from '@/core/store';
import {connect} from 'react-redux';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {View, TouchableOpacity} from 'react-native';
import style from '@/screens/Transaction/style';
import styles from '@/screens/Transaction/components/styles';
import {GdSVGIcons} from '@/utils/icons-pack';
import {CommonService} from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import {Bars} from 'react-native-loader';
import colors from '@/utils/colors';
import httpInstance from '@/core/services/http/http.service';
import {commonUrls} from '@/core/services/common/common.url';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

export class TransactionScreen extends React.Component {
  constructor(props: Props) {
    super(props);
    this.state = {
      showLoader: true,
      transactionsData: [],
    };
  }
  componentDidMount() {
    this.getTransactions();
  }

  async getTransactions() {
    try {
      // const transactions = await CommonService.getTransactions();
      httpInstance
        .post(
          'https://apitest.giddh.com/company/mobilein1601731188063045bms/daybook?page=0&count=20&from=01-04-2020&to=05-10-2020&branchUniqueName=Mobi1',
          {},
        )
        .then((res) => {
          this.setState({
            transactionsData: res.data.body.entries,
          });
          console.log(res.data);
        });
      // console.log(transactions);

      // this.setState({
      //   transactionsData: transactions.body.entries,
      // });
      // console.log(this.state.transactionsData);
      this.setState({showLoader: false});
    } catch (e) {
      console.log('error');
      this.setState({showLoader: false});
    }
  }

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
          <View style={style.filterStyle}>
            <View style={style.dateRangePickerStyle}>
              <GDRoundedDateRangeInput label="Select Date" />
            </View>
            <View style={styles.iconPlacingStyle}>
              <View style={style.iconCard}>
                <GdSVGIcons.download style={styles.iconStyle} width={18} height={18} />
              </View>
              <View style={{width: 15}} />
              <TouchableOpacity style={style.iconCard} delayPressIn={0} onPress={this.getTransactions}>
                <GdSVGIcons.sort style={styles.iconStyle} width={18} height={18} />
              </TouchableOpacity>
            </View>
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
