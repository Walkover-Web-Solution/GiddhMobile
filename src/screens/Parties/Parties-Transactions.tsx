import React from 'react';
import {connect} from 'react-redux';
import {GDRoundedDateRangeInput} from '@/core/components/input/rounded-date-range-input.component';
import TransactionList from '@/screens/Transaction/components/transaction-list.component';
import _ from 'lodash';
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
  StatusBar,
} from 'react-native';
import style from '@/screens/Transaction/style';
import {useIsFocused} from '@react-navigation/native';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import VoucherModal from './components/voucherModal';
import PDFModal from './components/pdfModal';
import DownloadModal from './components/downloadingModal';
import RNFetchBlob from 'rn-fetch-blob';
import getSymbolFromCurrency from 'currency-symbol-map';

import Share from 'react-native-share';
import base64 from 'react-native-base64';
import MoreModal from './components/moreModal';
import ShareModal from './components/sharingModal';

type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

class PartiesTransactionScreen extends React.Component {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLoader: true,
      transactionsLoader: true,
      transactionsData: [],
      startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
      page: 1,
      totalPages: 0,
      loadingMore: false,
      voucherModal: false,
      DownloadModal: false,
      ShareModal: false,
      MoreModal: false,
      pdfModal: false,
      vouchers: [],
      creditTotal: 0,
      debitTotal: 0,
      activeDateFilter: '',
      dateMode: 'defaultDates',
    };
  }
  componentDidMount() {
    this.getTransactions();
  }

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle="light-content" /> : null;
  };

  setActiveDateFilter = (activeDateFilter, dateMode) => {
    this.setState({
      activeDateFilter: activeDateFilter,
      dateMode: dateMode,
    });
  };

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

  transactionsLoader = () => {
    this.setState({transactionsLoader: true});
  };

  modalVisible = () => {
    this.setState({voucherModal: false});
  };
  pdfmodalVisible = () => {
    this.setState({pdfModal: false});
  };
  shareModalVisible = (value) => {
    this.setState({ShareModal: value});
  };
  downloadModalVisible = (value) => {
    this.setState({DownloadModal: value});
  };
  moreModalVisible = () => {
    this.setState({MoreModal: false});
  };

  onWhatsApp = () => {
    if (this.props.route.params.item.mobileNo) {
      Linking.openURL(`whatsapp://send?phone=${this.props.route.params.item.mobileNo}&text=${''}`);
    } else {
      return Alert.alert('', 'The phone number for this person is not available');
    }
  };
  onCall = () => {
    if (this.props.route.params.item.mobileNo) {
      Linking.openURL(`tel://${this.props.route.params.item.mobileNo}`);
    } else {
      return Alert.alert('', 'The phone number for this person is not available');
    }
  };

  phoneNo = () => {
    if (this.props.route.params.item.mobileNo) {
      return `${this.props.route.params.item.mobileNo}`;
    } else {
      return Alert.alert('', 'The phone number for this person is not available');
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

  async getTransactions() {
    try {
      const transactions = await CommonService.getPartyTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.props.route.params.item.uniqueName,
        this.state.vouchers,
      );

      console.log('transactions are', JSON.stringify(transactions));
      this.setState({
        transactionsData: transactions.body.entries,
        showLoader: false,
        transactionsLoader: false,
        debitTotal: transactions.body.debitTotal,
        creditTotal: transactions.body.creditTotal,
        totalPages: transactions.body.totalPages,
      });
    } catch (e) {
      console.log(e);
      this.setState({showLoader: false});
    }
  }
  async handleLoadMore() {
    try {
      const transactions = await CommonService.getPartyTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.props.route.params.item.uniqueName,
        this.state.vouchers,
      );
      this.setState({
        transactionsData: [...this.state.transactionsData, ...transactions.body.entries],
        showLoader: false,
        loadingMore: false,
      });
      // const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      // const companyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      // await httpInstance
      //   .post(
      //     `https://api.giddh.com/company/${companyName}/daybook?page=${this.state.page}&count=25&from=${this.state.startDate}&to=${this.state.endDate}&branchUniqueName=${branchName}`,
      //     {},
      //   )
      //   .then((res) => {
      //     this.setState({
      //       transactionsData: [...this.state.transactionsData, ...res.data.body.entries],
      //       showLoader: false,
      //       loadingMore: false,
      //     });
      //   });
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

  exportFile = async () => {
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
  permissonDownload = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.exportFile();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  permissonShare = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.onShare();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  permissonWhatsapp = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.onWhatsAppShare();
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
          this.setState({ShareModal: false});
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
              // err && console.log(err);
            });
        });
    } catch (e) {
      console.log(e);
      console.log(e);
    }
  };

  onWhatsAppShare = async () => {
    Linking.canOpenURL(`whatsapp://send?phone=${this.props.route.params.item.mobileNo.replace(/\D/g, '')}&text=${''}`)
      .then(async (supported) => {
        if (!supported) {
          Alert.alert('', 'Please install whats app to send direct message via whats app');
        } else {
          try {
            this.setState({ShareModal: true});
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
            const shareOptions = {
              title: 'Share via',
              message: 'Transactions report',
              url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`,
              social: Share.Social.WHATSAPP,
              whatsAppNumber: this.props.route.params.item.mobileNo.replace(/\D/g, ''),
              filename: 'Transactions report',
            };
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
                this.setState({ShareModal: false});
              })
              .then(() => {
                Share.shareSingle(shareOptions)
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    err && console.log(err);
                  });
              });
          } catch (e) {
            this.props.downloadModal(false);
            console.log(e);
            console.log(e);
          }
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  filterCall = _.debounce(this.getTransactions, 2000);

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
          {this.FocusAwareStatusBar(this.props.isFocused)}
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          {this.FocusAwareStatusBar(this.props.isFocused)}
          <View
            style={{
              height: Dimensions.get('window').height * 0.08,
              backgroundColor: '#864DD3',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <Icon name={'Backward-arrow'} color="#fff" size={18} />
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
            <View style={{alignSelf: 'center'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontFamily: 'AvenirLTStd-Book', color: '#616161'}}>Credit Total :</Text>
                <Text style={{fontFamily: 'AvenirLTStd-Book', fontSize: 18, marginLeft: 5}}>
                  {this.props.route.params.item.country.code == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.props.route.params.item.country.code)}
                  {this.numberWithCommas(this.state.creditTotal)}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontFamily: 'AvenirLTStd-Book', color: '#616161'}}>Debit Total :</Text>
                <Text style={{fontFamily: 'AvenirLTStd-Book', fontSize: 18, marginLeft: 8}}>
                  {this.props.route.params.item.country.code == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.props.route.params.item.country.code)}
                  {this.numberWithCommas(this.state.debitTotal)}
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row'}}>
              {this.state.transactionsData.length == 0 ? null : (
                <TouchableOpacity delayPressIn={0} style={{padding: 5}} onPress={() => this.setState({pdfModal: true})}>
                  <AntDesign name="pdffile1" size={22} color={'#FF7C7C'} />
                </TouchableOpacity>
              )}

              {this.props.route.params.item.mobileNo && (
                <TouchableOpacity
                  delayPressIn={0}
                  style={{marginLeft: 20, padding: 5}}
                  onPress={() => this.setState({MoreModal: true})}>
                  <Entypo name="dots-three-vertical" size={22} color={'#808080'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{marginTop: Dimensions.get('window').height * 0.02}} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
            }}>
            <TouchableWithoutFeedback
              style={{
                height: 40,
                width: Dimensions.get('window').width * 0.6,
                borderRadius: 20,
                borderWidth: 1,
                // marginLeft: 15,
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
              }>
              <View style={{marginLeft: 10}} />
              <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
              <Text style={{fontFamily: 'AvenirLTStd-Book', marginLeft: 5}}>
                {moment(this.state.startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                  ' - ' +
                  moment(this.state.endDate, 'DD-MM-YYYY').format('DD MMM YY')}
              </Text>
            </TouchableWithoutFeedback>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={{padding: 5}} onPress={() => this.dateShift('left')}>
                <Entypo name="chevron-left" size={22} color={'#808080'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{padding: 5}}
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
                // position: 'absolute',
                // marginTop: Dimensions.get('window').height * 0.2,
                // right: 10,
                borderWidth: 1,
                borderColor: '#D9D9D9',
              }}
              onPress={() => this.setState({voucherModal: true})}
              // onPress={() => this.tryDate()}
              // onPress={() => console.log(this.props.route.params.item.uniqueName, 'hello')}
            >
              <Foundation name="filter" size={22} color={'#808080'} />
            </TouchableOpacity>
          </View>

          {/* <GDRoundedDateRangeInput
            label={`${this.state.startDate + ' - ' + this.state.endDate}`}
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

          {/* <TouchableOpacity
            style={{height: 40, width: 120, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.transactionsData)}></TouchableOpacity> */}

          {this.state.transactionsLoader ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
              <Bars size={15} color={colors.PRIMARY_NORMAL} />
            </View>
          ) : (
            <>
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
                  style={{marginTop: 20}}
                  data={this.state.transactionsData}
                  renderItem={({item}) => (
                    <TransactionList
                      item={item}
                      downloadModal={this.shareModalVisible}
                      transactionType={'partyTransaction'}
                      phoneNo={this.props.route.params.item.mobileNo}
                    />
                  )}
                  keyExtractor={(item) => item.uniqueName}
                  onEndReachedThreshold={0.2}
                  onEndReached={() => this.handleRefresh()}
                  ListFooterComponent={this._renderFooter}
                />
              )}
            </>
          )}

          <DownloadModal modalVisible={this.state.DownloadModal} />
          <ShareModal modalVisible={this.state.ShareModal} />
          <PDFModal
            modalVisible={this.state.pdfModal}
            setModalVisible={this.pdfmodalVisible}
            onExport={this.permissonDownload}
            onShare={this.permissonShare}
            onWhatsAppShare={this.permissonWhatsapp}
            downloadModal={this.downloadModalVisible}
            shareModal={this.shareModalVisible}
            phoneNo={this.props.route.params.item.mobileNo}
          />
          <VoucherModal
            modalVisible={this.state.voucherModal}
            setModalVisible={this.modalVisible}
            filter={this.filter}
            loader={this.transactionsLoader}
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

function Screen(props) {
  const isFocused = useIsFocused();

  return <PartiesTransactionScreen {...props} isFocused={isFocused} />;
}
export default connect(mapStateToProps, mapDispatchToProps)(Screen);
