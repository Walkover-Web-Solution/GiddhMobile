import React, { createRef } from 'react';
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
  Alert,
} from 'react-native';
import style from './style';
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { FONT_FAMILY } from '../../utils/constants';

import Icon from '@/core/components/custom-icon/custom-icon';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LoaderKit  from 'react-native-loader-kit';
import color from '@/utils/colors';
import _ from 'lodash';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import { CommonService } from '@/core/services/common/common.service';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useIsFocused } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import EditItemDetail from './EditItemDetails';
import CheckBox from 'react-native-check-box';
import BottomSheet from '@/components/BottomSheet';
import { formatAmount } from '@/utils/helper';
import { withTranslation } from 'react-i18next';
import SalesPersonComponent from '@/components/SalesPersonComponent';
import PdfPreviewScreen from '@/screens/PdfPreviewScreen/PdfPreviewScreen';

const { SafeAreaOffsetHelper } = NativeModules;
const INVOICE_TYPE = {
  debit: 'debit note',
  cash: 'cash',
};
interface Props {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const KEYBOARD_EVENTS = {
  IOS_ONLY: {
    KEYBOARD_WILL_SHOW: 'keyboardWillShow',
    KEYBOARD_WILL_HIDE: 'keyboardWillHide',
  },
  KEYBOARD_DID_SHOW: 'keyboardDidShow',
  KEYBOARD_DID_HIDE: 'keyboardDidHide',
};
export class DebiteNote extends React.Component<Props> {
  // private invoiceBottomSheetRef: React.Ref<BottomSheet>;
  constructor(props) {
    super(props);
    this.invoiceBottomSheetRef = createRef();
    this.copyVoucherBottomSheetRef = createRef();
    this.setBottomSheetVisible = this.setBottomSheetVisible.bind(this);
    this.state = {
      loading: false,
      invoiceType: INVOICE_TYPE.debit,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
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
      displayedDate: moment(),
      showDatePicker: false,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      modesArray: [],
      editItemDetails: {
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
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null,
      },
      linkedInvoices: '',
      showAllInvoice: false,
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      selectedInvoice: '',
      companyCountryDetails: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1,
      selectedSalesPerson: undefined,
      copyVoucherList: [],
      fetchingCopyVouchers: false,
      copyVoucherTab: 'account',
      pdfPreviewVisible: false,
      pdfPreviewParams: null,
      allStockVariants: {}
    };
    this.keyboardMargin = new Animated.Value(0);
  }

  setSelectedSalesPerson = (salesPerson: any) => {
    this.setState({ selectedSalesPerson: salesPerson });
  }

  getCopyPartyName = () => {
    return this.state.partyName?.name ?? (this.state.searchPartyName ? this.state.searchPartyName : '');
  };

  openCopyVoucherSheet = () => {
    const defaultTab = this.getCopyPartyName() ? 'account' : 'all';
    this.setBottomSheetVisible(this.copyVoucherBottomSheetRef, true);
    this.setState({ copyVoucherList: [], copyVoucherTab: defaultTab });
    this.fetchPreviousVouchers(defaultTab);
  };

  switchCopyVoucherTab = (tab) => {
    if (this.state.copyVoucherTab === tab) return;
    this.setState({ copyVoucherTab: tab, copyVoucherList: [] });
    this.fetchPreviousVouchers(tab);
  };

  openPreviousVoucherPdf = (item) => {
    const voucherUniqueName = item?.uniqueName;
    const voucherNumber = item?.voucherNumber ?? '';
    if (!voucherUniqueName && !voucherNumber) return;
    this.setBottomSheetVisible(this.copyVoucherBottomSheetRef, false);
    setTimeout(() => {
      this.setState({
        pdfPreviewVisible: true,
        pdfPreviewParams: {
          companyVersionNumber: this.state.companyVersionNumber,
          uniqueName: item?.account?.uniqueName,
          voucherInfo: {
            voucherNumber: [`${voucherNumber}`],
            uniqueName: voucherUniqueName,
            voucherType: INVOICE_TYPE.debit
          }
        }
      });
    }, 300);
  };

  closePreviousVoucherPdf = () => {
    this.setState({ pdfPreviewVisible: false, pdfPreviewParams: null });
  };

