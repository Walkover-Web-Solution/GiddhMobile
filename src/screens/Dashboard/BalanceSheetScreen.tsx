import useCustomTheme, {ThemeProps} from '@/utils/theme';
import moment from 'moment';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import DateFilter from './component/DateFilter';
import {useIsFocused} from '@react-navigation/native';
import Header from '@/components/Header';
import MatButton from '@/components/OutlinedButton';
import {CommonService} from '@/core/services/common/common.service';
import {useSelector} from 'react-redux';
import Loader from '@/components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import BottomSheet from '@/components/BottomSheet';
import Icon from '@/core/components/custom-icon/custom-icon';
import { formatAmount } from '@/utils/helper';
import { commonUrls } from '@/core/services/common/common.url';

const {height, width} = Dimensions.get('window');

const BalanceSheetScreen = () => {
  const {statusBar, styles, theme, voucherBackground} = useCustomTheme(makeStyles, 'Stock');
  const [date, setDate] = useState<{startDate: string; endDate: string}>({
    startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
    endDate: moment().format('DD-MM-YYYY'),
  });
  const [dateMode, setDateMode] = useState('defaultDates');
  const [activeDateFilter, setActiveDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const optionModalizeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [consolidatedBranch, setConsolidatedBranch] = useState(' ');
  const [refreshing, setRefreshing] = useState(false);
  const branchListModalRef = useRef(null);
  const [selectedBranch, setSelectedBranch] = useState({});
  const [balanceSheet, setBalanceSheet] = useState([]);
  const branchList = useSelector((state) => state?.commonReducer?.branchList);
  const onRefresh = () => {
    setRefreshing(true);
    fetchDetailedBalanceSheet(consolidatedBranch?.length == 1 ? selectedBranch?.uniqueName : '');
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  //  Function's
  const changeDate = (startDate: string, endDate: string) => {
    setDate({startDate, endDate});
  };

  const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
    setActiveDateFilter(activeDateFilter);
    setDateMode(dateMode);
  };

  const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
    if (visible) {
      Keyboard.dismiss();
      modalRef?.current?.open();
    } else {
      modalRef?.current?.close();
    }
  };

  const calculateClosingTotal = (items) => {
    return items.reduce((total, item) => {
      const closingAmount = item.closingBalance.amount;
      const type = item.closingBalance.type;
      return type === "DEBIT" ? total - closingAmount : total + closingAmount;
    }, 0);
  };

  const calculateForwardTotal = (items) => {
    return items.reduce((total, item) => {
      const forwardAmount = item.forwardedBalance.amount;
      const type = item.forwardedBalance.type;
      return type === "DEBIT" ? total - forwardAmount : total + forwardAmount;
    }, 0);
  };

  const longDateFormat =  (date:string) => moment(date, 'DD/MM/YYYY').format('DD MMM YY');

  //  Api calls
  const fetchDetailedBalanceSheet = async (branchUniqueName: string) => {
    setLoading(true);
    const consolidateState = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    setConsolidatedBranch(consolidateState ? consolidateState : ' ');
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const response = await fetch(commonUrls.fetchDetailedBalanceSheet(
        date?.startDate, 
        date?.endDate, 
        branchUniqueName ? branchUniqueName : consolidateState ? consolidateState : '')
      .replace(':companyUniqueName',activeCompany) ,{
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'session-id' : token,
          'user-agent' : Platform.OS
        },
      })
      const result = await response.json()
      if (result && result?.status == 'success') {
        console.log("response 222222------------------>",result);
        setBalanceSheet(result?.body?.groupDetails);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('Error while fetching balance sheet', error);
    }
  };

  //  components
  const RenderBranchModal = (
    <BottomSheet
      bottomSheetRef={branchListModalRef}
      headerText="Select Branch"
      headerTextColor="#084EAD"
      adjustToContentHeight={branchList?.length * 47 > height - 100 ? false : true}
      flatListProps={{
        data: branchList,
        renderItem: ({item}) => {
          return (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log('item', item?.uniqueName);
                fetchDetailedBalanceSheet(item?.uniqueName);
                setSelectedBranch(item);
                setBottomSheetVisible(branchListModalRef, false);
              }}>
              <Icon
                name={item?.alias === selectedBranch?.alias ? 'radio-checked2' : 'radio-unchecked'}
                color={'#084EAD'}
                size={16}
              />
              <Text style={styles.radiobuttonText}>{item?.alias}</Text>
            </TouchableOpacity>
          );
        },
        ListEmptyComponent: () => {
          return (
            <View style={styles.modalCancelView}>
              <Text style={styles.modalCancelText}>No Accounts Available</Text>
            </View>
          );
        },
      }}
    />
  );


  const renderCategory = (category, items) => {
    const closingTotal = calculateClosingTotal(items);
    const forwardTotal = calculateForwardTotal(items);
    
    return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:12}}>
        <Text style={styles.dateText}>As of {longDateFormat(date?.startDate)}</Text>
        <Text style={styles.dateText}>As of {longDateFormat(date?.endDate)}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.text}>{item.groupName}</Text>
            <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:12}}>
                <Text style={styles.amountText}>
                    {formatAmount(item.closingBalance.amount)} {item.closingBalance.type?.charAt?.(0) == 'D' ? "Dr." : "Cr."}
                </Text>
                <Text style={styles.amountText}>
                    {formatAmount(item.forwardedBalance.amount)} {item?.forwardedBalance?.type?.charAt?.(0) == 'D' ? "Dr." : "Cr."}
                </Text>
            </View>
        </View>
      ))}
      <View style={styles.totalContainer}>
        <Text style={[styles.dateText,{color:'#1a237e'}]}>Total {category}: </Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:12,paddingVertical:3}}>
            <Text style={styles.totalText}>{formatAmount(closingTotal)}</Text>
            <Text style={styles.totalText}>{formatAmount(forwardTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const data = [
    {
        "forwardedBalance": {
            "amount": 69856.4458,
            "type": "DEBIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 69856.4458,
            "type": "DEBIT"
        },
        "childGroups": [
            {
                "forwardedBalance": {
                    "amount": 69856.4458,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 69856.4458,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 69856.4458,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 69856.4458,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "General Reserves",
                        "uniqueName": "generalreserves",
                        "groupName": "Reserves & Surplus"
                    }
                ],
                "category": null,
                "uniqueName": "reservessurplus",
                "groupName": "Reserves & Surplus"
            },
            {
                "forwardedBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [],
                "category": "assets",
                "uniqueName": "profitandloss",
                "groupName": "Profit and Loss"
            }
        ],
        "accounts": [],
        "category": "liabilities",
        "uniqueName": "shareholdersfunds",
        "groupName": "Shareholders’ Funds"
    },
    {
        "forwardedBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "childGroups": [],
        "accounts": [],
        "category": "liabilities",
        "uniqueName": "noncurrentliabilities",
        "groupName": "Non Current Liabilities"
    },
    {
        "forwardedBalance": {
            "amount": 2036781.11793214,
            "type": "CREDIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 2036781.11793214,
            "type": "CREDIT"
        },
        "childGroups": [
            {
                "forwardedBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [],
                "category": null,
                "uniqueName": "loanandoverdraft",
                "groupName": "Loan and Overdraft"
            },
            {
                "forwardedBalance": {
                    "amount": 151432.66186711,
                    "type": "CREDIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 151432.66186711,
                    "type": "CREDIT"
                },
                "childGroups": [
                    {
                        "forwardedBalance": {
                            "amount": 105861.01382007,
                            "type": "CREDIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 105861.01382007,
                            "type": "CREDIT"
                        },
                        "childGroups": [],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 105668.8421029,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 105668.8421029,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "TDS Payable (TDS payable )",
                                "uniqueName": "tdspayable1",
                                "groupName": "TDS payable"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "TDS Payable (TDS payable )",
                                "uniqueName": "tdspayable",
                                "groupName": "TDS payable"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 190.03030303,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 190.03030303,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "TDS Payable (tds1)",
                                "uniqueName": "tdspayable2",
                                "groupName": "TDS payable"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 2.14141414,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 2.14141414,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "TDS Payable (tds2)",
                                "uniqueName": "tdspayable3",
                                "groupName": "TDS payable"
                            }
                        ],
                        "category": null,
                        "uniqueName": "tdspayable",
                        "groupName": "TDS payable"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 44602.21904704,
                            "type": "CREDIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 44602.21904704,
                            "type": "CREDIT"
                        },
                        "childGroups": [],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (gst 11)",
                                "uniqueName": "igst4",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (GST18)",
                                "uniqueName": "igstnull",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 4945.944384,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 4945.944384,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (GST18)",
                                "uniqueName": "igst2",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 149.35714284,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 149.35714284,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (GST12)",
                                "uniqueName": "igst1",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 39038.16,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 39038.16,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (GST28)",
                                "uniqueName": "igst3",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 468.7575202,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 468.7575202,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (GST5)",
                                "uniqueName": "igst",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (reyyy)",
                                "uniqueName": "igst5",
                                "groupName": "IGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "IGST (commongst5)",
                                "uniqueName": "igst6",
                                "groupName": "IGST"
                            }
                        ],
                        "category": null,
                        "uniqueName": "igst",
                        "groupName": "IGST"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 484.7145,
                            "type": "CREDIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 484.7145,
                            "type": "CREDIT"
                        },
                        "childGroups": [],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST28)",
                                "uniqueName": "sgstgst28",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST18)",
                                "uniqueName": "sgstnull",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST18)",
                                "uniqueName": "sgst2",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST12)",
                                "uniqueName": "sgst1",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST28)",
                                "uniqueName": "sgst3",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (GST5)",
                                "uniqueName": "sgst",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (reyyy)",
                                "uniqueName": "sgst4",
                                "groupName": "SGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 484.7145,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 484.7145,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "SGST (commongst5)",
                                "uniqueName": "sgst5",
                                "groupName": "SGST"
                            }
                        ],
                        "category": null,
                        "uniqueName": "sgst",
                        "groupName": "SGST"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "childGroups": [],
                        "accounts": [],
                        "category": null,
                        "uniqueName": "gstcess",
                        "groupName": "GST CESS"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "childGroups": [],
                        "accounts": [],
                        "category": null,
                        "uniqueName": "tcspayable",
                        "groupName": "TCS payable"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "childGroups": [],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (gst 11)",
                                "uniqueName": "utgst4",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (GST18)",
                                "uniqueName": "utgstnull",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (GST12)",
                                "uniqueName": "utgst1",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (GST5)",
                                "uniqueName": "utgst",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (GST28)",
                                "uniqueName": "utgst3",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (GST18)",
                                "uniqueName": "utgst2",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (reyyy)",
                                "uniqueName": "utgst5",
                                "groupName": "UTGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "UTGST (commongst5)",
                                "uniqueName": "utgst6",
                                "groupName": "UTGST"
                            }
                        ],
                        "category": null,
                        "uniqueName": "utgst",
                        "groupName": "UTGST"
                    },
                    {
                        "forwardedBalance": {
                            "amount": 484.7145,
                            "type": "CREDIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 484.7145,
                            "type": "CREDIT"
                        },
                        "childGroups": [],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (GST18)",
                                "uniqueName": "cgstnull",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (GST18)",
                                "uniqueName": "cgst2",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (GST12)",
                                "uniqueName": "cgst1",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (GST28)",
                                "uniqueName": "cgst3",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (GST5)",
                                "uniqueName": "cgst",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (reyyy)",
                                "uniqueName": "cgst4",
                                "groupName": "CGST"
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 484.7145,
                                    "type": "CREDIT"
                                },
                                "openingBalance": {
                                    "amount": 484.7145,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "CGST (commongst5)",
                                "uniqueName": "cgst5",
                                "groupName": "CGST"
                            }
                        ],
                        "category": null,
                        "uniqueName": "cgst",
                        "groupName": "CGST"
                    }
                ],
                "accounts": [],
                "category": null,
                "uniqueName": "dutiestaxes",
                "groupName": "Duties & Taxes"
            },
            {
                "forwardedBalance": {
                    "amount": 1885348.45606503,
                    "type": "CREDIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 1885348.45606503,
                    "type": "CREDIT"
                },
                "childGroups": [
                    {
                        "forwardedBalance": {
                            "amount": 5550,
                            "type": "CREDIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 5550,
                            "type": "CREDIT"
                        },
                        "childGroups": [
                            {
                                "forwardedBalance": {
                                    "amount": 5550,
                                    "type": "CREDIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 5550,
                                    "type": "CREDIT"
                                },
                                "childGroups": [
                                    {
                                        "forwardedBalance": {
                                            "amount": 0,
                                            "type": "DEBIT"
                                        },
                                        "creditTotal": 0,
                                        "debitTotal": 0,
                                        "closingBalance": {
                                            "amount": 0,
                                            "type": "DEBIT"
                                        },
                                        "childGroups": [],
                                        "accounts": [],
                                        "category": null,
                                        "uniqueName": "sd3",
                                        "groupName": "SD 3"
                                    }
                                ],
                                "accounts": [
                                    {
                                        "creditTotal": 0,
                                        "debitTotal": 0,
                                        "closingBalance": {
                                            "amount": 5550,
                                            "type": "CREDIT"
                                        },
                                        "openingBalance": {
                                            "amount": 5550,
                                            "type": "CREDIT"
                                        },
                                        "currency": {
                                            "code": "INR",
                                            "symbol": null
                                        },
                                        "name": "rajuu",
                                        "uniqueName": "rajuu",
                                        "groupName": "SD 2"
                                    },
                                    {
                                        "creditTotal": 0,
                                        "debitTotal": 0,
                                        "closingBalance": {
                                            "amount": 0,
                                            "type": "DEBIT"
                                        },
                                        "openingBalance": {
                                            "amount": 0,
                                            "type": "CREDIT"
                                        },
                                        "currency": {
                                            "code": "INR",
                                            "symbol": null
                                        },
                                        "name": "ft",
                                        "uniqueName": "ft",
                                        "groupName": "SD 2"
                                    }
                                ],
                                "category": null,
                                "uniqueName": "sd2",
                                "groupName": "SD 2"
                            }
                        ],
                        "accounts": [],
                        "category": null,
                        "uniqueName": "sd1",
                        "groupName": "SD 1"
                    }
                ],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 7485.5166667,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 7485.5166667,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Walkover Technologies Private Limited",
                        "uniqueName": "giddh",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1056490.23232551,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 1056490.23232551,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Sulbha",
                        "uniqueName": "sulbha",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Bznd",
                        "uniqueName": "bznd",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1622.63636366,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 1622.63636366,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Kriti Creditor",
                        "uniqueName": "kriticreditor",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 2935634.97979798,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 2935634.97979798,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Deepanshu Vendor",
                        "uniqueName": "deepanshuvendor",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "G jjgo",
                        "uniqueName": "gjjgo",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "AUD",
                            "symbol": null
                        },
                        "name": "tulip",
                        "uniqueName": "tulip",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 8574.4444378,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 8574.4444378,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Mike",
                        "uniqueName": "mike",
                        "groupName": "Sundry Creditors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 120,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 120,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Aman Vendor",
                        "uniqueName": "amanvendor",
                        "groupName": "Sundry Creditors"
                    }
                ],
                "category": null,
                "uniqueName": "sundrycreditors",
                "groupName": "Sundry Creditors"
            }
        ],
        "accounts": [],
        "category": "liabilities",
        "uniqueName": "currentliabilities",
        "groupName": "Current Liabilities"
    },
    {
        "forwardedBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "childGroups": [],
        "accounts": [],
        "category": "assets",
        "uniqueName": "fixedassets",
        "groupName": "Fixed Assets"
    },
    {
        "forwardedBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 0,
            "type": "DEBIT"
        },
        "childGroups": [],
        "accounts": [],
        "category": "assets",
        "uniqueName": "noncurrentassets",
        "groupName": "Non Current Assets"
    },
    {
        "forwardedBalance": {
            "amount": 3205050.17213214,
            "type": "DEBIT"
        },
        "creditTotal": 0,
        "debitTotal": 0,
        "closingBalance": {
            "amount": 3205050.17213214,
            "type": "DEBIT"
        },
        "childGroups": [
            {
                "forwardedBalance": {
                    "amount": 2033.562402,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 2033.562402,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 2033.562402,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 2033.562402,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Tax On Export",
                        "uniqueName": "taxonexport",
                        "groupName": "Tax On Export"
                    }
                ],
                "category": null,
                "uniqueName": "taxonexport",
                "groupName": "Tax On Export"
            },
            {
                "forwardedBalance": {
                    "amount": 330.26296504,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 330.26296504,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 330.26296504,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 330.26296504,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Tax On Advance",
                        "uniqueName": "taxonadvance",
                        "groupName": "Tax On Advance"
                    }
                ],
                "category": null,
                "uniqueName": "taxonadvance",
                "groupName": "Tax On Advance"
            },
            {
                "forwardedBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [],
                "category": null,
                "uniqueName": "tcsreceivable",
                "groupName": "TCS receivable"
            },
            {
                "forwardedBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 0,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [],
                "category": null,
                "uniqueName": "tdsreceivable",
                "groupName": "TDS receivable"
            },
            {
                "forwardedBalance": {
                    "amount": 290,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 290,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 290,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 290,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Reverse Charge",
                        "uniqueName": "reversecharge",
                        "groupName": "Reverse Charge"
                    }
                ],
                "category": null,
                "uniqueName": "reversecharge",
                "groupName": "Reverse Charge"
            },
            {
                "forwardedBalance": {
                    "amount": 134240.78290000002,
                    "type": "CREDIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 134240.78290000002,
                    "type": "CREDIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 333,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 333,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Dilpreet-bank",
                        "uniqueName": "dilpreet-bank",
                        "groupName": "Bank Accounts"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "SBI",
                        "uniqueName": "sbi",
                        "groupName": "Bank Accounts"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 134573.78290000002,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 134573.78290000002,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "ICICI",
                        "uniqueName": "icici",
                        "groupName": "Bank Accounts"
                    }
                ],
                "category": null,
                "uniqueName": "bankaccounts",
                "groupName": "Bank Accounts"
            },
            {
                "forwardedBalance": {
                    "amount": 1128721.9,
                    "type": "CREDIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 1128721.9,
                    "type": "CREDIT"
                },
                "childGroups": [],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1128721.9,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 1128721.9,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Cash",
                        "uniqueName": "cash",
                        "groupName": "Cash"
                    }
                ],
                "category": null,
                "uniqueName": "cash",
                "groupName": "Cash"
            },
            {
                "forwardedBalance": {
                    "amount": 2217346.3739651,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 2217346.3739651,
                    "type": "DEBIT"
                },
                "childGroups": [
                    {
                        "forwardedBalance": {
                            "amount": 130,
                            "type": "DEBIT"
                        },
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 130,
                            "type": "DEBIT"
                        },
                        "childGroups": [
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "fdsfsdfds",
                                "groupName": "fdsfsdfds"
                            },
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "fdfsd",
                                "groupName": "fdfsd"
                            },
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "gfdgdf",
                                "groupName": "gfdgdf"
                            },
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "fdsfds",
                                "groupName": "fdsfds"
                            },
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "fsdfds",
                                "groupName": "fsdfds"
                            },
                            {
                                "forwardedBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "childGroups": [],
                                "accounts": [],
                                "category": null,
                                "uniqueName": "rewrew",
                                "groupName": "rewrew"
                            }
                        ],
                        "accounts": [
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "Registered Customer",
                                "uniqueName": "registeredcustomer",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "dsadsadas",
                                "uniqueName": "dsadsadas",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "fsdfsdfsd",
                                "uniqueName": "fsdfsdfsd",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "testt",
                                "uniqueName": "testt",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "fdfsdfsd",
                                "uniqueName": "fdfsdfsd",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 0,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 0,
                                    "type": "CREDIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "dfsfsd",
                                "uniqueName": "dfsfsd",
                                "groupName": "TESTING GROUP "
                            },
                            {
                                "creditTotal": 0,
                                "debitTotal": 0,
                                "closingBalance": {
                                    "amount": 130,
                                    "type": "DEBIT"
                                },
                                "openingBalance": {
                                    "amount": 130,
                                    "type": "DEBIT"
                                },
                                "currency": {
                                    "code": "INR",
                                    "symbol": null
                                },
                                "name": "fdsfds",
                                "uniqueName": "fdsfds",
                                "groupName": "TESTING GROUP "
                            }
                        ],
                        "category": null,
                        "uniqueName": "testinggroup",
                        "groupName": "TESTING GROUP "
                    }
                ],
                "accounts": [
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 199679,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 199679,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "JAIN",
                        "uniqueName": "jain",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "vvvv",
                        "uniqueName": "vvvv",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 3662,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 3662,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Test",
                        "uniqueName": "test",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Dilpreet Required",
                        "uniqueName": "dilpreetrequired",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 804739.7969,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 804739.7969,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "GBP",
                            "symbol": null
                        },
                        "name": "Rishi UK",
                        "uniqueName": "rishiuk",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "rishi",
                        "uniqueName": "rishi",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "sheba",
                        "uniqueName": "sheba",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "kriti-09",
                        "uniqueName": "kriti-09",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "AFN",
                            "symbol": null
                        },
                        "name": "Bdhdhey",
                        "uniqueName": "bdhdhey",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 16685,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 16685,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Test Company3",
                        "uniqueName": "n5o1650876913905",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 797.76,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 797.76,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Kriti",
                        "uniqueName": "kriti",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "kriti 121",
                        "uniqueName": "kriti121",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1925,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 1925,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Debtor 1",
                        "uniqueName": "debtor1",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 123031.8025,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 123031.8025,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "USD",
                            "symbol": null
                        },
                        "name": "John",
                        "uniqueName": "john",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 900,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 900,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Custom Field",
                        "uniqueName": "customfield",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Gyhh",
                        "uniqueName": "gyhh",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 111,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 111,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Dilpreet : Debtor",
                        "uniqueName": "dilpreetdebtor",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 911745,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 911745,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Deepanshu",
                        "uniqueName": "deepanshu",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 1,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Testing customer",
                        "uniqueName": "testingcustomer",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "raju",
                        "uniqueName": "raju",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 48.084999999984035,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 48.084999999984035,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "USD",
                            "symbol": null
                        },
                        "name": "USD Customer",
                        "uniqueName": "usdcustomer",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "jimmy",
                        "uniqueName": "jimmy",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Daman and diu",
                        "uniqueName": "damananddiu",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 5800,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 5800,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Testing customer",
                        "uniqueName": "testingcustomer1",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 55906,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 55906,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Kriti 123",
                        "uniqueName": "kriti123",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 88549,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 88549,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "SLL",
                            "symbol": null
                        },
                        "name": "Can",
                        "uniqueName": "can",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 23,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 23,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "CD ch",
                        "uniqueName": "cdch",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 22,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 22,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "fdsfsdfds",
                        "uniqueName": "fdsfsdfds",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 100,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 100,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "opening balance",
                        "uniqueName": "openingbalance",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 2776.1578947,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 2776.1578947,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Mobile",
                        "uniqueName": "mobile1",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 222.2222202,
                            "type": "CREDIT"
                        },
                        "openingBalance": {
                            "amount": 222.2222202,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Prince-delhi",
                        "uniqueName": "prince-delhi",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "CREDIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Mobile",
                        "uniqueName": "mobile",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Fgf",
                        "uniqueName": "fgf",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 1,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 1,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Dilpreet 2",
                        "uniqueName": "dilpreet2",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 0,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Debtor 2",
                        "uniqueName": "debtor2",
                        "groupName": "Sundry Debtors"
                    },
                    {
                        "creditTotal": 0,
                        "debitTotal": 0,
                        "closingBalance": {
                            "amount": 20045.99968,
                            "type": "DEBIT"
                        },
                        "openingBalance": {
                            "amount": 20045.99968,
                            "type": "DEBIT"
                        },
                        "currency": {
                            "code": "INR",
                            "symbol": null
                        },
                        "name": "Dilpreet",
                        "uniqueName": "dilpreet",
                        "groupName": "Sundry Debtors"
                    }
                ],
                "category": null,
                "uniqueName": "sundrydebtors",
                "groupName": "Sundry Debtors"
            },
            {
                "forwardedBalance": {
                    "amount": 2248012.6557,
                    "type": "DEBIT"
                },
                "creditTotal": 0,
                "debitTotal": 0,
                "closingBalance": {
                    "amount": 2248012.6557,
                    "type": "DEBIT"
                },
                "childGroups": [],
                "accounts": [],
                "category": "assets",
                "uniqueName": "inventories",
                "groupName": "Inventories"
            }
        ],
        "accounts": [],
        "category": "assets",
        "uniqueName": "currentassets",
        "groupName": "Current Assets"
    }
]

  useEffect(() => {
    fetchDetailedBalanceSheet(consolidatedBranch?.length == 1 ? selectedBranch?.uniqueName : '');
    DeviceEventEmitter.addListener(APP_EVENTS.consolidateBranch, (payload) => {
      setConsolidatedBranch(payload?.activeBranch);
      setSelectedBranch({});
    });
  }, [date]);

  const filteredData:any = {
    Liabilities: balanceSheet.filter((item) => item?.category === 'liabilities'),
    Assets: balanceSheet.filter((item) => item?.category === 'assets'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10}}>
          <DateFilter
            startDate={date.startDate}
            endDate={date.endDate}
            dateMode={dateMode}
            activeDateFilter={activeDateFilter}
            disabled={isLoading}
            changeDate={changeDate}
            setActiveDateFilter={_setActiveDateFilter}
            optionModalRef={optionModalizeRef}
            showHeading={false}
          />
          {consolidatedBranch?.length == 1 && (
            <View style={{width: '40%', paddingRight: 16, marginTop: -4}}>
              <MatButton
                lable="Select branch"
                value={selectedBranch?.alias}
                onPress={() => {
                  setBottomSheetVisible(branchListModalRef, true);
                }}
              />
            </View>
          )}
        </View>
        {!loading ? (
          <View style={{paddingHorizontal: 16}}>
            <FlatList
              data={Object.keys(filteredData)}
              keyExtractor={(item) => item}
              renderItem={({item}) => renderCategory(item, filteredData?.[item])}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <Loader isLoading={loading} />
        )}
      </ScrollView>
      {RenderBranchModal}
    </SafeAreaView>
  );
};

