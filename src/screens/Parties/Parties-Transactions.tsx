import React, { createRef } from 'react';
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
  Platform,
  DeviceEventEmitter,
  TextInput,
  ToastAndroid,
  Keyboard
} from 'react-native';
import style from '@/screens/Transaction/style';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Icon from '@/core/components/custom-icon/custom-icon';
import { CommonService } from '@/core/services/common/common.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import RNFetchBlob from 'react-native-blob-util';
import getSymbolFromCurrency from 'currency-symbol-map';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import PushNotification, { Importance } from 'react-native-push-notification';
import OTPInputView from '@twotalltotems/react-native-otp-input';

import Share from 'react-native-share';
import base64 from 'react-native-base64';
import MoreModal from './components/moreModal';
import ShareModal from './components/sharingModal';
import color from '@/utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Dropdown from 'react-native-modal-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { PaymentServices } from '@/core/services/payment/payment';
import TOAST from 'react-native-root-toast';
import SMSUserConsent from '../../../SMSUserConsent';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';
import { AccountsService } from '@/core/services/accounts/accounts.service';
import ConfirmationBottomSheet, { ConfirmationMessages } from '@/components/ConfirmationBottomSheet';
import Toast from '@/components/Toast';
import Notifee, { AndroidNotificationSetting } from '@notifee/react-native';

interface SMSMessage {
  receivedOtpMessage: string
}
type connectedProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;
type Props = connectedProps

const { width, height } = Dimensions.get('window');

type State = {
  selectedItems: Array<any>
  transactionsData: Array<any>
}
class PartiesTransactionScreen extends React.Component<Props, State> {
  private voucherBottomSheetRef: React.Ref<BottomSheet>;
  private pdfBottomSheetRef: React.Ref<BottomSheet>;
  private moreBottomSheetRef: React.Ref<BottomSheet>;
  private reminderBottomSheetRef: React.Ref<BottomSheet>;
  private payorBottomSheetRef: React.Ref<BottomSheet>;
  private bankBottomSheetRef: React.Ref<BottomSheet>;
  private confirmationBottomSheetRef: React.Ref<BottomSheet>;
  constructor(props: Props) {
    super(props);
    this.voucherBottomSheetRef = createRef<BottomSheet>();
    this.pdfBottomSheetRef = createRef<BottomSheet>();
    this.moreBottomSheetRef = createRef<BottomSheet>();
    this.reminderBottomSheetRef = createRef<BottomSheet>();
    this.payorBottomSheetRef = createRef<BottomSheet>();
    this.bankBottomSheetRef = createRef<BottomSheet>();
    this.confirmationBottomSheetRef = createRef<BottomSheet>();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.state = {
      showLoader: true,
      transactionsLoader: true,
      transactionsData: [],
      startDate: null,
      endDate: null,
      page: 1,
      totalPages: 0,
      loadingMore: false,
      DownloadModal: false,
      ShareModal: false,
      vouchers: [],
      creditTotal: 0,
      debitTotal: 0,
      activeDateFilter: '',
      dateMode: 'defaultDates',
      datePicker: false,
      timePicker: false,
      dateTime: new Date(Date.now()),
      iosLoaderToExport: false,
      payNowButtonPressed: false,
      payButtonPressed: false,
      selectedPayor: null,
      selectedBank: null,
      totalAmount: "₹" + formatAmount(this.props.route?.params?.item?.closingBalance?.amount),
      totalAmountPlaceHolder: 'a',
      review: '',
      reviewPlaceHolder: '',
      code: '',
      countryCode: this.props.route.params?.item?.country?.code,
      currencySymbol: this.props.route.params?.item?.country?.code == 'IN'
        ? '₹' : (getSymbolFromCurrency(this.props.route?.params?.item?.country?.code) == undefined ? "" : getSymbolFromCurrency(this.props.route?.params?.item?.country?.code)),
      selectPayorData: [],
      bankAccounts: [],
      OTPMessage: "",
      requestIdOTP: '',
      paymentProcessing: false,
      disableResendButton: false,
      openingBalance: {},
      closingBalance: {},
      selectedItems: []
    };

  }

