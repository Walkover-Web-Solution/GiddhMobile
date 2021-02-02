import React from 'react';
import {connect} from 'react-redux';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import {
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Text,
  PermissionsAndroid,
  Alert,
  Linking,
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
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import VoucherModal from './components/voucherModal';
import PDFModal from './components/pdfModal';
import DownloadModal from './components/downloadingModal';
import RNFetchBlob from 'rn-fetch-blob';

import base64 from 'react-native-base64';
import Share from 'react-native-share';
import MoreModal from './components/moreModal';

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
      voucherModal: false,
      DownloadModal: false,
      MoreModal: false,
      pdfModal: false,
      vouchers: [],
      exportDisabled: false,
    };
  }
  componentDidMount() {
    this.getTransactions();
  }

  modalVisible = () => {
    this.setState({voucherModal: false});
  };
  pdfmodalVisible = () => {
    this.setState({pdfModal: false});
  };
  downloadModalVisible = (value) => {
    this.setState({DownloadModal: value});
  };
  moreModalVisible = () => {
    this.setState({MoreModal: false});
  };

  onWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${''}&text=${''}`);
  };
  onCall = () => {
    Linking.openURL(`tel://app`);
  };

  filter = (filterType) => {
    if (filterType == 'sales') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['sales']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rsales') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'sales'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'purchase') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['purchase']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rpurchase') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'purchase'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'creditnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['credit note']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rcreditnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'credit note'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'debitnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['debit note']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rdebitnote') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'debit note'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'receipt') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['receipt']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rreceipt') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'receipt'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'payment') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['payment']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rpayment') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'payment'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'voucher') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['journal']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rvoucher') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'journal'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'contra') {
      this.setState(
        {
          vouchers: this.state.vouchers.concat(['contra']),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'Rcontra') {
      this.setState(
        {
          vouchers: this.state.vouchers.filter((item) => item !== 'contra'),
        },
        () => {
          this.getTransactions();
        },
      );
    } else if (filterType == 'clearall') {
      this.setState(
        {
          vouchers: [],
        },
        () => {
          this.getTransactions();
        },
      );
    }
  };

  async getTransactions() {
    try {
      const transactions = await CommonService.getPartyTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.props.route.params.item.uniqueName,
        this.state.vouchers,
      );
      this.setState(
        {
          transactionsData: transactions.body.entries,
          showLoader: false,
          exportDisabled: transactions.body.entries.length == 0 ? true : false,
        },
        // () => console.log(this.state.transactionsData),
      );
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

  func2 = async () => {
    try {
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'GET',
        `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=view-detailed&sort=asc`,
        {
          'session-id': `${token}`,
        },
      ).then((res) => {
        let base64Str = res.base64();
        let base69 = base64.decode(base64Str);
        let pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
        RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
        this.setState({DownloadModal: false});
      });
    } catch (e) {
      console.log(e);
      console.log(e);
    }
  };
  downloadFile = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.func2();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onShare = async () => {
    try {
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'GET',
        `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=view-detailed&sort=asc`,
        {
          'session-id': `${token}`,
        },
      )
        .then((res) => {
          let base64Str = res.base64();
          let base69 = base64.decode(base64Str);
          let pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
          this.setState({DownloadModal: false});
        })
        .then(() => {
          Share.open({
            title: 'This is the report',
            message: 'Message:',
            url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`,
            subject: 'Report',
          })
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              Alert.alert('share cancelled');
              // err && console.log(err);
            });
        });
    } catch (e) {
      console.log(e);
      console.log(e);
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
          <View
            style={{
              height: Dimensions.get('window').height * 0.1,
              width: '100%',
              backgroundColor: '#f3e5f5',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={{fontFamily: 'AvenirLTStd-Book', color: '#808080'}}>
                {this.props.route.params.type == 'Vendors' ? 'Payable' : 'Receivable'}
              </Text>
              <Text style={{fontFamily: 'AvenirLTStd-Book', fontSize: 18}}>
                ₹{this.props.route.params.item.closingBalance.amount}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                delayPressIn={0}
                style={{marginRight: 10}}
                onPress={() => this.setState({pdfModal: true})}
                disabled={this.state.exportDisabled}>
                <AntDesign name="pdffile1" size={22} color={'#FF7C7C'} />
              </TouchableOpacity>
              <TouchableOpacity
                delayPressIn={0}
                style={{marginLeft: 10}}
                onPress={() => this.setState({MoreModal: true})}>
                <Entypo name="dots-three-vertical" size={22} color={'#808080'} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{marginTop: Dimensions.get('window').height * 0.02}} />
          <GDRoundedDateRangeInput
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
              marginTop: Dimensions.get('window').height * 0.2,
              right: 10,
              borderWidth: 1,
              borderColor: '#D9D9D9',
            }}
            onPress={() => this.setState({voucherModal: true})}>
            <Foundation name="filter" size={22} color={'#808080'} />
          </TouchableOpacity>

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
            <FlatList
              style={{paddingHorizontal: 10, marginTop: 20}}
              data={this.state.transactionsData}
              renderItem={({item}) => <TransactionList item={item} />}
              keyExtractor={(item) => item.uniqueName}
              //   onEndReachedThreshold={0.2}
              //   onEndReached={() => this.handleRefresh()}
              //   ListFooterComponent={this._renderFooter}
            />
          )}

          {/* <TouchableOpacity
            style={{height: 40, width: 120, backgroundColor: 'pink'}}
            onPress={() => Linking.openURL(`whatsapp://send?phone=${'+918770132578'}&text=${''}`)}></TouchableOpacity> */}

          <DownloadModal modalVisible={this.state.DownloadModal} />
          <PDFModal
            modalVisible={this.state.pdfModal}
            setModalVisible={this.pdfmodalVisible}
            onExport={this.downloadFile}
            onShare={this.onShare}
            downloadModal={this.downloadModalVisible}
          />
          <VoucherModal
            modalVisible={this.state.voucherModal}
            setModalVisible={this.modalVisible}
            filter={this.filter}
          />
          <MoreModal
            modalVisible={this.state.MoreModal}
            setModalVisible={this.moreModalVisible}
            onWhatsApp={this.onWhatsApp}
            onCall={this.onCall}
          />
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
