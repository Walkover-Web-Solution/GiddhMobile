import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Keyboard,
  ActivityIndicator,
  DeviceEventEmitter,
  Animated,
  NativeModules,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
// import style from './style';
import {connect} from 'react-redux';
import { withTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Icon from '@/core/components/custom-icon/custom-icon';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import _, {isInteger} from 'lodash';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {InvoiceService} from '@/core/services/invoice/invoice.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useIsFocused} from '@react-navigation/native';
import style from './style';
import {FONT_FAMILY} from '../../utils/constants';
import CheckBox from 'react-native-check-box';
import routes from '@/navigation/routes';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';
import SalesPersonComponent from '@/components/SalesPersonComponent';
import { CommonService } from '@/core/services/common/common.service';
import Toast from '@/components/Toast';
import OcrDocumentPreviewModal from '@/screens/Scan2/components/OcrDocumentPreviewModal';
import {
  fetchScan2OcrData,
  getOcrMatchedAccount,
  markScan2DocumentComplete,
  handleScan2AwareBack,
  navigateBackToScan2,
  resolveScan2VoucherVersion,
} from '@/screens/Scan2/scan2Ocr.utils';

const {SafeAreaOffsetHelper} = NativeModules;
const INVOICE_TYPE = {
  credit: 'sales',
  cash: 'cash',
  receipt: 'receipt',
  payment: 'payment',
};

const {width, height} = Dimensions.get('window');
export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class Payment extends React.Component {
  // private taxModalRef: React.Ref<BottomSheet>;
  // private calculationModalRef: React.Ref<BottomSheet>;
  // private paymentModalRef: React.Ref<BottomSheet>;
  constructor(props) {
    super(props);
    this.taxModalRef = React.createRef();
    this.calculationModalRef = React.createRef();
    this.paymentModalRef = React.createRef();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.focusRef = React.createRef();
    this.ocrDataBody = null;
    this.ocrFetchPromise = null;
    this.state = {
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,

      partyName: '',
      searchResults: [],
      searchPartyName: '',
      searchTop: height * 0.15,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      clearanceDate: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      showClearanceDatePicker: false,
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      modesArray: [],
      SelectedTaxData: {
        taxType: '',
        taxText: '',
        taxDetailsArray: [],
      },
      fetechingTaxList: false,
      taxArray: [],
      tdsTcsTaxArray: [],
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '₹',
      exchangeRate: 1,
      companyCountryDetails: '',
      selectedInvoice: '',
      allBillingToAddresses: [],
      billFromSameAsShipFrom: true,
      billToSameAsShipTo: false,
      tdsOrTcsArray: [],
      partyType: undefined,
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1,
      showPaymentModePopup: false,
      selectedButton: false,
      modalVisible: false,
      isTaxBoxSelected: false,
      isChecked: false,
      amountForReceipt: '',
      paymentMode: {
        uniqueName: '',
        name: '',
      },
      chequeNumber: '',
      isClearanceDateSelelected: false,
      addDescription: '',
      selectedTax: {
        uniqueName: '',
        taxType: '',
      },
      adjustedAmountOfLinkedInvoices: null,
      navigatingAgain: false,
      checkedTaxName: '',
      allPaymentModes: [],
      radioBtn: 0,
      radio_props: [],
      isSelectAccountButtonSelected: false,
      selectedArrayType: [],
      tdsTcsTaxCalculationMethod: 'OnTaxableAmount',
      taxAmount: 10,
      balanceDetails: {
        totalTaxableAmount: 0,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
      isAmountFieldInFocus: false,
      selectedSalesPerson: undefined,
      ocrEncodedData: null,
      showOcrPreview: false,
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setSelectedSalesPerson = (salesPerson) => {
    this.setState({ selectedSalesPerson: salesPerson });
  }

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? (
      <StatusBar backgroundColor="#1A237E" barStyle={Platform.OS == 'ios' ? 'dark-content' : 'light-content'} />
    ) : null;
  };

  setSelectedButton = (buttonSelect) => {
    this.setState({selectedButton: buttonSelect});
  };

  // Other Taxes Modal
  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  };

  async getAllInvoice() {
    try {
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const page = 1;
      const count = 50;
      const number = '';
      const payload = await {
        accountUniqueName: this.state.partyName.uniqueName,
        voucherType: INVOICE_TYPE.payment,
        number: '',
        voucherBalanceType: "dr",
        page: page,
      };
      const results = await InvoiceService.getInvoicesForReceipt(
        date,
        payload,
        this.state.companyVersionNumber,
        page,
        count,
      );
      if (results.body && results.status == 'success') {
        let allVoucherInvoice = this.state.companyVersionNumber == 1 ? results.body.results : results.body.items;
        this.setState({allVoucherInvoice});
      }
    } catch (e) {
      this.setState({allVoucherInvoice: []});
    }
  }

  async getExchangeRateToINR(currency) {
    try {
      const results = await InvoiceService.getExchangeRate(
        moment().format('DD-MM-YYYY'),
        this.state.companyCountryDetails.currency.code,
        currency,
      );
      if (results.body && results.status == 'success') {
        await this.setState({
          exchangeRate: results.body,
        });
      }
    } catch (e) {}
    return 1;
  }

  async setActiveCompanyCountry() {
    try {
      const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
      const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
      if (results.body && results.status == 'success') {
        await this.setState({
          companyCountryDetails: results.body.country,
        });
      }
    } catch (e) {}
  }

  async createPayment(type) {
    try {
      this.setState({loading: true});
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const page = 1;
      const count = 50;
      const lang = 'en';
      const selectedInvoices = this.state.allVoucherInvoice.filter((item) => {
        return item.isSelect == true;
      });

      const adjustmentsInvoicesPayload = await selectedInvoices.map((item) => {
        return {
          voucherType: item.voucherType,
          subVoucher: null,
          voucherNumber: item.voucherNumber,
          voucherTotal: {
            amountForAccount: parseInt(item.voucherTotal.amountForAccount),
            Company: parseInt(item.voucherTotal.Company),
          },
          uniqueName: item.uniqueName,
          currency: item.currency,
          exchangeRate: item.exchangeRate,
          amount: {
            amountForAccount: parseInt(item.adjustedAmount),
            amountForCompany: parseInt(item.adjustedAmount),
          },
          accountUniqueName: item.accountUniqueName,
          noteVoucherType: item.noteVoucherType,
          voucherBalanceType: null,
          voucherDate: item.voucherDate,
          accountCurrency: item.currency,
          calculatedTaxAmount: 0,
        };
      });

      const payload = await {
        transactions: [
          {
            amount: parseInt(this.state.amountForReceipt),
            particular: this.state.paymentMode.uniqueName,
            ...(this.state.SelectedTaxData.taxDetailsArray?.length > 0 && {
              taxes: await this.state.SelectedTaxData.taxDetailsArray.map((item) => {
                return item.uniqueName;
              }),
            }),
            total: parseInt(this.state.amountForReceipt),
            convertedTotal: (
              Math.round(
                (this.state.balanceDetails.totalTaxableAmount - this.state.balanceDetails.tdsOrTcsTaxAmount) *
                  this.state.exchangeRate *
                  100,
              ) / 100
            ).toFixed(2),
            discount: 0,
            convertedDiscount: 0,
            isStock: false,
            convertedRate: 0,
            convertedAmount: (
              Math.round(parseInt(this.state.amountForReceipt) * this.state.exchangeRate * 100) / 100
            ).toFixed(2),
            isChecked: false,
            showTaxationDiscountBox: false,
            itcAvailable: '',
            advanceReceiptAmount: parseInt(this.state.amountForReceipt),
            showDropdown: false,
            showOtherTax: true,
            type: 'DEBIT',
            discounts: [],
            isInclusiveTax: false,
            shouldShowRcmEntry: false,
            subVoucher: '',
            ...(adjustmentsInvoicesPayload?.length > 0 && {adjustments: adjustmentsInvoicesPayload}),
          },
        ],
        voucherType: 'pay',
        entryDate: moment(this.state.date).format('DD-MM-YYYY'),
        unconfirmedEntry: false,
        attachedFile: '',
        attachedFileName: '',
        tag: null,
        description: this.state.addDescription,
        generateInvoice: true,
        chequeNumber: this.state.chequeNumber,
        chequeClearanceDate:
          this.state.showClearanceDatePicker && moment(this.state.clearanceDate).format('DD-MM-YYYY')
            ? moment(this.state.clearanceDate).format('DD-MM-YYYY')
            : '',
        invoiceNumberAgainstVoucher: '',
        compoundTotal: parseInt(this.state.amountForReceipt),
        convertedCompoundTotal: (
          Math.round(parseInt(this.state.amountForReceipt) * this.state.exchangeRate * 100) / 100
        ).toFixed(2),
        invoicesToBePaid: [],
        tdsTcsTaxesSum: this.state.balanceDetails.tdsOrTcsTaxAmount,
        otherTaxesSum: this.state.balanceDetails.tdsOrTcsTaxAmount,
        exchangeRate: this.state.exchangeRate,
        valuesInAccountCurrency: true,
        selectedCurrencyToDisplay: 0,
        isOtherTaxesApplicable: true,
        salesPersonUniqueName: this.state.selectedSalesPerson?.uniqueName,
        ...(this.state.selectedArrayType?.length > 0 && {
          otherTaxType: this.state.selectedArrayType.filter((item) => {
            if (item == 'tdspay' || item == 'tcspay' || item == 'tdsrc' || item == 'tcsrc') {
              return item;
            }
          })[0],
          tcsCalculationMethod: this.state.tdsTcsTaxCalculationMethod,
        }),
      };

      const results = await InvoiceService.createPayment(
        payload,
        this.state.partyName.uniqueName,
        this.state.companyVersionNumber,
        lang,
      );

      if (type != 'share') {
        this.setState({loading: false});
      }
      if (results.body) {
        const scanParams = this.props.route?.params;
        await markScan2DocumentComplete(scanParams, this.state.companyVersionNumber, {
          ocrType: 'expense',
          voucherType: 'payment',
        });
        alert(this.props.t('payment.paymentCreatedSuccessfully'));
        const partyDetails = this.state.partyDetails;
        const partyName = this.state.partyName;
        this.resetState();
        this.setActiveCompanyCountry();
        this.getAllPaymentModes();
        this.getAllTaxes();
        this.getCompanyVersionNumber();
        DeviceEventEmitter.emit(APP_EVENTS.PaymentCreated, {});
        if (navigateBackToScan2(this.props.navigation, scanParams)) {
          return;
        }
        if (type == 'navigate') {
          this.props.navigation.navigate("Home", {
            screen: routes.Parties,
            params: {
              screen: 'PartiesTransactions',
              initial: false,
              params: {
                item: {
                  name: partyName.name,
                  uniqueName: partyName.uniqueName,
                  country: {code: partyDetails.country.countryCode},
                  mobileNo: partyDetails.mobileNo,
                },
                type: 'Vendors',
              }
            },
          });
        }
      }
    } catch (e) {
      this.setState({allVoucherInvoice: []});
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps?.route?.params?.refetchDataOnNavigation !==
      this.props?.route?.params?.refetchDataOnNavigation
    ) {
      this.handleScan2VoucherRouteRefresh();
    }
  }

  bootstrapScan2OcrFlow = async () => {
    await this.getCompanyVersionNumber();
    await this.initializeScan2OcrFlow();
  };

  handleScan2VoucherRouteRefresh = () => {
    this.clearAll();
    const scanParams = this.props.route?.params;
    if (scanParams?.isFromScan2 && scanParams?.requestId) {
      void this.bootstrapScan2OcrFlow();
    }
  };

  componentDidMount() {
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllPaymentModes();
    this.getCompanyVersionNumber();
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInPurchaseBill, (data) => {});

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      this.getCompanyVersionNumber();
      if (this.state.searchPartyName == '') {
        this.searchCalls();
      }
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry();
      this.getAllTaxes();
      this.getAllPaymentModes();
      this.getCompanyVersionNumber();
    });

    if (Platform.OS == 'ios') {
      // Native Bridge for giving the bottom offset //Our own created
      SafeAreaOffsetHelper.getBottomOffset().then((offset) => {
        const {bottomOffset} = offset;
        this.setState({bottomOffset});
      });
    }

    void this.bootstrapScan2OcrFlow();
  }

  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber);
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      this.setState({companyVersionNumber});
    }
  };

  /*
         Added Keyboard Listner for making view scroll if needed
       */
  keyboardWillShow = (event) => {
    const value = event.endCoordinates.height - this.state.bottomOffset;
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: value,
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardMargin, {
      duration: event.duration,
      toValue: 0,
    }).start();
  };

  renderHeader() {
    return (
      <View style={style.header}>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              handleScan2AwareBack(this.props.navigation, this.props.route?.params);
            }}>
            <Icon name={'Backward-arrow'} size={18} color={'#FFFFFF'} />
          </TouchableOpacity>
          <TouchableOpacity style={style.invoiceTypeButton}>
            <Text style={style.invoiceType}>{this.props.t('payment.payment')}</Text>
          </TouchableOpacity>
        </View>
        {!!this.state.ocrEncodedData && (
          <TouchableOpacity
            style={{marginRight: 16, alignSelf: 'center'}}
            onPress={() => this.setState({showOcrPreview: true})}
          >
            <Text style={{color: '#FFFFFF', fontFamily: 'AvenirLTStd-Book'}}>
              {this.props.t('scan2.preview', {defaultValue: 'Preview'})}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  renderSelectPartyName() {
    return (
      <View
        onLayout={this.onLayout}
        style={{flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 14}}
        onPress={() => {}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Icon name={'Profile'} color={'#084EAD'} style={{margin: 16}} size={16} />
          <TextInput
            placeholderTextColor={'#808080'}
            placeholder={this.props.t('payment.selectPartiesName')}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) => this.setState({searchPartyName: text}, () => this.searchCalls())}
            style={style.searchTextInputStyle}
          />
          <ActivityIndicator color={'#5773FF'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book'}}>{this.props.t('common.clearAll')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y,
    });
  };

  searchCalls = _.debounce(this.searchUser, 200);

  async getAllPaymentModes() {
    try {
      const results = await InvoiceService.getBriefAccount();
      if (results.body && results.status == 'success') {
        this.setState({allPaymentModes: results.body.results});
      }
    } catch (e) {}
  }

  async getAllTaxes() {
    this.setState({fetechingTaxList: true});
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        await new Promise((resolve) => {
          this.setState({taxArray: results.body, fetechingTaxList: false}, resolve);
        });
        this.getTdsTcsTaxes(results?.body);
        return results.body;
      }
    } catch (e) {
      this.setState({fetechingTaxList: false});
    }
    return [];
  }

  getTdsTcsTaxes(taxArray) {
    const taxes = taxArray.filter((item) => {
      return item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tdsrc' || item.taxType == 'tcsrc';
    });
    this.setState({tdsTcsTaxArray: taxes});
    this.setState({tdsOrTcsArray: taxes});
  }

  isTdsOrTcsTaxType(taxType) {
    return (
      taxType === 'tdspay' ||
      taxType === 'tcspay' ||
      taxType === 'tcsrc' ||
      taxType === 'tdsrc'
    );
  }

  getTaxDeatilsForUniqueName(uniqueName) {
    const taxArr = this.state.taxArray || [];
    const name = typeof uniqueName === 'string' ? uniqueName : uniqueName && uniqueName.uniqueName;
    if (!name) {
      return null;
    }
    return taxArr.find((t) => t && t.uniqueName === name) || null;
  }

  /** From a taxes/groupTaxes array (uniqueNames or objects), keep only TDS/TCS-type names. */
  getTdsTcsNamesFromSource(source) {
    if (!Array.isArray(source) || source.length === 0) {
      return [];
    }
    const names = source
      .map((entry) => (typeof entry === 'string' ? entry : entry && entry.uniqueName))
      .filter(Boolean);
    return names.filter((name) => {
      const row = this.getTaxDeatilsForUniqueName(name);
      return row && this.isTdsOrTcsTaxType(row.taxType);
    });
  }

  /**
   * Payment has no stock/item lines. TDS/TCS hierarchy for the party account:
   * account.taxes -> account.groupTaxes -> account default (applicableTaxes difference).
   * First source that has a TDS/TCS wins.
   */
  resolveHierarchicalTdsTcsNames(accountDetails, accountDefaultTaxNames) {
    const sources = [];
    if (accountDetails) {
      sources.push(accountDetails.taxes);
      sources.push(accountDetails.groupTaxes);
    }
    sources.push(
      accountDefaultTaxNames != null ? accountDefaultTaxNames : this.state.defaultAccountTax,
    );
    for (let i = 0; i < sources.length; i++) {
      const tdsTcs = this.getTdsTcsNamesFromSource(sources[i]);
      if (tdsTcs.length > 0) {
        return tdsTcs;
      }
    }
    return [];
  }

  setDefaultAccountTax(tax) {
    const allDefaultTax = [];
    if (tax) {
      for (let j = 0; j < tax.length; j++) {
        const name = typeof tax[j] === 'string' ? tax[j] : tax[j] && tax[j].uniqueName;
        if (name) {
          allDefaultTax.push(name);
        }
      }
    }
    this.setState({defaultAccountTax: allDefaultTax});
    return allDefaultTax;
  }

  /**
   * Apply party TDS/TCS into the selected tax list (same separation as voucher screens).
   * Normal GST taxes are not part of Payment's UI — only TDS/TCS.
   */
  applyPartyTdsTcsTaxes(accountDetails, accountDefaultTaxNames) {
    const tdsTcsNames = this.resolveHierarchicalTdsTcsNames(accountDetails, accountDefaultTaxNames);
    const taxDetailsArray = [];
    const selectedArrayType = [];
    for (let i = 0; i < tdsTcsNames.length; i++) {
      const row = this.getTaxDeatilsForUniqueName(tdsTcsNames[i]);
      if (row && row.taxDetail && row.taxDetail[0] && !selectedArrayType.includes(row.taxType)) {
        // Payment allows only one TDS/TCS family at a time (same mutual-exclusion as the tax picker).
        if (selectedArrayType.length === 0) {
          taxDetailsArray.push(row);
          selectedArrayType.push(row.taxType);
        }
      }
    }
    const SelectedTaxData = {
      ...this.state.SelectedTaxData,
      taxDetailsArray,
    };
    this.setState(
      {
        SelectedTaxData,
        selectedArrayType,
        isChecked: taxDetailsArray.length > 0,
      },
      () => {
        if (Number(this.state.amountForReceipt) > 0) {
          this.calculatedTaxAmounstForReceipt();
        }
      },
    );
  }

  _renderSearchList() {
    return (
      <View style={[style.searchResultContainer, {top: height * 0.15}]}>
        <FlatList
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          data={this.state.searchResults.length == 0 ? [this.props.t('common.resultNotFound')] : this.state.searchResults}
          style={{paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5}}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={{}}
              onFocus={() => this.onChangeText('')}
              onPress={async () => {
                if (item != this.props.t('common.resultNotFound')) {
                  this.setState(
                    {
                      partyName: item,
                      searchResults: [],
                      searchPartyName: item.name,
                      searchError: '',
                      isSearchingParty: false,
                    },
                    async () => {
                      await this.searchAccount();
                      Keyboard.dismiss();
                      this.state.partyName ? this.handleInputFocus() : null;
                      await this.prefillFromOcrData();
                    },
                  );
                } else {
                  this.setState({isSearchingParty: false, searchResults: []});
                }
              }}>
              <Text style={style.searchItemText}>{item.name ? item.name : this.props.t('common.resultNotFound')}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            padding: 10,
            alignItems: 'center',
          }}
          onPress={() =>
            this.setState({
              searchResults: [],
              searchError: '',
              isSearchingParty: false,
            })
          }>
          <AntDesign name="closecircleo" size={15} color={'#424242'} />
        </TouchableOpacity>
      </View>
    );
  }

  async searchUser() {
    this.setState({isSearchingParty: true});
    try {
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrycreditors', false);

      if (results.body && results.body.results) {
        this.setState({searchResults: results.body.results, isSearchingParty: false, searchError: ''});
      }
    } catch (e) {
      this.setState({searchResults: [], searchError: 'No Results', isSearchingParty: false});
    }
  }

  applyOcrBodyToState = async (body) => {
    const encodedData = body?.encodedData ?? body?.encodedFile ?? null;
    const amount =
      body?.voucherTotal?.amountForAccount ??
      body?.entries?.[0]?.voucherTotal?.amountForAccount ??
      body?.entries?.[0]?.transactions?.[0]?.amount ??
      '';

    this.setState({
      ocrEncodedData: encodedData,
      date: body?.date ? moment(body.date, 'DD-MM-YYYY') : this.state.date,
      amountForReceipt:
        amount !== '' && amount != null
          ? String(Math.round(Number(amount)))
          : this.state.amountForReceipt,
      amountPaidNowText:
        amount !== '' && amount != null ? Number(amount) : this.state.amountPaidNowText,
    });
  };

  loadScan2OcrBody = async () => {
    if (this.ocrDataBody) {
      return this.ocrDataBody;
    }
    if (this.ocrFetchPromise) {
      return this.ocrFetchPromise;
    }

    this.ocrFetchPromise = (async () => {
      const scanParams = this.props.route?.params;
      if (!scanParams?.isFromScan2 || !scanParams?.requestId) {
        return null;
      }

      try {
        const voucherVersion = await resolveScan2VoucherVersion(
          this.state.companyVersionNumber,
          () => AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber)
        );

        const response = await fetchScan2OcrData(scanParams, voucherVersion, {
          ocrType: 'expense',
          voucherType: 'payment',
        });

        if (response?.status !== 'success' || !response?.body) {
          Toast({
            message: response?.message ?? 'Unable to load OCR data',
            duration: 'LONG',
            position: 'BOTTOM',
          });
          return null;
        }

        this.ocrDataBody = response.body;
        return this.ocrDataBody;
      } catch (e) {
        console.warn('----- Error fetching Scan2 OCR data ------', e);
        Toast({
          message: e?.data?.message ?? e?.message ?? 'Unable to load OCR data',
          duration: 'LONG',
          position: 'BOTTOM',
        });
        return null;
      }
    })();

    try {
      return await this.ocrFetchPromise;
    } finally {
      this.ocrFetchPromise = null;
    }
  };

  initializeScan2OcrFlow = async () => {
    const scanParams = this.props.route?.params;
    if (!scanParams?.isFromScan2 || !scanParams?.requestId) {
      return;
    }

    this.setState({loading: true});
    try {
      const body = await this.loadScan2OcrBody();
      if (!body) {
        return;
      }

      const matched = getOcrMatchedAccount(body);
      if (matched) {
        await new Promise((resolve) => {
          this.setState({partyName: matched, searchPartyName: matched.name}, () => resolve());
        });
        const partyDetails = await this.searchAccount();
        if (!partyDetails) {
          await this.setState({
            partyName: '',
            searchPartyName: '',
          });
          Toast({
            message: 'Unable to load matched party. Please select an account.',
            duration: 'LONG',
            position: 'BOTTOM',
          });
          return;
        }
        await this.applyOcrBodyToState(body);
        this.state.partyName ? this.handleInputFocus() : null;
      } else {
        this.setState({searchPartyName: ''});
      }
    } catch (e) {
      console.warn('----- Error in Scan2 OCR init ------', e);
      Toast({
        message: e?.data?.message ?? e?.message ?? 'Error loading OCR data',
        duration: 'LONG',
        position: 'BOTTOM',
      });
    } finally {
      this.setState({loading: false});
    }
  };

  /**
   * Scan2 OCR create flow only: after account selection, fetch OCR voucher data and prefill.
   */
  prefillFromOcrData = async () => {
    const scanParams = this.props.route?.params;
    if (!scanParams?.isFromScan2 || !scanParams?.requestId) {
      return;
    }

    try {
      const body = await this.loadScan2OcrBody();
      if (!body) {
        return;
      }
      await this.applyOcrBodyToState(body);
    } catch (e) {
      console.warn('----- Error in OCR Prefill ------', e);
      Toast({
        message: e?.data?.message ?? e?.message ?? 'Error loading OCR data',
        duration: 'LONG',
        position: 'BOTTOM',
      });
    }
  };

  async searchAccount() {
    this.setState({isSearchingParty: true});
    try {
      const uniqueName = this.state.partyName?.uniqueName;
      if (!uniqueName) {
        this.setState({isSearchingParty: false});
        return null;
      }
      const results = await InvoiceService.getAccountDetails(uniqueName);
      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        this.getAllInvoice();
        const applicableTaxes = results.body.applicableTaxes ? results.body.applicableTaxes : [];
        const otherApplicableTaxes = results.body.otherApplicableTaxes
          ? results.body.otherApplicableTaxes
          : [];
        let taxesToApply;
        if (applicableTaxes.length === otherApplicableTaxes.length) {
          taxesToApply = applicableTaxes;
        } else {
          const otherTaxUniqueNames = otherApplicableTaxes.map((tax) => tax.uniqueName);
          taxesToApply = applicableTaxes.filter(
            (tax) => !otherTaxUniqueNames.includes(tax.uniqueName),
          );
        }

        // Ensure company tax list is loaded before resolving TDS/TCS rows.
        if (!this.state.taxArray || this.state.taxArray.length === 0) {
          await this.getAllTaxes();
        }

        const accountDefaultTaxNames = this.setDefaultAccountTax(taxesToApply);
        await new Promise((resolve) => {
          this.setState(
            {
              defaultAccountTax: accountDefaultTaxNames,
              partyDetails: results.body,
              isSearchingParty: false,
              searchError: '',
              countryDeatils: results.body.country,
              currency: results.body.currency,
              currencySymbol: results.body.currencySymbol,
              selectedSalesPerson: results.body.salesPerson ? results.body.salesPerson : undefined,
              // Clear previous party's tax selection before applying the new hierarchy.
              SelectedTaxData: {
                ...this.state.SelectedTaxData,
                taxDetailsArray: [],
              },
              selectedArrayType: [],
              isChecked: false,
            },
            resolve,
          );
        });

        this.applyPartyTdsTcsTaxes(results.body, accountDefaultTaxNames);
        return results.body;
      }
    } catch (e) {
      this.setState({searchResults: [], searchError: 'No Results', isSearchingParty: false});
    }
    return null;
  }

  resetState = () => {
    this.ocrDataBody = null;
    this.ocrFetchPromise = null;
    this.setState({
      loading: false,
      invoiceType: INVOICE_TYPE.credit,
      bottomOffset: 0,

      partyName: '',
      searchResults: [],
      searchPartyName: '',
      searchTop: height * 0.15,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      clearanceDate: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      showClearanceDatePicker: false,
      BillToAddress: {},
      BillFromAddress: {},
      shipToAddress: {},
      shipFromAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      tempAmountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      // selectedArrayType: [],
      fetechingWarehouseList: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      tempSelectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      modesArray: [],
      SelectedTaxData: {
        quantityText: '',
        rateText: '',
        unitText: '',
        amountText: '',
        discountValueText: '',
        discountPercentageText: '',
        discountType: '',
        taxType: '',
        taxText: '',
        warehouse: '',
        total: 0,
        taxDetailsArray: [],
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      tdsTcsTaxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null,
      },
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '₹ ',
      exchangeRate: 1,
      companyCountryDetails: '',
      selectedInvoice: '',
      tdsOrTcsArray: [],
      partyType: undefined,
      companyVersionNumber: 1,
      showPaymentModePopup: false,
      selectedButton: false,
      modalVisible: false,
      isTaxBoxSelected: false,
      isChecked: false,
      amountForReceipt: '',
      paymentMode: {
        uniqueName: '',
        name: '',
      },
      chequeNumber: '',
      isClearanceDateSelelected: false,
      addDescription: '',
      selectedTax: {
        uniqueName: '',
        taxType: '',
      },
      adjustedAmountOfLinkedInvoices: null,
      navigatingAgain: false,
      checkedTaxName: '',
      allPaymentModes: [],
      isSelectAccountButtonSelected: false,
      selectedArrayType: [],
      defaultAccountTax: [],
      tdsTcsTaxCalculationMethod: 'OnTaxableAmount',
      balanceDetails: {
        totalTaxableAmount: 0,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
      selectedSalesPerson: undefined,
      ocrEncodedData: null,
      showOcrPreview: false,
    });
  };

  clearAll = () => {
    this.resetState();
    this.resetOnUncheckTax();
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllPaymentModes();
    this.getCompanyVersionNumber();
  };

  _renderTaxCalculationMethodModal() {
    return (
      <BottomSheet
        bottomSheetRef={this.calculationModalRef}
        headerText={this.props.t('payment.calculationMethod')}
        headerTextColor='#084EAD'
      >
        <TouchableOpacity
          onFocus={() => this.onChangeText('')}
          style={{
            paddingHorizontal: 20,
            marginHorizontal: 2,
            borderRadius: 10,
            marginTop: 10,
          }}
          onPress={async () => {
            await this.setState({tdsTcsTaxCalculationMethod: 'OnTaxableAmount'});
            await this.calculatedTaxAmounstForReceipt();
            this.setBottomSheetVisible(this.calculationModalRef, false);
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
            {this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount' ? (
              <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
            ) : (
              <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
            )}
            <Text
              style={{
                color: '#1C1C1C',
                paddingVertical: 4,
                fontSize: 14,
                textAlign: 'center',
                marginLeft: 10,
                fontFamily: FONT_FAMILY.semibold,
              }}>
              {this.props.t('payment.onTaxableValue')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onFocus={() => this.onChangeText('')}
          style={{
            paddingHorizontal: 20,
            marginHorizontal: 2,
            borderRadius: 10,
            marginBottom: 10,
          }}
          onPress={async () => {
            await this.setState({tdsTcsTaxCalculationMethod: 'OnTotalAmount'});
            await this.calculatedTaxAmounstForReceipt();
            this.setBottomSheetVisible(this.calculationModalRef, false);
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
            {this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount' ? (
              <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
            ) : (
              <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
            )}
            <Text
              style={{
                color: '#1C1C1C',
                paddingVertical: 4,
                fontSize: 14,
                textAlign: 'center',
                marginLeft: 10,
                fontFamily: FONT_FAMILY.semibold,
              }}>
              {this.props.t('payment.onTotalValue')}
            </Text>
          </View>
        </TouchableOpacity>
      </BottomSheet>
    );
  }

  _renderTax() {
    return (
      <BottomSheet
        bottomSheetRef={this.taxModalRef}
        headerText={this.props.t('payment.selectTaxes')}
        headerTextColor='#084EAD'
        onClose={() => {
          if(this.state.SelectedTaxData.taxDetailsArray.length == 0){
            this.setState({ isChecked: false });
            this.resetOnUncheckTax();
          }
        }}
        flatListProps={{
          data: this.state.tdsTcsTaxArray,
          renderItem: ({item}) => {
            const selectedTaxArray = this.state.SelectedTaxData.taxDetailsArray;
            const selectedTaxTypeArr = [...this.state.selectedArrayType];
            const filtered = _.filter(selectedTaxArray, function (o) {
              if (o.uniqueName == item.uniqueName) {
                return o;
              }
            });
            return (
              <TouchableOpacity
                style={{paddingHorizontal: 20}}
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
                    return;
                  }

                  const currentlySelected = _.filter(selectedTaxArray, function (o) {
                    return o.uniqueName == item.uniqueName;
                  });
                  const isSelecting = currentlySelected.length === 0;
                  let nextTaxDetailsArray;
                  let nextSelectedArrayType;
                  let openCalculationModal = false;

                  if (isSelecting) {
                    nextTaxDetailsArray = [...selectedTaxArray, item];
                    nextSelectedArrayType = [...selectedTaxTypeArr, item.taxType];
                    openCalculationModal = this.isTdsOrTcsTaxType(item.taxType);
                  } else {
                    nextTaxDetailsArray = _.filter(selectedTaxArray, function (o) {
                      return o.uniqueName !== item.uniqueName;
                    });
                    nextSelectedArrayType = _.filter(selectedTaxTypeArr, function (o) {
                      return o !== item.taxType;
                    });
                  }

                  // Commit both arrays first, then recalculate from the updated state.
                  await new Promise((resolve) => {
                    this.setState(
                      {
                        SelectedTaxData: {
                          ...this.state.SelectedTaxData,
                          taxDetailsArray: nextTaxDetailsArray,
                        },
                        selectedArrayType: nextSelectedArrayType,
                        isChecked: nextTaxDetailsArray.length > 0,
                      },
                      resolve,
                    );
                  });

                  if (nextTaxDetailsArray.length === 0) {
                    this.resetOnUncheckTax();
                  } else {
                    this.calculatedTaxAmounstForReceipt();
                  }

                  if (openCalculationModal) {
                    this.setBottomSheetVisible(this.calculationModalRef, true);
                  }
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
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
              <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
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
                  {this.props.t('payment.noTaxesAvailable')}
                </Text>
              </View>
            );
          }
        }}
      />
    );
  }

  handleInputFocus() {
    this.focusRef.current.focus();
  }

  renderAmount() {
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={{paddingVertical: Platform.OS == 'ios'? 10 : 0, paddingHorizontal: 15, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={[style.invoiceAmountText, {textAlignVertical: 'center', fontSize: 18}]}>
            {this.state.currencySymbol}
          </Text>
          <TextInput
            style={[style.invoiceAmountText, {marginRight: 10, flex: 1}]}
            keyboardType="phone-pad"
            placeholder={'0.00'}
            placeholderTextColor={this.state.isAmountFieldInFocus ? '#808080' : '#1C1C1C'}
            value={this.state.amountForReceipt}
            ref={this.focusRef}
            onFocus={() => {
              this.setState({
                isAmountFieldInFocus: true,
              });
            }}
            onBlur={() => {
              this.setState({
                isAmountFieldInFocus:
                  this.state.amountForReceipt != 0 || this.state.amountForReceipt != '' ? true : false,
              });
            }}
            onChangeText={(text) => {
              if (!this.state.partyName) {
                alert(this.props.t('payment.pleaseSelectParty'));
              } else {
                const amountText = text.replace(/[^0-9]/g, '');
                // Pass amountText into calc — await setState does not wait for commit,
                // so reading this.state.amountForReceipt here would be one keystroke behind.
                this.setState(
                  {
                    amountForReceipt: amountText,
                    amountPaidNowText: amountText,
                  },
                  () => {
                    this.calculatedTaxAmounstForReceipt(amountText);
                  },
                );
              }
            }}></TextInput>
        </View>
      </View>
    );
  }

  getSelectedDateDisplay() {}
  getYesterdayDate() {
    this.setState({date: moment().subtract(1, 'days')});
  }

  getTodayDate() {
    this.setState({date: moment()});
  }

  formatDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.date;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return this.props.t('common.today');
    } else if (diffYears === 0 && diffDays === 1) {
      return this.props.t('common.yesterday');
    } else if (diffYears === 0 && diffDays === -1) {
      return this.props.t('common.tomorrow');
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    }
  }
  formatClearanceDate() {
    const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const someDateTimeStamp = this.state.clearanceDate;
    var dt = (dt = new Date(someDateTimeStamp));
    const date = dt.getDate();
    const month = months[dt.getMonth()];
    const timeDiff = someDateTimeStamp - Date.now();
    const diffDays = new Date().getDate() - date;
    const diffYears = new Date().getFullYear() - dt.getFullYear();

    if (diffYears === 0 && diffDays === 0) {
      return this.props.t('common.today');
    } else if (diffYears === 0 && diffDays === 1) {
      return this.props.t('common.yesterday');
    } else if (diffYears === 0 && diffDays === -1) {
      return this.props.t('common.tomorrow');
    } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
    } else if (diffYears >= 1) {
      return month + ' ' + date + ', ' + new Date(someDateTimeStamp).getFullYear();
    } else {
      return month + ' ' + date;
    }
  }

  hideDatePicker = () => {
    this.setState({showDatePicker: false});
  };
  hideClearanceDatePicker = () => {
    this.setState({showClearanceDatePicker: false});
  };

  handleConfirm = (date) => {
    this.setState({date: moment(date)});
    this.hideDatePicker();
  };

  handleConfirmClearanceDate = (date) => {
    this.setState({clearanceDate: moment(date)});
    this.hideClearanceDatePicker();
  };

  _renderDateView() {
    const {date, displayedDate} = this.state;

    return (
      <View style={style.dateView}>
        <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => {
            if (!this.state.partyName) {
              alert(this.props.t('payment.pleaseSelectParty'));
            } else {
              this.setState({showDatePicker: true});
            }
          }}>
          <Icon name={'Calendar'} color={'#084EAD'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{borderColor: '#D9D9D9', borderWidth: 1, paddingHorizontal: 4, paddingVertical: 2}}
          onPress={() => {
            if (!this.state.partyName) {
              alert(this.props.t('payment.pleaseSelectParty'));
            } else {
              this.state.date.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate();
            }
          }}>
          <Text style={{color: '#808080'}}>
            {this.state.date.startOf('day').isSame(moment().startOf('day')) ? this.props.t('common.yesterdayQ') : this.props.t('common.todayQ')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderAccountsPopUp() {
    return (
      <BottomSheet
        bottomSheetRef={this.paymentModalRef}
        headerText={this.props.t('payment.selectAccount')}
        headerTextColor='#084EAD'
        flatListProps={{
          data: this.state.allPaymentModes,
          style: {paddingVertical: 10},
          renderItem: ({item}) => {
            return (
              <TouchableOpacity
                onFocus={() => this.onChangeText('')}
                style={{
                  paddingHorizontal: 20,
                  marginHorizontal: 2,
                  borderRadius: 10,
                }}
                onPress={async () => {
                  await this.setState({
                    paymentMode: {
                      uniqueName: item.uniqueName,
                      name: item.name,
                    },
                  });
                  this.setBottomSheetVisible(this.paymentModalRef, false);
                  await this.setState({
                    isSelectAccountButtonSelected: this.state.paymentMode.uniqueName != '' ? true : false,
                  });
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 8}}>
                  {this.state.paymentMode.uniqueName == item.uniqueName ? (
                    <Icon name={'radio-checked2'} color={'#084EAD'} size={16} />
                  ) : (
                    <Icon name={'radio-unchecked'} color={'#084EAD'} size={16} />
                  )}
                  <Text
                    style={{
                      color: '#1C1C1C',
                      paddingVertical: 4,
                      fontSize: 14,
                      textAlign: 'center',
                      marginLeft: 10,
                      fontFamily: FONT_FAMILY.bold,
                    }}>
                    {item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }
        }}
      />
    );
  }

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'Path-12190'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{this.props.t('payment.paymentMode')}</Text>
        </View>

        <View style={{paddingVertical: 6, marginTop: 10}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{flexDirection: 'row'}}
              onPress={() => {
                if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
                  this.setBottomSheetVisible(this.paymentModalRef, true);
                } else {
                  alert(this.props.t('payment.pleaseSelectParty'));
                }
              }}
              textColor={{color}}>
              <View
                style={[
                  style.cashBankButtonWrapper,
                  {marginLeft: 20},
                  {borderColor: this.state.isSelectAccountButtonSelected ? '#084EAD' : '#d9d9d9'},
                ]}>
                <Text
                  style={[
                    style.cashBankButtonText,
                    {
                      color: this.state.isSelectAccountButtonSelected ? '#084EAD' : '#868686',
                    },
                  ]}>
                  {this.state.isSelectAccountButtonSelected ? this.state.paymentMode.name : this.props.t('payment.selectAccount')}
                </Text>
              </View>
              {this.state.isSelectAccountButtonSelected ? (
                <Entypo name="edit" size={16} color={'#084EAD'} style={{alignSelf: 'center'}} />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  _renderTaxes() {
    return (
      <TouchableOpacity
        style={[style.senderAddress]}
        onPress={async () => {
          if (!this.state.partyName) {
            alert(this.props.t('payment.pleaseSelectParty'));
          } else if (this.state.amountForReceipt == '') {
            alert(this.props.t('payment.pleaseEnterAmount'));
          } else {
            this.setBottomSheetVisible(this.taxModalRef, true);
            await this.setState({
              isChecked: true
            });
          }
        }}>
        <View style={{flexDirection: 'row'}}>
          <CheckBox
            checkBoxColor={'#084EAD'}
            uncheckedCheckBoxColor={'#084EAD'}
            style={{marginLeft: -4}}
            onClick={async () => {
              if (!this.state.partyName) {
                alert(this.props.t('payment.pleaseSelectParty'));
              } else if (this.state.amountForReceipt == '') {
                alert(this.props.t('payment.pleaseEnterAmount'));
              } else {
                this.setBottomSheetVisible(this.taxModalRef, true);
                await this.setState({
                  isChecked: true
                });
              }
            }}
            isChecked={this.state.isChecked}
          />
          {this.state.SelectedTaxData.taxDetailsArray.length > 0 ? (
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <Text style={[style.addressHeaderText, {marginLeft: 5}]}>{this.props.t('payment.tax')} </Text>
                <Text style={[style.addressHeaderText, {marginLeft: 5, color: '#084EADBF'}]}>
                  {`(${this.state.SelectedTaxData.taxDetailsArray.map((item) => ` ${item.name}`)} )`}{' '}
                </Text>
              </View>
              <View style={{alignSelf: 'center', justifyContent: 'flex-end'}}>
                <Entypo name="edit" size={16} color={'#084EAD'} style={{paddingRight: 10}} />
              </View>
            </View>
          ) : (
            <Text style={[style.addressHeaderText, {marginLeft: 5}]}>{this.props.t('payment.tax')}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Cheque Details View
  _renderChequeDetails() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'path-15'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{this.props.t('payment.chequeDetails')}</Text>
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={[
                style.cashBankButtonWrapper,
                {marginHorizontal: 20},
                {
                  justifyContent: 'center',
                  width: 150,
                  height: 40,
                  borderColor: this.state.chequeNumber ? '#084EAD' : '#d9d9d9',
                },
              ]}>
              <TextInput
                style={[
                  style.chequeButtonText,
                  {
                    color: this.state.chequeNumber ? '#084EAD' : '#868686',
                  },
                ]}
                autoCapitalize={'characters'}
                value={this.state.chequeNumber.toString()}
                placeholder={this.props.t('payment.chequeNo')}
                placeholderTextColor={'#868686'}
                returnKeyType={'done'}
                multiline={true}
                // onFocus={() => {
                //   if (!this.state.partyName) {
                //     alert('Please select a party.');
                //   } else if (this.state.amountForReceipt == '') {
                //     alert('Please enter amount.');
                //   } else {
                //   }
                // }}
                onChangeText={(text) => {
                  if (!this.state.partyName) {
                    alert(this.props.t('payment.pleaseSelectParty'));
                  } else if (this.state.amountForReceipt == '') {
                    alert(this.props.t('payment.pleaseEnterAmount'));
                  } else {
                    this.setState({chequeNumber: text});
                  }
                }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!this.state.partyName) {
                  alert(this.props.t('payment.pleaseSelectParty'));
                } else if (this.state.amountForReceipt == '') {
                  alert(this.props.t('payment.pleaseEnterAmount'));
                } else {
                  this.setSelectedButton(4);
                  this.setState({showClearanceDatePicker: true});
                  this.setState({isClearanceDateSelelected: true});
                }
              }}>
              <View
                style={[
                  style.cashBankButtonWrapper,
                  {borderColor: this.state.selectedButton == 4 ? '#084EAD' : '#d9d9d9'},
                ]}>
                {this.state.isClearanceDateSelelected ? (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: this.state.selectedButton == 4 ? '#084EAD' : '#868686',
                      },
                    ]}>
                    {this.formatClearanceDate()}
                  </Text>
                ) : (
                  <Text
                    style={[
                      style.cashBankButtonText,
                      {
                        color: this.state.selectedButton == 4 ? '#084EAD' : '#868686',
                        fontFamily: this.state.selectedButton == 4 ? FONT_FAMILY.bold : FONT_FAMILY.regular,
                      },
                    ]}>
                    {this.props.t('payment.clearanceDate')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Link Invoice View
  _renderLinkIvoice() {
    return (
      <TouchableOpacity
        style={[style.senderAddress, {flexDirection: 'row'}]}
        onPress={() => {
          if (!this.state.partyName) {
            alert(this.props.t('payment.pleaseSelectParty'));
          } else if (!this.state.amountForReceipt) {
            alert(this.props.t('payment.pleaseEnterAmount'));
          } else {
            this.props.navigation.navigate('PaymentLinkToInvice', {
              getLinkedInvoicesAdjustedAmount: this.getLinkedInvoicesAdjustedAmount.bind(this),
              navigatingAgain: this.state.navigatingAgain,
              partyName: this.state.searchPartyName,
              currencySymbol: this.state.currencySymbol,
              partyAmount: this.state.amountPaidNowText,
              realVoucherInvoice: this.state.allVoucherInvoice,
            });
          }
        }}>
        <View style={{flexDirection: 'row', flex: 1, padding: 10, marginLeft: -2.5, paddingLeft: 0}}>
          <View style={{flexDirection: 'row'}}>
            <Entypo name="link" size={21} color={'#084EAD'} />
            <Text style={[style.addressHeaderText, {marginLeft: 7}]}>{this.props.t('payment.linkInvoice')}</Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            {this.state.adjustedAmountOfLinkedInvoices != null && this.state.adjustedAmountOfLinkedInvoices != 0 ? (
              <Text style={[style.addressHeaderText, {color: '#808080'}]}>
                {this.props.t('payment.adjustedAmt') + ': ' + this.state.currencySymbol + ' ' + this.state.adjustedAmountOfLinkedInvoices}
              </Text>
            ) : null}
          </View>
          <AntDesign name={'right'} size={18} color={'#808080'} />
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}></View>
        </View>
      </TouchableOpacity>
    );
  }

  // Add Description View
  _renderAddDescription() {
    return (
      <View style={style.senderAddress}>
        <View style={{flexDirection: 'row'}}>
          <Icon name={'path-15'} color={'#084EAD'} size={16} />
          <Text style={style.addressHeaderText}>{this.props.t('payment.addDescription')}</Text>
        </View>
        <View style={{paddingVertical: 6, marginTop: 10, justifyContent: 'space-between'}}>
          <TextInput
            style={{marginLeft: 20, margin: 10, borderBottomColor: '#808080', borderBottomWidth: 1.5}}
            value={this.state.addDescription}
            placeholder={this.props.t('payment.noteOptional')}
            onChangeText={(text) => {
              this.setState({addDescription: text});
            }}></TextInput>
        </View>
      </View>
    );
  }

  _renderSaveButton() {
    return (
      <TouchableOpacity
        style={{flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60}}
        onPress={async () => {
          await this.genrateInvoice('navigate');
        }}>
        <Icon name={'path-18'} size={48} color={'#084EAD'} />
      </TouchableOpacity>
    );
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false,
    });
  };
  getLinkedInvoicesAdjustedAmount = async (adjustedAmount, allVoucherInvoice) => {
    this.setState({adjustedAmountOfLinkedInvoices: adjustedAmount});
    this.setState({allVoucherInvoice: allVoucherInvoice});
    this.setState({navigatingAgain: true});
  };

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin}}
      />
    );
  }

  resetOnUncheckTax() {
    this.setState({
      balanceDetails: {
        totalTaxableAmount: this.state.amountForReceipt,
        mainTaxAmount: 0,
        tdsOrTcsTaxAmount: 0,
      },
    });
  }

  calculatedTaxAmounstForReceipt(amountOverride) {
    const receiptAmount = Number(
      amountOverride !== undefined && amountOverride !== null
        ? amountOverride
        : this.state.amountForReceipt,
    );
    const taxDetailsArray = this.state.SelectedTaxData?.taxDetailsArray || [];
    let mainTaxPercentage = 0;

    taxDetailsArray.forEach((item) => {
      if (item?.taxDetail?.[0] && !this.isTdsOrTcsTaxType(item.taxType)) {
        mainTaxPercentage = mainTaxPercentage + item.taxDetail[0].taxValue;
      }
    });

    const tdsTcsFromDetails = taxDetailsArray
      .filter((item) => item?.taxDetail?.[0] && this.isTdsOrTcsTaxType(item.taxType))
      .map((item) => ({taxValue: item.taxDetail[0].taxValue, taxType: item.taxType}));
    const SelectedTdsOrTcsTaxDetails =
      tdsTcsFromDetails.length > 0 ? tdsTcsFromDetails : [{taxValue: 0, taxType: 'tdspay'}];

    let totalTaxableAmount = 0;

    if (SelectedTdsOrTcsTaxDetails[0].taxValue != 0) {
      if (this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount') {
        if (SelectedTdsOrTcsTaxDetails[0].taxType == 'tdspay' || SelectedTdsOrTcsTaxDetails[0].taxType == 'tdsrc') {
          const tdsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(receiptAmount / (1 + (mainTaxPercentage - tdsTaxRate) / 100));
        } else if (
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcspay' ||
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcsrc'
        ) {
          const tcsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(receiptAmount / (1 + (mainTaxPercentage + tcsTaxRate) / 100));
          console.log('tcsTaxRate', receiptAmount);//todo
        }
      } else if (this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount') {
        if (SelectedTdsOrTcsTaxDetails[0].taxType == 'tdspay' || SelectedTdsOrTcsTaxDetails[0].taxType == 'tdsrc') {
          const tdsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(((receiptAmount / (100 - tdsTaxRate)) * 100) / (100 + mainTaxPercentage)) * 100;
        } else if (
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcspay' ||
          SelectedTdsOrTcsTaxDetails[0].taxType == 'tcsrc'
        ) {
          const tcsTaxRate = SelectedTdsOrTcsTaxDetails[0].taxValue;
          totalTaxableAmount = Number(((receiptAmount / (100 + tcsTaxRate)) * 100) / (100 + mainTaxPercentage)) * 100;
          console.log('tcsTaxRate', receiptAmount);//todo
        }
      }
    } else {
      totalTaxableAmount = Number(receiptAmount / (1 + mainTaxPercentage / 100));
    }

    let mainTaxAmount = 0;
    if (mainTaxPercentage != 0) {
      mainTaxAmount = Number((totalTaxableAmount * mainTaxPercentage) / 100);
    }

    let tdsOrTcsTaxAmount = 0;
    if (SelectedTdsOrTcsTaxDetails[0].taxValue != 0) {
      if (this.state.tdsTcsTaxCalculationMethod == 'OnTaxableAmount') {
        tdsOrTcsTaxAmount = Number((totalTaxableAmount * SelectedTdsOrTcsTaxDetails[0].taxValue) / 100);
      } else if (this.state.tdsTcsTaxCalculationMethod == 'OnTotalAmount') {
        tdsOrTcsTaxAmount = Number(
          ((totalTaxableAmount + mainTaxAmount) * SelectedTdsOrTcsTaxDetails[0].taxValue) / 100,
        );
      }
    }

    function roundToTwo(num) {
      return +(Math.round(num + 'e+2') + 'e-2');
    }

    const fallbackAmount =
      amountOverride !== undefined && amountOverride !== null
        ? amountOverride
        : this.state.amountForReceipt;

    this.setState({
      balanceDetails: {
        totalTaxableAmount: totalTaxableAmount != 0 ? roundToTwo(totalTaxableAmount) : fallbackAmount,
        mainTaxAmount: mainTaxAmount != 0 ? roundToTwo(mainTaxAmount) : 0,
        tdsOrTcsTaxAmount: SelectedTdsOrTcsTaxDetails[0].taxValue != 0 ? roundToTwo(tdsOrTcsTaxAmount) : 0,
      },
    });
  }

  // Balance Dropdown View
  _renderTotalAmount() {
    return (
      <View>
        <View
          style={{
            backgroundColor: '#E6E6E6',
            flexDirection: 'row',
            paddingVertical: 9,
            paddingHorizontal: 16,
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row'}}>
            <Icon style={{marginRight: 10}} name={'Path-12190'} size={16} color="#084EAD" />
            <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.balance')}</Text>
          </View>
          <Icon
            style={{transform: [{rotate: this.state.expandedBalance ? '180deg' : '0deg'}]}}
            name={'9'}
            size={16}
            color="#808080"
            onPress={() => {
              this.setState({expandedBalance: !this.state.expandedBalance});
            }}
          />
        </View>

        {this.state.expandedBalance && (
          <View style={{margin: 16}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.taxableAmount')}</Text>
              <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                {this.state.currencySymbol + formatAmount(Number(this.state.balanceDetails.totalTaxableAmount))}
              </Text>
            </View>
            {this.state.balanceDetails.mainTaxAmount > 0 ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.tax')}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + formatAmount(Number(this.state.balanceDetails.mainTaxAmount))}
                </Text>
              </View>
            ) : null}
            {this.state.selectedArrayType.includes('tdspay') || this.state.selectedArrayType.includes('tdsrc') ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.tds')}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {'- ' + this.state.currencySymbol + formatAmount(Number(this.state.balanceDetails.tdsOrTcsTaxAmount))}
                </Text>
              </View>
            ) : null}
            {this.state.selectedArrayType.includes('tcspay') || this.state.selectedArrayType.includes('tcsrc') ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.tcs')}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + formatAmount(Number(this.state.balanceDetails.tdsOrTcsTaxAmount))}
                </Text>
              </View>
            ) : null}
            <View style={{height: 1.1, backgroundColor: 'black', marginVertical: 10}}></View>

            {this.state.amountForReceipt != 0 && this.state.amountForReceipt != '' ? (
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>{this.props.t('payment.total')}</Text>
                <Text style={{color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold}}>
                  {this.state.currencySymbol + formatAmount(Number(this.state.amountForReceipt))}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  genrateInvoice(type) {
    if (!this.state.partyName) {
      alert(this.props.t('payment.pleaseSelectParty'));
    } else if (this.state.amountForReceipt == '') {
      alert(this.props.t('payment.pleaseEnterAmount'));
    } else if (!this.state.paymentMode.uniqueName) {
      alert(this.props.t('payment.pleaseSelectAccount'));
    } else {
      this.createPayment(type);
    }
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="never"
          style={[{flex: 1, backgroundColor: 'white'}, {marginBottom: this.keyboardMargin}]}
          bounces={false}>
          <View style={[style.container, {paddingBottom: 80}]}>
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderSelectPartyName()}
              {this.renderAmount()}
              <SalesPersonComponent setSelectedSalesPerson={this.setSelectedSalesPerson} selectedSalesPerson={this.state.selectedSalesPerson} themecolor={"#084EAD"} />
            </View>
            {this._renderDateView()}
            {this._renderAddress()}
            {this._renderChequeDetails()}
            {this._renderTaxes()}
            {this._renderLinkIvoice()}
            {this._renderAddDescription()}
            {this.state.amountForReceipt > 0 && this.state.partyName.name && this._renderTotalAmount()}
            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              pickerComponentStyleIOS={{height: 250}}
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />

            <DateTimePickerModal
              isVisible={this.state.showClearanceDatePicker}
              mode="date"
              pickerComponentStyleIOS={{height: 250}}
              onConfirm={this.handleConfirmClearanceDate}
              onCancel={this.hideClearanceDatePicker}
            />
          </View>

          {this.state.searchResults.length > 0 && this._renderSearchList()}
          {this.state.loading && (
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
              <LoaderKit
                  style={{ width: 45, height: 45 }}
                  name={'LineScale'}
                  color={color.PRIMARY_NORMAL}
              />
            </View>
          )}
          <OcrDocumentPreviewModal
            visible={this.state.showOcrPreview}
            encodedData={this.state.ocrEncodedData}
            onClose={() => this.setState({showOcrPreview: false})}
          />
        </Animated.ScrollView>
        {this.state.amountForReceipt > 0 &&
          this.state.partyName.name &&
          this.state.paymentMode.uniqueName != '' &&
          this._renderSaveButton()}
        {this._renderAccountsPopUp()}
        {this._renderTax()}
        {this._renderTaxCalculationMethodModal()}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const {commonReducer} = state;
  return {
    ...commonReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
  };
}

const PaymentWithTranslation = withTranslation()(Payment);

function Screen(props) {
  const isFocused = useIsFocused();

  return <PaymentWithTranslation {...props} isFocused={isFocused} />;
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(Screen);
export default MyComponent;
