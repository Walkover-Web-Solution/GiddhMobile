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
  Platform, DeviceEventEmitter, TextInput, ToastAndroid
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
import { PaymentServices } from '@/core/services/payment/payment';
import TOAST from 'react-native-root-toast';
import SMSUserConsent from 'react-native-sms-user-consent';

interface SMSMessage {
  receivedOtpMessage: string
}
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
      startDate: null,
      endDate: null,
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
      totalAmount: "₹" + this.currencyFormat(this.props.route.params.item.closingBalance.amount, this.props.route.params.activeCompany?.balanceDisplayFormat),
      totalAmountPlaceHolder: 'a',
      review: '',
      reviewPlaceHolder: '',
      code: '',
      currencySymbol: this.props.route.params.item.country.code == 'IN'
        ? '₹' : (getSymbolFromCurrency(this.props.route.params.item.country.code) == undefined ? "" : getSymbolFromCurrency(this.props.route.params.item.country.code)),
      selectPayorData: [],
      bankAccounts: [],
      OTPMessage: "",
      requestIdOTP: '',
      paymentProcessing: false,
      disableResendButton: false
    };

  }

  getActiveCompany = async () => {
    if (this.props.route.params.type == 'Vendors' && this.props.route.params.item.country.code == "IN") {
      let activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyName);
      if (activeCompany == null || activeCompany == undefined) {
        activeCompany = " "
      }
      let remark = await (this.props.route.params.item.name).split(' ')[0] + " - " + (activeCompany).split(' ')[0]
      this.setState({ review: remark, reviewPlaceHolder: 'a' })
    }
  }

  componentDidMount() {
    this.getActiveCompany()
    if (this.props.route.params.item.bankPaymentDetails && this.props.route.params.type == 'Vendors') {
      this.getBankAccountsData()
    }
    this.getTransactions();
    PushNotification.popInitialNotification((notification) => {
      console.log('Initial Notification', notification);
    });

  }

  getSMSMessage = async () => {
    try {
      const message: SMSMessage = await SMSUserConsent.listenOTP()
      let messageResponse = message.receivedOtpMessage.slice(15)
      messageResponse = messageResponse.slice(0, 6)
      console.log(messageResponse)
      await this.setState({ code: messageResponse.toString() })
    } catch (e) {
      console.log(JSON.stringify(e))
    }
  }

  removeSmsListener = () => {
    try {
      SMSUserConsent.removeOTPListener()
    } catch (e) {
      console.log(e)
    }
  }

  async getBankAccountsData() {
    let allAccounts = await PaymentServices.getAccounts()
    if (allAccounts.body.length > 0) {
      let allPayor = await PaymentServices.getAllPayor(allAccounts.body[0].uniqueName, 1);
      if (allAccounts.status == "success") {
        await this.setState({ bankAccounts: allAccounts.body })
        console.log(JSON.stringify("All bank Account " + JSON.stringify(this.state.bankAccounts)))
      }
      if (allPayor.status == "success") {
        await this.setState({ selectPayorData: allPayor.body })
        if (allPayor.body.length > 0) {
          await this.setState({ selectedPayor: allPayor.body[0] })
        }
        console.log(JSON.stringify("All Payor " + JSON.stringify(this.state.selectPayorData)))
      }
    }

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

  sendNotification = async (data: any) => {
    try {
      await this.createChannel();
      const activeCompanyUniqueName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName)
      const activeCompanyName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyName)
      let notificationSetArr: any = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SET_ARR)
      if (notificationSetArr == null) {
        notificationSetArr = []
      } else {
        notificationSetArr = JSON.parse(notificationSetArr)
      }
      let notificationExist = false
      if (notificationSetArr.length > 0) {
        for (var i = 0; i < notificationSetArr.length; i++) {
          if (new Date(Date.now()).getTime() > notificationSetArr[i][1]) {
            // Remove old notifications
            notificationSetArr.splice(i, 1)
            i = (i == notificationSetArr.length - 1) ? i : i - 1
          }
        }
        for (var i = 0; i < notificationSetArr.length; i++) {
          if (notificationSetArr[i][0] == (data.uniqueName + (this.state.dateTime).getTime())) {
            notificationExist = true
            break
          }
        }
      }
      if (notificationExist) {
        console.log("Notification Exist, After all notifications set Array " + notificationSetArr)
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SET_ARR, JSON.stringify(notificationSetArr))
        alert(`Reminder for ${data.name} is already set for selected date and time`)
        return
      }

      await notificationSetArr.push([data.uniqueName + this.state.dateTime.getTime(), this.state.dateTime.getTime()])
      console.log("After all notifications set Array " + notificationSetArr)
      // Store Already set notifications unique name.
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SET_ARR, JSON.stringify(notificationSetArr))

      await PushNotification.localNotificationSchedule({
        date: this.state.dateTime,
        message: 'Payment to ' + data.name + " is due",
        allowWhileIdle: true,
        channelId: 'channel-id',
        smallIcon: 'ic_launcher',
        title: 'Reminder',
        userInfo: { item: JSON.stringify(data), activeCompanyUniqueName: activeCompanyUniqueName, activeCompanyName: activeCompanyName, activeCompany: this.props.route.params.activeCompany }
      });
      await this.setState({ remainderModal: false });
      await setTimeout(() => { Alert.alert("Success", "Reminder successfully activated", [{ style: 'destructive', text: 'Okay' }]) }, 400)
    } catch (error) {
      console.log("failed to push notification" + error);
      let notificationSetArr: any = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SET_ARR)
      if (notificationSetArr == null) {
        notificationSetArr = []
      } else {
        notificationSetArr = JSON.parse(notificationSetArr)
      }
      if (notificationSetArr.length > 0) {
        for (var i = 0; i < notificationSetArr.length; i++) {
          if (notificationSetArr[i][0] == (data.uniqueName + (this.state.dateTime).getTime())) {
            notificationSetArr.splice(i, 1)
            console.log("After removing notification" + notificationSetArr)
            await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SET_ARR, JSON.stringify(notificationSetArr))
            break
          }
        }
      }
      Alert.alert("Fail", "Failed to activat reminder", [{ style: 'destructive', text: 'Okay' }])
    }
  }


  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#520EAD" barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} /> : null;
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
      if (this.state.startDate == null || this.state.endDate == null) {
        this.setState({
          startDate: transactions.body.fromDate,
          endDate: transactions.body.toDate
        })
      }
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
      this.setState({
        startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
        endDate: moment().format('DD-MM-YYYY'),
      })
      this.setState({
        showLoader: false,
      });
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
        if (res.respInfo.status != 200) {
          Platform.OS == "ios" ? this.setState({ iosLoaderToExport: false }) : this.downloadModalVisible(false)
          if (Platform.OS == "ios") {
            TOAST.show(JSON.parse(res.data).message, {
              duration: TOAST.durations.LONG,
              position: -150,
              hideOnPress: true,
              backgroundColor: "#1E90FF",
              textColor: "white",
              opacity: 1,
              shadow: false,
              animation: true,
              containerStyle: { borderRadius: 10 }
            });
          } else {
            ToastAndroid.show(JSON.parse(res.data).message, ToastAndroid.LONG)
          }
          return
        }
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
          let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${this.state.startDate} to ${this.state.endDate}.pdf`;
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
            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${this.state.startDate} to ${this.state.endDate}.pdf`,
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

  numberWithCommas = (x: any) => {
    if (x == null) {
      return "0";
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  currencyFormat(amount: number, currencyType: string | undefined) {
    console.log("Currency type " + currencyType + " total Amount " + amount)
    switch (currencyType) {
      case 'IND_COMMA_SEPARATED':
        // eslint-disable-next-line no-lone-blocks
        {
          if (amount.toString().length > 4) {
            return amount
              .toFixed(1)
              .toString()
              .replace(/\B(?=(\d{2})+(?!\d))/g, ',');
          } else if (amount.toString().length === 3) {
            return amount.toFixed(1).toString();
          } else if (amount.toString().length === 4) {
            return amount
              .toFixed(1)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        break;
      case 'INT_SPACE_SEPARATED': {
        return amount
          .toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      case 'INT_APOSTROPHE_SEPARATED': {
        return amount
          .toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
      }
      default: {
        return amount
          //.toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }
  }

  scheduleNotification = () => {
    const today = new Date(Date.now());
    const selected: Date = this.state.dateTime;
    if (today.getDate() == selected.getDate() && today.getMonth() == selected.getMonth() && today.getFullYear() == selected.getFullYear() && this.state.dateTime.getTime() <= new Date(Date.now()).getTime()) {
      Alert.alert("Invalid time", "Please enter a valid time", [{ style: 'destructive', text: 'Okay' }]);
    } else {
      this.sendNotification(this.props.route.params.item);
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

  resendOTP = async () => {
    // Resend OTP
    try {
      await this.setState({ code: '', disableResendButton: true })
      const payload = {
        bankName: this.state.bankAccounts[0].bankName,
        urn: this.state.selectedPayor.urn,
        uniqueName: this.state.bankAccounts[0].uniqueName,
        totalAmount: (((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')).trim(),
        bankPaymentTransactions: [{ amount: Number(((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')), remarks: this.state.review, vendorUniqueName: this.props.route.params.item.uniqueName }]
      }
      console.log("Send OTP request " + JSON.stringify(payload))
      const response = await PaymentServices.sendOTP(payload)
      console.log("OTP response" + JSON.stringify(response))
      if (response.status == "success") {
        if (Platform.OS == "ios") {
          await this.setState({ disableResendButton: false })
          TOAST.show(response.body.message, {
            duration: TOAST.durations.LONG,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          });
        } else {
          ToastAndroid.show(response.body.message, ToastAndroid.LONG)
          await this.removeSmsListener()
          await this.getSMSMessage()
        }
        await this.setState({ OTPMessage: response.body.message, payButtonPressed: true, requestIdOTP: response.body.requestId, disableResendButton: false })
      } else {
        await this.setState({ disableResendButton: false })
        if (Platform.OS == "ios") {
          TOAST.show(response.data.message, {
            duration: TOAST.durations.LONG,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          });
        } else {
          ToastAndroid.show(response.data.message, ToastAndroid.LONG)
        }
      }
    } catch (e) {
      await this.setState({ disableResendButton: false })
      if (Platform.OS == "ios") {
        TOAST.show("Error - Please try again", {
          duration: TOAST.durations.LONG,
          position: -150,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      } else {
        ToastAndroid.show("Error - Please try again", ToastAndroid.LONG)
      }
      console.log("Error in sending OTP " + JSON.stringify(e))
    }
  }

  confirmPayment = async () => {
    if (this.state.code.length != 6) {
      Alert.alert("Missing Fields", "Enter complete OTP",
        [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
      return
    }
    // Confirm Payment
    await this.setState({ paymentProcessing: true })
    const payload = { requestId: this.state.requestIdOTP, otp: this.state.code }
    console.log("Payment payload " + JSON.stringify(payload))
    const response = await PaymentServices.confirmPayment(payload, this.state.selectedPayor.urn, this.state.bankAccounts[0].uniqueName)
    if (response.status == "success") {
      this.removeSmsListener()
      this.props.navigation.navigate("Parties")
      if (Platform.OS == "ios") {
        await setTimeout(() => {
          TOAST.show(response.body.Message, {
            duration: TOAST.durations.LONG,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          }), 100
        })
      } else {
        ToastAndroid.show(response.body.Message, ToastAndroid.LONG)
      }
      await this.setState({ paymentProcessing: false })
    } else {
      await this.setState({ paymentProcessing: false, code: '' })
      if (Platform.OS == "ios") {
        await setTimeout(() => {
          TOAST.show(response.data.message, {
            duration: TOAST.durations.LONG,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          }), 100
        })
      } else {
        ToastAndroid.show(response.data.message, ToastAndroid.LONG)
      }
    }
  }

  PayButtonPressed = async () => {
    if (this.state.payNowButtonPressed) {
      if (this.state.selectedPayor != null && this.state.totalAmount != null && this.state.totalAmount != '' && this.state.review != '') {
        console.log("Total Amount" + ((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '') + " first Number " + (this.state.totalAmount).substr(1, 1))
        if (Number(((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')) > 0 && (this.state.totalAmount).substr(1, 1) != 0) {
          // Sent OTP API call
          this.resendOTP();
        } else {
          if ((this.state.totalAmount).substr(1, 1) == 0) {
            Alert.alert("Invalid", "Amount should be greater than or equal to 1",
              [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
          } else {
            Alert.alert("Invalid", "Please Enter Valid Amount",
              [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
          }
        }
      } else {
        Alert.alert("Missing Fields", "Enter all the mandatory fields",
          [{ text: "OK", onPress: () => { console.log("Alert cancelled") } }])
      }
    } else {
      await this.setState({ payNowButtonPressed: true })
    }
  }

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
            {this.state.payNowButtonPressed ?
              <View style={{ justifyContent: "space-between", alignItems: "center", flexDirection: "row", flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF', width: "60%" }}>
                  {this.props.route.params.item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, color: '#FFFFFF', width: "35%", textAlign: "right", paddingLeft: 2 }}>
                  {this.state.currencySymbol + this.numberWithCommas(this.props.route.params.item.closingBalance.amount)}
                </Text>
              </View>
              : <Text numberOfLines={1} style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                {this.props.route.params.item.name}
              </Text>
            }
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
                <TouchableOpacity delayPressIn={0} style={{ padding: 5 }} onPress={() => this.setState({ pdfModal: true })}>
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
                  options={this.state.selectPayorData.length > 0 ? this.state.selectPayorData : ["No results found"]}
                  renderSeparator={() => {
                    return (<View></View>);
                  }}
                  onDropdownWillShow={() => this.setState({ isPayorDD: true })}
                  onDropdownWillHide={() => this.setState({ isPayorDD: false })}
                  dropdownStyle={{ width: '78%', height: this.state.selectPayorData.length > 1 ? 100 : 50, marginTop: 5, borderRadius: 5 }}
                  dropdownTextStyle={{ color: '#1C1C1C' }}
                  renderRow={(options) => {
                    return (
                      <Text style={{ padding: 10, color: '#1C1C1C' }}>{options == "No results found" ? options : options.user.name}</Text>)
                  }}
                  onSelect={(index, value) => {
                    if (value != "No results found") {
                      this.setState({ selectedPayor: value })
                    }
                  }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ color: this.state.selectedPayor == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>
                      {this.state.selectedPayor == null ? 'Select Payor' : this.state.selectedPayor.user.name}</Text>
                    <Text style={{ color: '#E04646' }}>{this.state.selectedPayor == null ? '*' : ''}</Text>
                  </View>
                </Dropdown>
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
              {this.state.selectedPayor ? <Text style={{ paddingHorizontal: 20, marginLeft: 15, color: '#808080', fontSize: 12, marginBottom: 10 }}>
                {`Bank Bal ${this.state.bankAccounts.length > 0 ? this.state.bankAccounts[0].effectiveBal : 0} dr`}</Text> : <View style={{ marginBottom: 0 }}></View>}
              <View style={{ flexDirection: "row", marginTop: 15 }}>
                <View style={{ backgroundColor: '#864DD3', width: 25, height: 25, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 3 }}>
                  <FontAwesome name={'dollar'} color="white" size={18} />
                </View>
                <TextInput
                  onBlur={async () => {
                    if (this.state.totalAmount == '') {
                      await this.setState({ totalAmountPlaceHolder: '' })
                    } else {
                      let amount = await (this.currencyFormat(Number((this.state.totalAmount).replace(/[^0-9.]/g, '').replace(/,/g, '')), this.props.route.params.activeCompany?.balanceDisplayFormat))
                      console.log("Total Amount " + (this.state.totalAmount).replace(/[^0-9.]/g, '').replace(/,/g, '') + " currency symbol " + this.state.currencySymbol)
                      if (amount == "NaN") {
                        if (Platform.OS == "ios") {
                          TOAST.show("Invalid Amount", {
                            duration: TOAST.durations.LONG,
                            position: -140,
                            hideOnPress: true,
                            backgroundColor: "#1E90FF",
                            textColor: "white",
                            opacity: 1,
                            shadow: false,
                            animation: true,
                            containerStyle: { borderRadius: 10 }
                          });
                        } else {
                          ToastAndroid.show("Invalid Amount", ToastAndroid.SHORT)
                        }
                        await this.setState({ totalAmount: '', totalAmountPlaceHolder: '' })
                        return
                      }
                      await this.setState({ totalAmount: this.state.currencySymbol + amount })
                    }
                  }}
                  returnKeyType={'done'}
                  keyboardType="number-pad"
                  onFocus={() => {
                    this.setState({ totalAmountPlaceHolder: 'a' })
                  }}
                  onChangeText={(text) => {
                    console.log(text)
                    this.setState({ totalAmount: (text).replace(/[^0-9.₹]/g, '') })
                  }}
                  style={{ fontSize: 15, textAlignVertical: "center", marginHorizontal: 10, padding: 0, width: "90%", }}>
                  <Text style={{ color: '#1c1c1c' }}>{this.state.totalAmountPlaceHolder != '' ? ((this.state.totalAmount.length > 1 || this.state.totalAmount == this.state.currencySymbol) && this.state.currencySymbol != "" ? (this.state.currencySymbol).substring(1)
                    : (this.state.currencySymbol)) : ''}</Text>
                  <Text style={{ color: this.state.totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.totalAmountPlaceHolder == '' &&
                    'Total Amount'}</Text>
                  <Text style={{ color: this.state.totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.totalAmountPlaceHolder != '' &&
                    (this.state.totalAmount)}</Text>
                  <Text style={{ color: '#E04646' }}>{this.state.totalAmountPlaceHolder == '' ? '*' : ''}</Text>
                </TextInput>
              </View>
              <View style={{ flexDirection: "row", marginLeft: 0, marginTop: 20 }}>
                <Ionicons name={'md-document-text'} color='#864DD3' size={27} />
                <TextInput
                  multiline={true}
                  returnKeyType={"done"}
                  onBlur={() => {
                    if (this.state.review == '') {
                      this.setState({ reviewPlaceHolder: '' })
                    }
                  }}
                  onFocus={() => {
                    this.setState({ reviewPlaceHolder: 'a' })
                  }}
                  onChangeText={(text) => {
                    console.log(text)
                    this.setState({ review: text })
                  }
                  }
                  style={{ fontSize: 15, marginHorizontal: 8, textAlignVertical: "center", padding: 0, width: "90%", }}>
                  <Text style={{ color: this.state.reviewPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c' }}>{this.state.reviewPlaceHolder == '' ? 'Comments' : this.state.review}</Text>
                  <Text style={{ color: '#E04646' }}>{this.state.reviewPlaceHolder == '' ? '*' : ''}</Text>
                </TextInput>
              </View>
              {this.state.payButtonPressed ?
                <View style={{
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  flex: 1,
                  marginBottom: 30
                }}>
                  <Text style={{ fontSize: 18, color: 'black', marginTop: 40 }} >Enter OTP</Text>
                  <OTPInputView
                    style={{ width: '85%', height: 100, }}
                    pinCount={6}
                    code={this.state.code}
                    textContentType="oneTimeCode"
                    onCodeChanged={code => { this.setState({ code }) }}
                    autoFocusOnLoad
                    codeInputFieldStyle={style.underlineStyleBase}
                    onCodeFilled={(code) => {
                      this.setState({ code })
                      console.log(`Code is ${code}, you are good to go!`)
                    }}
                  />
                  <Text style={{ fontSize: 16, color: '#808080' }} >{this.state.OTPMessage}</Text>
                  <TouchableOpacity disabled={this.state.disableResendButton} onPress={() => this.resendOTP()}>
                    <Text style={{ fontSize: 16, color: this.state.disableResendButton ? colors.PRIMARY_DISABLED : '#5773FF', marginTop: 10, marginBottom: 20 }} >Resend</Text>
                  </TouchableOpacity>
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
                    style={{ marginTop: 20 }}
                    data={this.state.transactionsData}
                    renderItem={({ item }) => (
                      <TransactionList
                        item={item}
                        downloadModal={this.downloadModalVisible}
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
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => this.scheduleNotification()}
                  style={{
                    marginBottom: 10,
                    height: height * 0.05,
                    width: width * 0.6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5773FF', marginTop: 30, borderRadius: 50
                  }}>
                  <Text style={{ color: 'white', }}>Done</Text>
                </TouchableOpacity>
              </View>
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
                    newDate.setSeconds(0);
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
                  newTime.setSeconds(0)
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
          {this.state.paymentProcessing && (
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
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          )}
          {this.props.route.params.type == 'Vendors' ? (
            this.props.route.params.item.bankPaymentDetails === false ?
              <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity onPress={async () => {
                  await this.props.navigation.navigate("CustomerVendorScreens", { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: this.props.route.params.item.uniqueName } }),
                    await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                  <Text style={{ fontSize: 20, color: "black" }}>Add Bank Details</Text>
                </TouchableOpacity>
              </View> :
              this.props.route.params.type == 'Vendors' && this.props.route.params.item.country.code == "IN" &&
              (this.state.payButtonPressed == false ?
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                  <TouchableOpacity onPress={async () => {
                    this.PayButtonPressed()
                  }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.payNowButtonPressed ? '#5773FF' : '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: this.state.payNowButtonPressed ? "white" : "black" }}>{this.state.payNowButtonPressed ? "Pay" : "Pay Now"}</Text>
                  </TouchableOpacity>
                </View> :
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                  <TouchableOpacity disabled={this.state.paymentProcessing} onPress={async () => { this.confirmPayment() }}
                    style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.paymentProcessing ? '#ACBAFF' : '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: "white" }}>{"Confirm"}</Text>
                  </TouchableOpacity>
                </View>))
            : null}
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
