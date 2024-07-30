import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Keyboard,
  ActivityIndicator,
  DeviceEventEmitter,
  Animated,
  NativeModules,
  Platform,
  Dimensions,
  StatusBar,
  ToastAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import style from './addEntryStyles';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Dialog from 'react-native-dialog';
import Award from '../../assets/images/icons/customer_success.svg';
import Icon from '@/core/components/custom-icon/custom-icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Bars } from 'react-native-loader';
import DocumentPicker from 'react-native-document-picker';
import color from '@/utils/colors';
import _, { find, result } from 'lodash';
import { APP_EVENTS, FONT_FAMILY, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useIsFocused } from '@react-navigation/native';
import CheckBox from 'react-native-check-box';
import BottomSheet from '@/components/BottomSheet';
import { AccountsService } from '@/core/services/accounts/accounts.service';
import { CommonService } from '@/core/services/common/common.service';
import { localeData, voucherTypes, KEYBOARD_EVENTS, getAbbreviation } from './constants';
import TOAST from 'react-native-root-toast';
import {  formatAmount, giddhRoundOff } from '@/utils/helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getInvoiceListRequest } from './accountHelper';
const { SafeAreaOffsetHelper } = NativeModules;
const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export class AddEntry extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.assignTagRef = React.createRef();
    this.voucherTypesRef = React.createRef();
    this.invoicesRef = React.createRef();
    this.discountRef = React.createRef();
    this.taxModalRef = React.createRef();
    this.variantRef = React.createRef();
    this.warehouseRef = React.createRef();
    this.reverseChargeConfirmation = React.createRef();
    this.stockUnitRef = React.createRef();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.state = {
      selectedAccountData: {},
      ledgerUnderstandingObject: {},
      currentEntryType: 'Dr',
      searchResults: [],
      searchAccountName: '',
      showMoreDetails: false,
      particularAccountStockData: {},
      totalSearchPages: 0,
      searchPage: 1,
      amountForEntry: 0,
      taxInclusiveAmount: 0,
      exchangeRate: 1,
      totalAmount: 0,
      isAmountFieldInFocus: false,
      currencySymbol: '',
      description: '',
      chequeNumber: '',
      chequeClearanceDate: '',
      showClearanceDatePicker: false,
      isClearanceDateSelelected: false,
      selectedButton: false,
      allTags: [],
      selectedTags: [],
      generateVoucher: true,
      loading: false,
      searchTop: height * 0.15,
      searchError: '',
      allDiscounts: [],
      selectedDiscounts: [],
      selectedVoucherType: '',
      invoiceNumberAgainstVoucher: '',
      referenceInvoices: [],
      adjustmentInvoices: [],
      finalAdjustedInvoices: [],
      navigatingAgain: false,
      selectedReferenceInvoice: {},
      date: moment(),
      adjustedAmountOfLinkedInvoices: null,
      discountPercent: 0,
      discountAmount: 0,
      discountTotalValue: 0,
      SelectedTaxData: {
        taxType: '',
        taxText: '',
        taxDetailsArray: [],
      },
      taxArray: [],
      totalTaxAmount: 0,
      selectedTaxUniqueNameList: [],
      selectedArrayType: [],
      showDiscountAndTaxPopup: false,
      shouldShowRCMSection: false, //for showing the reverse checkbox
      shouldShowTouristSchemeSection: false,
      allowParentGroup: ['sales', 'cash', 'sundrydebtors', 'bankaccounts'],  //for tourist parent cases.
      entryDate: moment(),
      reverseCharge: false,
      touristScheme: false,
      passPortNumber: '',
      stockLists: [],
      selectedStockVariant: {},
      warehouseList: [],
      selectedWarehouse: {},
      stockQuantity: 0,
      stockPrice: 0,
      selectedStockUnit: {},
      selectedStock: {},
      oppositeAccountUniqueName: '',
      bottomOffset: 0,
      isSearchingAccount: false,
      showDatePicker: false,
      companyVersionNumber: 1,
      partyName: undefined,
      currency: '',
      uploadedAttachment: {},
      successDialog: false,
      invoicePageCount: 1,
      totalInvoicePageCount: 1
    };
    this.keyboardMargin = new Animated.Value(0);
  }



  // ************************ BELOW ARE FUNCTIONS ************************



  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#0E7942" barStyle={Platform.OS == 'ios' ? "dark-content" : "light-content"} /> : null;
  };
  componentDidMount() {
    this.keyboardWillShowSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_SHOW, this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener(KEYBOARD_EVENTS.IOS_ONLY.KEYBOARD_WILL_HIDE, this.keyboardWillHide);
    // this.getSelectedAccountData(this.props?.route?.params?.item?.uniqueName)
    // this.searchCalls();
    // this.setActiveCompanyCountry();
    // this.getAllTaxes();
    // this.getWarehouse();
    // this.getCompanyVersionNumber();  //adding these commented lines in clearAll function as they were called mulptiple times.
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.RefreshAddEntryPage, async () => {
      this.clearAll();
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry();
      this.getCompanyVersionNumber();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const { bottomOffset } = offset;
        this.setState({ bottomOffset });
      });
    }
  }
  componentWillMount(): void {

  }
  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
    this.clearAll();
  }
  resetState = () => {
    this.setState({
      selectedAccountData: {},
      ledgerUnderstandingObject: {},
      currentEntryType: 'Dr',
      searchResults: [],
      searchAccountName: '',
      showMoreDetails: false,
      particularAccountStockData: {},
      totalSearchPages: 0,
      searchPage: 1,
      amountForEntry: 0,
      taxInclusiveAmount: 0,
      exchangeRate: 1,
      totalAmount: 0,
      isAmountFieldInFocus: false,
      currencySymbol: '',
      description: '',
      chequeNumber: '',
      chequeClearanceDate: '',
      showClearanceDatePicker: false,
      isClearanceDateSelelected: false,
      selectedButton: false,
      allTags: [],
      selectedTags: [],
      generateVoucher: true,
      loading: false,
      searchTop: height * 0.15,
      searchError: '',
      allDiscounts: [],
      selectedDiscounts: [],
      selectedVoucherType: '',
      invoiceNumberAgainstVoucher: '',
      referenceInvoices: [],
      adjustmentInvoices: [],
      finalAdjustedInvoices: [],
      navigatingAgain: false,
      selectedReferenceInvoice: {},
      date: moment(),
      adjustedAmountOfLinkedInvoices: null,
      discountPercent: 0,
      discountAmount: 0,
      discountTotalValue: 0,
      SelectedTaxData: {
        taxType: '',
        taxText: '',
        taxDetailsArray: [],
      },
      taxArray: [],
      totalTaxAmount: 0,
      selectedTaxUniqueNameList: [],
      selectedArrayType: [],
      showDiscountAndTaxPopup: false,
      shouldShowRCMSection: false, //for showing the reverse checkbox
      shouldShowTouristSchemeSection: false,
      allowParentGroup: ['sales', 'cash', 'sundrydebtors', 'bankaccounts'],  //for tourist parent cases.
      entryDate: moment(),
      reverseCharge: false,
      touristScheme: false,
      passPortNumber: '',
      stockLists: [],
      selectedStockVariant: {},
      warehouseList: [],
      selectedWarehouse: {},
      stockQuantity: 0,
      stockPrice: 0,
      selectedStockUnit: {},
      selectedStock: {},
      oppositeAccountUniqueName: '',
      bottomOffset: 0,
      isSearchingAccount: false,
      showDatePicker: false,
      companyVersionNumber: 1,
      partyName: undefined,
      currency: '',
      uploadedAttachment: {},
      successDialog: false,
      invoicePageCount: 1,
      totalInvoicePageCount: 1
    });
  };
  componentDidUpdate(prevProps, prevState) {
    //updating the discounts
    if (prevState.amountForEntry !== this.state.amountForEntry) {
      this.calculatedTaxAmounstForEntry();
    }
    if ((prevState.discountTotalValue !== this.state.discountTotalValue) || (prevState.selectedDiscounts !== this.state.selectedDiscounts)) {
      this.calculatedTaxAmounstForEntry();
    }

    //below are conditions for stck related
    if (!this.state?.particularAccountStockData?.stock) {
      return;
    }
    // const { stockPrice, stockQuantity } = this.state;
    // let amountForEntry = (this.state?.amountForEntry);
    // console.log('amountForEntry00', amountForEntry)
    // if (amountForEntry != prevState?.amountForEntry) {
    //   const price = amountForEntry !== 0 ? amountForEntry / stockQuantity : stockPrice;
    //   this.setState({
    //     stockPrice: price
    //   })
    // } else if (stockPrice != prevState?.stockPrice) {
    //   const amount = stockQuantity !== 0 ? stockQuantity * stockPrice : amountForEntry;
    //   let convertedAmount = (amount / this.state?.exchangeRate).toFixed(3);
    //   console.log('convertedAmount1', convertedAmount)
    //   this.setState({
    //     amountForEntry: convertedAmount
    //   })
    // } else if (stockQuantity != prevState?.stockQuantity) {
    //   const amount = stockQuantity !== 0 ? stockQuantity * stockPrice : amountForEntry;
    //   let convertedAmount = (amount / this.state?.exchangeRate).toFixed(3);
    //   console.log('convertedAmount2', convertedAmount)
    //   this.setState({
    //     amountForEntry: convertedAmount
    //   })
    // }
  }
