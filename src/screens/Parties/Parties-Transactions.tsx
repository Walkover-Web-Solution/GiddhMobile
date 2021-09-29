import React from 'react';
import { connect } from 'react-redux';
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
  Modal,
  Platform, DeviceEventEmitter, TextInput
} from 'react-native';
import style from '@/screens/Transaction/style';
import { useIsFocused } from '@react-navigation/native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Icon from '@/core/components/custom-icon/custom-icon';
import { CommonService } from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from '@/utils/constants';
import { Bars } from 'react-native-loader';
import colors from '@/utils/colors';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import Fontisto from 'react-native-vector-icons/Fontisto';
import PushNotification, { Importance } from 'react-native-push-notification';
import Dialog from 'react-native-dialog';
import OTPInputView from '@twotalltotems/react-native-otp-input';

import Share from 'react-native-share';
import base64 from 'react-native-base64';
import MoreModal from './components/moreModal';
import ShareModal from './components/sharingModal';
import { catch } from 'metro.config';
import color from '@/utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dropdown from 'react-native-modal-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps;

const { width, height } = Dimensions.get('window');

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
      remainderModal: false,
      datePicker: false,
      timePicker: false,
      dateTime: new Date(Date.now()),
      iosLoaderToExport: false,
      payNowButtonPressed: false,
      payButtonPressed: false,
      payorDropDown: Dropdown,
      isPayorDD: false,
      selectedPayor: null,
      totalAmount: '',
      totalAmountPlaceHolder: '',
      review: '',
      reviewPlaceHolder: ''
    };

  }
  componentDidMount() {
    this.getTransactions();
    PushNotification.popInitialNotification((notification) => {
      console.log('Initial Notification', notification);
    });
  }

  createChannel = () => {
    PushNotification.createChannel(
      {
        channelId: "channel-id",
        channelName: "My channel",
        channelDescription: "reminders channel",
        playSound: false,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }

  sendNotification = async (companyName) => {
    try {
      await this.createChannel();
      PushNotification.localNotificationSchedule({
        date: this.state.dateTime,
        message: 'Payment to ' + companyName + " is due",
        allowWhileIdle: true,
        channelId: 'channel-id',
        smallIcon: 'ic_launcher',
        title: 'Reminder'
      });
      this.setState({ remainderModal: false });
      await Alert.alert("Success", "Reminder successfully activated", [{ style: 'destructive', text: 'Okay' }]);
    } catch (error) {
      console.log("failed to push notification" + error);
      Alert.alert("Fail", "Failed to activat reminder", [{ style: 'destructive', text: 'Okay' }])
    }
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
    this.setState({ transactionsLoader: true });
  };

  modalVisible = () => {
    this.setState({ voucherModal: false });
  };
  pdfmodalVisible = () => {
    this.setState({ pdfModal: false });
  };
  shareModalVisible = (value) => {
    this.setState({ ShareModal: value });
  };
  downloadModalVisible = (value) => {
    this.setState({ DownloadModal: value });
  };
  moreModalVisible = () => {
    this.setState({ MoreModal: false });
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
      this.setState({ showLoader: false });
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
      this.setState({ showLoader: false, loadingMore: false });
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
      await Platform.OS == "ios" ? this.setState({ iosLoaderToExport: true }) : null
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
        let pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
        RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
        if (Platform.OS === "ios") {
          let pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
          RNFetchBlob.ios.openDocument(pdfLocation)
          this.setState({ iosLoaderToExport: false })
        } else {
          this.downloadModalVisible(false)
        }
      })
    } catch (e) {
      Platform.OS == "ios" ? this.setState({ iosLoaderToExport: false }) : this.downloadModalVisible(false)
      console.log(e);
    }
  };
  permissonDownload = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.exportFile();
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.exportFile();
        } else {
          this.downloadModalVisible(false)
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      this.downloadModalVisible(false)
      console.warn(err);
    }
  };
  permissonShare = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.onShare();
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.onShare();
        } else {
          this.setState({ ShareModal: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      this.setState({ ShareModal: false });
      console.warn(err);
    }
  };
  permissonWhatsapp = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.onWhatsAppShare()
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.onWhatsAppShare();
        } else {
          this.setState({ ShareModal: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      this.setState({ ShareModal: false });
      console.warn(err);
    }
  };

  onShare = async () => {
    try {
      await Platform.OS == "ios" ? this.setState({ ShareModal: true }) : null
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'GET',
        `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=view-detailed&sort=asc`,
        {
          'session-id': `${token}`,
        },
      )
        .then(async (res) => {
          let base64Str = await res.base64();
          let base69 = await base64.decode(base64Str);
          let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
          await this.setState({ ShareModal: false });
          await RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
          if (Platform.OS === "ios") {
            RNFetchBlob.ios.previewDocument(pdfLocation)
          }
          await this.setState({ ShareModal: false });
        })
        .then(async () => {
          await Share.open({
            title: 'This is the report',
            //message: 'Message:',
            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`,
            subject: 'Report',
          })
            .then((res) => {
              // this.setState({ ShareModal: false });
              console.log(res);
            })
            .catch((err) => {
              // this.setState({ ShareModal: false });
              // err && console.log(err);
            });
        });
    } catch (e) {
      this.setState({ ShareModal: false });
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
            this.setState({ ShareModal: true });
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
            const shareOptions = {
              title: 'Share via',
              message: 'Transactions report',
              url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`,
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
              .then(async (res) => {
                let base64Str = await res.base64();
                let base69 = await base64.decode(base64Str);
                let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
                await this.setState({ ShareModal: false });
                await RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
                if (Platform.OS === "ios") {
                  await RNFetchBlob.ios.previewDocument(pdfLocation)
                }
              })
              .then(async () => {
                await Share.shareSingle(shareOptions)
                  .then((res) => {
                    // this.setState({ ShareModal: false });
                    console.log(res);
                  })
                  .catch((err) => {
                    // this.setState({ ShareModal: false });
                    err && console.log(err);
                  });
              });
          } catch (e) {
            this.setState({ ShareModal: false });
            console.log(e);
          }
        }
      })
      .catch((err) => {
        this.setState({ ShareModal: false });
        console.error('An error occurred', err)
      }
      );
  };

  filterCall = _.debounce(this.getTransactions, 2000);

  numberWithCommas = (x) => {
    if (x == null) {
      return "0";
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  scheduleNotification = () => {
    const today = new Date(Date.now());
    const selected: Date = this.state.dateTime;
    if (today.getDate() == selected.getDate() && today.getMonth() == selected.getMonth() && today.getFullYear() == selected.getFullYear() && this.state.dateTime.getTime() <= new Date(Date.now()).getTime()) {
      Alert.alert("Invalid time", "Please enter a valid time", [{ style: 'destructive', text: 'Okay' }]);
    } else {
      this.sendNotification(this.props.route.params.item.name);
    }
  }

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          {this.FocusAwareStatusBar(this.props.isFocused)}
          <Bars size={15} color={colors.PRIMARY_NORMAL} />
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
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

            <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
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
            <View style={{ alignSelf: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Credit Total :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 18, marginLeft: 5 }}>
                  {this.props.route.params.item.country.code == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.props.route.params.item.country.code)}
                  {this.numberWithCommas(this.state.creditTotal)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Debit Total :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 18, marginLeft: 8 }}>
                  {this.props.route.params.item.country.code == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.props.route.params.item.country.code)}
                  {this.numberWithCommas(this.state.debitTotal)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {this.state.transactionsData.length == 0 ? null : (
                <TouchableOpacity delayPressIn={0} style={{ padding: 5 }} onPress={() => {

                  //this.setState({ pdfModal: true })
                }}>
                  <AntDesign name="pdffile1" size={22} color={'#FF7C7C'} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => this.setState({ remainderModal: true })}>
                <MaterialCommunityIcons name="bell-ring" size={22} color={"#808080"} />
              </TouchableOpacity>
              {this.props.route.params.item.mobileNo && (
                <TouchableOpacity
                  delayPressIn={0}
                  style={{ marginLeft: 15, padding: 5 }}
                  onPress={() => this.setState({ MoreModal: true })}>
                  <Entypo name="dots-three-vertical" size={22} color={'#808080'} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{ marginTop: Dimensions.get('window').height * 0.02 }} />
          {this.state.payNowButtonPressed === false ? <View
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
              <View style={{ marginLeft: 10 }} />
              <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
              <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 5 }}>
                {moment(this.state.startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                  ' - ' +
                  moment(this.state.endDate, 'DD-MM-YYYY').format('DD MMM YY')}
              </Text>
            </TouchableWithoutFeedback>
            <View style={{ flexDirection: 'row' }}>
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
                // position: 'absolute',
                // marginTop: Dimensions.get('window').height * 0.2,
                // right: 10,
                borderWidth: 1,
                borderColor: '#D9D9D9',
              }}
              onPress={() => this.setState({ voucherModal: true })}
            // onPress={() => this.tryDate()}
            // onPress={() => console.log(this.props.route.params.item.uniqueName, 'hello')}
            >
              <Foundation name="filter" size={22} color={'#808080'} />
            </TouchableOpacity>
          </View> :
            <ScrollView style={{ paddingHorizontal: 20, }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="person" size={25} color="#864DD3" style={{ marginTop: 7 }} />
                <Dropdown
                  ref={(ref) => this.state.payorDropDown = ref}
                  style={{ flex: 1, paddingLeft: 10 }}
                  textStyle={{ color: 'black', fontSize: 15 }}
                  defaultValue={"Select Payor*"}
                  defaultTextStyle={{ color: '#808080' }}
                  options={["Sulbha", "Sulbha", "Sulbha", "Mishra"]}
                  renderSeparator={() => {
                    return (<View></View>);
                  }}
                  onDropdownWillShow={() => this.setState({ isPayorDD: true })}
                  onDropdownWillHide={() => this.setState({ isPayorDD: false })}
                  dropdownStyle={{ width: '80%', height: 150, marginTop: 5, borderRadius: 10 }}
                  dropdownTextStyle={{ color: '#1C1C1C' }}
                  renderRow={(options) => {
                    return (<Text style={{ padding: 10, color: '#1C1C1C' }}>{options}</Text>);
                  }}
                  onSelect={(index, value) => { this.setState({ selectedPayor: value }) }} />
                <Icon
                  style={{ transform: [{ rotate: this.state.isPayorDD ? '180deg' : '0deg' }], padding: 5, marginLeft: 20 }}
                  name={'9'}
                  size={12}
                  color="#808080"
                  onPress={() => {
                    this.setState({ isPayorDD: true });
                    this.state.payorDropDown.show();
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={{ backgroundColor: '#864DD3', width: 25, height: 25, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
                  <FontAwesome name={'dollar'} color="white" size={18} />
                </View>
                <TextInput
                  onBlur={() => {
                    if (this.state.totalAmount == '') {
                      this.setState({ totalAmountPlaceHolder: '' })
                    }
                  }}
                  keyboardType="number-pad"
                  onFocus={() => {
                    this.setState({ totalAmountPlaceHolder: 'a' })
                  }}
                  onChangeText={(text) => {
                    console.log(text)
                    this.setState({ totalAmount: text })
                  }
                  }
                  style={{ fontSize: 15, textAlignVertical: "center", marginHorizontal: 10, padding: 0, width: "90%" }}>
                  <Text style={{ color: this.state.totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.totalAmountPlaceHolder == '' ?
                    'Total Amount' : (this.props.route.params.item.country.code == 'IN'
                      ? '₹' : getSymbolFromCurrency(this.props.route.params.item.country.code) + this.state.totalAmount)}</Text>
                  <Text style={{ color: '#E04646' }}>{this.state.totalAmountPlaceHolder == '' ? '*' : ''}</Text>
                </TextInput>
              </View>
              <View style={{ flexDirection: "row", marginLeft: 0, marginTop: 20 }}>
                <Ionicons name={'md-document-text'} color='#864DD3' size={27} />
                <TextInput
                  placeholder={"Review"}
                  onChangeText={(text) => {
                    console.log(text)
                    this.setState({ review: text })
                  }
                  }
                  style={{ fontSize: 15, marginHorizontal: 10, textAlignVertical: "center", padding: 0, width: "90%" }}>
                  {this.state.review}
                </TextInput>
              </View>
              {this.state.payButtonPressed ?
                <View style={{
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  flex: 1,
                }}>
                  <Text style={{ fontSize: 18, color: 'black', marginTop: 40 }} >Enter OTP</Text>
                  <OTPInputView
                    style={{ width: '85%', height: 100, }}
                    pinCount={6}
                    // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                    // onCodeChanged = {code => { this.setState({code})}}
                    autoFocusOnLoad
                    codeInputFieldStyle={style.underlineStyleBase}
                    onCodeFilled={(code) => {
                      console.log(`Code is ${code}, you are good to go!`)
                    }}
                  />
                  <Text style={{ fontSize: 16, color: '#808080' }} >{"An OTP has been sent to User :" + " Kriti"}</Text>
                  <Text style={{ fontSize: 16, color: '#5773FF', marginTop: 10, marginBottom: 20 }} >Resend</Text>
                </View> : null}
            </ScrollView>
          }

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
          {this.state.payNowButtonPressed === false ?
            this.state.transactionsLoader ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Bars size={15} color={colors.PRIMARY_NORMAL} />
              </View>
            ) : (
              <>
                {this.state.transactionsData.length == 0 ? (
                  <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: "center", }}>
                    <Image
                      source={require('@/assets/images/noTransactions.png')}
                      style={{ resizeMode: 'contain', height: 250, width: 300 }}
                    />
                    <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 25, marginTop: 10, marginBottom: 20 }}>No Transactions</Text>
                  </ScrollView>
                ) : (
                  <FlatList
                    style={{ marginTop: 20, marginBottom: 60 }}
                    data={this.state.transactionsData}
                    renderItem={({ item }) => (
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
            ) : null}

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
          <Dialog.Container
            visible={this.state.remainderModal}
            onBackdropPress={() => this.setState({ remainderModal: false })}>

            <Text style={{ textAlign: 'center', fontSize: 18, marginBottom: 10, fontFamily: FONT_FAMILY.bold }}>Set Reminder</Text>
            <View style={{ paddingHorizontal: 15 }}>
              <Text>Date</Text>
              <TouchableOpacity
                onPress={() => this.setState({ datePicker: true })}
                style={{ borderBottomColor: "#808080", borderBottomWidth: 0.55 }}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                  <Text style={{ color: '#808080', paddingVertical: 10 }}>{format(this.state.dateTime, "dd/MM/yyyy")}</Text>
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 20 }}>Time</Text>
              <TouchableOpacity
                onPress={() => this.setState({ timePicker: true })}
                style={{ borderBottomColor: "#808080", borderBottomWidth: 0.55 }}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                  <Text style={{ color: '#808080', paddingVertical: 10 }}>{format(this.state.dateTime, "HH:mm")}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.scheduleNotification()}
                style={{
                  marginBottom: 10,
                  height: height * 0.05,
                  width: width * 0.6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5773FF', marginTop: 30, borderRadius: 50
                }}>
                <Text style={{ color: 'white', }}>Done</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={this.state.datePicker}
                mode="date"
                date={this.state.dateTime}
                onConfirm={(date) => {
                  if (Number(format(date, "MM")) < Number(format(new Date(Date.now()), "MM"))) {
                    Alert.alert("Invalid", "You cannot schedule reminder on any day before today", [{ style: 'destructive', text: 'Okay' }]);
                  }
                  else if (Number(format(date, "MM")) == Number(format(new Date(Date.now()), "MM")) && Number(format(date, "dd")) < Number(format(new Date(Date.now()), "dd"))) {
                    Alert.alert("Invalid", "You cannot schedule reminder on any day before today", [{ style: 'destructive', text: 'Okay' }]);
                  } else {
                    const newDate: Date = this.state.dateTime;
                    newDate.setDate(date.getDate());
                    newDate.setMonth(date.getMonth());
                    newDate.setFullYear(date.getFullYear());
                    console.log(newDate);
                    this.setState({ dateTime: newDate });
                  }
                  this.setState({ datePicker: false });
                }}
                onCancel={(date) => {
                  this.setState({ datePicker: false });
                }}
              />
              <DateTimePickerModal
                isVisible={this.state.timePicker}
                mode="time"
                date={this.state.dateTime}
                onConfirm={(date) => {
                  const newTime: Date = this.state.dateTime;
                  newTime.setTime(date.getTime());
                  console.log(newTime);
                  this.setState({ timePicker: false, dateTime: newTime });
                }}
                onCancel={(date) => {
                  this.setState({ timePicker: false });
                }}
              />
            </View>
          </Dialog.Container>
          <Modal visible={false}>
            <View style={{ flex: 1 }}>
              {this.FocusAwareStatusBar(this.props.isFocused)}
              <View
                style={{
                  height: Dimensions.get('window').height * 0.08,
                  backgroundColor: '#864DD3',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}>
                <TouchableOpacity onPress={() => this.setState({ remainderModal: false })}>
                  <Icon name={'Backward-arrow'} color="#fff" size={18} />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                  Set Remainder
                </Text>
              </View>
            </View>
          </Modal>
          {this.state.iosLoaderToExport && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.4)',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
              }}>
              <View style={{
                width: width * 0.7,
                paddingVertical: 20,
                backgroundColor: '#fff',
                borderRadius: 15,
                elevation: 3,
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                alignSelf: 'center',
                padding: 15,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Bars size={15} color={color.PRIMARY_NORMAL} />
                <Text style={{ marginTop: 20, fontFamily: 'AvenirLTStd-Black' }}>Downloading PDF</Text>
              </View>
            </View>
          )}
          {this.props.route.params.item.bankPaymentDetails === false ?
            <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 98 + "%" }}>
              <TouchableOpacity onPress={async () => {
                await this.props.navigation.navigate("CustomerVendorScreens", { screen: 'CustomerVendorScreens', params: { index: 1,uniqueName:this.props.route.params.item.uniqueName } }),
                  await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
              }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                <Text style={{ fontSize: 20, color: "black" }}>Add Bank Details</Text>
              </TouchableOpacity>
            </View> : (this.state.creditTotal > 0 ? (
              this.state.payButtonPressed == false ?
                <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 98 + "%" }}>
                  <TouchableOpacity onPress={async () => {
                    if (this.state.payNowButtonPressed) {
                      if (this.state.selectedPayor && this.state.totalAmount) {
                        await this.setState({ payButtonPressed: true })
                      } else {
                        Alert.alert("Missing Fields", "Enter all the mandatory fields",
                          [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
                      }
                    } else {
                      await this.setState({ payNowButtonPressed: true })
                    }
                  }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.payNowButtonPressed ? '#5773FF' : '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: this.state.payNowButtonPressed ? "white" : "black" }}>{this.state.payNowButtonPressed ? "Pay" : "Pay Now"}</Text>
                  </TouchableOpacity>
                </View> :
                <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 98 + "%" }}>
                  <TouchableOpacity onPress={async () => { }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: "white" }}>{"Confirm"}</Text>
                  </TouchableOpacity>
                </View>) : null)
          }
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