  getActiveCompany = async () => {
    if (this.props.route?.params?.type == 'Vendors' && this.state.countryCode == "IN") {
      let activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyName);
      if (activeCompany == null || activeCompany == undefined) {
        activeCompany = " "
      }
      let remark = await (this.props.route?.params?.item?.name).split(' ')[0] + " - " + (activeCompany).split(' ')[0]
      this.setState({ review: remark, reviewPlaceHolder: 'a' })
    }
  }

  async componentDidMount() {
    console.log('totalAmounttotalAmount', this.state?.totalAmount)
    this.setState({
      countryCode: this.props.route?.params?.item?.country?.countryCode ? this.props.route?.params?.item?.country?.countryCode : this.props.route?.params?.item?.country?.code,
      currencySymbol: this.props.route?.params?.item?.currencySymbol ? this.props.route?.params?.item?.currencySymbol :
        this.props.route.params?.item?.country?.code == 'IN'
          ? '₹' : (getSymbolFromCurrency(this.props.route?.params?.item?.country?.code) == undefined ? "" : getSymbolFromCurrency(this.props.route?.params?.item?.country?.code))
    })
    this.getActiveCompany()
    if (this.props.route?.params?.item?.bankPaymentDetails && this.props.route?.params?.type == 'Vendors') {
      this.getBankAccountsData()
    }

    // This listener calls API again when screen in focus.
    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      try {
        await this.setState({ showLoader: true });
        if (this.props?.route?.params?.type == 'Vendors') { await this.getAccountData(); }
        await this.getTransactions();
      } catch (error) {
        // handle errors here
      }
    })

    PushNotification.popInitialNotification((notification) => {
      console.log('Initial Notification', notification);
    });

  }

  componentWillUnmount() {
    this.removeSmsListener()
    this.unsubscribe()

  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedBank !== prevState.selectedBank || this.state.totalAmount !== prevState.totalAmount) {
      const amount = (((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')).trim();
      this.getAllPayorData(amount)
    }
  }

  getAllPayorData = _.debounce(this.getAllPayor, 20);

  retrieveVerificationCode = (sms: any, codeLength: any) => {
    const codeRegExp = new RegExp(`\\d{${codeLength}}`, 'm');
    const code = sms?.match(codeRegExp)?.[0];
    return code ?? "";
  }

  getSMSMessage = async () => {
    try {
      const message: SMSMessage = await SMSUserConsent.listenOTP()
      let messageResponse = message.receivedOtpMessage
      console.log(messageResponse)
      var otp = this.retrieveVerificationCode(messageResponse, 6)
      await this.setState({ code: otp.toString() })
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

  async getAllPayor(amount: number) {
    const response = await PaymentServices.getAllPayor(this.state.selectedBank?.uniqueName, amount);
    if (response.status == "success" && response?.body) {
      await this.setState({
        selectPayorData: response.body,
        payorErrorMessage: null
      });
      if (response.body.length > 0) {
        await this.setState({ selectedPayor: response.body[0] });
      }
      return;
    }

    if (response?.status == 'error') {
      this.setState({
        selectedPayor: null,
        selectPayorData: [],
        payorErrorMessage: response?.message ?? 'Something Went Wrong'
      });
    }

  }

  async getBankAccountsData() {
    let allAccounts = await PaymentServices.getAccounts()
    if (allAccounts.body.length > 0) {
      if (allAccounts.status == "success") {
        await this.setState({ bankAccounts: allAccounts.body })
        console.log(JSON.stringify("All bank Account " + JSON.stringify(this.state.bankAccounts)))
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
      this.setBottomSheetVisible(this.reminderBottomSheetRef, false);
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

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if (visible) {
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };
  shareModalVisible = (value) => {
    this.setState({ ShareModal: value });
  };
  downloadModalVisible = (value) => {
    this.setState({ DownloadModal: value });
  };
  onWhatsApp = () => {
    if (this.props.route.params?.item?.mobileNo) {
      Linking.openURL(`whatsapp://send?phone=${this.props.route?.params?.item?.mobileNo}&text=${''}`);
    } else {
      return Alert.alert('', 'The phone number for this person is not available');
    }
  };
  onCall = () => {
    if (this.props.route.params?.item?.mobileNo) {
      Linking.openURL(`tel://${this.props.route.params?.item?.mobileNo}`);
    } else {
      return Alert.alert('', 'The phone number for this person is not available');
    }
  };

  phoneNo = () => {
    if (this.props.route.params?.item?.mobileNo) {
      return `${this.props.route.params?.item?.mobileNo}`;
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
        this.props.route.params?.item?.uniqueName,
        this.state.vouchers,
      );
      if (transactions.body) {
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
          // debitTotal: transactions.body.debitTotal, //commented as earlier company amount was showing now need to show the acount currency
          // creditTotal: transactions.body.creditTotal,
          totalPages: transactions.body.totalPages,
        });
      }
      //Handling balance api
      const balance = await CommonService.getPartyBalance(
        this.state.startDate,
        this.state.endDate,
        this.props.route.params?.item?.uniqueName,
      );
      if (balance.body) {
        this.setState({
          openingBalance: balance.body.forwardedBalance,
          closingBalance: balance.body.closingBalance,
          debitTotal: balance.body.debitTotal,
          creditTotal: balance.body.creditTotal,
          totalAmount: "₹" + formatAmount(balance?.body?.closingBalance?.amount)
        });
      }
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

  private async getAccountData() {
    try {
      const response = await AccountsService.getIndividualAccountData(this.props.route?.params?.item?.uniqueName);
      if (response?.status == 'success') {
        this.props.navigation.setParams({
          item: { ...response?.body },
          type: (response?.body?.accountType === 'Creditors' ? 'Vendors' : 'Creditors')
        });
      }
    } catch (e) {
      console.log('----- Parties Transaction - getAccountData -----', e);
    }
  }

  async handleLoadMore() {
    try {
      const transactions = await CommonService.getPartyTransactions(
        this.state.startDate,
        this.state.endDate,
        this.state.page,
        this.props.route.params?.item?.uniqueName,
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
        'POST',
        `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=admin-detailed&sort=asc&branchUniqueName=&lang=en`,
        {
          'session-id': `${token}`,
          'content-type': 'application/json'
        },
        JSON.stringify({
          includeDescription: true,
          description: null,
          includeParticulars: true,
          includeVouchers: true,
          particulars: [
            this.props.route.params?.item?.uniqueName
          ],
          ...(this.state.vouchers?.length > 0 && {vouchers: this.state.vouchers}),
          inventory: {
            includeInventory: false,
            includeQuantity: true,
            quantityEqualTo: true,
            quantityGreaterThan: true,
            includeItemValue: true,
            itemValueLessThan: true,
            itemValueEqualTo: true,
          }
        })
      ) .then((res) => {
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
        let pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate} - ${moment()}.pdf`;
        RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
        Platform.OS == "android" && RNFetchBlob.android.actionViewIntent(pdfLocation, 'application/pdf')
        if (Platform.OS === "ios") {
          //let pdfLocation = `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate} to ${this.state.endDate} - ${moment()}.pdf`;
          RNFetchBlob.ios.openDocument(pdfLocation)
          this.setState({ iosLoaderToExport: false })
        } else {
          this.downloadModalVisible(false)
        }
        if (Platform.OS !== "ios") {
          ToastAndroid.show("Pdf saved successfully", ToastAndroid.LONG)
        }
      })
    } catch (e) {
      Platform.OS == "ios" ? this.setState({ iosLoaderToExport: false }) : this.downloadModalVisible(false)
      console.log(e);
    }
  };
  permissonDownload = async () => {
    try {
      if (Platform.OS == "android" && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          this.downloadModalVisible(false);
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
      await this.exportFile();
    } catch (err) {
      this.downloadModalVisible(false)
      console.warn(err);
    }
  };
  permissonShare = async () => {
    try {
      if (Platform.OS == "android" && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          this.setState({ ShareModal: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
      await this.onShare();
    } catch (err) {
      this.setState({ ShareModal: false });
      console.warn(err);
    }
  };
  permissonWhatsapp = async () => {
    try {
      if (Platform.OS == "android" && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          this.setState({ ShareModal: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
      await this.onWhatsAppShare();
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
      let pdfName = `${this.state.startDate} to ${this.state.endDate} - ${moment()}`
      RNFetchBlob.fetch(
        'POST',
        `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=admin-detailed&sort=asc&branchUniqueName=&lang=en`,
        {
          'session-id': `${token}`,
          'content-type': 'application/json'
        },
        JSON.stringify({
          includeDescription: true,
          description: null,
          includeParticulars: true,
          includeVouchers: true,
          particulars: [
            this.props.route.params?.item?.uniqueName
          ],
          ...(this.state.vouchers?.length > 0 && {vouchers: this.state.vouchers}),
          inventory: {
            includeInventory: false,
            includeQuantity: true,
            quantityEqualTo: true,
            quantityGreaterThan: true,
            includeItemValue: true,
            itemValueLessThan: true,
            itemValueEqualTo: true,
          }
        })
      ) 
        .then(async (res) => {
          let base64Str = await res.base64();
          let base69 = await base64.decode(base64Str);
          let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${pdfName}.pdf`;
          await RNFetchBlob.fs.writeFile(pdfLocation, JSON.parse(base69).body.file, 'base64');
          await this.setState({ ShareModal: false });
          //if (Platform.OS === "ios") {
          //RNFetchBlob.ios.previewDocument(pdfLocation)
          //}
        })
        .then(async () => {
          setTimeout(async () => await Share.open({
            title: 'This is the report',
            //message: 'Message:',
            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${pdfName}.pdf`,
            subject: 'Report',
          })
            .then((res) => {
              this.setState({ ShareModal: false });
              console.log(res);
            })
            .catch((err) => {
              // this.setState({ ShareModal: false });
              // err && console.log(err);
            }), 100)
        });
    } catch (e) {
      this.setState({ ShareModal: false });
      console.log(e);
    }
  };

  onWhatsAppShare = async () => {
    Linking.canOpenURL(`whatsapp://send?phone=${this.props?.route?.params?.item?.mobileNo.replace(/\D/g, '')}&text=${''}`)
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
              url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate}-${this.state.endDate}.pdf`,
              social: Share.Social.WHATSAPP,
              whatsAppNumber: this.props.route?.params?.item?.mobileNo.replace(/\D/g, ''),
              filename: 'Transactions report',
            };
            RNFetchBlob.fetch(
              'POST',
              `https://api.giddh.com/company/${activeCompany}/export-daybook-v2?page=0&count=50&from=${this.state.startDate}&to=${this.state.endDate}&format=pdf&type=admin-detailed&sort=asc&branchUniqueName=&lang=en`,
              {
                'session-id': `${token}`,
                'content-type': 'application/json'
              },
              JSON.stringify({
                includeDescription: true,
                description: null,
                includeParticulars: true,
                includeVouchers: true,
                particulars: [
                  this.props.route.params?.item?.uniqueName
                ],
                ...(this.state.vouchers?.length > 0 && {vouchers: this.state.vouchers}),
                inventory: {
                  includeInventory: false,
                  includeQuantity: true,
                  quantityEqualTo: true,
                  quantityGreaterThan: true,
                  includeItemValue: true,
                  itemValueLessThan: true,
                  itemValueEqualTo: true,
                }
              })
            ) 
              .then(async (res) => {
                let base64Str = await res.base64();
                let base69 = await base64.decode(base64Str);
                let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.state.startDate}-${this.state.endDate}.pdf`;
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

  filterCall = _.debounce(this.getTransactions, 200);

  numberWithCommas = (x: any) => {
    if (x == null) {
      return "0";
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  currencyFormat(amount: number, currencyType: string | undefined) {
    console.log("Currency type " + currencyType + " total Amount " + amount)
    if (amount == null || amount == undefined) {
      return ""
    }
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

  scheduleNotification = async() => {
    if (Platform.OS == "android" && Platform.Version >= 33) {
      const settings = await Notifee.getNotificationSettings();
      if (settings.android.alarm == AndroidNotificationSetting.DISABLED) {
        Alert.alert("No permission to set Alarm/Reminder", "Please provide permission to set Alarm/Reminder",
          [{
            text: "OK", onPress: () => {
              Notifee.openAlarmPermissionSettings()
            }
          }, { text: "Cancel", onPress: () => { } }])
        return;
      }
    }
    const today = new Date(Date.now());
    const selected: Date = this.state.dateTime;
    if (today.getDate() == selected.getDate() && today.getMonth() == selected.getMonth() && today.getFullYear() == selected.getFullYear() && this.state.dateTime.getTime() <= new Date(Date.now()).getTime()) {
      Alert.alert("Invalid time", "Please enter a valid time", [{ style: 'destructive', text: 'Okay' }]);
    } else {
      this.sendNotification(this.props.route?.params?.item);
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
        bankName: this.state.selectedBank?.bankName,
        urn: this.state.selectedPayor?.urn,
        uniqueName: this.state.selectedBank?.uniqueName,
        totalAmount: (((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')).trim(),
        bankPaymentTransactions: [{ amount: Number(((this.state.totalAmount)).replace(/₹/g, '').replace(/,/g, '')), remarks: this.state.review, vendorUniqueName: this.props.route?.params?.item?.uniqueName }]
      }
      console.log("Send OTP request " + JSON.stringify(payload))
      const response = await PaymentServices.sendOTP(payload)
      console.log("OTP response" + JSON.stringify(response))
      if (response.status == "success") {
        if (Platform.OS == "ios") {
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
          this.setState({ OTPMessage: response.body.message, payButtonPressed: true, requestIdOTP: response.body.requestId, disableResendButton: false })
        } else {
          ToastAndroid.show(response.body.message, ToastAndroid.LONG)
          this.setState({ OTPMessage: response.body.message, payButtonPressed: true, requestIdOTP: response.body.requestId, disableResendButton: false })
          await this.getSMSMessage()
        }
      } else {
        this.setState({ disableResendButton: false })
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
      this.setState({ disableResendButton: false })
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
    const response = await PaymentServices.confirmPayment(payload, this.state.selectedPayor.urn, this.state.selectedBank?.uniqueName)
    if (response.status == "success") {
      await this.setState({ paymentProcessing: false })
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

  bankBottomSheet() {
    const ListEmptyComponent = () => {
      return (
        <View style={{ height: height * 0.3, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={style.regularText}>
            No Bank Exist
          </Text>
        </View>
      )
    }
    const renderItem = ({ item }: { item: object }) => {
      return (
        <TouchableOpacity
          style={[style.button, { paddingVertical: 10 }]}
          onPress={() => {
            this.setState({ selectedBank: item })
            this.setBottomSheetVisible(this.bankBottomSheetRef, false);
          }}
        >
          <Icon name={this.state.selectedBank?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={'#864DD3'} size={16} />
          <View>
            <Text style={style.buttonText}>
              {item?.bankName}
            </Text>
            <Text style={style.buttonSmallText}>
              {`A/c No: ${item?.accountNo}`}
            </Text>
            <Text style={style.buttonSmallText}>
              {`Clo Bal: ${item?.effectiveBal} dr.`}
            </Text>
          </View>
        </TouchableOpacity>
      )
    }
    return (
      <BottomSheet
        bottomSheetRef={this.bankBottomSheetRef}
        headerText='Select Bank'
        headerTextColor='#864DD3'
        flatListProps={{
          data: this.state.bankAccounts,
          renderItem: renderItem,
          ListEmptyComponent: <ListEmptyComponent />
        }}
      />
    )
  }

  payorBottomSheet() {
    const ListEmptyComponent = () => {
      return (
        <View style={{ height: height * 0.3, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={style.regularText}>
            No Payor Exist
          </Text>
        </View>
      )
    }
    const renderItem = ({ item }: { item: object }) => {
      return (
        <TouchableOpacity
          style={style.button}
          onPress={() => {
            this.setState({ selectedPayor: item })
            this.setBottomSheetVisible(this.payorBottomSheetRef, false);
          }}
        >
          <Icon name={this.state.selectedPayor?.user?.name == item?.user?.name ? 'radio-checked2' : 'radio-unchecked'} color={'#864DD3'} size={16} />
          <Text style={style.buttonText}
          >
            {item?.user?.name}
          </Text>
        </TouchableOpacity>
      )
    }
    return (
      <BottomSheet
        bottomSheetRef={this.payorBottomSheetRef}
        headerText='Select Payor'
        headerTextColor='#864DD3'
        flatListProps={{
          data: this.state.selectPayorData,
          renderItem: renderItem,
          ListEmptyComponent: <ListEmptyComponent />
        }}
      />
    )
  }

  onPressDelete = (accountUniqueName: string, entryUniqueName: string) => {

    this.setState({
      selectedItems: [{ accountUniqueName, entryUniqueName }]
    });

    this.setBottomSheetVisible(this.confirmationBottomSheetRef, true);
  }

  async handleDelete () {
    this.setBottomSheetVisible(this.confirmationBottomSheetRef, false);

    const accountUniqueName = this.state.selectedItems[0]?.accountUniqueName;
    const entryUniqueName = this.state.selectedItems[0]?.entryUniqueName;
    
    try {
      const response = await CommonService.deleteEntry(accountUniqueName, entryUniqueName, this.props.companyVoucherVersion)
      if (response?.status === 'success') {
        this.setState((prevState) => ({ 
          selectedItems: [],
          transactionsData : prevState.transactionsData?.filter(item => item?.uniqueName !== entryUniqueName)
        }))
      }
    } catch (error: any) {
      Toast({ message: error?.data?.message });
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
              paddingLeft: 20,
              paddingRight: 10,
              justifyContent: "space-between"
            }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              maxWidth: '65%',
            }} >
              <TouchableOpacity
                hitSlop={{ right: 20, left: 20, top: 10, bottom: 10 }}
                onPress={() => this.props.navigation.goBack()}
              >
                <Icon name={'Backward-arrow'} color="#fff" size={18} />
              </TouchableOpacity>
              <Text
                onPress={() => {
                  if (Platform.OS == "ios") {
                    TOAST.show(this.props.route?.params?.item?.name + '', {
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
                    ToastAndroid.show(this.props.route?.params?.item?.name + '', ToastAndroid.LONG);
                  }
                }} numberOfLines={2} style={{ fontFamily: 'OpenSans-Bold', fontSize: 16, marginLeft: 20, color: '#FFFFFF' }}>
                {this.props.route?.params?.item?.name}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={async () => {
                  await this.props.navigation.navigate("AddEntryStack", {
                    screen: "AddEntryScreen",
                    params: {
                      item: this.props.route.params?.item,
                    }
                  })
                  await DeviceEventEmitter.emit(APP_EVENTS.RefreshAddEntryPage, {})
                }}
                style={{ paddingHorizontal: 8 }}
              >
                <AntDesign
                  name="plus"
                  size={20}
                  color={'#FFFFFF'}
                />
              </TouchableOpacity>
              {this.state.transactionsData.length == 0 ? null : (
                <TouchableOpacity delayPressIn={0} style={{ paddingHorizontal: 8 }} onPress={() => this.setBottomSheetVisible(this.pdfBottomSheetRef, true)}>
                  <AntDesign name="pdffile1" size={20} color={'#FFFFFF'} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={{ paddingHorizontal: 8 }} onPress={() => this.setBottomSheetVisible(this.reminderBottomSheetRef, true)}>
                <MaterialCommunityIcons name="bell-ring" size={20} color={"#FFFFFF"} />
              </TouchableOpacity>
              {this.props.route?.params?.item?.mobileNo ? (
                <TouchableOpacity
                  delayPressIn={0}
                  style={{ paddingHorizontal: 8 }}
                  onPress={() => this.setBottomSheetVisible(this.moreBottomSheetRef, true)}>
                  <Entypo name="dots-three-vertical" size={20} color={'#FFFFFF'} />
                </TouchableOpacity>
              ) : null}
            </View>
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
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Cr Total :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 16, marginLeft: 5 }}>
                  {this.state.countryCode == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.state.co)}
                  {formatAmount(this.state.creditTotal)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Dr Total :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 16, marginLeft: 8 }}>
                  {this.state.countryCode == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.state.countryCode)}
                  {formatAmount(this.state.debitTotal)}
                </Text>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Cl Bal :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 16, marginLeft: 5 }}>
                  {this.state.countryCode == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.state.countryCode)}
                  {formatAmount(this.state.closingBalance?.amount)}
                  <Text style={{ fontSize: 10 }} >
                    {this.state.closingBalance?.type == 'DEBIT' ? 'Dr' : 'Cr'}
                  </Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', color: '#616161' }}>Op Bal :</Text>
                <Text style={{ fontFamily: 'AvenirLTStd-Book', fontSize: 16, marginLeft: 8 }}>
                  {this.state.countryCode == 'IN'
                    ? '₹'
                    : getSymbolFromCurrency(this.state.countryCode)}
                  {formatAmount(this.state.openingBalance?.amount)}
                  <Text style={{ fontSize: 10 }}>
                    {this.state.openingBalance?.type == 'DEBIT' ? 'Dr' : 'Cr'}
                  </Text>
                </Text>
              </View>
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
                width: Dimensions.get('window').width * 0.5,
                borderRadius: 20,
                borderWidth: 1,
                justifyContent: 'center',
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
              {/* <View style={{ marginLeft: 10 }} /> */}
              <MaterialCommunityIcons name="calendar-month" size={22} color={'#808080'} />
              <Text style={{ fontFamily: 'AvenirLTStd-Book', marginLeft: 5 }}>
                {moment(this.state.startDate, 'DD-MM-YYYY').format('DD MMM YY') +
                  ' - ' +
                  moment(this.state.endDate, 'DD-MM-YYYY').format('DD MMM YY')}
              </Text>
            </TouchableWithoutFeedback>
            <View style={{ flexDirection: 'row', width: '20%', justifyContent: 'space-between' }}>
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
              onPress={() => {
                this.setBottomSheetVisible(this.voucherBottomSheetRef, true);
              }}
            >
              <Foundation name="filter" size={22} color={'#808080'} />
            </TouchableOpacity>
          </View> :
            <ScrollView style={{ paddingHorizontal: 20, }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: this.state.payButtonPressed ? '#F1F1F2' : null,
                }}
              >
                <FontAwesome name={'bank'} size={20} color="#864DD3" />
                <TouchableOpacity
                  disabled={this.state.payButtonPressed}
                  style={{ flexDirection: "row", flex: 1, minHeight: 50, justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={() => {
                    this.setBottomSheetVisible(this.bankBottomSheetRef, true)
                  }}
                >
                  <Text style={{ color: this.state.selectedBank == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book', marginLeft: 10 }}>
                    {this.state.selectedBank == null ? 'Select Bank' : this.state.selectedBank.bankName}
                    <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.selectedBank == null ? '*' : ''}</Text>
                  </Text>
                  <Icon name={'9'} size={12} color="#808080" style={{ padding: 5, marginLeft: 20 }} />
                </TouchableOpacity>
              </View>
              <View style={{
                flexDirection: 'row',
                backgroundColor: this.state.payButtonPressed ? '#F1F1F2' : null,
                minHeight: 50,
              }}>
                <MaterialCommunityIcons name="account" size={24} color="#864DD3" style={{ alignSelf: 'center' }} />
                <TouchableOpacity
                  disabled={this.state.payButtonPressed}
                  style={{ flex: 1 }}
                  onPress={() => this.setBottomSheetVisible(this.payorBottomSheetRef, true)}
                >
                  <View style={{ flexDirection: "row", flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: this.state.selectedPayor == null ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book', marginLeft: 10 }}>
                      {this.state.selectedPayor == null ? 'Select Payor' : this.state.selectedPayor.user.name}
                      <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.selectedPayor == null ? '*' : ''}</Text>
                    </Text>
                    <Icon
                      style={{ padding: 5, marginLeft: 20 }}
                      name={'9'}
                      size={12}
                      color="#808080"
                    />
                  </View>
                  <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book', fontSize: 10, position: 'absolute', bottom: -5, marginLeft: 10 }}>{this.state?.payorErrorMessage}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", alignItems: 'center', backgroundColor: this.state.payButtonPressed ? '#F1F1F2' : null, minHeight: 50 }}>
                <View style={{ backgroundColor: '#864DD3', width: 25, height: 25, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 3 }}>
                  <FontAwesome name={'dollar'} color="white" size={16} />
                </View>
                <TextInput
                  onBlur={async () => {
                    if (this.state.totalAmount == '') {
                      await this.setState({ totalAmountPlaceHolder: '' })
                    } else {
                      let amount = await (formatAmount(Number((this.state.totalAmount).replace(/[^0-9.]/g, '').replace(/,/g, ''))))
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
                  editable={!this.state.payButtonPressed}
                  onFocus={() => {
                    this.setState({ totalAmountPlaceHolder: 'a' })
                  }}
                  onChangeText={(text) => {
                    console.log(text)
                    this.setState({ totalAmount: (text).replace(/[^0-9.₹]/g, '') })
                  }}
                  style={{ fontSize: 15, textAlignVertical: "center", marginHorizontal: 10, padding: 0, minHeight: 50, flex: 1 }}>
                  <Text style={{ color: '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.totalAmountPlaceHolder != '' ? ((this.state.totalAmount.length > 1 || this.state.totalAmount == this.state?.currencySymbol) && this.state?.currencySymbol != "" ? (this.state?.currencySymbol).substring(1)
                    : (this.state.currencySymbol)) : ''}</Text>
                  <Text style={{ color: this.state.totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.totalAmountPlaceHolder == '' &&
                    'Total Amount'}</Text>
                  <Text style={{ color: this.state.totalAmountPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.totalAmountPlaceHolder != '' &&
                    (this.state.totalAmount)}</Text>
                  <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.totalAmountPlaceHolder == '' ? '*' : ''}</Text>
                </TextInput>
              </View>
              <View style={{ flexDirection: "row", marginLeft: 0, minHeight: 50, backgroundColor: this.state.payButtonPressed ? '#F1F1F2' : undefined }}>
                <View
                  style={{
                    height: 50,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MaterialCommunityIcons name={'file-document'} color='#864DD3' size={27} />
                </View>
                <TextInput
                  multiline={true}
                  editable={!this.state.payButtonPressed}
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
                    this.setState({ review: text })
                  }
                  }
                  style={{ fontSize: 15, marginHorizontal: 10, padding: 0, flex: 1, alignSelf: 'center' }}>
                  <Text style={{ color: this.state.reviewPlaceHolder == '' ? 'rgba(80,80,80,0.5)' : '#1c1c1c', fontFamily: 'AvenirLTStd-Book' }}>{this.state.reviewPlaceHolder == '' ? 'Comments' : this.state.review}</Text>
                  <Text style={{ color: '#E04646', fontFamily: 'AvenirLTStd-Book' }}>{this.state.reviewPlaceHolder == '' ? '*' : ''}</Text>
                </TextInput>
              </View>
              {this.state.payButtonPressed ?
                <View style={{
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  flex: 1,
                  marginBottom: 30
                }}>
                  <Text style={{ fontSize: 18, color: 'black', marginTop: 40, fontFamily: 'AvenirLTStd-Book' }} >Enter OTP</Text>
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
                  <Text style={{ fontSize: 16, color: '#808080', fontFamily: 'AvenirLTStd-Book', alignSelf: "center", width: '85%' }} >{this.state.OTPMessage}</Text>
                  <TouchableOpacity disabled={this.state.disableResendButton} onPress={() => this.resendOTP()}>
                    <Text style={{ fontSize: 16, color: this.state.disableResendButton ? colors.PRIMARY_DISABLED : '#5773FF', marginTop: 10, marginBottom: 20, fontFamily: 'AvenirLTStd-Book' }} >Resend</Text>
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
                        transactionType={item?.particular?.uniqueName == this.props.route?.params?.item?.uniqueName ? 'partyTransaction' : 'normalTransaction'}
                        phoneNo={this.props.route?.params?.item?.mobileNo}
                        onPressDelete={this.onPressDelete}
                        navigation = {this.props.navigation}
                      />
                    )}
                    keyExtractor={(item) => item.uniqueName}
                    onEndReachedThreshold={0.2}
                    onEndReached={() => this.handleRefresh()}
                    ListFooterComponent={this._renderFooter}
                    ItemSeparatorComponent={() => <View style={style?.divider}/>}
                  />
                )}
              </>
            ) : null}

          <DownloadModal modalVisible={this.state.DownloadModal} />
          <ShareModal modalVisible={this.state.ShareModal} />
          <PDFModal
            bottomSheetRef={this.pdfBottomSheetRef}
            setBottomSheetVisible={this.setBottomSheetVisible}
            onExport={this.permissonDownload}
            onShare={this.permissonShare}
            onWhatsAppShare={this.permissonWhatsapp}
            downloadModal={this.downloadModalVisible}
            shareModal={this.shareModalVisible}
            phoneNo={this.props.route?.params?.item?.mobileNo}
          />
          <VoucherModal
            bottomSheetRef={this.voucherBottomSheetRef}
            setBottomSheetVisible={this.setBottomSheetVisible}
            filter={this.filter}
            loader={this.transactionsLoader}
          />
          <MoreModal
            bottomSheetRef={this.moreBottomSheetRef}
            setBottomSheetVisible={this.setBottomSheetVisible}
            onWhatsApp={this.onWhatsApp}
            onCall={this.onCall}
          />
          <ConfirmationBottomSheet
            bottomSheetRef={this.confirmationBottomSheetRef}
            message={ConfirmationMessages.DELETE_ENTRY.message}
            description={ConfirmationMessages.DELETE_ENTRY.description}
            onConfirm={() => this.handleDelete()}
            onReject={() => this.setBottomSheetVisible(this.confirmationBottomSheetRef, false)}
          />
          {this.bankBottomSheet()}
          {this.payorBottomSheet()}
          <BottomSheet
            bottomSheetRef={this.reminderBottomSheetRef}
            headerText='Set Reminder'
            headerTextColor='#864DD3'
          >
            <View style={{ padding: 20 }}>
              <Text style={{ fontFamily: 'AvenirLTStd-Book' }}>Date</Text>
              <TouchableOpacity
                onPress={() => this.setState({ datePicker: true })}
                style={{ borderBottomColor: "#808080", borderBottomWidth: 0.55 }}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                  <Text style={{ color: '#808080', paddingVertical: 10, fontFamily: 'AvenirLTStd-Book' }}>{format(this.state.dateTime, "dd/MM/yyyy")}</Text>
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 20, fontFamily: 'AvenirLTStd-Book' }}>Time</Text>
              <TouchableOpacity
                onPress={() => this.setState({ timePicker: true })}
                style={{ borderBottomColor: "#808080", borderBottomWidth: 0.55 }}>
                <View style={{ flexDirection: "row", alignItems: 'center' }}>
                  <Text style={{ color: '#808080', paddingVertical: 10, fontFamily: 'AvenirLTStd-Book' }}>{format(this.state.dateTime, "HH:mm")}</Text>
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
                  <Text style={{ color: 'white', fontFamily: 'AvenirLTStd-Book' }}>Done</Text>
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
          </BottomSheet>
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
            !!!this.props.route?.params?.item?.bankPaymentDetails && (this.props.route?.params?.item?.accountBankDetails?.length == 0 || this.props.route?.params?.item?.accountBankDetails == null) ?
              <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity onPress={async () => {
                  await this.props.navigation.navigate("CustomerVendorScreens", { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: this.props.route?.params?.item?.uniqueName } }),
                    await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                  <Text style={{ fontSize: 20, color: "black", fontFamily: 'AvenirLTStd-Book' }}>Add Bank Details</Text>
                </TouchableOpacity>
              </View> :
              this.props.route.params.type == 'Vendors' && this.state.countryCode == "IN" &&
              (this.state.payButtonPressed == false ?
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => {
                    this.PayButtonPressed()
                  }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.payNowButtonPressed ? '#5773FF' : '#F5F5F5', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: this.state.payNowButtonPressed ? "white" : "black", fontFamily: 'AvenirLTStd-Book' }}>{this.state.payNowButtonPressed ? "Pay" : "Pay Now"}</Text>
                  </TouchableOpacity>
                </View> :
                <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
                  <TouchableOpacity disabled={this.state.paymentProcessing} onPress={async () => { this.confirmPayment() }}
                    style={{ justifyContent: "center", alignItems: "center", backgroundColor: this.state.paymentProcessing ? '#ACBAFF' : '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
                    <Text style={{ fontSize: 20, color: "white", fontFamily: 'AvenirLTStd-Book' }}>{"Confirm"}</Text>
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
    companyVoucherVersion: state.commonReducer.companyVoucherVersion
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
  const navigation = useNavigation();
  return <PartiesTransactionScreen {...props} isFocused={isFocused} navigation={navigation}/>;
}
export default connect(mapStateToProps, mapDispatchToProps)(Screen);