  fetchPreviousVouchers = async (tab = this.state.copyVoucherTab) => {
    // Tag every request so a stale/overlapping response can never wedge the
    // loader (e.g. an old fetch resolving after a newer one has started).
    const requestId = (this._copyVoucherRequestId || 0) + 1;
    this._copyVoucherRequestId = requestId;
    this.setState({ fetchingCopyVouchers: true });
    try {
      const payload = {
        count: 10,
        isLastInvoicesRequest: true,
        sortBy: 'voucherDate',
        sort: 'desc'
      };
      const partyName = this.getCopyPartyName();
      if (tab === 'account' && partyName) {
        payload.q = partyName;
      }
      // Safety net: the axios timeout only covers the network round-trip, not
      // the async request interceptor (AsyncStorage reads / session refresh),
      // so a hang there would keep the loader spinning forever. Race the call
      // against a timeout so the UI always recovers.
      const response = await Promise.race([
        CommonService.getLastVouchers(
          INVOICE_TYPE.debit,
          10,
          this.state.companyVersionNumber,
          payload
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('COPY_VOUCHER_TIMEOUT')), 30000)
        )
      ]);
      if (this._copyVoucherRequestId !== requestId) return;
      if (response?.status === 'success' && Array.isArray(response?.body?.items)) {
        this.setState({ copyVoucherList: response.body.items });
      } else {
        this.setState({ copyVoucherList: [] });
      }
    } catch (e) {
      if (this._copyVoucherRequestId !== requestId) return;
      this.setState({ copyVoucherList: [] });
    } finally {
      if (this._copyVoucherRequestId === requestId) {
        this.setState({ fetchingCopyVouchers: false });
      }
    }
  };

  copyVoucherFromList = async (item) => {
    const accountUniqueName = item?.account?.uniqueName;
    if (!accountUniqueName) return;
    this.setBottomSheetVisible(this.copyVoucherBottomSheetRef, false);
    this.setState({ loading: true });
    try {
      // Make sure taxes are available (needed while mapping entries)
      if (!this.state.taxArray || this.state.taxArray.length === 0) {
        await this.getAllTaxes();
      }

      // Fetch the full voucher and copy ONLY the product/service line items.
      // Party, addresses, sales person, currency etc. are intentionally left untouched so
      // the current new-note context (the selected party and its details) is preserved.
      // accountUniqueName here belongs to the previous voucher and is only used to fetch it.
      const payload = {
        number: item?.voucherNumber ?? '',
        uniqueName: item?.uniqueName ?? '',
        type: INVOICE_TYPE.debit
      };
      const response = await CommonService.getVoucher(accountUniqueName, this.state.companyVersionNumber, payload);

      if (response?.status === 'success') {
        const addedItems = await this.mapEntriesToUIData(response?.body?.entries ?? []);
        this.updateTCSAndTDSTaxAmount(addedItems);
        this.setState({ addedItems }, () => {
          const totalAmount = this.getTotalAmount();
          this.setState({
            totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2)
          });
        });
      }
    } catch (e) {
      console.warn('----- Error copying voucher -----', e);
      Alert.alert(this.props.t('common.alert'), e?.data?.message ?? 'Error while copying debit note');
    } finally {
      this.setState({ loading: false });
    }
  };

  async getParticularServiceStockVariants(accountUniqueName, stockUniqueName, variantUniqueName) {
    try {
      // ----- If the item is a Stock -----
      if (!!stockUniqueName) {
        if (!this.state.allStockVariants[stockUniqueName]) {
          const stockVariantsResult = await InvoiceService.getStockVariants(stockUniqueName);
          if (stockVariantsResult.status == 'success' && stockVariantsResult.body) {
            await this.setState({
              allStockVariants: {
                ...this.state.allStockVariants,
                [stockUniqueName]: stockVariantsResult.body
              }
            });
          }
        }
        const results = await InvoiceService.getStockDetails(
          accountUniqueName,
          stockUniqueName,
          variantUniqueName ?? this.state.allStockVariants[stockUniqueName][0].uniqueName
        );
        if (results && results.body) {
          const data = results.body;
          if (!!data?.stock?.variant) {
            data.rate = data.stock.variant.unitRates[0].rate;
            data.stock.rate = data.stock.variant.unitRates[0].rate;
            data.stock.stockUnitCode = data.stock.variant.unitRates[0].stockUnitCode;
            data.stock.stockUnitName = data.stock.variant.unitRates[0].stockUnitName;
            data.stock.stockUnitUniqueName = data.stock.variant.unitRates[0].stockUnitUniqueName;
          } else {
            data.rate = data.stock.unitRates[0].rate;
            data.stock.rate = data.stock.unitRates[0].rate;
            data.stock.stockUnitCode = data.stock.unitRates[0].stockUnitCode;
            data.stock.stockUnitName = data.stock.unitRates[0].stockUnitName;
            data.stock.stockUnitUniqueName = data.stock.unitRates[0].stockUnitUniqueName;
          }
          data.quantity = 1;
          if (this.state.companyVersionNumber == 2) {
            const variantObj = this.state.allStockVariants[stockUniqueName].find((variant) => variant?.uniqueName == variantUniqueName);
            data.stock.variant.name = variantObj?.name ?? this.state.allStockVariants[stockUniqueName][0].name;
            data.stock.isMultiVariant = this.state.allStockVariants[stockUniqueName]?.length > 1;
          }
          data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return data;
        }
        // ----- If the item is a Service -----
      } else {
        const results = await InvoiceService.getSalesDetails(accountUniqueName);
        if (results && results.body) {
          const data = results.body;
          data.quantity = 1;
          data["newUniqueName"] = data.uniqueName + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return data;
        }
      }
    } catch (e) {
      console.warn('----- Error in getParticularServiceStockVariants -----', e);
    }
  }

  async mapEntriesToUIData(entries) {
    let addedItems = [];

    await Promise.all(entries.map(async (entry) => {
      const accountUniqueName = entry.transactions[0].account?.uniqueName;
      const stockUniqueName = entry.transactions[0].stock?.uniqueName;
      const variantUniqueName = entry.transactions[0].stock?.variant?.uniqueName;

      const particularData = await this.getParticularServiceStockVariants(accountUniqueName, stockUniqueName, variantUniqueName);

      // Inserting Tax according to the tax present in voucher.
      let taxDetailsArray = [];
      let selectedArrayType = [];
      // Capture the TDS/TCS calculation method coming with the voucher entry so the
      // amount can be recomputed for display (independent of otherTaxTotal).
      let tdsTcsCalculationMethod = null;

      entry?.taxes?.forEach((entryTax) => {
        // Resolve the full tax object from the master list and rely on its taxType
        // for de-duplication. The entry tax does not always carry a reliable taxType,
        // and keying off it can cause a TDS/TCS tax to be skipped so it never reaches the UI.
        const tax = this.state.taxArray.find((tax) => tax.uniqueName === entryTax.uniqueName);
        if (!tax) return;
        if (selectedArrayType.includes(tax.taxType)) return;
        taxDetailsArray.push(tax);
        selectedArrayType.push(tax.taxType);
        if (tax.taxType == 'tdspay' || tax.taxType == 'tcspay' || tax.taxType == 'tcsrc' || tax.taxType == 'tdsrc') {
          tdsTcsCalculationMethod = entryTax?.calculationMethod ?? tax?.taxDetail?.[0]?.calculationMethod ?? 'OnTaxableAmount';
        }
      });

      const isStock = !!particularData?.stock;

      let percentDiscountArray = [];
      let fixedDiscount = {
        discountValue: 0,
        discountType: '',
        name: undefined,
        uniqueName: undefined,
        linkAccount: {
          name: undefined,
          uniqueName: undefined
        }
      };

      entry?.discounts?.forEach((_discount) => {
        const discount = {
          name: _discount?.name,
          uniqueName: _discount?.uniqueName,
          discountValue: _discount?.discountValue,
          discountType: _discount?.calculationMethod,
          linkAccount: {
            name: _discount?.accountName,
            uniqueName: _discount?.accountUniqueName
          }
        };
        if (_discount?.calculationMethod === 'FIX_AMOUNT') {
          fixedDiscount = discount;
        } else if (_discount?.calculationMethod === 'PERCENTAGE') {
          percentDiscountArray.push(discount);
        }
      });

      const modifiedEntryObj = {
        ...particularData,
        "hsnNumber": entry?.hsnNumber,
        "sacNumber": entry?.sacNumber,
        "quantity": isStock ? entry.transactions[0].stock.quantity : (entry?.usedQuantity !== 0 ? entry?.usedQuantity : 1),
        "quantityText": isStock ? entry.transactions[0].stock.quantity : (entry?.usedQuantity !== 0 ? entry?.usedQuantity : 1),
        "rate": isStock ? entry.transactions[0].stock.rate.rateForAccount : entry?.subTotal?.amountForAccount,
        "rateText": isStock ? entry.transactions[0].stock.rate.rateForAccount : entry?.subTotal?.amountForAccount,
        "taxDetailsArray": taxDetailsArray,
        "selectedArrayType": selectedArrayType,
        "unitText": isStock ? entry.transactions[0].stock.quantity : '',
        "amount": entry?.subTotal?.amountForAccount,
        "amountText": entry?.subTotal?.amountForAccount,
        "isNew": false,
        "description": entry?.description,
        "unit": isStock ? entry.transactions[0].stock.quantity : '',
        "total": entry?.subTotal?.amountForAccount,
        "taxType": 0,
        "tax": entry?.taxTotal?.amountForAccount ?? 0,
        "warehouse": 0,
        "discountDetails": {},
        "discountPercentage": percentDiscountArray[0]?.discountValue,
        "discountPercentageText": percentDiscountArray[0]?.discountValue,
        "percentDiscountArray": percentDiscountArray,
        "discountValue": 0,
        "discountType": null,
        "fixedDiscount": fixedDiscount,
        "fixedDiscountUniqueName": fixedDiscount?.uniqueName,
        "tdsTcsTaxCalculationMethod": null,
        "tdsOrTcsTaxObj": null
      };

      modifiedEntryObj.discountValue = this.calculateDiscountedAmount(modifiedEntryObj);
      // Set the calculation method first so the TDS/TCS amount can be derived from the
      // selected taxes, then compute the display object off the taxDetailsArray. This works
      // even when the voucher entry does not include an otherTaxTotal.
      modifiedEntryObj.tdsTcsTaxCalculationMethod = tdsTcsCalculationMethod ?? 'OnTaxableAmount';
      modifiedEntryObj.taxText = entry?.taxTotal?.amountForAccount ?? modifiedEntryObj.tax ?? 0;
      this.calculateTdsOrTcsAmountToDisplay(modifiedEntryObj);
      if (!modifiedEntryObj.tdsOrTcsTaxObj) {
        // Fallback: use the TDS/TCS amount already computed on the voucher entry.
        const fallbackTdsTcs = this.calculateTdsTcsTaxToDisplay(entry);
        if (fallbackTdsTcs) {
          modifiedEntryObj.tdsOrTcsTaxObj = fallbackTdsTcs;
          modifiedEntryObj.tdsTcsTaxCalculationMethod = fallbackTdsTcs.calculationMethod ?? modifiedEntryObj.tdsTcsTaxCalculationMethod;
        }
      }
      // Keep card/total amount in sync with discount + tax without requiring an item edit.
      modifiedEntryObj.total = this.getTotalAmountOfCard(modifiedEntryObj);
      addedItems.push(modifiedEntryObj);
    }));

    return addedItems;
  }

  calculateTdsTcsTaxToDisplay(itemDetails) {
    try {
      let totalTcsorTdsTax = 0;
      let totalTcsorTdsTaxName = '';
      let calculationMethod = '';
      if (itemDetails?.taxes && itemDetails?.taxes?.length > 0) {
        for (let i = 0; i < itemDetails?.taxes?.length; i++) {
          const item = itemDetails?.taxes[i];
          if (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') {
            if (itemDetails?.otherTaxTotal) {
              totalTcsorTdsTax = itemDetails?.otherTaxTotal?.amountForAccount < 0 ? ((-1) * itemDetails?.otherTaxTotal?.amountForAccount) : itemDetails?.otherTaxTotal?.amountForAccount;
              totalTcsorTdsTaxName = item.taxType;
              calculationMethod = item.calculationMethod;
              break;
            }
          }
        }
      }
      if (totalTcsorTdsTaxName != '' && totalTcsorTdsTax != 0) {
        return { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2), calculationMethod: calculationMethod };
      } else {
        return null;
      }
    } catch (error) {
      console.log("errr", error);
      return null;
    }
  }

  _renderCopyVoucherRow = ({ item }) => {
    const name = item?.account?.name ?? item?.account?.customerName ?? '';
    const voucherNumber = item?.voucherNumber ?? '';
    const amount = item?.grandTotal?.amountForAccount ?? 0;
    const voucherDate = item?.voucherDate ? moment(item.voucherDate, 'DD-MM-YYYY').format('MMM DD') : '';
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
        onPress={() => this.copyVoucherFromList(item)}>
        <View style={{ width: '50%', paddingRight: 6 }}>
          <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold, fontSize: 15 }} numberOfLines={1}>{name}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => this.openPreviousVoucherPdf(item)}
            style={{ alignSelf: 'flex-start', backgroundColor: '#FDE6E5', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 }}>
            <Text style={{ color: '#ff6961', fontFamily: FONT_FAMILY.semibold, fontSize: 12, textDecorationLine: 'underline' }} numberOfLines={1}>
              {voucherNumber ? `#${voucherNumber}` : this.props.t('common.na')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ width: '18%', color: '#808080', textAlign: 'center', fontFamily: FONT_FAMILY.regular, fontSize: 13 }} numberOfLines={1}>{voucherDate}</Text>
        <Text style={{ width: '32%', color: '#1C1C1C', textAlign: 'right', fontFamily: FONT_FAMILY.semibold, fontSize: 14 }} numberOfLines={1}>{formatAmount(amount)}</Text>
      </TouchableOpacity>
    );
  };

  _renderCopyVoucherTabs = () => {
    const tabs = [
      { key: 'account', label: this.props.t('common.accountInvoices') },
      { key: 'all', label: this.props.t('common.allInvoices') }
    ];
    return (
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E6E6E6' }}>
        {tabs.map((tab) => {
          const active = this.state.copyVoucherTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: active ? '#ff6961' : 'transparent' }}
              onPress={() => this.switchCopyVoucherTab(tab.key)}>
              <Text style={{ color: active ? '#ff6961' : '#808080', fontFamily: FONT_FAMILY.semibold, fontSize: 14 }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  _renderCopyVoucherListHeader = () => {
    return (
      <View>
        {this._renderCopyVoucherTabs()}
        <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E6E6E6' }}>
          <Text style={{ width: '50%', color: '#808080', fontFamily: FONT_FAMILY.semibold, fontSize: 12 }}>{this.props.t('common.name')}</Text>
          <Text style={{ width: '18%', color: '#808080', fontFamily: FONT_FAMILY.semibold, fontSize: 12, textAlign: 'center' }}>{this.props.t('common.date')}</Text>
          <Text style={{ width: '32%', color: '#808080', fontFamily: FONT_FAMILY.semibold, fontSize: 12, textAlign: 'right' }}>{this.props.t('common.amount')}</Text>
        </View>
      </View>
    );
  };

  _renderCopyVoucherEmpty = () => {
    return (
      <View style={{ paddingVertical: 30, alignItems: 'center' }}>
        {this.state.fetchingCopyVouchers ? (
          <ActivityIndicator color={'#ff6961'} size="small" />
        ) : (
          <Text style={{ color: '#808080', fontFamily: FONT_FAMILY.regular }}>{this.props.t('common.noResultsFound')}</Text>
        )}
      </View>
    );
  };

  _renderPdfPreviewModal() {
    return (
      <Modal
        visible={this.state.pdfPreviewVisible}
        animationType="slide"
        onRequestClose={this.closePreviousVoucherPdf}>
        {this.state.pdfPreviewVisible && this.state.pdfPreviewParams ? (
          <PdfPreviewScreen
            {...this.state.pdfPreviewParams}
            onClose={this.closePreviousVoucherPdf}
          />
        ) : null}
      </Modal>
    );
  }

  _renderCopyVoucherSheet() {
    return (
      <BottomSheet
        bottomSheetRef={this.copyVoucherBottomSheetRef}
        headerText={this.props.t('common.Copy Previous Debit Notes')}
        headerSubText={this.props.t('common.Tap a bill to copy it · tap the #voucher to preview')}
        headerTextColor='#ff6961'
        onClose={() => Keyboard.dismiss()}
        flatListProps={{
          data: this.state.copyVoucherList,
          keyExtractor: (item, index) => `${item?.uniqueName ?? item?.voucherNumber ?? index}`,
          renderItem: this._renderCopyVoucherRow,
          ListHeaderComponent: this._renderCopyVoucherListHeader,
          ListEmptyComponent: this._renderCopyVoucherEmpty,
          showsVerticalScrollIndicator: false,
          contentContainerStyle: { paddingHorizontal: 16, paddingBottom: 10 }
        }}
      />
    );
  }

  setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if(visible){
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

  setOtherDetails = (data) => {
    this.setState({ otherDetails: data });
  };

  selectBillingAddress = (address) => {
    console.log(address);
    this.setState({ partyBillingAddress: address });
    if (this.state.billSameAsShip) {
      this.setState({ partyShippingAddress: address });
    }
  };

  selectShippingAddress = (address) => {
    console.log('shipping add', address);
    this.setState({ partyShippingAddress: address });
  };

  // func1 = async () => {
  //   const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.token);
  //   console.log(activeCompany);
  // };
  FocusAwareStatusBar = (isFocused) => {
    return isFocused ? <StatusBar backgroundColor="#ff5355" barStyle={Platform.OS == "ios" ? "dark-content" : "light-content"} /> : null;
  };

  async getExchangeRateToINR(currency) {
    try {
      const results = await InvoiceService.getExchangeRate(
        moment().format('DD-MM-YYYY'),
        this.state.companyCountryDetails.currency.code,
        currency,
      );
      if (results.body && results.status == 'success') {
        await this.setState({
          totalAmountInINR: (Math.round(Number(this.getTotalAmount()) * results.body * 100) / 100).toFixed(2),
          exchangeRate: results.body,
        });
      }
    } catch (e) { }
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
    } catch (e) { }
  }

  componentDidMount() {
    this.searchCalls();
    this.setActiveCompanyCountry();
    this.getAllTaxes();
    this.getAllDiscounts();
    this.getAllWarehouse();
    this.getAllAccountsModes();
    this.getCompanyVersionNumber();

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
      this.getCompanyVersionNumber();
      if (this.state.searchPartyName == "") {
        this.searchCalls();
      }
    });

    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.updatedItemInInvoice, (data) => {
      this.updateAddedItems(data);
      // fire logout action
      // store.dispatch.auth.logout();
    });

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      this.resetState();
      this.setActiveCompanyCountry();
      this.getAllTaxes();
      this.getAllDiscounts();
      this.getAllWarehouse();
      this.getAllAccountsModes();
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

  getCompanyVersionNumber = async () => {
    let companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber)
    if (companyVersionNumber != null || companyVersionNumber != undefined) {
      this.setState({ companyVersionNumber })
    }
  }

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
              {/* {this.state.invoiceType == INVOICE_TYPE.credit ? 'Sales Invoice' : 'Cash Invoice'} */}
              {this.props.t('debitNote.title')}
            </Text>
            {/* <Icon style={{ marginLeft: 4 }} name={'9'} color={'white'} /> */}
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity
          style={{marginRight: 16, alignSelf: 'center'}}
          onPress={() => {
            if (this.state.invoiceType == INVOICE_TYPE.debit) {
              this.setCashTypeInvoice();
            } else {
              this.setCreditTypeInvoice();
            }
            // this.setState({ showInvoiceModal: true })
          }}>
          <Text style={style.invoiceTypeTextRight}>
            {`${this.state.invoiceType == INVOICE_TYPE.debit ? INVOICE_TYPE.cash : INVOICE_TYPE.debit}` + '?'}
          </Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  renderInvoiceTypeModal() {
    return (
      <Modal
        isVisible={this.state.showInvoiceModal}
        backdropColor={'black'}
        animationIn="fadeIn"
        transparent={true}
        animationOut="fadeOut"
        style={{
          position: 'absolute',
          elevation: 10,
          justifyContent: 'center',
          alignItems: 'center',
          right: 0,
          left: 0,
          bottom: 0,
          top: 0,
        }}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            overflow: 'hidden',
            alignSelf: 'center',
            width: '100%',
            height: '100%',
          }}>
          <View style={{ backgroundColor: 'white', marginTop: 70, marginHorizontal: 40, borderRadius: 10 }}>
            <TouchableOpacity
              style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }}
              onPress={() => this.setCashTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Cash' ? '#5773FF' : 'black' }}>{this.props.t('creditNote.cashInvoice')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: 50, justifyContent: 'center', paddingHorizontal: 20 }}
              onPress={() => this.setCreditTypeInvoice()}>
              <Text style={{ color: this.state.invoiceType == 'Credit' ? '#5773FF' : 'black' }}>{this.props.t('creditNote.creditInvoice')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderSelectPartyName() {
    return (
      <>
      <View
        onLayout={this.onLayout}
        style={{ flexDirection: 'row', minHeight: 50, alignItems: 'center', paddingTop: 10 }}
        onPress={() => { }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}> */}
          <Icon name={'Profile'} color={'#ff6961'} style={{ margin: 16 }} size={16} />
          <TextInput
            placeholderTextColor={'#808080'}
            placeholder={this.props.t('creditNote.searchCompanyName')}
            returnKeyType={'done'}
            value={this.state.searchPartyName}
            onChangeText={(text) =>
              this.setState({ searchPartyName: text }, () => {
                this.searchCalls();
              })
            }
            style={style.searchTextInputStyle}
          />
          {/* </View> */}
          <ActivityIndicator color={'#5773FF'} size="small" animating={this.state.isSearchingParty} />
        </View>
        <TouchableOpacity onPress={() => this.clearAll()}>
          <Text style={{ color: '#1C1C1C', marginRight: 16, fontFamily: 'AvenirLTStd-Book' }}>{this.props.t('common.clearAll')}</Text>
        </TouchableOpacity>
      </View>
      <View
        onLayout={this.onLayout}
        style={{ flexDirection: 'row',alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => this.openCopyVoucherSheet()}>
          <FontAwesome5 name={'copy'} color={'#ff6961'} style={{ marginLeft: 16 }} size={18} />
          <Text style={{ color: '#1C1C1C', marginLeft: 10, fontFamily: 'AvenirLTStd-Book' }}>{this.props.t('common.Copy Previous Debit Notes')}</Text>
        </TouchableOpacity>
      </View>
      </>
    );
  }

  clearAll = async () => {
    await this.resetState();
    await this.searchCalls()
    await this.setActiveCompanyCountry();
    await this.getAllTaxes();
    await this.getAllDiscounts();
    await this.getAllWarehouse();
    await this.getAllAccountsModes();
    await this.getCompanyVersionNumber();
  };

  onLayout = (e) => {
    this.setState({
      searchTop: e.nativeEvent.layout.height + e.nativeEvent.layout.y,
    });
  };

  searchCalls = _.debounce(this.searchUser, 200);

  async getAllDiscounts() {
    this.setState({ fetechingDiscountList: true });
    try {
      const results = await InvoiceService.getDiscounts();
      if (results.body && results.status == 'success') {
        this.setState({ discountArray: results.body, fetechingDiscountList: false });
      }
    } catch (e) {
      this.setState({ fetechingDiscountList: false });
    }
  }

  async getAllWarehouse() {
    this.setState({ fetechingWarehouseList: true });
    try {
      const results = await InvoiceService.getWarehouse();
      if (results.body && results.status == 'success') {
        this.setState({ warehouseArray: results.body.results, fetechingWarehouseList: false });
      }
    } catch (e) {
      this.setState({ fetechingWarehouseList: false });
    }
  }

  async getAllAccountsModes() {
    try {
      const results = await InvoiceService.getBriefAccount();
      if (results.body && results.status == 'success') {
        this.setState({ modesArray: results.body.results });
      }
    } catch (e) { }
  }

  async getAllInvoice() {
    try {
      const date = await moment(this.state.date).format('DD-MM-YYYY');
      const payload = await {
        ...(this.state.companyVersionNumber == 1 && { 
          accountUniqueNames: [this.state.partyName.uniqueName, 'sales'] 
        }),
        ...(this.state.companyVersionNumber == 2 && { 
          accountUniqueName: this.state.partyName.uniqueName,
          number: "" 
        }),
        voucherType: INVOICE_TYPE.debit
      };
      const results = await InvoiceService.getVoucherInvoice(date, payload, this.state.companyVersionNumber);
      if (results.body && results.status == 'success') {
        let allVoucherInvoice = this.state.companyVersionNumber == 1 ? results.body.results : results.body.items
        this.setState({ allVoucherInvoice });
      }
    } catch (e) {
      this.setState({ allVoucherInvoice: [] });
    }
  }

  async getAllTaxes() {
    this.setState({ fetechingTaxList: true });
    try {
      const results = await InvoiceService.getTaxes();
      if (results.body && results.status == 'success') {
        await new Promise((resolve) => {
          this.setState({ taxArray: results.body, fetechingTaxList: false }, resolve);
        });
      } else {
        this.setState({ fetechingTaxList: false });
      }
    } catch (e) {
      this.setState({ fetechingTaxList: false });
    }
  }

  getTaxDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.state.taxArray, function (o) {
      if (o.uniqueName == uniqueName) {
        return o;
      }
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  resolveTaxAndGroupTaxNames(taxes, groupTaxes, opts) {
    const whenBoth = (opts && opts.whenBothNonEmpty) || 'intersection';
    const toNames = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) {
        return [];
      }
      return arr
        .map((entry) => (typeof entry === 'string' ? entry : entry && entry.uniqueName))
        .filter((name) => Boolean(name));
    };
    const t = toNames(taxes);
    const g = toNames(groupTaxes);
    if (t.length > 0 && g.length === 0) {
      return t;
    }
    if (g.length > 0 && t.length === 0) {
      return g;
    }
    if (t.length > 0 && g.length > 0) {
      if (whenBoth === 'preferTaxes') {
        return t;
      }
      const gSet = new Set(g);
      const isSame = t.length === g.length && t.every((name) => gSet.has(name));
      if (isSame) {
        return t.slice();
      }
      return t.filter((name) => !gSet.has(name));
    }
    return [];
  }

  shouldSkipTaxDueToTdsTcsConflict(selectedTaxArray, taxDetails) {
    if (!taxDetails) {
      return true;
    }
    return (
      (selectedTaxArray.includes(taxDetails.taxType) && !selectedTaxArray.includes(taxDetails)) ||
      ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
        taxDetails.taxType == 'tcspay') ||
      ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tcsrc')) &&
        taxDetails.taxType == 'tdsrc') ||
      ((selectedTaxArray.includes('tdspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcspay')) &&
        taxDetails.taxType == 'tcsrc') ||
      ((selectedTaxArray.includes('tcspay') || selectedTaxArray.includes('tdsrc') || selectedTaxArray.includes('tcsrc')) &&
        taxDetails.taxType == 'tdspay')
    );
  }

  pushLinkedTaxDetail(taxDetailsArray, selectedTaxArray, uniqueName) {
    const taxDetails = this.getTaxDeatilsForUniqueName(uniqueName);
    if (!taxDetails) {
      return;
    }
    if (taxDetailsArray.some((t) => t.uniqueName === taxDetails.uniqueName)) {
      return;
    }
    if (this.shouldSkipTaxDueToTdsTcsConflict(selectedTaxArray, taxDetails)) {
      return;
    }
    taxDetailsArray.push(taxDetails);
    selectedTaxArray.push(taxDetails.taxType);
  }

  isTdsOrTcsTaxType(taxType) {
    return (
      taxType === 'tdspay' ||
      taxType === 'tcspay' ||
      taxType === 'tcsrc' ||
      taxType === 'tdsrc'
    );
  }

  lineHasTaxHierarchyLinkage(itemDetails) {
    if (!itemDetails) {
      return false;
    }
    if (itemDetails.stock) {
      const stock = itemDetails.stock;
      return (
        (Array.isArray(stock.taxes) && stock.taxes.length > 0) ||
        (Array.isArray(stock.groupTaxes) && stock.groupTaxes.length > 0)
      );
    }
    return (
      (Array.isArray(itemDetails.taxes) && itemDetails.taxes.length > 0) ||
      (Array.isArray(itemDetails.groupTaxes) && itemDetails.groupTaxes.length > 0)
    );
  }

  filterTaxDetailsByApplicableAndLinked(taxDetailsArray, selectedTaxArray, resolvedLinkedTaxNames, itemDetails) {
    const linked = (resolvedLinkedTaxNames || []).filter(Boolean);
    const applicable = itemDetails?.applicableTaxes;
    const hasApplicable = Array.isArray(applicable) && applicable.length > 0;

    if (linked.length === 0 && !hasApplicable) {
      return { taxDetailsArray, selectedTaxArray };
    }

    const allowed = new Set(linked);
    if (hasApplicable && linked.length === 0) {
      applicable.forEach((t) => {
        const u = typeof t === 'string' ? t : t && t.uniqueName;
        if (u) {
          allowed.add(u);
        }
      });
    }

    const next = taxDetailsArray.filter((row) => row && row.uniqueName && allowed.has(row.uniqueName));
    return {
      taxDetailsArray: next,
      selectedTaxArray: next.map((r) => r.taxType)
    };
  }

  getHierarchicalResolvedTaxRows(itemDetails) {
    const taxArr = this.state.taxArray || [];
    let resolvedNames = [];
    if (itemDetails.stock) {
      const stock = itemDetails.stock;
      const stockHasAny =
        (Array.isArray(stock.taxes) && stock.taxes.length > 0) ||
        (Array.isArray(stock.groupTaxes) && stock.groupTaxes.length > 0);
      resolvedNames = stockHasAny
        ? this.resolveTaxAndGroupTaxNames(stock.taxes, stock.groupTaxes, { whenBothNonEmpty: 'preferTaxes' })
        : this.resolveTaxAndGroupTaxNames(itemDetails.taxes, itemDetails.groupTaxes, {
            whenBothNonEmpty: 'intersection'
          });
    } else {
      resolvedNames = this.resolveTaxAndGroupTaxNames(itemDetails.taxes, itemDetails.groupTaxes, {
        whenBothNonEmpty: 'intersection'
      });
    }
    const rows = [];
    for (let i = 0; i < resolvedNames.length; i++) {
      const row = taxArr.find((t) => t && t.uniqueName === resolvedNames[i]);
      if (row && row.taxDetail && Array.isArray(row.taxDetail) && row.taxDetail.length > 0) {
        rows.push(row);
      }
    }
    return rows;
  }

  dedupeTaxDetailRows(rows) {
    const seen = new Set();
    const out = [];
    const list = rows || [];
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      if (!row || !row.uniqueName || seen.has(row.uniqueName)) {
        continue;
      }
      if (!row.taxDetail || !row.taxDetail[0]) {
        continue;
      }
      seen.add(row.uniqueName);
      out.push(row);
    }
    return out;
  }

  getCanonicalTaxRowsForLine(itemDetails) {
    const hierarchicalRows = this.getHierarchicalResolvedTaxRows(itemDetails);
    const hSet = new Set(
      hierarchicalRows.map((r) => r && r.uniqueName).filter(Boolean)
    );

    if (!itemDetails.taxDetailsArray || itemDetails.taxDetailsArray.length === 0) {
      return hierarchicalRows;
    }
    if (hierarchicalRows.length === 0) {
      if (this.lineHasTaxHierarchyLinkage(itemDetails)) {
        return hierarchicalRows;
      }
      return this.dedupeTaxDetailRows(itemDetails.taxDetailsArray);
    }

    const fromDetails = itemDetails.taxDetailsArray.filter(
      (row) =>
        row &&
        row.uniqueName &&
        hSet.has(row.uniqueName)
    );

    return fromDetails.length > 0 ? this.dedupeTaxDetailRows(fromDetails) : hierarchicalRows;
  }

  getTaxRowsForCalculation(itemDetails) {
    const canonical = this.getCanonicalTaxRowsForLine(itemDetails);
    if (canonical.length > 0) {
      return canonical;
    }
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      return this.dedupeTaxDetailRows(itemDetails.taxDetailsArray);
    }
    return canonical;
  }

  getDiscountDeatilsForUniqueName(uniqueName) {
    const filtered = _.filter(this.state.discountArray, function (o) {
      if (o.uniqueName == uniqueName) {
        return o;
      }
    });
    if (filtered.length > 0) {
      return filtered[0];
    }
    return undefined;
  }

  _renderSearchList() {
    return (
      // <Modal animationType="none" transparent={true} visible={true}>
      //   <TouchableOpacity
      //     style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)'}}
      //     onPress={() =>
      //       this.setState({
      //         searchResults: [],

      //         searchError: '',
      //         isSearchingParty: false,
      //       })
      //     }>
      <View style={[style.searchResultContainer, { top: height * 0.15 }]}>

        <FlatList
          nestedScrollEnabled={true}
          data={this.state.searchResults.length == 0 ? [this.props.t('common.resultNotFound')] : this.state.searchResults}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5 }}
          renderItem={({ item }) => (
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
                    () => {
                      this.getAllInvoice();
                      this.searchAccount();
                      this.getAllAccountsModes();
                      Keyboard.dismiss();
                    },
                  );
                } else {
                  this.setState({ isSearchingParty: false, searchResults: [] })
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
          {/* <Text style={{marginLeft: 3}}>Close</Text> */}
        </TouchableOpacity>
      </View>
      //   </TouchableOpacity>
      // </Modal>
    );
  }

  async searchUser() {
    this.setState({ isSearchingParty: true });
    try {
      // console.log('Creditors called');
      const results = await InvoiceService.search(this.state.searchPartyName, 1, 'sundrycreditors', false);

      if (results.body && results.body.results) {
        this.setState({ searchResults: results.body.results, isSearchingParty: false, searchError: '' });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: this.props.t('addItemScreen.noResults'), isSearchingParty: false });
    }
  }

  setDefaultAccountTax(tax) {
    var allDefaultTax = []
    if (tax) {
      for (let j = 0; j < tax.length; j++) {
        allDefaultTax.push(tax[j].uniqueName)
      }
    }
    this.setState({ defaultAccountTax: allDefaultTax })
    console.log("ALL TAX " + JSON.stringify(allDefaultTax))
  }

  setDefaultDiscount(discount) {
    var allDefaultDiscount = []
    if (discount) {
      for (let j = 0; j < discount.length; j++) {
        allDefaultDiscount.push(discount[j].uniqueName)
      }
    }
    this.setState({ defaultAccountDiscount: allDefaultDiscount })
    console.log("ALL Discount " + JSON.stringify(allDefaultDiscount))
  }

  async searchAccount() {
    this.setState({ isSearchingParty: true });
    try {
      const results = await InvoiceService.getAccountDetails(this.state.partyName.uniqueName);

      if (results.body) {
        if (results.body.currency != this.state.companyCountryDetails.currency.code) {
          await this.getExchangeRateToINR(results.body.currency);
        }
        this.setDefaultAccountTax(results.body.applicableTaxes)
        this.setDefaultDiscount(results.body.applicableDiscounts)
        await this.setState({
          addedItems: [],
          partyDetails: results.body,
          isSearchingParty: false,
          searchError: '',
          countryDeatils: results.body.country,
          currency: results.body.currency,
          currencySymbol: results.body.currencySymbol,
          addressArray: results.body.addresses,
          partyBillingAddress: results.body.addresses[0],
          partyShippingAddress: results.body.addresses[0],
          selectedSalesPerson: results.body.salesPerson ? results.body.salesPerson : undefined,
        });
      }
    } catch (e) {
      this.setState({ searchResults: [], searchError: this.props.t('addItemScreen.noResults'), isSearchingParty: false });
    }
  }

  resetState = () => {
    this.setState({
      loading: false,
      invoiceType: INVOICE_TYPE.debit,
      bottomOffset: 0,
      showInvoiceModal: false,
      partyName: undefined,
      searchResults: [],
      searchPartyName: '',
      searchTop: 0,
      isSearchingParty: false,
      searchError: '',
      invoiceAmount: 0,
      partyDetails: {},
      startDate: null,
      endDate: null,
      date: moment(),
      displayedDate: moment(),
      showDatePicker: false,
      partyBillingAddress: {},
      partyShippingAddress: {},
      addressArray: [],
      addedItems: [],
      showItemDetails: false,
      expandedBalance: true,
      amountPaidNowText: 0,
      itemDetails: undefined,
      warehouseArray: [],
      fetechingWarehouseList: false,
      showPaymentModePopup: false,
      selectedPayMode: {
        name: 'Cash',
        uniqueName: 'cash',
      },
      modesArray: [],
      editItemDetails: {
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
      },
      fetechingDiscountList: false,
      fetechingTaxList: false,
      discountArray: [],
      taxArray: [],
      otherDetails: {
        shipDate: '',
        shippedVia: null,
        trackingNumber: null,
        customField1: null,
        customField2: null,
        customField3: null,
      },
      linkedInvoices: '',
      showAllInvoice: false,
      allVoucherInvoice: [],
      countryDeatils: {
        countryName: '',
        countryCode: '',
      },
      currency: '',
      currencySymbol: '',
      exchangeRate: 1,
      totalAmountInINR: 0.0,
      companyCountryDetails: '',
      selectedInvoice: '',
      billSameAsShip: true,
      tdsOrTcsArray: [],
      defaultAccountTax: [],
      defaultAccountDiscount: [],
      companyVersionNumber: 1,
      selectedSalesPerson: undefined
    });
  };

  getDiscountForEntry(item) {
    // console.log('item is', item);
    const discountArr = [];
    if (item.fixedDiscount) {
      const discountItem = {
        calculationMethod: 'FIX_AMOUNT',
        uniqueName: item.fixedDiscount.uniqueName,
        amount: { type: 'DEBIT', amountForAccount: Number(item.fixedDiscount.discountValue) },
        discountValue: Number(item.fixedDiscount.discountValue),
        name: '',
        particular: '',
      };
      discountArr.push(discountItem);
    }
    if (item.percentDiscountArray) {
      if (item.percentDiscountArray.length > 0) {
        for (let i = 0; i < item.percentDiscountArray.length; i++) {
          const discountItem = {
            calculationMethod: 'PERCENTAGE',
            uniqueName: item.percentDiscountArray[i].uniqueName,
            amount: { type: 'DEBIT', amountForAccount: item.percentDiscountArray[i].discountValue },
            discountValue: item.percentDiscountArray[i].discountValue,
            name: item.percentDiscountArray[i].name,
            particular: item.percentDiscountArray[i].linkAccount.uniqueName,
          };
          discountArr.push(discountItem);
        }
      }
    }
    if (discountArr.length > 0) {
      return discountArr;
    } else {
      return [
        { calculationMethod: 'FIX_AMOUNT', amount: { type: 'DEBIT', amountForAccount: 0 }, name: '', particular: '' },
      ];
    }
  }

  getTaxesForEntry(item) {
    const taxArr = [];
    // console.log(' tax item is', item);
    if (item.taxDetailsArray) {
      for (let i = 0; i < item.taxDetailsArray.length; i++) {
        const tax = item.taxDetailsArray[i];
        const taxItem = { uniqueName: tax.uniqueName, calculationMethod: item?.tdsTcsTaxCalculationMethod ?? 'OnTaxableAmount' };
        taxArr.push(taxItem);
      }
      return taxArr;
    }
    return [];
  }

  getEntries() {
    const entriesArray = [];
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      console.log('item is', item);
      const entry = {
        date: moment(this.state.date).format('DD-MM-YYYY'),
        description: item.description,
        discounts: this.getDiscountForEntry(item),
        // discounts: [
        //   {calculationMethod: 'FIX_AMOUNT', amount: {type: 'DEBIT', amountForAccount: 0}, name: '', particular: ''},
        // ],
        hsnNumber: item.hsnNumber == null ? '' : item.hsnNumber,
        purchaseOrderItemMapping: { uniqueName: '', entryUniqueName: '' },
        sacNumber: item.sacNumber == null ? '' : item.sacNumber,
        taxes: this.getTaxesForEntry(item),
        // taxes: [],
        transactions: [
          {
            account: { uniqueName: item.uniqueName, name: item.name },
            amount: { type: 'DEBIT', amountForAccount: Number(item.rate) * Number(item.quantity) },
            stock: item.stock
              ? {
                quantity: item.quantity,
                sku: item.stock.skuCode,
                name: item.stock.name,

                uniqueName: item.stock.uniqueName,
                rate: {
                  rateForAccount: Number(item.rate)
                },
                stockUnit: {
                  code: item.stock.stockUnitCode
                },
                ...(item?.stock?.variant && {
                  variant: {
                  name: item.stock.variant.name,
                  uniqueName: item.stock.variant.uniqueName
                  }
                })
              }
              : undefined,
          },
        ],
        voucherNumber: '',
        voucherType: this.state.invoiceType,
      };
      entriesArray.push(entry);
    }
    return entriesArray;
  }

  async createInvoice() {
    try {
      this.setState({ loading: true });
      if (this.state.currency != this.state.companyCountryDetails.currency.code) {
        let exchangeRate = 1;
        (await this.getTotalAmount()) > 0
          ? (exchangeRate = Number(this.state.totalAmountInINR) / this.getTotalAmount())
          : (exchangeRate = 1);
        await this.setState({ exchangeRate: exchangeRate });
      }
      console.log('came to this');
      const postBody = this.state.companyVersionNumber == 1 ? {
        account: {
          attentionTo: '',
          // billingDetails: this.state.partyBillingAddress,
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName,
            },
            county: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName,
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : this.state.partyBillingAddress?.state?.code,
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : this.state.partyBillingAddress?.state?.name,
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : '',
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          currency: { code: this.state.currency },
          currencySymbol: this.state.currencySymbol,
          email: '',
          mobileNumber: '',
          name: this.state.partyName.name,
          // shippingDetails: this.state.partyShippingAddress,
          shippingDetails: {
            address: [this.state.partyShippingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            gstNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName,
            },
            county: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName,
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : this.state.partyShippingAddress?.state?.code,
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : this.state.partyShippingAddress?.state?.name,
            pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : '',
          },
          uniqueName: this.state.partyName.uniqueName,
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        // dueDate: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: "",
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.amountPaidNowText,
        },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        passportNumber: '',
        templateDetails: {
          other: {
            shippingDate: this.state.otherDetails.shipDate,
            shippedVia: this.state.otherDetails.shippedVia,
            trackingNumber: this.state.otherDetails.trackingNumber,
            customField1: this.state.otherDetails.customField1,
            customField2: this.state.otherDetails.customField2,
            customField3: this.state.otherDetails.customField3,
          },
        },
        touristSchemeApplicable: false,
        type: this.state.invoiceType,
        updateAccountDetails: false,
        salesPersonUniqueName: this.state.selectedSalesPerson?.uniqueName
      } : {
        account: {
          attentionTo: '',
          billingDetails: {
            address: [this.state.partyBillingAddress.address],
            countryName: this.state.countryDeatils.countryName,
            taxNumber: this.state.partyBillingAddress.gstNumber ? this.state.partyBillingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName,
            },
            county: {
              code: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.code : this.state.partyBillingAddress.stateCode,
              name: this.state.partyBillingAddress.state ? this.state.partyBillingAddress.state.name : this.state.partyBillingAddress.stateName,
            },
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            stateCode: this.state.partyBillingAddress.stateCode ? this.state.partyBillingAddress.stateCode : this.state.partyBillingAddress?.state?.code,
            stateName: this.state.partyBillingAddress.stateName ? this.state.partyBillingAddress.stateName : this.state.partyBillingAddress?.state?.name,
            pincode: this.state.partyBillingAddress.pincode ? this.state.partyBillingAddress.pincode : '',
          },
          contactNumber: '',
          country: this.state.countryDeatils,
          currency: { code: this.state.currency, symbol: this.state.currencySymbol },
          currencySymbol: this.state.currencySymbol,
          email: " ",
          mobileNumber: '',
          name: this.state.partyName.name,
          uniqueName: this.state.partyName.uniqueName,
          shippingDetails: {
            address: [this.state.partyShippingAddress.address],
            country: {
              code: this.state.countryDeatils.countryCode,
              name: this.state.countryDeatils.countryName,
            },
            taxNumber: this.state.partyShippingAddress.gstNumber ? this.state.partyShippingAddress.gstNumber : '',
            panNumber: '',
            state: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName,
            },
            county: {
              code: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.code : this.state.partyShippingAddress.stateCode,
              name: this.state.partyShippingAddress.state ? this.state.partyShippingAddress.state.name : this.state.partyShippingAddress.stateName,
            },
            stateCode: this.state.partyShippingAddress.stateCode ? this.state.partyShippingAddress.stateCode : this.state.partyShippingAddress?.state?.code,
            stateName: this.state.partyShippingAddress.stateName ? this.state.partyShippingAddress.stateName : this.state.partyShippingAddress?.state?.name,
            pincode: this.state.partyShippingAddress.pincode ? this.state.partyShippingAddress.pincode : '',
          },
        },
        date: moment(this.state.date).format('DD-MM-YYYY'),
        dueDate: "",
        deposit: {
          type: 'DEBIT',
          accountUniqueName: this.state.selectedPayMode.uniqueName,
          amountForAccount: this.state.amountPaidNowText,
        },
        entries: this.getEntries(),
        exchangeRate: this.state.exchangeRate,
        templateDetails: {
          other: {
            shippingDate: this.state.otherDetails.shipDate,
            shippedVia: this.state.otherDetails.shippedVia,
            trackingNumber: this.state.otherDetails.trackingNumber,
            customField1: this.state.otherDetails.customField1,
            customField2: this.state.otherDetails.customField2,
            customField3: this.state.otherDetails.customField3,
          },
        },
        type: this.state.invoiceType,
        updateAccountDetails: false,
        // Not having option to choose warehouse in mobile
        // "warehouse": {
        //   "name": "",
        //   "uniqueName": ""
        // },
        salesPersonUniqueName: this.state.selectedSalesPerson?.uniqueName
      }

      if (this.state.selectedInvoice != '') {
        this.state.companyVersionNumber == 1 ? postBody.invoiceLinkingRequest = { linkedInvoices: [this.state.linkedInvoices] }
          : postBody.referenceVoucher = this.state.linkedInvoices
      }

      console.log('postBody is', JSON.stringify(postBody));
      const results = await InvoiceService.createVoucher(
        postBody,
        this.state.partyName.uniqueName,
        this.state.companyVersionNumber
      );
      this.setState({ loading: false });
      if (results.body) {
        // this.setState({loading: false});
        alert(this.props.t('debitNote.debitNoteCreatedSuccessfully'));
        this.resetState();
        this.setActiveCompanyCountry();
        this.getAllTaxes();
        this.getAllDiscounts();
        this.getAllWarehouse();
        this.getAllAccountsModes();
        this.getCompanyVersionNumber();
        this.props.navigation.goBack();
        DeviceEventEmitter.emit(APP_EVENTS.DebitNoteCreated, {});
      }
    } catch (e) {
      console.log('problem occured', e);
      this.setState({ isSearchingParty: false, loading: false });
    }
  }

  renderAmount() {
    return (
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Text style={style.invoiceAmountText}>{`${this.state.currencySymbol} ${formatAmount(this.getTotalAmount())}`}</Text>
      </View>
    );
  }

  getSelectedDateDisplay() { }
  getYesterdayDate() {
    this.setState({ date: moment().subtract(1, 'days') });
  }

  getTodayDate() {
    this.setState({ date: moment() });
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

  hideDatePicker = () => {
    this.setState({ showDatePicker: false });
  };

  handleConfirm = (date) => {
    // console.log('A date has been picked: ', date);
    // this.setState({shipDate: moment(date).format('DD-MM-YYYY')});
    this.setState({ date: moment(date), selectedInvoice: '' });
    this.hideDatePicker();
    this.getAllInvoice();
  };

  _renderDateView() {
    const { date, displayedDate } = this.state;

    return (
      // <DateRangePicker
      // onChange={this.onDateChange}
      //   date={date}
      //   open={this.state.showDatePicker}
      //   displayedDate={displayedDate}
      //   buttonStyle={style.dateView}>
      //   <View style={style.dateView}>
      //     <View style={{flexDirection: 'row'}}>
      //       <Icon name={'Calendar'} color={'#ff6961'} size={16} />
      //       <Text style={style.selectedDateText}>{this.formatDate()}</Text>
      //     </View>
      //     <TouchableOpacity
      //       style={{borderColor: '#D9D9D9', borderWidth: 1, backgroundColor: 'pink'}}
      //       onPress={() =>
      //         this.state.date.startOf('day').isSame(moment().startOf('day'))
      //           ? this.getYesterdayDate()
      //           : this.getTodayDate()
      //       }>
      //       <Text style={{color: '#808080'}}>
      //         {this.state.date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
      //       </Text>
      //     </TouchableOpacity>
      //   </View>
      // </DateRangePicker>

      <View style={style.dateView}>
        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
          if (!this.state.partyName) {
            alert(this.props.t('common.pleaseSelectParty'));
          } else {
            this.setState({ showDatePicker: true })
          }
        }}>
          <Icon name={'Calendar'} color={'#ff6961'} size={16} />
          <Text style={style.selectedDateText}>{this.formatDate()}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ borderColor: '#D9D9D9', borderWidth: 1 }}
          onPress={() => {
            if (!this.state.partyName) {
              alert(this.props.t('common.pleaseSelectParty'));
            } else {
              this.state.date.startOf('day').isSame(moment().startOf('day'))
                ? this.getYesterdayDate()
                : this.getTodayDate()
            }
          }
          }>
          <Text style={{ color: '#808080' }}>
            {this.state.date.startOf('day').isSame(moment().startOf('day')) ? this.props.t('common.yesterday') : this.props.t('common.todayQ')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  invoiceBottomSheet(){
    const ListEmptyComponent = () => {
      return (
        <View style={{height: height * 0.3, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={style.regularText}>
            {this.props.t('creditNote.noInvoiceExist')}
          </Text>
        </View>
      )
    }
    const renderItem = ({item}) => {
      return (
        <TouchableOpacity
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          onPress={() => {
            this.state.allVoucherInvoice.length > 0
              ? this.setState({
                selectedInvoice: item.voucherNumber == null ? ' NA ' : item.voucherNumber,
                linkedInvoices: {
                  uniqueName: item.uniqueName,
                  voucherType: item.voucherType,
                  invoiceUniqueName: item.uniqueName,
                },
              })
              : null;
            this.setBottomSheetVisible(this.invoiceBottomSheetRef, false);
          }}
        >
        <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.regular }}>
          {this.state.allVoucherInvoice.length == 0
            ? item
            : item.voucherNumber == null
              ? 'NA'
              : item.voucherNumber}
              {console.log(this.state.allVoucherInvoice.length == 0
            ? item
            : item.voucherNumber == null
              ? 'NA'
              : item.voucherNumber)}
        </Text>
        {this.state.allVoucherInvoice.length != 0 ? (
          <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
            {`(${this.props.t('creditNote.dated')} : ` + item.voucherDate + ')'}
          </Text>
        ) : null}
        {this.state.allVoucherInvoice.length != 0 ? (
          <Text style={{ color: 'grey', fontFamily: FONT_FAMILY.regular }}>
            {`(${this.props.t('creditNote.dueColon')} ` + item.voucherTotal.amountForAccount + ')'}
          </Text>
        ) : null}
      </TouchableOpacity>
      )
    }
    return(
      <BottomSheet
        bottomSheetRef={this.invoiceBottomSheetRef}
        headerText={this.props.t('creditNote.selectInvoice')}
        headerTextColor='#ff6961'
        flatListProps={{
          data: this.state.allVoucherInvoice,
          renderItem: renderItem,
          ListEmptyComponent: <ListEmptyComponent/>
        }}
      />
    )
  }

  _renderSelectInvoice() {
    return (
      <View style={style.dateView}>
        <View style={{ flexDirection: 'row' }}>
          {/* <Icon name={'Calendar'} color={'#ff6961'} size={16} /> */}
          <Text style={style.InvoiceHeading}>{this.props.t('creditNote.invoiceHash')}</Text>
          <View style={{ flexDirection: 'row', width: '80%', marginHorizontal: 15, justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{flex: 1}}
              onPress={() => {
                this.setBottomSheetVisible(this.invoiceBottomSheetRef, true);
              }}
            >
              <Text style={{ color: '#808080', fontSize: 14, fontFamily: FONT_FAMILY.regular }}>
                {
                  this.state.selectedInvoice != '' ? this.state.selectedInvoice : this.props.t('common.selectAccount')
                }
              </Text>
            </TouchableOpacity>
            {this.state.selectedInvoice != '' ? (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  marginHorizontal: 15,
                  marginTop: -2,
                }}
                onPress={() => {
                    this.setState({
                      selectedInvoice: '',
                      linkedInvoices: '',
                    });
                }}>
                <AntDesign name="closecircleo" size={15} color={'grey'} />
                {/* <Text style={{marginLeft: 3}}>Close</Text> */}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  billingAddressArray() {
    const addressArray = this.state.partyBillingAddress;
    if (this.state.partyBillingAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils;
    }
    return addressArray;
  }

  selectBillingAddressFromEditAdress = async (address) => {
    console.log(JSON.stringify(address));
    const countryCode = address.selectedCountry.currency
      ? address.selectedCountry.currency.code
      : address.selectedCountry.countryCode;
    await this.setState({
      partyBillingAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode,
    });
    if (this.state.billSameAsShip) {
      this.setState({ partyShippingAddress: address });
    }
  };

  shippingAddressArray() {
    const addressArray = this.state.partyShippingAddress;
    if (this.state.partyShippingAddress.selectedCountry == null) {
      addressArray.selectedCountry = this.state.countryDeatils;
    }
    return addressArray;
  }

  selectShippingAddressFromEditAdress = (address) => {
    console.log(address);
    const countryCode = address.selectedCountry.currency
      ? address.selectedCountry.currency.code
      : address.selectedCountry.countryCode;
    this.setState({
      partyShippingAddress: address,
      countryDeatils: { countryName: address.selectedCountry.countryName, code: countryCode },
      currency: countryCode,
    });
  };

  _renderAddress() {
    return (
      <View style={style.senderAddress}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={'8'} color={'#ff6961'} size={16} />
          <Text style={style.addressHeaderText}>{this.props.t('creditNote.address')}</Text>
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert(this.props.t('common.pleaseSelectParty'));
                } else {
                  this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    activeAddress: this.state.partyBillingAddress,
                    type: 'address',
                    selectAddress: this.selectBillingAddress.bind(this),
                    color: '#ff6961',
                    statusBarColor: '#ff5355',
                    partyBillingAddress: this.state.partyBillingAddress
                  });
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {this.props.t('creditNote.billingAddress')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert(this.props.t('common.pleaseSelectParty'));
                } else {
                  this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.billingAddressArray(),
                    selectAddress: this.selectBillingAddressFromEditAdress.bind(this),
                    statusBarColor: '#ff5355',
                    headerColor: '#ff6961',
                  });
                }
              }}>
              <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
            </TouchableOpacity>
          </View>
          {/* <Icon name={'8'} color={'#229F5F'} size={16} /> */}
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              if (!this.state.partyName) {
                alert(this.props.t('common.pleaseSelectParty'));
              } else {
                this.props.navigation.navigate('SelectAddress', {
                  addressArray: this.state.addressArray,
                  activeAddress: this.state.partyBillingAddress,
                  type: 'address',
                  selectAddress: this.selectBillingAddress.bind(this),
                  color: '#ff6961',
                  statusBarColor: '#ff5355',
                  partyBillingAddress: this.state.partyBillingAddress
                });
              }
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.partyBillingAddress.address
                ? this.state.partyBillingAddress.address
                : this.state.partyBillingAddress.stateName
                  ? this.state.partyBillingAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : this.props.t('creditNote.selectBillingAddress')}
            </Text>
          </TouchableOpacity>
          {/* Sender Address View */}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            checkBoxColor={'#5773FF'}
            uncheckedCheckBoxColor={'#808080'}
            style={{ marginLeft: -3 }}
            onClick={() => {
              this.setState({
                billSameAsShip: !this.state.billSameAsShip,
                partyShippingAddress: this.state.partyBillingAddress,
              });
            }}
            isChecked={this.state.billSameAsShip}
          />
          <Text style={style.addressSameCheckBoxText}>{this.props.t('creditNote.shippingAddressSameAsBilling')}</Text>
          {/* <Text style={{ color: "#E04646", marginTop: 4 }}>*</Text> */}
        </View>
        <View style={{ paddingVertical: 6, marginTop: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{ width: '90%' }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert(this.props.t('common.pleaseSelectParty'));
                } else {
                  (!this.state.billSameAsShip
                    ? this.props.navigation.navigate('SelectAddress', {
                      addressArray: this.state.addressArray,
                      activeAddress: this.state.partyShippingAddress,
                      type: 'address',
                      selectAddress: this.selectShippingAddress.bind(this),
                      color: '#ff6961',
                      statusBarColor: '#ff5355',
                      partyShippingAddress: this.state.partyShippingAddress
                    }) : null)
                }
              }}>
              <Text numberOfLines={2} style={style.senderAddressText}>
                {this.props.t('creditNote.shippingAddress')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ height: '250%', width: '10%', alignItems: "flex-end" }}
              onPress={() => {
                if (!this.state.partyName) {
                  alert(this.props.t('common.pleaseSelectParty'));
                } else if (!this.state.billSameAsShip) {
                  this.props.navigation.navigate('EditAddress', {
                    dontChangeCountry: true,
                    address: this.shippingAddressArray(),
                    selectAddress: this.selectShippingAddressFromEditAdress.bind(this),
                    statusBarColor: '#ff5355',
                    headerColor: '#ff6961',
                  });
                }
              }}>
              <AntDesign name={'plus'} size={18} color={'#808080'} style={{ paddingLeft: '50%' }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ width: '90%' }}
            onPress={() => {
              if (!this.state.partyName) {
                alert(this.props.t('common.pleaseSelectParty'));
              } else {
                (!this.state.billSameAsShip
                  ? this.props.navigation.navigate('SelectAddress', {
                    addressArray: this.state.addressArray,
                    activeAddress: this.state.partyShippingAddress,
                    type: 'address',
                    selectAddress: this.selectShippingAddress.bind(this),
                    color: '#ff6961',
                    statusBarColor: '#ff5355',
                    partyShippingAddress: this.state.partyShippingAddress
                  }) : null)
              }
            }}>
            <Text numberOfLines={2} style={style.selectedAddressText}>
              {this.state.partyShippingAddress.address
                ? this.state.partyShippingAddress.address
                : this.state.partyShippingAddress.stateName
                  ? this.state.partyShippingAddress.stateName
                  : this.state.countryDeatils.countryName
                    ? this.state.countryDeatils.countryName
                    : this.props.t('creditNote.selectShippingAddress')}
            </Text>
          </TouchableOpacity>
          {/* Shipping Address View */}
        </View>
      </View>
    );
  }

  // https://api.giddh.com/company/mobileindore15161037983790ggm19/account-search?q=c&page=1&group=sundrydebtors&branchUniqueName=allmobileshop
  setCashTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.cash, showInvoiceModal: false });
  }

  setCreditTypeInvoice() {
    this.setState({ invoiceType: INVOICE_TYPE.debit, showInvoiceModal: false });
  }

  onDateChange = (dates) => {
    this.setState({
      ...dates,
      showDatePicker: false,
    });
  };

  updateAddedItems = async (addedItems) => {
    const updateAmountToCurrentCurrency = addedItems;
    if (this.state.currency.toString() != this.state.companyCountryDetails.currency.code.toString()) {
      try {
        const results = await InvoiceService.getExchangeRate(
          moment().format('DD-MM-YYYY'),
          this.state.currency,
          this.state.companyCountryDetails.currency.code,
        );
        if (results.body && results.status == 'success') {
          for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
            const item = updateAmountToCurrentCurrency[i];
            if (updateAmountToCurrentCurrency[i].currency.code.toString() != this.state.currency.toString()) {
              updateAmountToCurrentCurrency[i].currency = await {
                code: this.state.currency,
                symbol: this.state.currencySymbol,
              };
              updateAmountToCurrentCurrency[i].rate = await (Number(item.rate) * results.body);
            }
          }
        }
      } catch (e) { }
    }

    for (let i = 0; i < updateAmountToCurrentCurrency.length; i++) {
      if (updateAmountToCurrentCurrency[i].isNew == undefined || updateAmountToCurrentCurrency[i].isNew == true) {
        await this.DefaultStockAndAccountTax(updateAmountToCurrentCurrency[i])
        this.calculateTdsOrTcsAmountToDisplay(updateAmountToCurrentCurrency[i]);
      }
    }
    await this.setState({ addedItems: [...this.state.addedItems, ...updateAmountToCurrentCurrency] });
    await this.setState({
      totalAmountInINR: (Math.round(this.getTotalAmount() * this.state.exchangeRate * 100) / 100).toFixed(2),
    });
    await this.updateTCSAndTDSTaxAmount(updateAmountToCurrentCurrency);
  };

  calculateTdsOrTcsAmountToDisplay = (itemDetails) => {
    try {
      let totalTcsorTdsTax = 0;
      let totalTcsorTdsTaxName = '';
      const discountAmount = Number(itemDetails?.discountValue);
      let totalTaxableAmount = 0;
      let amt = Number(itemDetails.rate) * Number(itemDetails.quantityText);
      amt = amt - (discountAmount ? discountAmount : 0) ;
      if (itemDetails?.taxDetailsArray && itemDetails?.taxDetailsArray?.length > 0) {
        for (let i = 0; i < itemDetails?.taxDetailsArray?.length; i++) {
          const item = itemDetails?.taxDetailsArray[i];
          const taxPercent = Number(item.taxDetail[0].taxValue);
          if (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') {
            if(itemDetails.tdsTcsTaxCalculationMethod == 'OnTaxableAmount'){
              totalTaxableAmount = amt;
            }else if(itemDetails.tdsTcsTaxCalculationMethod == 'OnTotalAmount'){
              totalTaxableAmount = amt + (itemDetails?.taxText ? Number(itemDetails?.taxText) : 0);
            }
            const taxAmount = (taxPercent * Number(totalTaxableAmount)) / 100;
            totalTcsorTdsTax = taxAmount;
            totalTcsorTdsTaxName = item.taxType;
            break;
          }
        }
      }
      if (totalTcsorTdsTaxName != '' && totalTcsorTdsTax != 0) {
        const tdsOrTcsTaxObj = { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2) };
        itemDetails.tdsOrTcsTaxObj = tdsOrTcsTaxObj
      } else {
        itemDetails.tdsOrTcsTaxObj = null;
      }
      return itemDetails
    } catch (error) {
      console.log("errr", error);
      return null;
    }
  }

  async DefaultStockAndAccountTax(itemDetails) {
    let editItemDetails = itemDetails
    const stockInputHadTaxIds =
      !!itemDetails.stock &&
      ((Array.isArray(itemDetails.stock.taxes) && itemDetails.stock.taxes.length > 0) ||
        (Array.isArray(itemDetails.stock.groupTaxes) && itemDetails.stock.groupTaxes.length > 0));
    const stockTaxesSnapshot =
      editItemDetails.stock && Array.isArray(editItemDetails.stock.taxes)
        ? [...editItemDetails.stock.taxes]
        : undefined;
    const stockGroupTaxesSnapshot =
      editItemDetails.stock && Array.isArray(editItemDetails.stock.groupTaxes)
        ? [...editItemDetails.stock.groupTaxes]
        : undefined;
    let taxDetailsArray = []
    let selectedTaxArray = []
    let discountDetailsArray = editItemDetails.percentDiscountArray ? [...editItemDetails.percentDiscountArray] : []
    let resolvedLinkedTaxNames = []

    if (itemDetails.stock) {
      const stock = itemDetails.stock;
      const stockHasAny =
        (Array.isArray(stock.taxes) && stock.taxes.length > 0) ||
        (Array.isArray(stock.groupTaxes) && stock.groupTaxes.length > 0);
      const resolvedStockOrAccountNames = stockHasAny
        ? this.resolveTaxAndGroupTaxNames(stock.taxes, stock.groupTaxes, { whenBothNonEmpty: 'preferTaxes' })
        : this.resolveTaxAndGroupTaxNames(itemDetails.taxes, itemDetails.groupTaxes, {
            whenBothNonEmpty: 'intersection'
          });
      resolvedLinkedTaxNames = resolvedStockOrAccountNames.slice();
      for (let i = 0; i < resolvedStockOrAccountNames.length; i++) {
        this.pushLinkedTaxDetail(taxDetailsArray, selectedTaxArray, resolvedStockOrAccountNames[i]);
      }
    } else {
      const resolvedNames = this.resolveTaxAndGroupTaxNames(itemDetails.taxes, itemDetails.groupTaxes, {
        whenBothNonEmpty: 'intersection'
      });
      resolvedLinkedTaxNames = resolvedNames.slice();
      for (let i = 0; i < resolvedNames.length; i++) {
        this.pushLinkedTaxDetail(taxDetailsArray, selectedTaxArray, resolvedNames[i]);
      }
    }

    if (itemDetails.stock && editItemDetails.hsnNumber == null) {
      if (itemDetails.stock.hsnNumber) {
        editItemDetails.hsnNumber = itemDetails.stock.hsnNumber
      }
    }
    if (itemDetails.stock && editItemDetails.sacNumber == null) {
      if (itemDetails.stock.sacNumber) {
        editItemDetails.sacNumber = itemDetails.stock.sacNumber
      }
    }

    const accountHasTaxHierarchy = !itemDetails.stock && this.lineHasTaxHierarchyLinkage(itemDetails);
    if (this.state.defaultAccountTax && !accountHasTaxHierarchy) {
      for (var i = 0; i < this.state.defaultAccountTax.length; i++) {
        this.pushLinkedTaxDetail(taxDetailsArray, selectedTaxArray, this.state.defaultAccountTax[i]);
      }
    }

    const filtered = this.filterTaxDetailsByApplicableAndLinked(
      taxDetailsArray,
      selectedTaxArray,
      resolvedLinkedTaxNames,
      editItemDetails
    );
    taxDetailsArray = filtered.taxDetailsArray;
    selectedTaxArray = filtered.selectedTaxArray;

    if (this.state.defaultAccountDiscount) {
      for (var i = 0; i < this.state.defaultAccountDiscount.length; i++) {
        var discountDetails = this.getDiscountDeatilsForUniqueName(this.state.defaultAccountDiscount[i])
        discountDetails ? discountDetailsArray.push(discountDetails) : null
      }
    }

    editItemDetails.taxDetailsArray = taxDetailsArray
    editItemDetails.selectedArrayType = selectedTaxArray
    editItemDetails.quantityText = editItemDetails.quantity
    editItemDetails.rateText = editItemDetails.rate
    editItemDetails.percentDiscountArray = discountDetailsArray
    editItemDetails.amountText = editItemDetails.quantityText > 1 ? editItemDetails.quantityText * editItemDetails.rate : editItemDetails.rate
    editItemDetails.amount = editItemDetails.quantityText > 1 ? editItemDetails.quantityText * editItemDetails.rate : editItemDetails.rate
    editItemDetails.discountValue = this.calculateDiscountedAmount(editItemDetails)
    editItemDetails.isNew = false
    if(editItemDetails?.stock?.variant){
      editItemDetails.unitText = editItemDetails?.stock?.variant?.stockUnitCode;
    } else if(editItemDetails?.stock){
      editItemDetails.unitText = editItemDetails?.stock?.stockUnitCode;
    }
    editItemDetails.tax = this.calculatedTaxAmount(editItemDetails, 'taxAmount')

    if (editItemDetails.stock) {
      if (stockGroupTaxesSnapshot !== undefined && stockGroupTaxesSnapshot.length > 0) {
        editItemDetails.stock.groupTaxes = [...stockGroupTaxesSnapshot];
      }
      if (stockTaxesSnapshot !== undefined && stockTaxesSnapshot.length > 0) {
        editItemDetails.stock.taxes = [...stockTaxesSnapshot];
      } else if (stockInputHadTaxIds && resolvedLinkedTaxNames.length > 0) {
        editItemDetails.stock.taxes = [...resolvedLinkedTaxNames];
      }
    }
  }

  renderAddItemButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.state.invoiceType == INVOICE_TYPE.cash || this.state.partyName) {
            this.props.navigation.navigate('AddInvoiceItemScreen', {
              updateAddedItems: this.updateAddedItems.bind(this),
              addedItems: this.state.addedItems,
              currencySymbol: this.state.currencySymbol,
            });
          } else {
            alert(this.props.t('common.pleaseSelectParty'));
          }
        }}
        // onPress={() => console.log(this.state.partyShippingAddress)}
        style={{
          marginVertical: 16,
          paddingVertical: 10,
          flexDirection: 'row',
          borderColor: '#ff6961',
          borderWidth: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          width: '90%',
        }}>
        <AntDesign name={'plus'} color={'#ff6961'} size={18} style={{ marginHorizontal: 8 }} />
        <Text style={style.addItemMain}> {this.props.t('creditNote.addItem')}</Text>
      </TouchableOpacity>
    );
  }

  _renderSelectedStock() {
    return (
      <View>
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <Icon name={'Path-13016'} color="#ff6961" size={18} />
            <Text style={{ marginLeft: 10 }}>{this.props.t('creditNote.selectProductService')}</Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              borderColor: '#ff6961',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems:'center',
              paddingHorizontal:5,
              borderRadius:2
            }}
            onPress={() => {
              this.props.navigation.navigate('AddInvoiceItemScreen', {
                updateAddedItems: this.updateAddedItems.bind(this),
                addedItems: this.state.addedItems,
                currencySymbol: this.state.currencySymbol,
              });
            }}>
            <AntDesign name={'plus'} color={'#ff6961'} size={16} />
            <Text style={[style.addItemMain, { fontFamily: FONT_FAMILY.regular, fontSize: 14 }]}> {this.props.t('creditNote.addItem')}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.addedItems}
          style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          renderItem={({ item }) => this.renderStockItem(item)}
        />
      </View>
    );
  }

  addItem = (item) => {
    let newItems = this.state.addedItems;

    let uniqueName = item.stock ? item.stock.uniqueName : item.uniqueName
    var uniqueNumber = uniqueName.match(/\d+$/) != null ? Number(uniqueName.match(/\d+$/)[0]) + 1 : 1
    uniqueName = uniqueName.replace(/\d+$/, "") + uniqueNumber.toString();

    console.log("UniqueName " + uniqueName)

    item["newUniqueName"] = uniqueName

    newItems.push(item);
    this.setState({ addedItems: newItems });
    this.updateTCSAndTDSTaxAmount(newItems);
    if (item.rate) {
      const totalAmount = this.getTotalAmount();
      this.setState({
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2),
      });
    }
  };

  deleteItem = (item) => {
    const addedArray = this.state.addedItems;
    const itemUniqueName = item.newUniqueName ? item.newUniqueName : (item.stock ? item.stock.uniqueName : item.uniqueName);
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.newUniqueName ? e.newUniqueName : (e.stock ? e.stock.uniqueName : e.uniqueName);
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    addedArray.splice(index, 1);
    this.setState({ addedItems: addedArray, showItemDetails: false }, () => { });
    this.updateTCSAndTDSTaxAmount(addedArray);
    if (item.rate) {
      const totalAmount = this.getTotalAmount();
      this.setState({
        totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2),
      });
    }
  };

  renderRightAction(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.deleteItem(item);
        }}
        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <AntDesign name={'delete'} size={16} color="#E04646" />
        <Text style={{ color: '#E04646', marginLeft: 10 }}>{this.props.t('creditNote.delete')}</Text>
      </TouchableOpacity>
    );
  }

  renderStockItem(item) {
    return (
      <Swipeable
        onSwipeableRightOpen={() => console.log('Swiped right')}
        renderRightActions={() => this.renderRightAction(item)}>
        <TouchableOpacity
          style={{ backgroundColor: 'rgba(255, 99, 71, 0.1)', padding: 10, borderRadius: 2, marginBottom: 10 }}
          onPress={() => {
            this.setState({
              showItemDetails: true,
              itemDetails: item,
              editItemDetails: {
                quantityText: item.quantity,
                rateText: item.rate,
                unitText: '',
                amountText: '',
                discountValueText: '',
                discountPercentageText: '',
                discountType: '',
                taxType: '',
                taxText: '',
                warehouse: '',
                total: 0,
              },
            });
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 5 }}>
            <View style={{ flexDirection: 'row', width: "55%", }}>
              <Text numberOfLines={1} style={{ color: '#1C1C1C' }}>{item.name}</Text>
              {item.stock && (
                <Text numberOfLines={1} style={{ color: '#1C1C1C', flex: 1 }}>
                  ( {`${item.stock.name}`} ) {item?.stock?.isMultiVariant ? `- ${item?.stock?.variant?.name}` : ''}
                </Text>
              )}
            </View>
              <Text style={{ color: '#808080' }}>
                {String(item.quantity)} x {this.state.currencySymbol}
                {String(item.rate)}
              </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{width: '50%', flexWrap: 'wrap'}}>
              {item?.tdsOrTcsTaxObj ? <Text style={{ color: '#808080' }}>
                {item.tdsOrTcsTaxObj.name + ' : ' +formatAmount(item.tdsOrTcsTaxObj.amount)}
              </Text>:<></>}
            </View>
            <View style={{width: '50%', flexWrap: 'wrap', alignContent: 'flex-end', alignContent: 'flex-end', alignItems: 'center' }}>
              <Text style={{ color: '#808080' }}>
                {this.props.t('creditNote.tax')} : {this.state.currencySymbol}
                {formatAmount(this.calculatedTaxAmount(item, 'taxAmount'))}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
            <View style={{width: '50%', flexWrap: 'wrap'}}>
              <Text style={{ color: '#808080' }}>
                {this.props.t('creditNote.discount')} : {this.state.currencySymbol}
                {formatAmount(item.discountValue ? item.discountValue : 0)}
              </Text>
            </View>
            <View style={{width: '50%', flexWrap: 'wrap', alignContent: 'flex-end', alignItems: 'center'}}>
              <Text style={{ color: '#808080' }}>
                {this.props.t('creditNote.total')} : {this.state.currencySymbol}
                {formatAmount(this.getTotalAmountOfCard(item))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  onChangeTextBottomItemSheet(text, field) {
    const editItemDetails = this.state.editItemDetails;
    switch (field) {
      case 'Quantity':
        editItemDetails.quantityText = text;
        break;

      case 'Unit':
        editItemDetails.unitText = text;
        break;

      case 'Rate':
        editItemDetails.rateText = text;
        break;

      case 'Amount':
        editItemDetails.amountText = text;
        break;

      case 'Discount Value':
        editItemDetails.discountValueText = text;
        break;

      case 'Discount Percentage':
        editItemDetails.discountPercentageText = text;
        break;
    }
    this.setState({ editItemDetails });
  }

  _renderBottomSeprator(margin = 0) {
    return (
      <View
        style={{ height: 1, bottom: 0, backgroundColor: '#D9D9D9', position: 'absolute', left: margin, right: margin }}
      />
    );
  }

  calculateDiscountedAmount(itemDetails) {
    let totalDiscount = 0;
    let percentDiscount = 0;
    // Fixed discount was only applied inside EditItemDetails, so copied vouchers showed
    // the value as a placeholder but left discountValue/total as 0 until Done was pressed.
    if (itemDetails?.fixedDiscount && Number(itemDetails.fixedDiscount.discountValue) > 0) {
      totalDiscount = totalDiscount + Number(itemDetails.fixedDiscount.discountValue);
    }
    if (itemDetails.percentDiscountArray && itemDetails.percentDiscountArray.length > 0) {
      for (let i = 0; i < itemDetails.percentDiscountArray.length; i++) {
        percentDiscount = percentDiscount + itemDetails.percentDiscountArray[i].discountValue;
      }
      const amt = Number(itemDetails.rateText) * Number(itemDetails.quantityText);
      totalDiscount = totalDiscount + (Number(percentDiscount) * amt) / 100;
    }
    return totalDiscount;
  }

  getLineQtyForItem(itemDetails) {
    const fromField = Number(itemDetails.quantity);
    const fromText =
      itemDetails.quantityText != null && itemDetails.quantityText !== ''
        ? Number(itemDetails.quantityText)
        : NaN;
    if (Number.isFinite(fromText) && !(fromText === 0 && Number.isFinite(fromField) && fromField !== 0)) {
      return fromText;
    }
    return Number.isFinite(fromField) ? fromField : 0;
  }

  getLineRateForItem(itemDetails) {
    const fromField = Number(itemDetails.rate);
    const fromText =
      itemDetails.rateText != null && itemDetails.rateText !== ''
        ? Number(itemDetails.rateText)
        : NaN;
    if (Number.isFinite(fromText) && !(fromText === 0 && Number.isFinite(fromField) && fromField !== 0)) {
      return fromText;
    }
    return Number.isFinite(fromField) ? fromField : 0;
  }

  getTaxableAmountForItem(itemDetails) {
    const base = this.getLineQtyForItem(itemDetails) * this.getLineRateForItem(itemDetails);
    const disc = Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    const d = Number.isFinite(disc) ? disc : 0;
    return Math.max(0, base - d);
  }

  calculatedTaxAmount(itemDetails, calculateFor = 'taxAmount') {
    let totalTax = 0;
    const companyInr =
      this.state.currency != this.state.companyCountryDetails?.currency?.code &&
      this.state.companyCountryDetails?.currency?.code == 'INR';
    if (companyInr && calculateFor == 'totalAmount') {
      return 0;
    }
    let amt = this.getTaxableAmountForItem(itemDetails);
    const rows = this.getTaxRowsForCalculation(itemDetails);
    const useInrSez =
      this.state.companyCountryDetails?.currency?.code == 'INR' &&
      this.state.currency != this.state.companyCountryDetails?.currency?.code;

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      if (!item?.taxDetail?.[0]) {
        continue;
      }
      if (useInrSez) {
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        if (
          (item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc') &&
          calculateFor != 'taxAmount'
        ) {
          totalTax = item.taxType == 'tdspay' || item.taxType == 'tdsrc' ? totalTax - taxAmount : totalTax + taxAmount;
        } else if (calculateFor == 'taxAmount') {
          totalTax =
            item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc'
              ? totalTax
              : totalTax + taxAmount;
        }
      } else {
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        if (calculateFor == 'InvoiceDue') {
          totalTax = item.taxType == 'tdspay' || item.taxType == 'tdsrc' ? totalTax - taxAmount : totalTax + taxAmount;
        } else {
          totalTax =
            item.taxType == 'tdspay' || item.taxType == 'tcspay' || item.taxType == 'tcsrc' || item.taxType == 'tdsrc'
              ? totalTax
              : totalTax + taxAmount;
        }
      }
    }
    return Number(totalTax.toFixed(2));
  }

  calculatedTdsOrTcsTaxAmount(itemDetails) {
    let totalTcsorTdsTax = 0;
    let totalTcsorTdsTaxName = '';

    const taxArr = this.state.taxArray;
    let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
    let totalTaxableAmount = 0;
    amt = amt - Number(itemDetails.discountValue ? itemDetails.discountValue : 0);
    if (itemDetails.taxDetailsArray && itemDetails.taxDetailsArray.length > 0) {
      for (let i = 0; i < itemDetails.taxDetailsArray.length; i++) {
        const item = itemDetails.taxDetailsArray[i];
        const taxPercent = Number(item.taxDetail[0].taxValue);
        const taxAmount = (taxPercent * Number(amt)) / 100;
        if (
          item.taxType == 'tdspay' ||
          item.taxType == 'tcspay' ||
          item.taxType == 'tcsrc' ||
          item.taxType == 'tdsrc'
        ) {
          if(itemDetails.tdsTcsTaxCalculationMethod == 'OnTaxableAmount'){
            totalTaxableAmount = amt;
          }else if(itemDetails.tdsTcsTaxCalculationMethod == 'OnTotalAmount'){
            totalTaxableAmount = amt + (itemDetails?.tax ? Number(itemDetails?.tax) : 0);
          }
          const taxAmount = (taxPercent * Number(totalTaxableAmount)) / 100;
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
            if (
              taxArr[j].taxType == 'tdspay' ||
              taxArr[j].taxType == 'tcspay' ||
              taxArr[j].taxType == 'tcsrc' ||
              taxArr[j].taxType == 'tdsrc'
            ) {
              if(itemDetails?.tdsTcsTaxCalculationMethod == 'OnTaxableAmount'){
                totalTaxableAmount = amt;
              }else if(itemDetails?.tdsTcsTaxCalculationMethod == 'OnTotalAmount'){
                totalTaxableAmount = amt + (itemDetails?.tax ? Number(itemDetails?.tax) : 0);
              }
              const taxAmount = (taxPercent * Number(totalTaxableAmount)) / 100;
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
      let tdsOrTcsTaxObj = { name: totalTcsorTdsTaxName, amount: totalTcsorTdsTax.toFixed(2) };
      return tdsOrTcsTaxObj;
    } else {
      return null;
    }
  }

  // calculatedTaxAmount(itemDetails) {
  //   let totalTax = 0;
  //   let amt = Number(itemDetails.rate) * Number(itemDetails.quantity);
  //   let taxArr = this.state.taxArray;
  //   if (itemDetails.stock != null && itemDetails.stock.taxes.length > 0) {
  //     for (let i = 0; i < itemDetails.stock.taxes.length; i++) {
  //       let item = itemDetails.stock.taxes[i];
  //       for (let j = 0; j < taxArr.length; j++) {
  //         if (item == taxArr[j].uniqueName) {
  //           // console.log('tax value is ', taxArr[j].taxDetail[0].taxValue);
  //           let taxPercent = Number(taxArr[j].taxDetail[0].taxValue);
  //           let taxAmount = (taxPercent * Number(amt)) / 100;
  //           totalTax = totalTax + taxAmount;
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   // console.log('calculated tax is ', totalTax);
  //   return Number(totalTax);
  // }

  getTotalAmount() {
    let total = 0;
    for (let i = 0; i < this.state.addedItems.length; i++) {
      const item = this.state.addedItems[i];
      const discount = item.discountValue ? item.discountValue : 0;
      const tax = this.calculatedTaxAmount(item, 'totalAmount');
      const amount = this.getLineRateForItem(item) * this.getLineQtyForItem(item);
      total = total + amount - discount + tax;
    }
    return total.toFixed(2);
  }

  getTotalAmountOfCard(item){
    const discount = item.discountValue ? item.discountValue : 0;
    const tax = this.calculatedTaxAmount(item, 'totalAmount');
    const amount = this.getLineRateForItem(item) * this.getLineQtyForItem(item);
    const total = amount - discount + tax;
    return total;
  }

  _renderOtherDetails() {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 8,
          paddingHorizontal: 16,
          marginTop: 8,
        }}
        onPress={() => {
          if (!this.state.partyName) {
            alert(this.props.t('common.pleaseSelectParty'));
          } else {
            this.props.navigation.navigate('InvoiceOtherDetailScreen', {
              enteredDetails: this.state.otherDetails,
              warehouseArray: this.state.warehouseArray,
              setOtherDetails: this.setOtherDetails,
            })
          }
        }}>
        <View style={{ flexDirection: 'row' }}>
          <Icon style={{ marginRight: 16 }} name={'Sections'} size={16} color="#ff6961" />
          <Text style={{ color: '#1C1C1C' }}>{this.props.t('creditNote.otherDetails')}</Text>
        </View>
        <AntDesign name={'right'} size={18} color={'#808080'} />
      </TouchableOpacity>
    );
  }

  _renderPaymentMode() {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.state.showPaymentModePopup}
        onRequestClose={() => {
          this.setState({ showPaymentModePopup: false });
        }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
          }}
          onPress={() => {
            this.setState({ showPaymentModePopup: false });
          }}>
          <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 10, alignSelf: 'center' }}>
            {this.state.invoiceType == 'sales' && (
              <TextInput
                value={this.state.amountPaidNowText}
                keyboardType="number-pad"
                returnKeyType={'done'}
                placeholder={this.props.t('creditNote.enterAmount')}
                placeholderTextColor="black"
                onChangeText={(text) => {
                  this.setState({ amountPaidNowText: text });
                }}
              />
            )}
            <FlatList
              data={this.state.modesArray}
              style={{ paddingLeft: 5, paddingRight: 10, paddingBottom: 10, maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    borderBottomWidth: this.state.selectedPayMode.uniqueName == item.uniqueName ? 2 : 0,
                    borderColor: '#ff6961',
                    alignSelf: 'flex-start',
                    // backgroundColor: 'pink',
                    width: '100%',
                  }}
                  onFocus={() => this.onChangeText('')}
                  onPress={async () => {
                    this.setState({ selectedPayMode: item });
                    if (this.state.amountPaidNowText != 0) {
                      this.setState({ showPaymentModePopup: false });
                    }
                  }}>
                  <Text style={{ color: '#1C1C1C', paddingVertical: 10, textAlign: 'left' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

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
          <View style={{ flexDirection: 'row' }}>
            <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color="#ff6961" />
            <Text style={{ color: '#1C1C1C' }}>{this.props.t('creditNote.balance')}</Text>
          </View>
          <Icon
            style={{ transform: [{ rotate: this.state.expandedBalance ? '180deg' : '0deg' }] }}
            name={'9'}
            size={16}
            color="#808080"
            onPress={() => {
              this.setState({ expandedBalance: !this.state.expandedBalance });
            }}
          />
        </View>

        {this.state.expandedBalance && (
          <View style={{ margin: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#1C1C1C' }}>{this.props.t('creditNote.totalAmount') + ' ' + this.state.currencySymbol}</Text>
              <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(this.getTotalAmount())}</Text>
            </View>
          </View>
        )}
        {this.state.tdsOrTcsArray.length != 0 ? (
          <FlatList
            data={this.state.tdsOrTcsArray}
            renderItem={({ item }) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 16,
                    marginVertical: 6,
                  }}>
                  <Text style={{ color: '#1C1C1C' }}>{item.name}</Text>
                  <Text style={{ color: '#1C1C1C' }}>{this.state.currencySymbol + formatAmount(item.amount)}</Text>
                </View>
              );
            }}
          />
        ) : null}
        {/* <View style={{ justifyContent: 'flex-end', flexDirection: 'row', marginTop: 20, margin: 16 }}>
          <TouchableOpacity
            onPress={() => {
              this.genrateInvoice();
            }}>
            <Icon name={'path-18'} size={48} color={'#5773FF'} />
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }

  _renderSaveButton() {
    return (
      <TouchableOpacity
        style={{ flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60 }}
        onPress={() => {
          this.genrateInvoice();
        }}>
        <Icon name={'path-18'} size={48} color={'#5773FF'} />
      </TouchableOpacity>
    );
  }

  genrateInvoice() {
    if (!this.state.partyName) {
      alert(this.props.t('common.pleaseSelectParty'));
    } else if (this.state.addedItems.length == 0) {
      alert(this.props.t('creditNote.pleaseSelectEntries'));
    } else if (
      this.state.currency != this.state.companyCountryDetails.currency.code &&
      this.state.totalAmountInINR <= 0 &&
      this.getTotalAmount() > 0
    ) {
      Alert.alert(this.props.t('common.error'), this.props.t('creditNote.exchangeRateError'), [
        { style: 'destructive', onPress: () => console.log('alert destroyed') },
        ,
      ]);
    } else if (
      this.state.currency == this.state.companyCountryDetails.currency.code &&
      (!this.state.partyBillingAddress.stateName ||
        !this.state.partyBillingAddress.stateCode ||
        !this.state.partyBillingAddress.state)
    ) {
      Alert.alert(this.props.t('creditNote.emptyStateDetails'), this.props.t('creditNote.pleaseAddStateBilling'), [
        { style: 'destructive', text: this.props.t('creditNote.okay') },
        ,
      ]);
    } else if (
      this.state.currency == this.state.companyCountryDetails.currency.code &&
      (!this.state.partyShippingAddress.stateName ||
        !this.state.partyShippingAddress.stateCode ||
        !this.state.partyShippingAddress.state)
    ) {
      Alert.alert(this.props.t('creditNote.emptyStateDetails'), this.props.t('creditNote.pleaseAddStateShipping'), [
        { style: 'destructive', text: this.props.t('creditNote.okay') },
        ,
      ]);
    } else {
      this.createInvoice();
    }
  }

  updateEditedItem(details, selectedArrayType, selectedCode) {
    const itemUniqueName = details.item.newUniqueName ? details.item.newUniqueName : (details.item.stock ? details.item.stock.uniqueName : details.item.uniqueName);

    const addedArray = this.state.addedItems;
    const index = _.findIndex(
      addedArray,
      (e) => {
        const ouniqueName = e.newUniqueName ? e.newUniqueName : (e.stock ? e.stock.uniqueName : e.uniqueName);
        return ouniqueName == itemUniqueName;
      },
      0,
    );
    const item = this.state.addedItems[index];
    item.quantity = Number(details.quantityText);
    item.quantityText = details.quantityText;
    item.description = details.description;
    item.rate = Number(details.rateText);
    item.rateText = details.rateText;
    item.unit = Number(details.unitText);
    item.total = Number(details.total);
    item.amount = Number(details.amountText);
    item.amountText = details.amountText;
    item.discountPercentage = Number(details.discountPercentageText);
    item.discountValue = Number(details.discountValueText);
    item.discountType = Number(details.discountType);
    item.taxType = Number(details.taxType);
    item.tax = Number(details.taxText);
    item.hsnNumber = selectedCode == 'hsn' ? details.hsnNumber : '';
    item.sacNumber = selectedCode == 'sac' ? details.sacNumber : '';
    item.warehouse = Number(details.warehouse);
    item.discountDetails = details.discountDetails ? details.discountDetails : undefined;
    item.taxDetailsArray = details.taxDetailsArray;
    item.percentDiscountArray = details.percentDiscountArray ? details.percentDiscountArray : [];
    item.fixedDiscount = details.fixedDiscount ? details.fixedDiscount : { discountValue: 0 };
    item.fixedDiscountUniqueName = details.fixedDiscountUniqueName ? details.fixedDiscountUniqueName : '';
    item.selectedArrayType = selectedArrayType;
    item.tdsTcsTaxCalculationMethod = details.tdsTcsTaxCalculationMethod;
    item.tdsOrTcsTaxObj = details.tdsOrTcsTaxObj;
    if(item?.stock?.variant){
      item.stock.variant.stockUnitCode = details.unitText;
    } else if(item?.stock){
      item.stock.stockUnitCode = details.unitText;
    }
    // Replace item at index using native splice
    addedArray.splice(index, 1, item);
    this.setState({ showItemDetails: false, addedItems: addedArray }, () => { });

    const totalAmount = this.getTotalAmount();
    this.setState({ totalAmountInINR: (Math.round(totalAmount * this.state.exchangeRate * 100) / 100).toFixed(2) });

    this.updateTCSAndTDSTaxAmount(addedArray);
    // this.setState({ addedItems: addedItems })
    // this.setState({showItemDetails:false})
  }

  updateTCSAndTDSTaxAmount(addedArray) {
    let alltdsOrTcsTaxArr = [];
    let tcsTaxObj = { name: 'TCS', amount: 0 };
    let tdsTaxObj = { name: 'TDS', amount: 0 };
    for (let i = 0; i < addedArray.length; i++) {
      let tdsOrTcsTaxObj = this.calculatedTdsOrTcsTaxAmount(addedArray[i]);
      if (tdsOrTcsTaxObj != null) {
        tdsTaxObj.amount =
          tdsOrTcsTaxObj.name == 'tdspay' || tdsOrTcsTaxObj.name == 'tdsrc'
            ? (Number(tdsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2)
            : tdsTaxObj.amount;
        tcsTaxObj.amount =
          tdsOrTcsTaxObj.name == 'tcspay' || tdsOrTcsTaxObj.name == 'tcsrc'
            ? (Number(tcsTaxObj.amount) + Number(tdsOrTcsTaxObj.amount)).toFixed(2)
            : tcsTaxObj.amount;
      }
    }
    tcsTaxObj.amount != 0 ? alltdsOrTcsTaxArr.push(tcsTaxObj) : null;
    tdsTaxObj.amount != 0 ? alltdsOrTcsTaxArr.push(tdsTaxObj) : null;
    this.setState({ tdsOrTcsArray: alltdsOrTcsTaxArr });
  }

  componentWillUnmount() {
    this.keyboardWillShowSub = undefined;
    this.keyboardWillHideSub = undefined;
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Animated.ScrollView
          keyboardShouldPersistTaps="never"
          style={[{ flex: 1, backgroundColor: 'white' }, { marginBottom: this.keyboardMargin }]}
          bounces={false}>
          <View style={[style.container, { paddingBottom: 80 }]}>
            <View style={style.headerConatiner}>
              {this.renderHeader()}
              {this.renderSelectPartyName()}
              {this.renderAmount()}
              <SalesPersonComponent setSelectedSalesPerson={this.setSelectedSalesPerson} selectedSalesPerson={this.state.selectedSalesPerson} themecolor={"#ff6961"} />
            </View>
            {this._renderDateView()}
            {this._renderAddress()}
            {this._renderSelectInvoice()}
            {this._renderOtherDetails()}
            {this.state.addedItems.length > 0 ? this._renderSelectedStock() : this.renderAddItemButton()}
            {this.state.addedItems.length > 0 && this._renderTotalAmount()}
            {this.state.showInvoiceModal && this.renderInvoiceTypeModal()}
            {this.state.showPaymentModePopup && this._renderPaymentMode()}
            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              pickerComponentStyleIOS={{height: 250}}
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />
            {/* <TouchableOpacity
            style={{height: 60, width: 60, backgroundColor: 'pink'}}
            onPress={() => console.log(this.state.otherDetails)}></TouchableOpacity> */}
          </View>

          {this.state.searchResults.length > 0 && this._renderSearchList()}
          <Modal
            visible={this.state.loading}
            transparent
            statusBarTranslucent
          >
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)'}}>
              <LoaderKit
                style={{ width: 45, height: 45 }}
                name={'LineScale'}
                color={color.PRIMARY_NORMAL}
              />
            </View>
          </Modal>
        </Animated.ScrollView>
        {this.state.showItemDetails && (
          <EditItemDetail
            currencySymbol={this.state.currencySymbol}
            notIncludeTax={
              this.state.currency != this.state.companyCountryDetails?.currency?.code &&
              this.state.companyCountryDetails?.currency?.code == 'INR'
                ? false
                : true
            }
            zeroLineTotalTax={
              this.state.currency != this.state.companyCountryDetails?.currency?.code &&
              this.state.companyCountryDetails?.currency?.code == 'INR'
            }
            useInrSezTaxRowLogic={
              this.state.companyCountryDetails?.currency?.code == 'INR' &&
              this.state.currency != this.state.companyCountryDetails?.currency?.code
            }
            discountArray={this.state.discountArray}
            taxArray={this.state.taxArray}
            goBack={() => {
              this.setState({ showItemDetails: false });
            }}
            // selectedArrayType={this.state.itemDetails.selectedArrayType}
            itemDetails={this.state.itemDetails}
            updateItems={(details, selectedArr, selectedCode) => {
              this.updateEditedItem(details, selectedArr, selectedCode);
            }}
          />
        )}
        {this.state.addedItems.length > 0 && !this.state.showItemDetails && this._renderSaveButton()}
        {this.invoiceBottomSheet()}
        {this._renderCopyVoucherSheet()}
        {this._renderPdfPreviewModal()}
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { commonReducer } = state;
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

function Screen(props) {
  const isFocused = useIsFocused();

  return <DebiteNote {...props} isFocused={isFocused} />;
}
const MyComponent = connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Screen));
export default MyComponent;
