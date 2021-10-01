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
import Realm from 'realm';
import { RootDBOptions, TransactionDBOptions } from '@/Database';
import { TRANSACTION_SCHEMA } from '@/Database/AllSchemas/display-data-schemas/transaction-schema';
import LastDataLoadedTime from '@/core/components/data-loaded-time/LastDataLoadedTime';
import { calculateDataLoadedTime } from '@/utils/helper';
import { ROOT_DB_SCHEMA } from '@/Database/AllSchemas/company-branch-schema';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

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
      Realm: Realm
    };
  }

  getDbData = async () => {
    try {
      const realm = await Realm.open(RootDBOptions);
      const userEmail: any = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
      const data: any = realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail);
      const currentCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const currentBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      for (let i = 0; i < data?.companies?.length; i++) {
        if (data.companies[i].uniqueName == currentCompany) {
          for (let j = 0; j < data?.companies[i]?.branches?.length; j++) {
            const elem = data.companies[i].branches[j];
            if (currentBranch == elem.uniqueName) {
              if (elem?.transaction?.timeStamp) {
                this.setState({
                  transactionsData: elem?.transaction?.objects,
                  dataLoadedTime: elem?.transaction?.timeStamp
                // }, () => {
                //   setInterval(() => {
                //     this.setState({
                //       dataLoadedTime: ''
                //     });
                //   }, 3 * 1000);
                })
              }
              break;
            }
          }
          break;
        }
      }
    } catch (error) {
      console.log('error fetching transactions data from db');
    }
  }

  manageApiCalls = async () => {
    this.setState({
      showLoader: true
    });
    if (this.props.isInternetReachable) {
      await this.getTransactions();
    } else {
      await this.getDbData();
    }
    this.setState({
      showLoader: false
    })
  }

  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InternetAvailable, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InternetLost, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.CreditNoteCreated, () => {
      this.manageApiCalls()
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.InvoiceCreated, (data) => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.PurchaseBillCreated, () => {
      this.manageApiCalls();
    });
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.DebitNoteCreated, () => {
      this.manageApiCalls();
    });
    this.manageApiCalls();
  }

  downloadModalVisible = (value) => {
    this.setState({ DownloadModal: value });
  };

  func1 = async () => {
    const v1 = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    console.log(v1);
  };

  // updateDB = () => {
  //   try {
  //     const objects: any[] = [];
  //     this.state.transactionsData.forEach(element => {
  //       objects.push({
  //         particular: {
  //           name: element.particular.name
  //         },
  //         voucherName: element.voucherName,
  //         entryDate: element.entryDate,
  //         voucherNo: element.voucherNo,
  //         otherTransactions: [{
  //           amount: element.otherTransactions[0]?.amount,
  //           inventory: element.otherTransactions[0]?.inventory ? {
  //             quantity: element.otherTransactions[0]?.inventory?.quantity
  //           } : null,
  //           particular: {
  //             currency: {
  //               code: element.otherTransactions[0]?.particular.currency?.code
  //             }
  //           }
  //         }],
  //         creditAmount: element.creditAmount,
  //         debitAmount: element.debitAmount
  //       });
  //     });
  //     const existingData = this.state.Realm.objects(TRANSACTION_SCHEMA);
  //     this.state.Realm.write(() => {
  //       if (existingData.length > 0) {
  //         existingData[0].timeStamp = calculateDataLoadedTime(new Date());
  //         existingData[0].objects = objects;
  //       } else {
  //         this.state.Realm.create(TRANSACTION_SCHEMA, {
  //           timeStamp: calculateDataLoadedTime(new Date()),
  //           objects: objects,
  //         });
  //       }
  //     });
  //   } catch (error) {
  //     console.log("error updating db ", error);
  //   }
  // }

  async getTransactions() {
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page
      );
      this.setState(
        {
          transactionsData: transactions.body.entries,
          totalPages: transactions.body.totalPages,
        },
        () => {
          console.log('completed fetching transactions');
          // this.updateDB();
          this.setState({
            dataLoadedTime: 'Updated!'
          });
          setInterval(() => {
            this.setState({
              dataLoadedTime: '',
            })
          }, 3 * 1000);
        }
      );
    } catch (e) {
      console.log(e);
      if (e && e.data && e.data.code && e?.data?.code != 'UNAUTHORISED') {
        // this.props.logout();
      }
    }
  }

  async handleLoadMore() {
    try {
      const transactions = await CommonService.getTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page
      );
      this.setState({
        transactionsData: [...this.state.transactionsData, ...transactions.body.entries],
        showLoader: false,
        loadingMore: false
      });
    } catch (e) {
      console.log(e);
      this.setState({ showLoader: false });
    }
  }

  handleRefresh = () => {
    if (this.state.page < this.state.totalPages) {
      this.setState(
        {
          page: this.state.page + 1,
          loadingMore: true
        },
        () => {
          this.handleLoadMore();
        }
      );
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
                {this.state.dataLoadedTime.length > 0 ?
                  <LastDataLoadedTime
                    paddingHorizontal={10}
                    text={this.state.dataLoadedTime} /> : null}
                <FlatList
                  data={this.state.transactionsData}
                  renderItem={({ item }) => <TransactionList item={item} downloadModal={this.downloadModalVisible} />}
                  keyExtractor={(item) => item.createdAt}
                  onEndReachedThreshold={0.2}
                  onEndReached={() => this.handleRefresh()}
                  ListFooterComponent={this._renderFooter}
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
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    isInternetReachable: state.commonReducer.isInternetReachable
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // getCountriesAction: dispatch.common.getCountriesAction,
    // logoutAction: dispatch.auth.logoutAction,
    logout: () => {
      dispatch(CommonActions.logout());
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