export default BalanceSheetScreen;

const makeStyles = (theme: ThemeProps) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.solids.white,
    },
    listContainer:{
        padding: 5,
        paddingBottom:'35%'
    },
    button: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    radiobuttonText: {
      color: '#1C1C1C',
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: theme.typography.fontSize.regular.lineHeight,
      marginLeft: 10,
    },
    modalCancelView: {
      height: height * 0.3,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    modalCancelText: {
      flex: 1,
      color: '#1C1C1C',
      paddingVertical: 4,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 14,
      textAlign: 'center',
      alignSelf: 'center',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryTitle: {
      fontSize: theme.typography.fontSize.large.size,
      lineHeight: theme.typography.fontSize.large.lineHeight,
      fontFamily: theme.typography.fontFamily.bold ,
      marginBottom: 8,
      marginTop:4
    },
    card: {
      backgroundColor: '#f9f9f9',
      paddingHorizontal: 12,
      paddingVertical:8,
      borderRadius: 8,
      marginVertical: 4,
    },
    text: {
      fontSize: theme.typography.fontSize.regular.size,
      lineHeight: theme.typography.fontSize.regular.lineHeight,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: 5,
    },
    amountText:{
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        fontFamily: theme.typography.fontFamily.regular
    },
    totalContainer: {
        marginTop: 4,
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
      },
      totalText: {
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        fontFamily: theme.typography.fontFamily.medium,
        textAlign: "center",
      },
      dateText:{
        fontFamily:theme.typography.fontFamily.medium,
        fontSize: theme.typography.fontSize.small.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.secondary
      }
  });