// Functions to handle the price/amount/quantity change
  async updateStockPrice() {
    const { stockPrice, stockQuantity ,amountForEntry} = this.state;
    const price = amountForEntry !== 0 ? amountForEntry / stockQuantity : stockPrice;
    const formattedPrice = await giddhRoundOff(price);
    this.setState({
      stockPrice: formattedPrice
    })
  }
  async updateAmountStk() {
    const { stockPrice, stockQuantity, amountForEntry } = this.state;
    const amount = stockQuantity !== 0 ? stockQuantity * stockPrice : amountForEntry;
    const formattedAmount = await giddhRoundOff(amount);
    this.setState({
      amountForEntry: formattedAmount
    })
  }
  updateAmountQty() {
    const { stockPrice, stockQuantity, amountForEntry } = this.state;
    const amount = stockQuantity !== 0 ? stockQuantity * stockPrice : amountForEntry;
    this.setState({
      amountForEntry: amount
    })
  }


  clearAll = async () => {
    this.resetState();
    await this.getSelectedAccountData(this.props?.route?.params?.item?.uniqueName);
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getCompanyVersionNumber();
    this.getAllTaxes();
    this.getWarehouse();
  };
  setBottomSheetVisible = (refName: React.Ref<BottomSheet>, visible: boolean) => {
    if (visible) {
      Keyboard.dismiss();
      refName?.current?.open();
    } else {
      refName?.current?.close();
    }
  };
  async getTdsTcsTaxes() {
    const taxes = this.state.taxArray.filter((item) => {
      return item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tdsrc' || item.taxType == 'tcsrc';
    });
    this.setState({ tdsTcsTaxArray: taxes });
    this.setState({ tdsOrTcsArray: taxes });
  }
  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber)
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      if (companyVersionNumber == 2) {
        this.setState({
          allowParentGroup: [...this.state?.allowParentGroup, 'loanandoverdraft']
        })
      }
      this.setState({ companyVersionNumber })
    }
  }
  calculateDiscountAmount = async (value) => {
    const percentAmount = (this.state?.amountForEntry * value) / 100;
    this.setState({
      discountTotalValue: percentAmount,
    })
  }
  setSelectedButton = (buttonSelect) => {
    this.setState({ selectedButton: buttonSelect });
  };
  checkShowDiscountAndTaxField(selectedItem) {
    let activeAccount = this.state?.selectedAccountData;
    let showDiscountAndTaxPopup: boolean = false;
    if (activeAccount && (activeAccount.category === 'income' || activeAccount.category === 'expenses' || activeAccount.category === 'assets')) {
      if (activeAccount.category === 'assets') {
        showDiscountAndTaxPopup = activeAccount.parentGroups[0]?.uniqueName.includes('fixedassets');
      } else {
        showDiscountAndTaxPopup = true;
      }
    }
    if (showDiscountAndTaxPopup) {
      this.setState({
        showDiscountAndTaxPopup: true
      })
      return;
    }
    const uniqueNames = selectedItem?.parentGroups?.map(item => item.uniqueName);
    const uNameStr = uniqueNames.join(',');

    if (selectedItem) {
      const category = selectedItem?.category ? selectedItem?.category : "";
      if (category === 'income' || category === 'expenses' || category === 'assets') {
        if (category === 'assets') {
          showDiscountAndTaxPopup = uNameStr.includes('fixedassets');
        } else {
          showDiscountAndTaxPopup = true;
        }
      }
    }
    this.setState({
      showDiscountAndTaxPopup: showDiscountAndTaxPopup
    })
    return;
  }
  shouldShowRcmSection(particularAccountStockData: any) {
    try {
      let activeCompany = this.state?.companyCountryDetails;
      let formattedCurrentLedgerAccountParentGroups = [];
      if (particularAccountStockData && !particularAccountStockData?.parentGroups[0]?.uniqueName) {
        formattedCurrentLedgerAccountParentGroups = particularAccountStockData?.parentGroups?.map(parent => ({ uniqueName: parent }));
      }

      const currentLedgerAccountDetails = {
        uniqueName: this.state?.selectedAccountData ? this.state?.selectedAccountData?.uniqueName : '',
        parentGroups: this.state?.selectedAccountData && this.state?.selectedAccountData.parentGroups ? this.state?.selectedAccountData?.parentGroups : []
      };
      const selectedAccountDetails = {
        uniqueName: particularAccountStockData ? particularAccountStockData?.uniqueName : '',
        parentGroups: formattedCurrentLedgerAccountParentGroups?.length ? formattedCurrentLedgerAccountParentGroups : particularAccountStockData ? particularAccountStockData?.parentGroups : []
      };


      if (currentLedgerAccountDetails && selectedAccountDetails) {
        if (![currentLedgerAccountDetails?.uniqueName, selectedAccountDetails?.uniqueName].includes('roundoff')) {
          // List of allowed first level parent groups
          const allowedFirstLevelUniqueNames = (this.state?.companyVersionNumber === 2 && (activeCompany?.countryName === "India" || activeCompany?.countryName === 'United Kingdom')) ? ['operatingcost', 'indirectexpenses', 'fixedassets', 'revenuefromoperations', 'otherincome'] : ['operatingcost', 'indirectexpenses', 'fixedassets'];
          // List of not allowed second level parent groups
          const disallowedSecondLevelUniqueNames = (this.state?.companyVersionNumber === 2 && (activeCompany?.countryName === "India" || activeCompany?.countryName === 'United Kingdom')) ? ['discount', 'exchangeloss', 'roundoff', 'exchangegain', 'dividendincome', 'interestincome', 'dividendexpense', 'interestexpense'] : ['discount', 'exchangeloss'];
          const currentLedgerFirstParent = (currentLedgerAccountDetails.parentGroups && currentLedgerAccountDetails.parentGroups[0]) ? currentLedgerAccountDetails.parentGroups[0]?.uniqueName : '';
          const currentLedgerSecondParent = (currentLedgerAccountDetails.parentGroups && currentLedgerAccountDetails.parentGroups[1]) ? currentLedgerAccountDetails.parentGroups[1]?.uniqueName : '';
          const selectedAccountFirstParent = (selectedAccountDetails.parentGroups && selectedAccountDetails.parentGroups[0]) ? selectedAccountDetails.parentGroups[0]?.uniqueName : '';
          const selectedAccountSecondParent = (selectedAccountDetails.parentGroups && selectedAccountDetails.parentGroups[1]) ? selectedAccountDetails.parentGroups[1]?.uniqueName : '';


          // Both accounts (current ledger and selected account) in order to satisfy RCM MUST have first
          // level parent group unique name in allowed unique names and MUST NOT have their second level parent
          // in disallowed unique names
          let result = (allowedFirstLevelUniqueNames.some((firstLevelUniqueName: string) => [currentLedgerFirstParent, selectedAccountFirstParent].includes(firstLevelUniqueName)) && !disallowedSecondLevelUniqueNames.some((secondLevelUniqueName: string) => [currentLedgerSecondParent, selectedAccountSecondParent].includes(secondLevelUniqueName)));
          this.setState({
            shouldShowRCMSection: result
          });
          return;
        }
      }
      this.setState({
        shouldShowRCMSection: false
      })
      return;
    } catch (e) {
      console.log('Error---', e)
    }
  }
  shouldShowTouristScheme(particularAccountStockData: any) {
    //function to check if tourist scheme checkbox should be shown or not
    try {
      let formattedCurrentLedgerAccountParentGroups = [];
      if (particularAccountStockData && !particularAccountStockData?.parentGroups[0]?.uniqueName) {
        formattedCurrentLedgerAccountParentGroups = particularAccountStockData?.parentGroups?.map(parent => ({ uniqueName: parent }));
      }

      const currentLedgerAccountDetails = {
        parentGroups: this.state?.selectedAccountData && this.state?.selectedAccountData.parentGroups ? this.state?.selectedAccountData?.parentGroups : []
      };
      const selectedAccountDetails = {
        parentGroups: formattedCurrentLedgerAccountParentGroups?.length ? formattedCurrentLedgerAccountParentGroups : particularAccountStockData ? particularAccountStockData?.parentGroups : []
      };
      const currentLedgerSecondParent: any = currentLedgerAccountDetails.parentGroups[1]?.uniqueName ?? currentLedgerAccountDetails.parentGroups[1];
      const selectedAccountSecondParent: any = selectedAccountDetails?.parentGroups[1]?.uniqueName ?? selectedAccountDetails?.parentGroups[1];
      if (this.state?.companyCountryDetails?.alpha2CountryCode === 'AE' && currentLedgerSecondParent && selectedAccountSecondParent && (this.state?.allowParentGroup.includes(currentLedgerSecondParent)) && (this.state?.allowParentGroup.includes(selectedAccountSecondParent))) {
        this.setState({
          shouldShowTouristSchemeSection: true
        })
      } else {
        this.setState({
          shouldShowTouristSchemeSection: false
        })
      }
    } catch (e) {
      console.log('Error in tourist check function', e)
    }
  }
  calculatedTaxAmounstForEntry() {
    const uniquenameArray = this.state?.SelectedTaxData?.taxDetailsArray?.map((item) => item?.uniqueName);

    if (this.state?.selectedVoucherType == 'Advance Receipt') {
      ///only checkning if it is Advance receipt
      let amountForIncTax = Number(this.state?.amountForEntry);
      let taxess = this.state?.SelectedTaxData?.taxDetailsArray;
      if (!Array.isArray(taxess)) {
        throw new Error('Taxes must be an array.');
      }
      let totalTaxs = 0;
      taxess.forEach(tax => {
        if (tax.taxDetail && Array.isArray(tax.taxDetail) && tax.taxDetail.length > 0) {
          const latestTaxValue = tax.taxDetail[0].taxValue;
          totalTaxs += latestTaxValue;
        }
      });
      // Round the total tax to two decimal places
      const rateDecimal = totalTaxs / 100;
      // Calculate tax amount
      const taxAmount = (amountForIncTax / (1 + rateDecimal)) * rateDecimal;
      this.setState({
        taxInclusiveAmount: (amountForIncTax - taxAmount).toFixed(2),
        totalTaxAmount: taxAmount.toFixed(2),
        selectedTaxUniqueNameList: uniquenameArray
      })

    } else {
      let totalTax = 0;
      let amount = this.state?.amountForEntry - Number(this.calculateTotalDiscount());
      let taxes = this.state?.SelectedTaxData?.taxDetailsArray;
      taxes.forEach(tax => {
        if (tax.taxDetail && Array.isArray(tax.taxDetail) && tax.taxDetail.length > 0) {
          const latestTaxValue = tax.taxDetail[0].taxValue;
          const taxAmount = (amount * latestTaxValue) / 100;
          totalTax += taxAmount;
        }

      });
      this.setState({
        totalTaxAmount: totalTax,
        selectedTaxUniqueNameList: uniquenameArray
      })
    }


  }
 
  keyboardWillShow = (event) => {
    const value = event.endCoordinates.height - this.state.bottomOffset;
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: value
    }).start();
  };
  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: 0
    }).start();
  };
  getUnderstandingText = (selectedLedgerAccountType: string, accountName: string, parentGroups: Array<any>, localeData?: any) => {
    if (localeData) {
      let data;
      let isReverseChargeAccount = false;

      if (parentGroups) {
        parentGroups.forEach(key => {
          if (key?.uniqueName === "reversecharge") {
            isReverseChargeAccount = true;
          }
        });
      }

      let underStandingTextData = localeData;
      if (isReverseChargeAccount) {
        data = _.cloneDeep(underStandingTextData?.find((p) => p.accountType === "ReverseCharge"));
      } else {
        data = _.cloneDeep(underStandingTextData?.find((p) => p.accountType === selectedLedgerAccountType));
      }
      if (data) {
        if (data.balanceText && data.balanceText.cr) {
          data.balanceText.cr = data.balanceText.cr?.replace('<accountName>', accountName);
        }
        if (data.balanceText && data.balanceText.dr) {
          data.balanceText.dr = data.balanceText.dr?.replace('<accountName>', accountName);
        }

        if (data.text && data.text.dr) {
          data.text.dr = data.text.dr?.replace('<accountName>', accountName);
        }
        if (data.text && data.text.cr) {
          data.text.cr = data.text.cr?.replace('<accountName>', accountName);
        }
        this.setState({
          ledgerUnderstandingObject: _.cloneDeep(data)
        })
      }
    }
  }
  formatClearanceDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.chequeClearanceDate;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return 'Today';
    } else if (diffYears === 0 && diffDays === 1) {
      return 'Yesterday';
    } else if (diffYears === 0 && diffDays === -1) {
      return 'Tomorrow';
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else if (diffYears >= 1) {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + ' ' + date;
    }
  }
  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y
    });
  };
  handleTagAddRemove(tag: any) {
    if (this.state.selectedTags.includes(tag)) {
      this.setState({
        selectedTags: this.state?.selectedTags.filter((t) => t !== tag),
      });
    } else {
      this.setState({
        selectedTags: [...this.state?.selectedTags, tag],
      });
    }
  }
  removeTagFromList(tag: any) {
    let afterRemovedTags = this.state?.selectedTags.filter((t) => t !== tag)
    this.setState({
      selectedTags: afterRemovedTags,
    });
  }
  getYesterdayDate() {
    this.setState({ entryDate: moment().subtract(1, 'days') });
  }
  getTodayDate() {
    this.setState({ entryDate: moment() });
  }
  formatDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.entryDate;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return 'Today';
    } else if (diffYears === 0 && diffDays === 1) {
      return 'Yesterday';
    } else if (diffYears === 0 && diffDays === -1) {
      return 'Tomorrow';
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    }
  }
  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false
    });
  };
  calculatedTdsOrTcsTaxAmount(itemDetails) {
    let totalTcsorTdsTax = 0;
    let totalTcsorTdsTaxName = '';

    const taxArr = this.state.taxArray;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        if (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') {
          totalTcsorTdsTax = taxAmount;
          totalTcsorTdsTaxName = item.taxType;
          break;
        }
      }
    }
    if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
      for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
        const item = itemDetails.stock.taxes[i];
        for (let j = 0; j < taxArr.length; j++) {
          if (item == taxArr[j].uniqueName) {
            const taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
            const taxAmount = (taxPercent * Number(amt)) / 100;
            if ((taxArr[j].taxType == 'tdspay' || taxArr[j].taxType == 'tcspay' || taxArr[j].taxType == 'tcsrc' || taxArr[j].taxType == 'tdsrc')) {
              totalTcsorTdsTax = taxAmount;
              totalTcsorTdsTaxName = taxArr[j].taxType;
            }
            break;
          }
        }
      }
    }
    console.log('TCS Or TDS Tax is ' + totalTcsorTdsTax);
    if (totalTcsorTdsTaxName != '' && totalTcsorTdsTax != 0) {
      const tdsOrTcsTaxObj = { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2) };
      return tdsOrTcsTaxObj;
    } else {
      return null;
    }
  }
  getTotalAmount() {
    let total = 0;
    // for (let i = 0; i < this.state.addedItems.length; i++) {
    //   const item = this.state.addedItems[i];
    //   const discount = item.discountValue ? item.discountValue : 0;
    //   const tax = this.calculatedTaxAmount(item, 'totalAmount');
    //   const amount = Number(item.rate) * Number(item.quantity);
    //   total = total + amount - discount + tax;
    // }
    return total.toFixed(2);
  }
  getInvoiceDueTotalAmount() {
    let total = 0;
    // for (let i = 0; i < this.state.addedItems.length; i++) {
    //   const item = this.state.addedItems[i];
    //   const discount = item.discountValue ? item.discountValue : 0;
    //   const tax = this.calculatedTaxAmount(item, 'InvoiceDue');
    //   const amount = Number(item.rate) * Number(item.quantity);
    //   total = total + amount - discount + tax;
    // }
    return total.toFixed(2);
  }
  handleConfirmClearanceDate = (date) => {
    this.setState({ chequeClearanceDate: moment(date) });
    this.setState({ showClearanceDatePicker: false, isClearanceDateSelelected: true });
  };
  handleConfirm = (date) => {
    this.setState({ entryDate: moment(date) });
    this.hideDatePicker();
  };
  hideDatePicker = () => {
    this.setState({ showDatePicker: false });
  };
  handleUploadAttachment = async () => {
    try {
      const selectedAttachment = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.pdf,
          DocumentPicker.types.csv,
          DocumentPicker.types.xls,
        ],
      })

      if (selectedAttachment) {
        if (selectedAttachment?.size > 5000000) {
          ToastAndroid.show('File size more than 5MB is not allowed', ToastAndroid.LONG);
        }
        this.setState({ loading: true })

        const uploadRes = await this.uploadAttachment(selectedAttachment[0]);
        if (uploadRes?.status == 'success') {
          this.setState({
            uploadedAttachment: uploadRes?.body,
            loading: false
          })
        } else {
          this.setState({
            uploadedAttachment: {},
            loading: false
          })
          if (Platform.OS == "ios") {
            TOAST.show(uploadRes?.data?.message, {
              duration: TOAST.durations.LONG,
              position: -70,
              hideOnPress: true,
              backgroundColor: "#1E90FF",
              textColor: "white",
              opacity: 1,
              shadow: false,
              animation: true,
              containerStyle: { borderRadius: 10 }
            });
          } else {
            ToastAndroid.show(uploadRes?.data?.message, ToastAndroid.LONG)
          }

        }
      }
    } catch (err) {
      console.log('errrrr', err)
      // setUploading(false);
      this.setState({
        uploadedAttachment: {},
        loading: false
      })

      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        throw err;
      }
    }
  };
  checkForCreateEntryConditions = async () => {
    if (!this.state.particularAccountStockData) {
      alert('Please select a party.');
      return false;
    } else if (this.state?.reverseCharge && this.state?.SelectedTaxData?.taxDetailsArray?.length < 1) {
      alert('Tax field is mandatory');
      return false;
    }
    return true;
  }
  calculateTotalAmount() {
    if (this.state?.selectedVoucherType == 'Advance Receipt') {
      return parseFloat(this.state?.amountForEntry || 0);
    }
    let totalAmount = parseFloat(this.state?.amountForEntry || 0) - Number(this.calculateTotalDiscount()) + (this.state?.reverseCharge == false ? this.state?.totalTaxAmount : 0);

    return totalAmount;
  }
  calculateTotalDiscount() {
    let totalDiscount = 0;
    let percentDiscount = Number(this.state?.discountPercent);
    let amountDiscount = Number(this.state?.discountAmount);
    let extraOffers = this.state?.selectedDiscounts;
    // Calculate total discount from percent and amount discounts
    if (percentDiscount) {
      totalDiscount += (percentDiscount / 100) * this.state?.amountForEntry;
    }
    if (amountDiscount) {
      totalDiscount += amountDiscount;
    }
    // Add extra discounts
    if (extraOffers && extraOffers.length > 0) {
      extraOffers.forEach((extraOffer) => {
        if (extraOffer.discountType === 'PERCENTAGE') {
          totalDiscount += (extraOffer.discountValue / 100) * this.state?.amountForEntry;
        } else if (extraOffer.discountType === 'FIX_AMOUNT') {
          totalDiscount += extraOffer.discountValue;
        }
      });
    }
    return totalDiscount;
  }
  handleDiscountItemClick = (item) => {
    const isSelected = this.state?.selectedDiscounts.some((selectedItem) => selectedItem.discountUniqueName === item.uniqueName);
    if (isSelected) {
      const updatedSelectedItems = this.state?.selectedDiscounts.filter((selectedItem) => selectedItem.discountUniqueName !== item.uniqueName);
      this.setState({
        selectedDiscounts: updatedSelectedItems
      });
    } else {
      const newItemDetails = {
        amount: item?.discountValue,
        discountType: item?.discountType,
        discountUniqueName: item?.uniqueName,
        discountValue: item?.discountValue,
        isActive: true,
        name: item?.name,
        particular: item?.linkAccount?.uniqueName
      };
      this.setState({
        selectedDiscounts: [...this.state?.selectedDiscounts, newItemDetails]
      });
    }
  };
  getLinkedInvoicesAdjustedAmount = async (adjustedAmount, adjustmentInvoices, invoicePageCount, totalInvoicePageCount) => {
    this.setState({ adjustedAmountOfLinkedInvoices: adjustedAmount,invoicePageCount: invoicePageCount, totalInvoicePageCount: totalInvoicePageCount });
    this.setState({ adjustmentInvoices: adjustmentInvoices, navigatingAgain: true });

    let clonedAdjustedInvoices = _.cloneDeep(adjustmentInvoices);

    const finalInvoices = await clonedAdjustedInvoices
      .filter(obj => obj.isSelect == true)
      .map(item => {
        item.accountCurrency = {
          code: this.state?.selectedAccountData?.currency,
          symbol: this.state?.selectedAccountData?.currencySymbol
        };
        item.calculatedTaxAmount = 0;
        item.amount = {
          amountForAccount: Number(item?.adjustedAmount),
          amountForCompany: Number(item?.adjustedAmount) * Number(item?.exchangeRate)
        },
          item.voucherTotal = {
            amountForAccount: Number(item.voucherTotal.amountForAccount),
            amountForCompany: Number(item.voucherTotal.amountForAccount) * Number(item?.exchangeRate)
          }
        delete item.unadjustedAmount
        return item;
      });
    this.setState({
      finalAdjustedInvoices: finalInvoices
    })
  };
  handleAdjustVoucher() {
    if (this.state?.amountForEntry == 0) {
      alert("Please add amount.");
      return;
    }
    const particularAccountStockData = this.state?.particularAccountStockData?.stock ? {...this.state.particularAccountStockData, parentGroups : this.state.particularAccountStockData?.oppositeAccount?.parentGroups } : this.state.particularAccountStockData;
      let data : any = {
        oppositeAccountUniqueName: this.state?.oppositeAccountUniqueName,
        particularAccount: particularAccountStockData,
        ledgerAccount: this.state?.selectedAccountData,
        voucherType: this.state?.selectedVoucherType == 'Advance Receipt' ? 'receipt' : this.state?.selectedVoucherType?.toLowerCase()
      }
    let apiPayloadData = {
      selectedVoucherType: this.state?.selectedVoucherType,
      currentEntryType: this.state?.currentEntryType,
      companyVersionNumber : this.state.companyVersionNumber,
      requestData: data
    }
    this.props.navigation.navigate('Account.LinkInvoice', {
      getLinkedInvoicesAdjustedAmount: this.getLinkedInvoicesAdjustedAmount.bind(this),
      date: this.state?.entryDate,
      navigatingAgain: this.state.navigatingAgain,
      partyName: this.state.particularAccountStockData?.name,
      currencySymbol: this.state.currencySymbol,
      partyAmount: this.state.amountForEntry,
      realVoucherInvoice: this.state.adjustmentInvoices,
      paginationHelperData: apiPayloadData,
      invoicePageCount: this.state?.invoicePageCount,
      totalInvoicePageCount: this.state?.totalInvoicePageCount
    });
  }
  getAccountCategory(account: any, accountName: string) {
    let parent = account?.parentGroups ? account.parentGroups[0] : '';
    if (parent) {
        if (find(['shareholdersfunds', 'noncurrentliabilities', 'currentliabilities'], p => p === parent?.uniqueName)) {
            return 'liabilities';
        } else if (find(['fixedassets'], p => p === parent?.uniqueName)) {
            return 'fixedassets';
        } else if (find(['noncurrentassets', 'currentassets'], p => p === parent?.uniqueName)) {
            return 'assets';
        } else if (find(['revenuefromoperations', 'otherincome'], p => p === parent?.uniqueName)) {
            return 'income';
        } else if (find(['operatingcost', 'indirectexpenses'], p => p === parent?.uniqueName)) {
            if (accountName === 'roundoff') {
                return 'roundoff';
            }
            let subParent = account?.parentGroups[1];
            if (subParent && subParent?.uniqueName === 'discount') {
                return 'discount';
            }
            return 'expenses';
        } else {
            return '';
        }
    } else {
        return '';
    }
}
  getConvertedAmount(amount:any) {
    return   amount / this.state?.exchangeRate;
  }


  // ************************ BELOW ARE API CALLS AND HANDLING ************************



  uploadAttachment = async (res: any) => {
    try {
      let formData = new FormData();
      formData.append('file', res);
      const response = await CommonService.uploadAttachment(formData);
      return response;
    } catch (e) {
      console.log('Upload catch', e);
      // setUploading(false);
    }
  };
  async setActiveCompanyCountry() {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          companyCountryDetails: results.body.country
        },
          () => {
            //now fetching the currency converted rate for example - selected account is UAE but company is IND
            this.getConvertedCurrency()
          }
        );
      }
    } catch (e) { }
  }
  getConvertedCurrency = async () => {
    try {
      let fromCurrency = this.state?.selectedAccountData?.currency;
      let toCurrency = this.state?.companyCountryDetails?.currency?.code;
      const convertedRate = await CommonService.getCurrencyConversion(fromCurrency, toCurrency, moment().format('DD-MM-YYYY'))
      if (convertedRate.body && convertedRate.status == 'success') {
        this.setState({
          exchangeRate: convertedRate.body
        })
      }
      console.log('convertedRate', convertedRate)
    } catch (e) {
      console.log('Err in currency conversion rate', e)
    }
  }
  getParticularAccountData = async (accountName: string) => {
    //this method is to get second(to) account data
    try {
      const response = await AccountsService.getParticularToAccountData(accountName);
      if (response?.body) {
        this.checkShowDiscountAndTaxField(response?.body);
        this.shouldShowRcmSection(response?.body);
        this.shouldShowTouristScheme(response?.body);
        this.setState({
          particularAccountStockData: response?.body
        })
      } else {
        this.setState({
          particularAccountStockData: {}
        })
      }
    } catch (e) {
      console.log('error', e)
      this.setState({
        particularAccountStockData: {}
      })
    }
  }
  getParticularStockDataHandler = async (payload: any) => {
    //this method is to get second(to) account data
    const { stockUniqueName,
      variantUniqueName,
      oppositeAccountUniqueName,
    } = payload;
    const ledgerType = (this.state?.selectedAccountData?.uniqueName == 'sales' || this.state?.selectedAccountData?.uniqueName == 'purchases') ? this.state?.selectedAccountData?.uniqueName : this.state?.oppositeAccountUniqueName;
    try {
      const response = await AccountsService.getParticularStockData(ledgerType, stockUniqueName, oppositeAccountUniqueName, variantUniqueName);
      if (response?.body) {
        this.checkShowDiscountAndTaxField(response?.body)
        this.shouldShowRcmSection(response?.body);
        this.shouldShowTouristScheme(response?.body);
        this.setState({
          particularAccountStockData: response?.body,
          stockPrice: response?.body?.stock?.variant?.unitRates[0]?.rate / this.state?.exchangeRate,
          selectedStockUnit: response?.body?.stock?.variant?.unitRates[0],
          stockQuantity: 1
        })
        this.updateAmountStk();
        this.updateStockPrice();
        this.updateAmountQty();
      } else {
        this.setState({
          particularAccountStockData: {}
        })
      }
    } catch (e) {
      this.setState({
        particularAccountStockData: {}
      })
    }
  }
  getStocksAndVariants = async (stockUniqueName: string, oppositeAccountUniqueName: string) => {
    //this method is to get second(to) account data
    try {
      const response = await AccountsService.getStockData(stockUniqueName);
      if (response?.body) {
        this.setState({
          stockLists: response?.body,
          selectedStockVariant: response?.body[0],
        })
        let payload = {
          stockUniqueName: stockUniqueName,
          variantUniqueName: response?.body[0]?.uniqueName,
          oppositeAccountUniqueName: oppositeAccountUniqueName,
        }
        this.getParticularStockDataHandler(payload);
      } else {
        this.setState({
          stockLists: {}
        })
      }
    } catch (e) {
      this.setState({
        stockLists: {}
      })
    }
  }
  getTagsData = async () => {
    //this method is to get second(to) account data
    try {
      const response = await CommonService.getCompanyTags();
      if (response?.body) {
        this.setState({
          allTags: response?.body
        })
      } else {
        this.setState({
          allTags: []
        })
      }
    } catch (e) {
      this.setState({
        allTags: []
      })
    }
  }
  getDiscounts = async () => {
    //this method is to get discounts data
    try {
      const response = await CommonService.getCompanyDiscounts();
      if (response?.body) {
        this.setState({
          allDiscounts: response?.body
        })
      } else {
        this.setState({
          allDiscounts: []
        })
      }
    } catch (e) {
      this.setState({
        allDiscounts: []
      })
    }
  }
  getVoucherInvoiceList = async () => {
    try {
      const date = await moment(this.state.date);
      const particularAccountStockData = this.state?.particularAccountStockData?.stock ? {...this.state.particularAccountStockData, parentGroups : this.state.particularAccountStockData?.oppositeAccount?.parentGroups } : this.state.particularAccountStockData;
      let data = {
        oppositeAccountUniqueName: this.state?.oppositeAccountUniqueName,
        particularAccount: particularAccountStockData,
        ledgerAccount: this.state?.selectedAccountData,
        voucherType: this.state?.selectedVoucherType?.toLowerCase()
      }
      let request = await getInvoiceListRequest(data);
      const response = await InvoiceService.getVoucherInvoice(date, request, this.state.companyVersionNumber);
      if (response.body && response.status == 'success') {
        this.setState({ referenceInvoices: this.state.companyVersionNumber == 1 ? response.body.results : response.body.items });
      } else {
        this.setState({
          referenceInvoices: []
        });
      }
    } catch (e) {
      this.setState({
        referenceInvoices: []
      });
      console.log('er', e)
    }
  }
  // getVoucherAdjustmentInvoiceList = async () => {
  //   try {
  //     const date = await moment(this.state?.entryDate).format('DD-MM-YYYY');
  //     //If the selected AccountData is of type Stock then we need to manage its opposite Account data.
  //     const particularAccountStockData = this.state?.particularAccountStockData?.stock ? {...this.state.particularAccountStockData, parentGroups : this.state.particularAccountStockData?.oppositeAccount?.parentGroups } : this.state.particularAccountStockData;
  //     let data : any = {
  //       oppositeAccountUniqueName: this.state?.oppositeAccountUniqueName,
  //       particularAccount: particularAccountStockData,
  //       ledgerAccount: this.state?.selectedAccountData,
  //       voucherType: this.state?.selectedVoucherType == 'Advance Receipt' ? 'receipt' : this.state?.selectedVoucherType?.toLowerCase()
  //     }

  //     let request = await getInvoiceListRequest(data);
  //     // don't call api if it's invalid case
  //     if (!request) {
  //       return;
  //     }
  //     let payloadData = {
  //       accountUniqueName: request?.accountUniqueName,
  //       voucherType: request?.voucherType,
  //       number: "",
  //       page: 1,
  //       ...(this.state?.selectedVoucherType == 'Advance Receipt' && { subVoucher: "ADVANCE_RECEIPT" }),
  //       ...((this.state?.selectedVoucherType == 'Credit Note' || this.state?.selectedVoucherType == 'Debit Note') && { noteVoucherType: request?.noteVoucherType }),
  //       voucherBalanceType: this.state?.currentEntryType?.toLowerCase()
  //     }
  //     const response = await AccountsService.getAdjustmentInvoices(date, this.state.companyVersionNumber, 1, payloadData);
  //     if (response.body && response.status == 'success') {
  //       this.setState({ adjustmentInvoices: this.state.companyVersionNumber == 1 ? response.body.results : response.body.items });
  //     } else {
  //       this.setState({
  //         adjustmentInvoices: []
  //       });
  //     }
  //   } catch (e) {
  //     this.setState({
  //       adjustmentInvoices: []
  //     });
  //     console.log('ERROR in adjustment invoices', e)
  //   }
  // }

  searchCalls = _.debounce(this.searchAccount, 200);

  async searchAccount() {
    this.setState({ isSearchingAccount: true });
    try {
      let currentLedgerCategory = this.state?.selectedAccountData ? this.getAccountCategory(this.state?.selectedAccountData, this.state?.selectedAccountData?.uniqueName) : '';
      let stockAccountUniqueName =
        (currentLedgerCategory == 'income' || currentLedgerCategory == 'expenses' || currentLedgerCategory == 'fixedassets') ? this.state?.selectedAccountData?.uniqueName : '';
        const results = await AccountsService.getAccountNames(this.state.searchAccountName, stockAccountUniqueName, 1, true);
      if (results.body && results.body.results) {
        this.setState({
          searchResults: results.body.results,
          isSearchingAccount: false,
          searchError: '',
          totalSearchPages: results?.body?.totalPages
        });
      } else {
        this.setState({ searchResults: [], searchError: 'No Results', isSearchingAccount: false });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingAccount: false });
    }
  }
  async getWarehouse() {
    try {
      const results = await InvoiceService.getWareHouse();
      if (results.body && results.status == 'success') {
        this.setState({
          warehouseList: results?.body?.results,
          selectedWarehouse: results?.body?.results[0] ? results?.body?.results[0] : {}
        });
      } else {
        this.setState({ warehouseList: [] });
      }
    } catch (e) {
      this.setState({ warehouseList: [] });
    }
  }
  async getAllTaxes() {
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        const taxes = results.body.filter((item) => {
          return item.taxType != 'inputgst';
        });
        this.setState({ taxArray: taxes });
        // this.getTdsTcsTaxes();
      }
    } catch (e) {
      this.setState({ fetechingTaxList: false });
    }
  }
  async loadMoreSearchAccount() {
    this.setState({ isSearchingAccount: true });
    try {
      let currentLedgerCategory = this.state?.selectedAccountData ? this.getAccountCategory(this.state?.selectedAccountData, this.state?.selectedAccountData?.uniqueName) : '';
      let stockAccountUniqueName =
        (currentLedgerCategory == 'income' || currentLedgerCategory == 'expenses' || currentLedgerCategory == 'fixedassets') ? this.state?.selectedAccountData?.uniqueName : '';
      const results = await AccountsService.getAccountNames(this.state.searchAccountName, stockAccountUniqueName, this.state.searchPage, true);
      if (results.body && results.body.results) {
        this.setState({
          searchResults: [...this.state.searchResults, ...results.body.results],
          isSearchingAccount: false,
          searchError: ''
        });
      } else {
        this.setState({ searchResults: [], searchError: 'No Results', isSearchingAccount: false });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: 'No Results', isSearchingAccount: false });
    }
  }
  handleLoadMore = () => {
    if (this.state.searchPage < this.state.totalSearchPages) {
      this.setState(
        {
          searchPage: this.state.searchPage + 1,
        },
        () => {
          this.loadMoreSearchAccount();
        },
      );
    }
  };
  async getSelectedAccountData(accountName) {
    try {
      const results = await InvoiceService.getAccountDetails(accountName);
      if (results.body) {
        await this.setState({
          selectedAccountData: results.body,
          currencySymbol: results.body?.currencySymbol
        });
        this.getUnderstandingText(results.body?.accountType, results.body?.name, results.body?.parentGroups, localeData)
      }
    } catch (e) {
      console.log('EROROR', e)
    }
  }
  async createEntryRequest() {
    try {
      const postBody = await {
        voucherType: await getAbbreviation(this.state?.selectedVoucherType),
        entryDate: moment(this.state?.entryDate).format('DD-MM-YYYY'),
        unconfirmedEntry: false,
        attachedFile: this.state?.uploadedAttachment?.uniqueName ? this.state?.uploadedAttachment?.uniqueName : "",
        attachedFileName: this.state?.uploadedAttachment?.name ? this.state?.uploadedAttachment?.name : "",
        tag: null,
        ...(this.state?.selectedTags?.length > 0 && { tagNames: [...this.state?.selectedTags] }),
        description: this.state?.description,
        generateInvoice: this.state?.generateVoucher,
        chequeNumber: this.state?.chequeNumber,
        chequeClearanceDate: this.state?.chequeClearanceDate != '' ? this.state?.chequeClearanceDate?.format('DD-MM-YYYY') : '',
        invoiceNumberAgainstVoucher: this.state?.invoiceNumberAgainstVoucher,
        compoundTotal: await this.calculateTotalAmount(),
        convertedCompoundTotal: await this.state?.exchangeRate * this.calculateTotalAmount(),
        invoicesToBePaid: [], //left
        tdsTcsTaxesSum: 0,
        otherTaxesSum: 0,
        otherTaxType: "",
        exchangeRate: this.state?.exchangeRate,
        valuesInAccountCurrency: true,
        selectedCurrencyToDisplay: 0,
        isOtherTaxesApplicable: false,
        ...(this.state?.touristScheme && { touristSchemeApplicable: this.state?.touristScheme }),
        ...(this.state?.passPortNumber != '' && { passportNumber: this.state?.passPortNumber }),
        transactions: [{
          ...(this.state?.finalAdjustedInvoices?.length > 0 && { adjustments: this.state?.finalAdjustedInvoices }),
          amount: this?.state?.amountForEntry,
          convertedAmount: Number(this.state?.exchangeRate) * Number(this.state?.amountForEntry),
          particular: this.state?.particularAccountStockData?.stock ? this.state?.oppositeAccountUniqueName : this.state?.particularAccountStockData?.uniqueName,
          ...(this.state?.selectedReferenceInvoice?.voucherNumber && { referenceVoucher: { uniqueName: this.state?.selectedReferenceInvoice?.uniqueName } }),
          taxes: this.state?.selectedTaxUniqueNameList,
          total: await this.calculateTotalAmount(),
          convertedTotal: await this.state?.exchangeRate * this.calculateTotalAmount(),
          discount: this.state?.discountTotalValue,
          convertedDiscount: Number(this.state?.discountTotalValue) * this.state?.exchangeRate,
          isStock: !this.state?.particularAccountStockData?.stock ? false : true,
          convertedRate: this.state?.stockPrice,
          isChecked: false,
          showTaxationDiscountBox: true,
          itcAvailable: "",
          ...(this.state?.selectedVoucherType == 'Advance Receipt' && { subVoucher: "ADVANCE_RECEIPT" }),
          ...(this.state?.reverseCharge && { subVoucher: "REVERSE_CHARGE" }),
          taxInclusiveAmount: this.state?.taxInclusiveAmount,
          showDropdown: false,
          showOtherTax: false,
          type: this.state?.currentEntryType == 'Cr' ? "CREDIT" : "DEBIT",
          discounts: [
            ...this.state?.selectedDiscounts,
            ...((this.state?.discountAmount != 0 || this.state?.discountPercent != 0)
              ? [
                {
                  discountType: this.state?.discountPercent != 0 ? "PERCENTAGE" : "FIX_AMOUNT",
                  amount: this.state?.discountPercent != 0 ? this.state?.discountPercent : this.state?.discountAmount,
                  name: "",
                  particular: "",
                  isActive: true,
                  discountValue: this.state?.discountPercent != 0 ? this.state?.discountPercent : this.state?.discountAmount,
                },
              ]
              : [])
          ],
          ...(this.state?.particularAccountStockData?.stock && {
            unitRate: [
              {
                ...this.state?.selectedStockUnit,
                code: this.state?.selectedStockUnit?.stockUnitCode
              }
            ]
          }),
          ...(this.state?.particularAccountStockData?.stock && {
            inventory: {
              stock: {
                ...this.state.selectedStock
              },
              variant: {
                uniqueName: this.state?.selectedStockVariant?.uniqueName
              },
              quantity: this.state?.stockQuantity,
              unit: {
                stockUnitCode: this.state?.selectedStockUnit?.stockUnitCode,
                code: this.state?.selectedStockUnit?.stockUnitCode,
                rate: this.state?.selectedStockUnit?.stockPrice,
                stockUnitUniqueName: this.state?.selectedStockUnit?.stockUnitUniqueName,
                highPrecisionRate: this.state?.selectedStockUnit?.stockPrice
              },
              warehouse: {
                name: this.state?.selectedWarehouse?.name,
                uniqueName: this.state?.selectedWarehouse?.uniqueName
              }
            }
          }),
          isInclusiveTax: false,
          oppositeAccountUniqueName: this.state?.oppositeAccountUniqueName,
          shouldShowRcmEntry: true,
        }],

      }
      console.log('postBody', JSON.stringify(postBody))
      const createEntryResponse = await AccountsService.createAccountsEntry(this.state?.selectedAccountData?.uniqueName, this.state?.companyVersionNumber, postBody
      );
      if (createEntryResponse?.status == 'success') {
        this.setState({ successDialog: true });
        DeviceEventEmitter.emit(APP_EVENTS.NewEntryCreated, {});
      }
    } catch (e) {
      console.log('ERROR', e)
    }
  }


  // ************************ BELOW ARE COMPONENTS ************************



  renderHeader() {
    return (
      <View style={[style.header, { paddingTop: 10 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => {
              this.props.navigation.goBack();
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>
              Add Entry
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{ marginRight: 16, alignSelf: 'center' }}
          onPress={() => {
            this.setState({
              currentEntryType: this.state?.currentEntryType == 'Dr' ? 'Cr' : 'Dr'
            })
          }}>
          <Text style={style.invoiceTypeTextRight}>
            {this.state.currentEntryType == 'Dr' ? this.state?.ledgerUnderstandingObject?.text?.cr : this.state?.ledgerUnderstandingObject?.text?.dr}
            {' '}({this.state?.currentEntryType == 'Dr' ? 'Cr' : 'Dr'})
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  renderAccountFlow() {
    return (
      <View style={style.accountFlowView} >
        <Text style={style.accountFlowText}>
          {this.state?.currentEntryType == 'Dr' ? this.state?.ledgerUnderstandingObject?.text?.dr : this.state?.ledgerUnderstandingObject?.text?.cr}
          {' '}({this.state?.currentEntryType})
        </Text>
      </View>
    )
  }
  renderSelectAccountName() {
    return (
      <View
        onLayout={this.onLayout}
        style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Icon name={'Profile'} color={'#A6D8BF'} style={{ margin: 16 }} size={16} />
          <TextInput
            placeholderTextColor={'#A6D8BF'}
            placeholder={'Search account'}
            returnKeyType={'done'}
            value={this.state?.searchAccountName}
            // value={`${this.state.searchAccountName} ${this.state?.particularAccountStockData?.hasOwnProperty("stock") ? `(${this.state?.particularAccountStockData?.stock?.name})` : ''}`}
            onChangeText={(text) => {
              this.setState({ searchAccountName: text }),
                this.searchCalls()
            }}
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'white'} size="small" animating={this.state.isSearchingAccount} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{ color: 'white', marginRight: 16, fontFamily: 'AvenirLTStd-Book' }}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  }
  _renderSearchList() {
    return (
      <View style={[style.searchResultContainer, { top: height * 0.12 }]}>

        <FlatList
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={this.state.searchResults.length == 0 ? ["Result Not found"] : this.state.searchResults}
          style={{ paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{}}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                if (item != "Result Not found") {
                  this.setState(
                    {
                      partyName: item,
                      searchResults: [],
                      searchAccountName: item?.stock?.name ? `${item?.name} (${item?.stock?.name})` : item?.name,
                      searchError: '',
                      isSearchingAccount: false,
                    },
                    () => {
                      if (item?.hasOwnProperty("stock")) {
                        this.setState({
                          selectedStock: item?.stock,
                          oppositeAccountUniqueName: item?.uniqueName
                        })
                        this.getStocksAndVariants(item?.stock?.uniqueName, item?.uniqueName);
                      } else {
                        this.getParticularAccountData(item?.uniqueName);
                      }
                      this.getTagsData();
                      this.getDiscounts();
                      Keyboard.dismiss();
                    },
                  );
                } else {
                  this.setState({ isSearchingAccount: false, searchResults: [] })
                }
              }}>
              <Text style={{ color: '#1C1C1C', paddingVertical: 10 }}>{item.name ? item.name : "Result Not found"}
                {item?.hasOwnProperty("stock") ? ` (${item?.stock?.name})` : null}
              </Text>
            </TouchableOpacity>
          )}
          onEndReachedThreshold={0.2}
          onEndReached={() => this.handleLoadMore()}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            padding: 5,
            alignItems: 'center',
          }}
          onPress={() =>
            this.setState({
              searchResults: [],
              searchError: '',
              isSearchingAccount: false,
            })
          }>
          <Ionicons name="close-circle" size={20} color={'#424242'} />
          {/* <Text style={{marginLeft: 3}}>Close</Text> */}
        </TouchableOpacity>
      </View>
      // </Modal>
    );
  }
  _renderAssignTags() {
    return (
      <BottomSheet
        bottomSheetRef={this.assignTagRef}
        headerText='Select Tags'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: this.state?.allTags,
          renderItem: ({ item, index }) => {
            let isSelected = this.state.selectedTags.includes(item?.name);
            return (
              <TouchableOpacity
                style={style.tagListItem}
                onPress={async () => {
                  this.handleTagAddRemove(item?.name);
                }}>
                <CheckBox
                  checkBoxColor={'#229F5F'}
                  uncheckedCheckBoxColor={'#229F5F'}
                  isChecked={isSelected ? true : false}
                  onClick={async () => {
                    this.handleTagAddRemove(item?.name);
                  }}
                />
                <Text
                  style={style.tagText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          },
          ListEmptyComponent: () => {
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    color: '#1C1C1C',
                    paddingVertical: 4,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    textAlign: 'center',
                    alignSelf: 'center',
                  }}>
                  No Tags Available
                </Text>
              </View>
            );
          }
        }}
      />
    );
  }
  _renderVoucherTypes() {
    return (
      <BottomSheet
        bottomSheetRef={this.voucherTypesRef}
        headerText='Select Voucher'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: voucherTypes,
          renderItem: ({ item }) => {
            return (
              <TouchableOpacity
                style={{ paddingHorizontal: 20 }}
                onPress={() => {
                  this.setState({
                    selectedVoucherType: item,
                    selectedReferenceInvoice: {},
                    generateVoucher: item == 'Advance Receipt' ? true : this.state?.generateVoucher
                  });
                  this.setBottomSheetVisible(this.voucherTypesRef, false);
                  if (item == 'Debit Note' || item == 'Credit Note') {
                    this.getVoucherInvoiceList();
                  }
                  //Now calling the Adjustmentinvoices api inside the adjustment screen with pagination.
                  // if (item !== 'Contra') {
                  //   this.getVoucherAdjustmentInvoiceList();
                  // }
                }}>


                <Text
                  style={{
                    color: '#1C1C1C',
                    padding: 5,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    margin: 10,
                    borderRadius: 5
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }
        }}
      />
    );
  }
  _renderInvoicesTypes() {
    return (
      <BottomSheet
        bottomSheetRef={this.invoicesRef}
        headerText='Select Invoice'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: this.state?.referenceInvoices,
          renderItem: ({ item }) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: this.state?.selectedReferenceInvoice?.voucherNumber == item?.voucherNumber ? '#229F5F33' : '#ffffff'
                }}
                onPress={() => {
                  this.setState({
                    selectedReferenceInvoice: this.state?.selectedReferenceInvoice?.voucherNumber == item?.voucherNumber ? {} : item
                  })
                  this.setBottomSheetVisible(this.invoicesRef, false);
                }}
              >
                <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.regular }}>
                  {item.voucherNumber}
                </Text>
                <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
                  {'(Dated : ' + item.voucherDate + ')'}
                </Text>
                <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
                  {'(Due : ' + item.voucherTotal.amountForAccount + ')'}
                </Text>
              </TouchableOpacity>
            );
          },
          ListEmptyComponent: () => {
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    color: '#1C1C1C',
                    paddingVertical: 4,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    textAlign: 'center',
                    alignSelf: 'center',
                  }}>
                  No data Available
                </Text>
              </View>
            );
          }
        }}
      />
    );
  }

  _renderDiscountOptions() {
    return (
      <BottomSheet
        bottomSheetRef={this.discountRef}
        headerText='Select Discount'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
      >
        <View style={style.discountSheetView} >
          <View style={style.discountField} >
            <Text style={style.discountOptions}>
              Percent (%):
            </Text>
            <TextInput
              placeholder='Input here'
              keyboardType='numeric'
              editable={this.state?.discountAmount != 0 ? false : true}
              onChangeText={(text) => {
                this.calculateDiscountAmount(text);
                this.setState({
                  discountPercent: text
                });

              }}
              value={this.state?.discountPercent}
              style={style.discountInputField} />
          </View>
          <View style={style.discountField}  >
            <Text style={style.discountOptions} >
              Value:
            </Text>
            <TextInput
              editable={this.state?.discountPercent != 0 ? false : true}
              placeholder='Input here'
              keyboardType='numeric'
              value={this.state?.discountAmount}
              onChangeText={(text) => {

                this.setState({
                  discountAmount: text,
                  discountTotalValue: text
                });

              }}
              style={style.discountInputField} />
          </View>
          {this.state?.allDiscounts?.length > 0 && <View style={style.discountListView} >
            <View style={style.discountListSeparator}>
              <View style={style.line} />
              <Text style={[style.discountListText, { fontFamily: FONT_FAMILY.bold }]}>AND</Text>
              <View style={style.line} />
            </View>
            <FlatList
              data={this.state?.allDiscounts}
              renderItem={({ item }) => this.renderDiscountItems(item)}
              keyExtractor={(item) => item.uniqueName}
            />
          </View>}
        </View>
      </BottomSheet>
    );
  }
  _renderStockUnitModal() {
    return (
      <BottomSheet
        bottomSheetRef={this.stockUnitRef}
        headerText='Select Unit'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: this.state?.particularAccountStockData?.stock?.variant?.unitRates,
          renderItem: ({ item, index }) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                }}
                onPress={async () => {
                  this.setState({
                    selectedStockUnit: item,
                    stockPrice: item?.rate
                  });
                  this.setBottomSheetVisible(this.stockUnitRef, false);

                }}>


                <Text
                  style={{
                    color: '#1C1C1C',
                    padding: 5,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    margin: 10,
                    borderRadius: 5
                  }}>
                  {item?.stockUnitCode}
                </Text>
              </TouchableOpacity>
            );
          },

        }}
      />
    );
  }
  _renderTaxModal() {
    return (
      <BottomSheet
        bottomSheetRef={this.taxModalRef}
        headerText='Select Taxes'
        headerTextColor='#00B795'

        flatListProps={{
          data: this.state.taxArray?.filter(item => !(item?.taxType?.includes('tds') || item?.taxType?.includes('tcs'))),
          renderItem: ({ item }) => {
            const selectedTaxArray = this.state.SelectedTaxData.taxDetailsArray;
            const selectedTaxTypeArr = [...this.state.selectedArrayType];
            const filtered = _.filter(selectedTaxArray, function (o) {
              if (o.uniqueName == item.uniqueName) {
                return o;
              }
            });
            return (
              <TouchableOpacity
                style={{ paddingHorizontal: 20 }}
                onFocus={() => this.onChangeText('')}
                onPress={async () => {

                  if (
                    (selectedTaxTypeArr.includes(item.taxType) && !selectedTaxArray.includes(item)) ||
                    ((selectedTaxTypeArr.includes('tdspay') ||
                      selectedTaxTypeArr.includes('tdsrc') ||
                      selectedTaxTypeArr.includes('tcsrc')) &&
                      item.taxType == 'tcspay') ||
                    ((selectedTaxTypeArr.includes('tdspay') ||
                      selectedTaxTypeArr.includes('tcspay') ||
                      selectedTaxTypeArr.includes('tcsrc')) &&
                      item.taxType == 'tdsrc') ||
                    ((selectedTaxTypeArr.includes('tdspay') ||
                      selectedTaxTypeArr.includes('tdsrc') ||
                      selectedTaxTypeArr.includes('tcspay')) &&
                      item.taxType == 'tcsrc') ||
                    ((selectedTaxTypeArr.includes('tcspay') ||
                      selectedTaxTypeArr.includes('tdsrc') ||
                      selectedTaxTypeArr.includes('tcsrc')) &&
                      item.taxType == 'tdspay')
                  ) {
                    console.log('did not select');
                  } else {
                    const itemDetails = this.state.SelectedTaxData;
                    var filtered = _.filter(selectedTaxArray, function (o) {
                      if (o.uniqueName == item.uniqueName) {
                        return o;
                      }
                    });
                    if (filtered.length == 0) {
                      selectedTaxArray.push(item);
                      itemDetails.taxDetailsArray = selectedTaxArray;
                      const arr1 = [...selectedTaxTypeArr, item.taxType];
                      if (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tdsrc' || item.taxType == 'tcsrc') {
                        await this.calculatedTaxAmounstForEntry()
                        this.setBottomSheetVisible(this.calculationModalRef, true);
                      }
                      this.setState({ selectedArrayType: arr1 });
                    } else {
                      await this.calculatedTaxAmounstForEntry()
                      var filtered = _.filter(selectedTaxArray, function (o) {
                        if (o.uniqueName !== item.uniqueName) {
                          return o;
                        }
                      });

                      const arr2 = _.filter(selectedTaxTypeArr, function (o) {
                        if (o !== item.taxType) {
                          return o;
                        }
                      });
                      itemDetails.taxDetailsArray = filtered;
                      this.setState({ selectedArrayType: arr2 });
                    }
                  }
                  this.calculatedTaxAmounstForEntry()
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                  <View
                    style={{
                      borderRadius: 1,
                      borderWidth: 1,
                      borderColor: filtered.length == 0 ? '#CCCCCC' : '#1C1C1C',
                      width: 18,
                      height: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {filtered.length > 0 && (
                      <AntDesign name={'check'} size={10} color={filtered.length == 0 ? '#CCCCCC' : '#1C1C1C'} />
                    )}
                  </View>
                  <Text
                    style={{
                      color: '#1C1C1C',
                      paddingVertical: 4,
                      fontFamily: FONT_FAMILY.semibold,
                      fontSize: 14,
                      textAlign: 'center',
                      marginLeft: 20,
                    }}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          },
          ListEmptyComponent: () => {
            return (
              <View style={{ height: height * 0.3, flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <Text
                  style={{
                    flex: 1,
                    color: '#1C1C1C',
                    paddingVertical: 4,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    textAlign: 'center',
                    alignSelf: 'center'
                  }}>
                  No Taxes Available
                </Text>
              </View>

            );
          }
        }}
      />
    );
  }
  _renderVariantModal() {
    return (
      <BottomSheet
        bottomSheetRef={this.variantRef}
        headerText='Select Variant'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: this.state?.stockLists,
          renderItem: ({ item, index }) => {
            return (
              <TouchableOpacity
                style={{ paddingHorizontal: 20 }}
                onPress={async () => {
                  this.setState({
                    selectedStockVariant: item
                  });
                  let payload = {
                    stockUniqueName: this.state?.selectedStock?.uniqueName,
                    variantUniqueName: item?.uniqueName,
                    oppositeAccountUniqueName: this.state?.oppositeAccountUniqueName
                  }
                  this.getParticularStockDataHandler(payload);
                  this.setBottomSheetVisible(this.variantRef, false);
                }}>


                <Text
                  style={{
                    color: '#1C1C1C',
                    padding: 5,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    margin: 10,
                    borderRadius: 5
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          },

        }}
      />
    );
  }
  _renderWarehouseModal() {
    return (
      <BottomSheet
        bottomSheetRef={this.warehouseRef}
        headerText='Select Warehouse'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
        flatListProps={{
          data: this.state?.warehouseList,
          renderItem: ({ item, index }) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                }}
                onPress={async () => {
                  this.setState({
                    selectedWarehouse: item
                  });
                  this.setBottomSheetVisible(this.warehouseRef, false);

                }}>


                <Text
                  style={{
                    color: '#1C1C1C',
                    padding: 5,
                    fontFamily: FONT_FAMILY.semibold,
                    fontSize: 14,
                    margin: 10,
                    borderRadius: 5
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          },

        }}
      />
    );
  }
  _renderReverseChargeConfirmation() {
    return (
      <BottomSheet
        bottomSheetRef={this.reverseChargeConfirmation}
        headerText='Reverse Charge Confirmation'
        headerTextColor='#229F5F'
        onClose={() => {

        }}
      >
        <View style={style.reverseChargeView} >
          <Text style={style.reverseChargeNoteText}>
            {this.state?.reverseCharge ? 'If you uncheck this transaction from Reverse Charge, applied taxes will be considered as normal taxes and reverse charge effect will be removed from tax report.' :
              'Note: If you check this transaction for Reverse Charge, applied taxes will be considered under Reverse Charge taxes and will be added in tax report.'}
          </Text>
          <Text style={style.reverseChargeConfirmationText} >
            {this.state?.reverseCharge ? 'Are you sure you want to uncheck this transaction from Reverse Charge?' :
              'Are you sure you want to check this transaction for Reverse Charge?            '}
          </Text>
          <View style={style.reverseChargeConfirmView}>
            <TouchableOpacity
              style={style.reverseChargeConfirmButton}
              onPress={() => {
                this.setState({
                  reverseCharge: !this.state.reverseCharge
                })
                this.setBottomSheetVisible(this.reverseChargeConfirmation, false);
              }}
            >
              <Text style={style.reverseChargeConfirmButtonText} >Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setBottomSheetVisible(this.reverseChargeConfirmation, false);
              }}
              style={style.reverseChargeConfirmButton}
            >
              <Text style={style.reverseChargeConfirmButtonText} >No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
  renderAmount() {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{ paddingVertical: Platform.OS == 'ios' ? 10 : 0, paddingHorizontal: 15, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[style.invoiceAmountText, { textAlignVertical: 'center', fontSize: 18 }]}>
            {this.state.currencySymbol}
          </Text>
          <TextInput
            style={[style.invoiceAmountText, { flex: 1, alignSelf: 'flex-start' }]}
            keyboardType="phone-pad"
            placeholder={'0.00'}
            placeholderTextColor={this.state.isAmountFieldInFocus ? '#c9c9c9' : 'white'}
            value={this.state.amountForEntry+''}
            // ref={this.focusRef}
            onFocus={() => {
              this.setState({
                isAmountFieldInFocus: true
              })
            }}
            // onBlur={() => {
            //   this.setState({
            //     isAmountFieldInFocus: this.state.amountForReceipt!= 0 || this.state.amountForReceipt != ''? true : false
            //   })
            // }}
            onChangeText={async (text) => {
              await this.setState({
                amountForEntry: text,
              });
              this.updateStockPrice();
            }}>
          </TextInput>
        </View>
      </View>
    );
  }
  _renderSaveButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          // if (this.checkForCreateEntryConditions() == true) {
          this.createEntryRequest();
          // }
        }}
        style={style.saveButton}>
        <Text style={{ alignSelf: 'center', color: 'white', fontSize: 20 }}>Save</Text>
      </TouchableOpacity>
    );
  }
  renderDiscountItems(item: any) {
    const isSelected = this.state?.selectedDiscounts?.some((selectedItem) => selectedItem?.discountUniqueName === item?.uniqueName);
    return (
      <TouchableOpacity style={style.discountListItem}
        onPress={() => {
          this.handleDiscountItemClick(item)
        }}
      >
        <CheckBox
          checkBoxColor={'#229F5F'}
          uncheckedCheckBoxColor={'#229F5F'}
          isChecked={isSelected ? true : false}
          onClick={async () => {
            this.handleDiscountItemClick(item)
          }}
        />
        <Text style={style.discountListText} >{item?.name}</Text>
      </TouchableOpacity>
    )
  }
  _renderVoucherConditions() {
    return (
      <View>

        <View style={style.voucherOptionsField} >
          {(this.state?.selectedVoucherType != 'Contra' &&
            this.state?.selectedVoucherType != 'Receipt' &&
            this.state?.selectedVoucherType != 'Advance Receipt' &&
            this.state?.selectedVoucherType != ''
          ) && <View
            style={[
              style.cashBankButtonWrapper,
              { marginHorizontal: 20 },
              {
                justifyContent: 'center',
                width: 150,
                height: 40,
                borderColor: this.state.invoiceNumberAgainstVoucher != '' ? '#229F5F' : '#d9d9d9',
              },
            ]}>
              <TextInput
                style={[
                  style.chequeButtonText,
                  {
                    color: this.state.invoiceNumberAgainstVoucher != '' ? '#229F5F' : '#868686',
                  },
                ]}
                autoCapitalize={'characters'}
                value={this.state.invoiceNumberAgainstVoucher.toString()}
                placeholder={'Number'}
                placeholderTextColor={'#868686'}
                returnKeyType={'done'}
                // multiline={true}
                onChangeText={(text) => {

                  this.setState({ invoiceNumberAgainstVoucher: text });

                }}
              />
            </View>}
          {(this.state?.selectedVoucherType == 'Debit Note' ||
            this.state?.selectedVoucherType == 'Credit Note') && <TouchableOpacity
              onPress={() => {
                this.setBottomSheetVisible(this.invoicesRef, true);
              }}
              style={[
                style.sectionButton,
                { borderColor: this.state?.selectedReferenceInvoice?.voucherNumber ? '#229F5F' : '#d9d9d9' },
              ]}
            >
              <Text
                style={[
                  style.cashBankButtonText,
                  {
                    color: this.state?.selectedReferenceInvoice?.voucherNumber ? '#229F5F' : '#868686',
                    fontFamily: this.state?.selectedReferenceInvoice?.voucherNumber ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                  },
                ]}>
                {this.state?.selectedReferenceInvoice?.voucherNumber ? this.state?.selectedReferenceInvoice?.voucherNumber : 'Select Invoice'}
              </Text>
            </TouchableOpacity>}
        </View>
        {(this.state?.selectedVoucherType != 'Contra' &&
          this.state?.selectedVoucherType != ''
        ) &&
          <TouchableOpacity style={style.adjustVoucherView}
            onPress={() => {
              this.handleAdjustVoucher();

            }}
          >
            <CheckBox
              checkBoxColor={'#229F5F'}
              uncheckedCheckBoxColor={'#229F5F'}
              style={{ marginLeft: -4 }}
              onClick={async () => {
                if (this.state?.adjustedAmountOfLinkedInvoices) {
                  this.setState({
                    adjustedAmountOfLinkedInvoices: 0,
                    adjustmentInvoices: [],
                    invoicePageCount: 1,
                    totalInvoicePageCount: 1
                  })
                } else {
                  this.handleAdjustVoucher();
                }
              }}
              isChecked={(this.state.adjustedAmountOfLinkedInvoices != null && this.state.adjustedAmountOfLinkedInvoices != 0) ? true : false}

            />

            <Text style={[style.addressHeaderText, { marginHorizontal: 5 }]}>Adjust {this.state?.selectedVoucherType}</Text>
            {this.state.adjustedAmountOfLinkedInvoices != null && this.state.adjustedAmountOfLinkedInvoices != 0 ? (
              <Text style={[style.fieldHeadingText, { color: '#808080' }]}>
                {'Adjusted Amt.: ' + this.state.currencySymbol + ' ' + this.state.adjustedAmountOfLinkedInvoices}
              </Text>
            ) : null}
          </TouchableOpacity>}
      </View>
    )
  }
  _renderDateView() {

    return (
      <View style={style.dateView}>
        <TouchableOpacity
          style={{ flexDirection: 'row' }}
          onPress={() => {
            if (!this.state.particularAccountStockData) {
              alert('Please select a party.');
            } else {
              this.setState({ showDatePicker: true });
            }
          }}>
          <Icon name={'Calendar'} color={'#229F5F'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2 }}
          onPress={() => {
            if (!this.state.particularAccountStockData) {
              alert('Please select a party.');
            } else {
              this.state.entryDate.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate();
            }
          }}>
          <Text style={{ color: '#808080' }}>
            {this.state.entryDate.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  _renderVariantsAndWarehouse() {
    return (
      <View style={style.sectionMainView} >
        <View style={style.voucherOptionsField} >
          {this.state?.stockLists?.length > 1 && <TouchableOpacity
            onPress={() => {
              this.setBottomSheetVisible(this.variantRef, true);
            }}
            style={[
              style.sectionButton,
              { borderColor: this.state?.selectedStockVariant?.name ? '#229F5F' : '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: this.state?.selectedStockVariant?.name ? '#229F5F' : '#868686',
                  fontFamily: this.state?.selectedStockVariant?.name ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {this.state?.selectedStockVariant?.name ?
                this.state?.selectedStockVariant?.name :
                'Variants'}
            </Text>
          </TouchableOpacity>}
          {(this.state?.particularAccountStockData?.stock != null && this.state?.warehouseList?.length > 1) && <TouchableOpacity
            onPress={() => {
              this.setBottomSheetVisible(this.warehouseRef, true);
            }}
            style={[
              style.sectionButton,
              { borderColor: this.state?.selectedWarehouse?.name ? '#229F5F' : '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: this.state?.selectedWarehouse?.name ? '#229F5F' : '#868686',
                  fontFamily: this.state?.selectedWarehouse?.name ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {this.state?.selectedWarehouse?.name ? this.state?.selectedWarehouse?.name : 'Warehouse'}
            </Text>
          </TouchableOpacity>}
        </View>
      </View>
    )
  }
  _renderStockDetails() {
    return (
      <View style={style.sectionMainView} >

        <View style={{ flexDirection: 'row' }}>
          <Icon name={'path-15'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Stock Details'}</Text>
        </View>
        <View style={style.voucherOptionsField} >
          {<View
            style={[
              style.cashBankButtonWrapper,
              {
                justifyContent: 'center',
                width: 150,
                height: 40,
                marginLeft: 20,
                borderColor: this.state.stockQuantity ? '#229F5F' : '#d9d9d9',
              },
            ]}>
            <TextInput
              style={[
                style.chequeButtonText,
                {
                  color: this.state.stockQuantity ? '#229F5F' : '#868686',
                },
              ]}
              autoCapitalize={'characters'}
              value={this.state.stockQuantity?.toString()}
              placeholder={'Qty'}
              placeholderTextColor={'#868686'}
              returnKeyType={'done'}
              keyboardType='numeric'
              // multiline={true}
              onChangeText={async(text) => {
                if (!this.state.searchAccountName) {
                  alert('Please select an account.');
                } else {
                 await this.setState({ stockQuantity: text });
                 this.updateAmountQty();
                }
              }}
            />
          </View>}
          {<View
            style={[
              style.cashBankButtonWrapper,
              {
                justifyContent: 'center',
                width: 150,
                height: 40,
                marginLeft: 20,
                flexDirection: 'row', alignItems: 'center',
                borderColor: this.state.stockPrice != 0 ? '#229F5F' : '#d9d9d9',
              },
            ]}>
            {this.state.stockPrice != 0 && <Text style={[style.chequeButtonText, { marginHorizontal: 0, color: '#229F5F' }]} >{this.state?.currencySymbol}</Text>}
            <TextInput
              style={[
                style.chequeButtonText,
                {
                  color: this.state.stockPrice != 0 ? '#229F5F' : '#868686',
                },
              ]}
              autoCapitalize={'characters'}
              value={this.state?.stockPrice?.toString()}
              placeholder={'Price'}
              keyboardType='numeric'
              placeholderTextColor={'#868686'}
              returnKeyType={'done'}
              // multiline={true}
              onChangeText={async(text) => {
                if (!this.state.searchAccountName) {
                  alert('Please select an account.');
                } else {
                  await this.setState({ stockPrice: text });
                  this.updateAmountStk();
                }
              }}
            />
          </View>}
        </View>
        {<TouchableOpacity
          onPress={() => {
            this.setBottomSheetVisible(this.stockUnitRef, true);
          }}
          style={[
            style.sectionButton,
            { borderColor: this.state?.selectedStockUnit?.stockUnitCode ? '#229F5F' : '#d9d9d9' },
          ]}
        >
          <Text
            style={[
              style.cashBankButtonText,
              {
                color: this.state?.selectedStockUnit?.stockUnitCode ? '#229F5F' : '#868686',
                fontFamily: this.state?.selectedStockUnit?.stockUnitCode ? FONT_FAMILY.bold : FONT_FAMILY.regular,
              },
            ]}>
            {this.state?.selectedStockUnit?.stockUnitCode ?
              this.state?.selectedStockUnit?.stockUnitCode :
              'Unit'}
          </Text>
        </TouchableOpacity>}
      </View>
    )
  }
  _renderDiscountTaxField() {
    return (
      <View style={style.sectionMainView} >

        <View style={{ flexDirection: 'row' }}>
          <MaterialCommunityIcons name={'brightness-percent'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Discount & Tax'}</Text>
        </View>
        <View style={style.voucherOptionsField} >
          {(this.state?.showDiscountAndTaxPopup) && <TouchableOpacity
            onPress={() => {
              if (this.state?.amountForEntry == 0) {
                alert('Add amount')
              } else {
                this.setBottomSheetVisible(this.discountRef, true);
              }
            }}
            style={[
              style.sectionButton,
              { borderColor: (this.state?.discountTotalValue != 0 || this.state?.selectedDiscounts?.length > 0) ? '#229F5F' : '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: (this.state?.discountTotalValue != 0 || this.state?.selectedDiscounts?.length > 0) ? '#229F5F' : '#868686',
                  fontFamily: (this.state?.discountTotalValue != 0 || this.state?.selectedDiscounts?.length > 0) ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {(this.state?.discountTotalValue != 0 || this.state?.selectedDiscounts?.length > 0) ?
                `${this.state?.currencySymbol} ${this.calculateTotalDiscount()}` :
                'Discount'}
            </Text>
          </TouchableOpacity>}
          {(this.state?.showDiscountAndTaxPopup) && <TouchableOpacity
            onPress={() => {
              if (this.state?.amountForEntry == 0) {
                alert('Add amount')
              } else {
                this.setBottomSheetVisible(this.taxModalRef, true);
              }
            }}
            style={[
              style.sectionButton,
              { borderColor: this.state?.totalTaxAmount != 0 ? '#229F5F' : '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: this.state?.totalTaxAmount != 0 ? '#229F5F' : '#868686',
                  fontFamily: this.state?.totalTaxAmount != 0 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {this.state?.totalTaxAmount != 0 ? `${this.state?.currencySymbol} ${this.state?.totalTaxAmount}` :
                this.state?.reverseCharge ? <Text>Tax (RCM)<Text style={{ color: 'red' }} >*</Text></Text> :
                  'Tax'}
            </Text>
          </TouchableOpacity>}
        </View>
      </View>
    )
  }
  _renderAdvanceTaxField() {
    return (
      <View style={style.sectionMainView} >

        <View style={{ flexDirection: 'row' }}>
          <MaterialCommunityIcons name={'brightness-percent'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Tax on Advance'}</Text>
        </View>
        <View style={style.voucherOptionsField} >
          <View
            style={[
              style.cashBankButtonWrapper,
              { marginHorizontal: 20 },
              {
                justifyContent: 'center',
                width: 150,
                height: 40,
                borderColor: this.state.taxInclusiveAmount != 0 ? '#229F5F' : '#d9d9d9',
              },
            ]}>
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: this.state?.taxInclusiveAmount != 0 ? '#229F5F' : '#868686',
                  fontFamily: this.state?.taxInclusiveAmount != 0 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {this.state?.taxInclusiveAmount != 0 ? `${this.state?.currencySymbol} ${this.state?.taxInclusiveAmount}` :
                <Text>Amount</Text>}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (this.state?.amountForEntry == 0) {
                alert('Add amount')
              } else {
                this.setBottomSheetVisible(this.taxModalRef, true);
              }
            }}
            style={[
              style.sectionButton,
              { borderColor: this.state?.totalTaxAmount != 0 ? '#229F5F' : '#d9d9d9' },
            ]}
          >
            <Text
              style={[
                style.cashBankButtonText,
                {
                  color: this.state?.totalTaxAmount != 0 ? '#229F5F' : '#868686',
                  fontFamily: this.state?.totalTaxAmount != 0 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                },
              ]}>
              {this.state?.totalTaxAmount != 0 ? `${this.state?.currencySymbol} ${this.state?.totalTaxAmount}` :
                <Text>Tax on Advance<Text style={{ color: 'red' }} >{this.state?.reverseCharge ? '*' : null}</Text></Text>}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  _renderVoucherField() {
    return (
      <View style={style.sectionMainView} >
        <View style={style.sectionView} >
          <FontAwesome name={'ticket'} size={16} color={'#229F5F'} />
          <Text style={style.sectionText} >Voucher Type</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            this.setBottomSheetVisible(this.voucherTypesRef, true);
          }}
          style={[
            style.sectionButton,
            { borderColor: this.state?.selectedVoucherType != '' ? '#229F5F' : '#d9d9d9' },
          ]}
        >
          <Text
            style={[
              style.cashBankButtonText,
              {
                color: this.state?.selectedVoucherType != '' ? '#229F5F' : '#868686',
                fontFamily: this.state?.selectedVoucherType != '' ? FONT_FAMILY.bold : FONT_FAMILY.regular,
              },
            ]}>
            {this.state?.selectedVoucherType != '' ? this.state?.selectedVoucherType : 'Select voucher'}
          </Text>
        </TouchableOpacity>
        {this._renderVoucherConditions()}
      </View>
    )
  }
  _renderMoreDetailRow() {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#E6E6E6',
          flexDirection: 'row',
          paddingVertical: 8,
          paddingHorizontal: 16,
          justifyContent: 'space-between',
          marginVertical: 5
        }}
        activeOpacity={0.7}
        onPress={() => {
          this.setState({ showMoreDetails: !this.state.showMoreDetails });
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>More Details</Text>
        </View>
        <Icon
          style={{ transform: [{ rotate: this.state.showMoreDetails ? '180deg' : '0deg' }] }}
          name={'9'}
          size={16}
          color="#808080"
        />
      </TouchableOpacity>
    )
  }
  _renderChequeDetails() {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'path-15'} color={'#229F5F'} size={16} />
          <Text style={style.addressHeaderText}>{'Cheque Details'}</Text>
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={[
                style.cashBankButtonWrapper,
                { marginHorizontal: 20 },
                {
                  justifyContent: 'center',
                  width: 150,
                  height: 40,
                  borderColor: this.state.chequeNumber ? '#229F5F' : '#d9d9d9',
                },
              ]}>
              <TextInput
                style={[
                  style.chequeButtonText,
                  {
                    color: this.state.chequeNumber ? '#229F5F' : '#868686',
                  },
                ]}
                autoCapitalize={'characters'}
                value={this.state.chequeNumber.toString()}
                placeholder={'Cheque #'}
                placeholderTextColor={'#868686'}
                returnKeyType={'done'}
                // multiline={true}
                onChangeText={(text) => {
                  if (!this.state.partyName) {
                    alert('Please select a party.');
                  } else if (this.state.amountForReceipt == '') {
                    alert('Please enter amount.');
                  } else {
                    this.setState({ chequeNumber: text });
                  }
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!this.state.partyName) {
                  alert('Please select a party.');
                } else if (this.state.amountForReceipt == '') {
                  alert('Please enter amount.');
                } else {
                  this.setSelectedButton(4);
                  this.setState({ showClearanceDatePicker: true });

                }
              }}>
              <View
                style={[
                  style.cashBankButtonWrapper,
                  {
                    borderColor: this.state.isClearanceDateSelelected ? '#229F5F' : '#d9d9d9',
                    width: 150,
                    height: 40,
                  },
                ]}>
                {this.state.isClearanceDateSelelected ? (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: '#229F5F',
                      },
                    ]}>
                    {this.formatClearanceDate()}
                  </Text>
                ) : (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: this.state.isClearanceDateSelelected ? '#229F5F' : '#868686',
                        fontFamily: this.state.isClearanceDateSelelected ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                      },
                    ]}>
                    Clearance Date
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {this.state.isClearanceDateSelelected && <TouchableOpacity
              style={{ alignSelf: 'center', }}
              onPress={() => {
                this.setState({
                  chequeClearanceDate: '',
                  isClearanceDateSelelected: false
                })
              }}
            >
              <MaterialIcons name={'delete'} size={16} color={'#808080'} />
            </TouchableOpacity>}
          </View>
        </View>
      </View>
    );
  }
  _renderAssignTagView() {
    return (
      <View style={style.sectionMainView} >
        <View style={style.sectionView} >
          <FontAwesome name={'tag'} size={16} color={'#229F5F'} />
          <Text style={style.sectionText} >Assign Tag</Text>
        </View>
        <View style={style.tagListVeiw} >
          {this.state?.selectedTags?.map(item => {
            return (
              <TouchableOpacity
                style={style.selectedTagButton}
                onPress={() => {
                  this.removeTagFromList(item);
                }} >

                <Text style={style.selectedTagText} >{item}</Text>
                <Ionicons name={'close'} size={16} color={'#1C1C1C'} />
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          onPress={() => {
            this.setBottomSheetVisible(this.assignTagRef, true);
          }}
          style={[
            style.sectionButton,
            { borderColor: this.state.selectedTags?.length > 0 ? '#229F5F' : '#d9d9d9' },
          ]}
        >
          <Text
            style={[
              style.cashBankButtonText,
              {
                color: this.state.selectedTags?.length > 0 ? '#229F5F' : '#868686',
                fontFamily: this.state.selectedTags?.length > 0 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
              },
            ]}>
            {/* {this.state.selectedTag?.name != '' ? this.state?.selectedTag?.name : 'Select Tag'} */}
            Select Tags
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  _renderGenerateVoucher() {
    return (
      <View style={style.checkBoxView}>
        <CheckBox
          checkBoxColor={'#229F5F'}
          uncheckedCheckBoxColor={'#229F5F'}
          disabled={this.state?.selectedVoucherType == 'Advance Receipt' ? true : false}
          style={{ marginLeft: -4 }}
          onClick={async () => {
            this.setState({
              generateVoucher: !this.state.generateVoucher
            })
          }}
          isChecked={this.state.generateVoucher}
        />

        <Text style={[style.checkBoxText, { marginLeft: 5 }]}>Generate Voucher</Text>

      </View>
    )
  }
  _renderReverseCharge() {
    return (
      <View style={style.checkBoxView}>
        <CheckBox
          checkBoxColor={'#229F5F'}
          uncheckedCheckBoxColor={'#229F5F'}
          style={{ marginLeft: -4 }}
          onClick={async () => {
            this.setBottomSheetVisible(this.reverseChargeConfirmation, true);
          }}
          isChecked={this.state.reverseCharge}
        />

        <Text onPress={() => {
          this.setBottomSheetVisible(this.reverseChargeConfirmation, true);
        }} style={[style.checkBoxText, { marginLeft: 5 }]}>Is this transaction applicable for  Reverse Charge?{'\n'}
          <Text style={style.checkBoxSmallText} >(Tax is compulsory)</Text></Text>

      </View>
    )
  }
  _renderTouristSchemeSection() {
    return (
      <View style={style.touristSchemeView} >
        <View style={[style.checkBoxView, { marginHorizontal: 0 }]}>
          <CheckBox
            checkBoxColor={'#229F5F'}
            uncheckedCheckBoxColor={'#229F5F'}
            style={{ marginLeft: -4 }}
            onClick={async () => {
              this.setState({
                touristScheme: !this.state?.touristScheme,
                passPortNumber: ''
              })
            }}
            isChecked={this.state.touristScheme}
          />

          <Text onPress={() => {

          }} style={[style.checkBoxText, { marginLeft: 5 }]}>
            Is this transaction applicable for Tourist Scheme?</Text>

        </View>
        {this.state?.touristScheme && <View
          style={[
            style.cashBankButtonWrapper,
            { marginLeft: 20 },
            {
              justifyContent: 'center',
              width: 150,
              height: 40,
              borderColor: this.state.passPortNumber ? '#229F5F' : '#d9d9d9',
            },
          ]}>
          <TextInput
            style={[
              style.chequeButtonText,
              {
                color: this.state.passPortNumber ? '#229F5F' : '#868686',
              },
            ]}
            autoCapitalize={'characters'}
            value={this.state.passPortNumber}
            placeholder={'Passport Number'}
            placeholderTextColor={'#868686'}
            returnKeyType={'done'}
            // multiline={true}
            onChangeText={(text) => {
              this.setState({ passPortNumber: text });
            }}
          />
        </View>}
      </View>
    )
  }
  _renderDescriptionField() {
    return (
      <TextInput
        multiline={true}
        placeholder='Add Description'
        numberOfLines={5}
        value={this.state.description}
        onChangeText={(text) => {
          this.setState({
            description: text
          })
        }}
        style={{
          marginHorizontal: 16,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#229F5F',
          textAlignVertical: 'top',
          padding: 8,
          maxHeight: 150,
          minHeight: 100
        }}
      />
    );
  }
  _renderAttachmentField() {
    return (
      <View style={style.attchFileView} >
        <TouchableOpacity
          style={style.attachFileButton}
          onPress={() => {
            this.handleUploadAttachment();
          }}
        >
          <Entypo name={'attachment'} size={16} color={'#229F5F'} />
          <Text style={style.attachFileText} >Attach file</Text>
        </TouchableOpacity>
        {this.state?.uploadedAttachment?.name && <View style={style.attachedTextView} >
          <Text style={[style.attachFileText, { marginRight: 5 }]} >
            {this.state?.uploadedAttachment?.name?.substr(0, 20)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.setState({
                uploadedAttachment: {}
              })
            }}
          >
            <MaterialIcons name={'delete'} size={16} color={'#808080'} />
          </TouchableOpacity>
        </View>}
      </View>
    );
  }
  _renderTotalAmountField() {
    return (
      <View style={style.totalAmountView} >
        <Text style={style.totalAmoutText} >Total in {this.state?.selectedAccountData?.currency}</Text>
        <Text style={style.totalAmoutText}>{this.state?.currencySymbol} {formatAmount(this.calculateTotalAmount())}</Text>
      </View>
    )
  }
  _renderSuccessDialogue() {
    return (
      <Dialog.Container
        onRequestClose={() => { this.setState({ successDialog: false }) }}
        visible={this.state.successDialog} onBackdropPress={() => this.setState({ successDialog: false })} contentStyle={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Award />
        <Text style={{ color: '#229F5F', fontSize: 16, fontFamily: 'AvenirLTStd-Book' }}>Success</Text>
        <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center', fontFamily: 'AvenirLTStd-Book' }}>Entry Created Successfully.</Text>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            width: '70%',
            alignSelf: 'center',
            borderRadius: 30,
            backgroundColor: '#229F5F',
            marginTop: 30,
            height: 50, marginBottom: 5
          }}
          onPress={() => {
            this.setState({ successDialog: false });
            this.props.navigation.goBack();
          }}
        >
          <Text style={{ color: 'white', padding: 10, fontSize: 20, textAlignVertical: 'center', fontFamily: 'AvenirLTStd-Book', marginTop: Platform.OS == "ios" ? 5 : 0 }}>Done</Text>
        </TouchableOpacity>
      </Dialog.Container>
    )
  }
  _renderScreenElements() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1, marginVertical: 5 }}>
        {this._renderDateView()}
        {this.state?.shouldShowRCMSection && this._renderReverseCharge()}
        {this.state?.shouldShowTouristSchemeSection && this._renderTouristSchemeSection()}
        {this._renderVariantsAndWarehouse()}
        {this.state?.particularAccountStockData?.stock != null && this._renderStockDetails()}
        {(this.state?.showDiscountAndTaxPopup && this.state?.selectedVoucherType != 'Advance Receipt') && this._renderDiscountTaxField()}
        {(this.state?.selectedVoucherType == 'Advance Receipt') && this._renderAdvanceTaxField()}
        {this._renderMoreDetailRow()}
        {this.state?.showMoreDetails && (
          <>
            {this._renderVoucherField()}
            {this._renderChequeDetails()}
            {this._renderAssignTagView()}
          </>
        )
        }
        {this._renderGenerateVoucher()}
        {this._renderDescriptionField()}
        {this._renderAttachmentField()}
        {this._renderTotalAmountField()}
      </View>
    );
  }
  render() {

    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, backgroundColor: '#ffffff' }}
          // contentContainerStyle={{paddingBottom: height * 0.2,
          // }}
          bounces={true}
        >
          <View style={style.container}>
            {this.FocusAwareStatusBar(this.props.isFocused)}
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderAccountFlow()}
              {this.renderSelectAccountName()}
              {this.renderAmount()}
            </View>
            {this._renderScreenElements()}

          </View>
          {this.state.searchResults?.length > 0 && this._renderSearchList()}
          <Modal
            visible={this.state.loading}
            transparent
            statusBarTranslucent
          >
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <Bars size={15} color={color.PRIMARY_NORMAL} />
            </View>
          </Modal>
          <DateTimePickerModal
            isVisible={this.state.showClearanceDatePicker}
            mode="date"
            onConfirm={this.handleConfirmClearanceDate}
            onCancel={() => {
              this.setState({ showClearanceDatePicker: false });
            }}
          />
          <DateTimePickerModal
            isVisible={this.state.showDatePicker}
            mode="date"
            onConfirm={this.handleConfirm}
            onCancel={this.hideDatePicker}
          />
        </KeyboardAwareScrollView>
        {this._renderAssignTags()}
        {this._renderVoucherTypes()}
        {this._renderInvoicesTypes()}
        {this._renderDiscountOptions()}
        {this._renderTaxModal()}
        {this._renderStockUnitModal()}
        {this._renderVariantModal()}
        {this._renderWarehouseModal()}
        {this._renderReverseChargeConfirmation()}
        {(this.state.particularAccountStockData?.name) && this._renderSaveButton()}
        {/* check for any other condition above*/}
        {this.state?.successDialog && this._renderSuccessDialogue()}
      </KeyboardAvoidingView>
    );
  }
}
function mapStateToProps(state) {
  const { commonReducer } = state;
  return {
    ...commonReducer
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    }
  };
}

function Screen(props) {
  const isFocused = useIsFocused();

  return <AddEntry {...props} isFocused={isFocused} />;
}
const AddEntryScreen = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default AddEntryScreen;
