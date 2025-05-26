import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Animated, DeviceEventEmitter, Dimensions, FlatList, Keyboard, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import colors from "@/utils/colors";
import Entypo from 'react-native-vector-icons/Entypo'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from "@/components/Loader";
import AccountsPopUpModalize from "./component/AccountsPopUpModalize";
import { setBottomSheetVisible } from "@/components/BottomSheet";
import { InvoiceService } from "@/core/services/invoice/invoice.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_EVENTS, STORAGE_KEYS } from "@/utils/constants";
import _ from 'lodash';
import Routes from "@/navigation/routes";

const { height} = Dimensions.get('window');
const RenderSearchList = ({searchData, setIsSearchingParty, setSearchData, setPartyName, setSearchPartyName, searchAccount, focusRef}) => {
    const {styles} = useCustomTheme(getStyles,'Contra')
    const handleInputFocus = () =>{
        focusRef.current.focus()
    }
    return (
        <View style={[styles.searchResultContainer, {top: height * 0.15}]}>
          <FlatList
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            data={searchData.length == 0 ? ['Result Not found'] : searchData}
            style={{paddingHorizontal: 20, paddingVertical: 10, paddingTop: 5}}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={{}}
                onPress={async () => {
                    setSearchData([]);
                    setIsSearchingParty(false);
                    if (item != 'Result Not found') {
                        Keyboard.dismiss();
                        setPartyName(item);
                        setSearchPartyName(item?.name);
                        searchAccount(item?.uniqueName);
                        handleInputFocus();
                    }
                }}>
                <Text style={styles.searchItemText}>{item.name ? item.name : "Result Not found"}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() =>{
                setSearchData([]);
                setIsSearchingParty(false);
            }}>
            <AntDesign name="closecircleo" size={15} color={'#424242'} />
          </TouchableOpacity>
        </View>
      );
}

const ContraScreen = () => {
    const {styles, statusBar, voucherBackground, theme} = useCustomTheme(getStyles, 'Contra');
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const [date, setDate] = useState(moment());
    const [clearanceDate, setClearanceDate] = useState('');
    const [searchPartyName, setSearchPartyName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allPaymentModes, setAllPaymentModes] = useState([]);
    const [isSearchingParty, setIsSearchingParty] = useState(false);
    const [companyCountryDetails, setCompanyCountryDetails] = useState('');
    const [currencySymbol, setCurrencySymbol] = useState('₹');
    const [companyVersionNumber, setCompanyVersionNumber] = useState('1');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [partyDetails, setPartyDetails] = useState({});
    const [partyName, setPartyName] = useState('');
    const [isAmountFieldInFocus, setIsAmountFieldInFocus] = useState(false);
    const [isClearanceDateSelelected, setIsClearanceDateSelelected] = useState(false);
    const [amountForReceipt, setAmountForReceipt] = useState('');
    const [balanceDetails, setBalanceDetails] = useState({
        totalTaxableAmount: '0',
        mainTaxAmount: '0',
        tdsOrTcsTaxAmount: '0'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showClearanceDatePicker, setShowClearanceDatePicker] = useState(false);
    const [isSelectAccountButtonSelected, setIsSelectAccountButtonSelected] = useState(false);
    const [paymentMode, setPaymentMode] = useState({
        uniqueName: '',
        name: '',
    });
    const [chequeNumber, setChequeNumber] = useState('');
    const [addDescription, setAddDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const accountsModalizeRef = useRef(null);
    const focusRef = useRef(null);
    const navigation = useNavigation();
    const formatDate = (tempDate) => {
        const fulldays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const someDateTimeStamp = tempDate;
        var dt = (dt = new Date(someDateTimeStamp));
        const date = dt.getDate();
        const month = months[dt.getMonth()];
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

    const getYesterdayDate = () => {
        setDate(moment().subtract(1, 'days'))
    }
    
    const getTodayDate = () => {
        setDate(moment());
    }

    const hideDatePicker = () => {
        setShowDatePicker(false);
    };
    const hideClearanceDatePicker = () => {
        setShowClearanceDatePicker(false);
    };
    
    const handleConfirm = (date) => {
        setDate(moment(date));
        hideDatePicker();
    };
    
    const handleConfirmClearanceDate = (date) => {
        setClearanceDate(date);
        hideClearanceDatePicker();
    };

    const getCompanyVersionNumber = async () => {
        const companyVersionNumber = await AsyncStorage.getItem(STORAGE_KEYS.companyVersionNumber);
        if (companyVersionNumber != null || companyVersionNumber != undefined) {
          setCompanyVersionNumber(companyVersionNumber);
        }
    };

    const resetState = () => {
        setDate(moment());
        setSearchPartyName('');
        setSearchResults([]);
        setIsSearchingParty(false);
        setCompanyCountryDetails('');
        setCurrencySymbol('₹');
        setCompanyVersionNumber('1');
        setExchangeRate(1);
        setPartyDetails({});
        setPartyName('');
        setClearanceDate('');
        setAllPaymentModes([]);
        setIsAmountFieldInFocus(false);
        setIsClearanceDateSelelected(false);
        setAmountForReceipt('');
        setBalanceDetails({
                totalTaxableAmount: '0',
                mainTaxAmount: '0',
                tdsOrTcsTaxAmount: '0'
            });
        setShowDatePicker(false);
        setShowClearanceDatePicker(false);
        setIsSelectAccountButtonSelected(false);
        setPaymentMode({
                uniqueName: '',
                name: '',
            });
        setChequeNumber('');
        setAddDescription('');
        setLoading(false);
    }

    const clearAll = () => {
        resetState();
        searchCalls('');
        setActiveCompanyCountry();
        getAllPaymentModes();
        getCompanyVersionNumber();
    };


    const setActiveCompanyCountry = async () => {
        try {
          const activeCompanyCountryCode = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyCountryCode);
          const results = await InvoiceService.getCountryDetails(activeCompanyCountryCode);
          if (results.body && results.status == 'success') {
            setCompanyCountryDetails(results?.body?.country)
          }
        } catch (e) {
            console.log("error while fetching active company country");
        }
    }

    const getExchangeRateToINR = async (currency) => {
        try {
          const results = await InvoiceService.getExchangeRate(
            moment().format('DD-MM-YYYY'),
            companyCountryDetails?.currency?.code,
            currency,
          );
    
          if (results.body && results.status == 'success') {
            setExchangeRate(results?.body);
          }
        } catch (e) {
            console.log("error while getting exchange rate");
            
        }
    }

    const getAllPaymentModes = async () => {
        try {
          const results = await InvoiceService.getBriefAccount();
          if (results.body && results.status == 'success') {
            setAllPaymentModes(results.body.results)
          }
        } catch (e) {
            console.log("Error while fetching brief accounts");
        }
    }

    const searchUser = async (searchText:string) => {
        setIsSearchingParty(true);
        try {
          const results = await InvoiceService.search(searchText, 1, 'cash,bankaccounts,loanandoverdraft', false);
          if (results.body && results.body.results) {
            setSearchResults(results?.body?.results);
            setIsSearchingParty(false);
          }
        } catch (e) {
            setSearchResults([]);
            setIsSearchingParty(false);
        }
    }

    const searchAccount = async(partyUniqueName:string) => {
        setIsSearchingParty(true);
        try {
          const results = await InvoiceService.getAccountDetails(partyUniqueName);
          if (results.body) {
            if (results.body.currency != companyCountryDetails?.currency?.code) {
              await getExchangeRateToINR(results.body.currency);
            }
            setIsSearchingParty(false);
            setPartyDetails(results?.body);
            setCurrencySymbol(results?.body?.currencySymbol);
          }
        } catch (e) {
          setSearchResults([]);
          setIsSearchingParty(false);
        }
    }

    const createContraVoucher = async () => {
        try {
            setLoading(true);
            const lang = 'en';
            const payload = {
                transactions: [
                {
                    amount: parseInt(amountForReceipt),
                    particular: paymentMode.uniqueName,
                    total: parseInt(amountForReceipt),
                    convertedTotal: (Math.round((parseInt(balanceDetails.totalTaxableAmount) - parseInt(balanceDetails.tdsOrTcsTaxAmount)) * exchangeRate * 100) / 100 ).toFixed(2),
                    discount: 0,
                    convertedDiscount: 0,
                    isStock: false,
                    convertedRate: 0,
                    convertedAmount: (Math.round(parseInt(amountForReceipt) * exchangeRate * 100) / 100).toFixed(2),
                    isChecked: false,
                    showTaxationDiscountBox: false,
                    itcAvailable: '',
                    advanceReceiptAmount: parseInt(balanceDetails.totalTaxableAmount).toFixed(2),
                    showDropdown: false,
                    showOtherTax: true,
                    type: 'CREDIT',
                    discounts: [],
                    isInclusiveTax: false,
                    shouldShowRcmEntry: false,
                },
                ],
                voucherType: 'contra',
                entryDate: moment(date).format('DD-MM-YYYY'),
                unconfirmedEntry: false,
                attachedFile: '',
                attachedFileName: '',
                tag: null,
                description: addDescription,
                generateInvoice: true,
                chequeNumber: chequeNumber,
                chequeClearanceDate: clearanceDate ? moment(clearanceDate).format('DD-MM-YYYY') : '',
                compoundTotal: parseInt(amountForReceipt),
                convertedCompoundTotal: (Math.round(parseInt(amountForReceipt) * exchangeRate * 100) / 100 ).toFixed(2),
                tdsTcsTaxesSum: balanceDetails.tdsOrTcsTaxAmount,
                otherTaxesSum: balanceDetails.tdsOrTcsTaxAmount,
                exchangeRate: exchangeRate,
                valuesInAccountCurrency: true,
                selectedCurrencyToDisplay: 0,
            };
            const results = await InvoiceService.createReceipt(
                payload,
                partyName.uniqueName,
                companyVersionNumber,
                lang,
            );
            if (results.body) {
                alert('Contra voucher created successfully!');
                navigation.navigate("Home", {
                    screen: Routes.Parties,
                    params: {
                        screen: 'PartiesTransactions',
                        initial: false,
                        params: {
                            item: {
                                name: partyName.name,
                                uniqueName: partyName.uniqueName,
                                country: { code: partyDetails?.country?.countryCode },
                                mobileNo: partyDetails?.mobileNo,
                            },
                            type: 'Creditors',
                        },
                    }
                });
                resetState();
                setActiveCompanyCountry();
                getAllPaymentModes();
                getCompanyVersionNumber();
                DeviceEventEmitter.emit(APP_EVENTS.ReceiptCreated, {});
            }
        } catch (e) {
            setLoading(false);
        }
      }

    const genrateInvoice = () => {
        if (!partyName) {
            alert('Please select a creditor.');
        } else if (amountForReceipt == '' || parseInt(amountForReceipt) == 0 ) {
            alert('Please enter amount.');
        } else if (!paymentMode.uniqueName){
            alert('Please select payment method.');
        }else{
            createContraVoucher();
        }
    }

    const searchCalls = _.debounce((searchText) => searchUser(searchText), 200);

    useEffect(()=> {
        getAllPaymentModes();
        searchUser('');
        setActiveCompanyCountry();
        getCompanyVersionNumber();
        DeviceEventEmitter.addListener(APP_EVENTS.REFRESHPAGE, async () => {
            getCompanyVersionNumber();
            if (searchPartyName == '') {
                searchCalls('');
            }
        });
        DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
            resetState();
            setActiveCompanyCountry();
            getAllPaymentModes();
            getCompanyVersionNumber();
        });
    }, [])


    return (
        <KeyboardAvoidingView behavior={ Platform.OS == 'ios' ? "padding" : "height" } style={styles.container}>
            <Animated.ScrollView
            keyboardShouldPersistTaps="never"
            bounces={false}>
            {/* <_StatusBar statusBar={statusBar}/> */}
            <Header header={'Contra'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            {/* Party Name */}
            <View style={styles.partyContainer}>
                <View style={styles.partySubView}>
                    <Icon name={'Profile'} color={voucherBackground} style={{margin: 16}} size={16} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'From (CR)'}
                        returnKeyType={'done'}
                        value={searchPartyName}
                        onChangeText={(text) => {
                            setSearchPartyName(text);
                            searchCalls(text);
                        }}
                        style={styles.searchTextInputStyle}
                    />
                    <ActivityIndicator color={'#5773FF'} size="small" animating={isSearchingParty} />
                </View>
                <TouchableOpacity onPress={clearAll}>
                <Text style={styles.planText}>Clear All</Text>
                </TouchableOpacity>
            </View>
            {/* Amount */}
            <View style={styles.amountContainer}>
                <View style={styles.amountView}>
                    <Text style={styles.invoiceAmountText}>{currencySymbol}</Text>
                    <TextInput
                        style={[styles.invoiceAmountText, {flex: 1,alignSelf: 'flex-start'}]}
                        keyboardType="phone-pad"
                        placeholder={'0.00'}
                        placeholderTextColor={isAmountFieldInFocus ? '#808080' : '#1C1C1C'}
                        value={amountForReceipt}
                        ref={focusRef}
                        onFocus={() => {
                            setIsAmountFieldInFocus(true);
                        }}
                        onBlur={() => {
                            setIsAmountFieldInFocus(amountForReceipt != '' ? true : false)
                        }}
                        onChangeText={async (text) => {
                        if (!partyName) {
                            alert('Please select a party.');
                        } else {
                            setAmountForReceipt(text.replace(/[^0-9]/g, ''));
                            setBalanceDetails({
                                ...balanceDetails,
                                totalTaxableAmount: text.replace(/[^0-9]/g, '')
                            })
                        }
                        }}>
                    </TextInput>
                </View>
            </View>
            {/* Date */}
            <View style={styles.dateView}>
                <TouchableOpacity
                    style={styles.dateBtn}
                    onPress={() => {
                        if (!partyName) {
                        alert('Please select a party.');
                        } else {
                            setShowDatePicker(true);
                        }
                    }}>
                    <Icon name={'Calendar'} color={voucherBackground} size={16} />
                    <Text style={styles.selectedDateText}>{formatDate(date)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.dateBtnStyle}
                    onPress={() => {
                        if (!partyName) {
                        alert('Please select a party.');
                        } else {
                        date.startOf('day').isSame(moment().startOf('day'))
                            ? getYesterdayDate()
                            : getTodayDate();
                        }
                    }}>
                    <Text style={{color: '#808080'}}>
                        {date.startOf('day').isSame(moment().startOf('day')) ? 'Yesterday?' : 'Today?'}
                    </Text>
                </TouchableOpacity>
            </View>
            {/* Payment mode */}
            <View style={styles.fieldContainer}>
                <View style={styles.rowContainer}>
                    <Icon name={'Path-12190'} color={voucherBackground} size={16} />
                    <Text style={styles.fieldHeadingText}>{'To (DR)*'}</Text>
                </View>
                <View style={styles.paymentView}>
                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={styles.rowContainer}
                            onPress={() => {
                                if (partyName) {
                                    setBottomSheetVisible(accountsModalizeRef, true);
                                } else {
                                    alert('Please select a creditor.');
                                }
                            }}
                            textColor={{colors}}>
                            <View
                                style={[
                                styles.buttonWrapper,
                                {marginLeft: 20},
                                {borderColor: isSelectAccountButtonSelected ? voucherBackground : '#d9d9d9'},
                                ]}>
                                <Text
                                style={[
                                    styles.buttonText,
                                    {
                                    color: isSelectAccountButtonSelected ? voucherBackground : '#868686',
                                    },
                                ]}>
                                {isSelectAccountButtonSelected ? paymentMode.name : 'Select A/c'}
                                </Text>
                            </View>
                            {isSelectAccountButtonSelected ? (
                                <Entypo name="edit" size={16} color={voucherBackground} style={{ alignSelf: 'center' }}/>
                            ) : null}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Cheque details */}
            <View style={styles.fieldContainer}>
                <View style={styles.rowContainer}>
                    <Icon name={'path-15'} color={voucherBackground} size={16} />
                    <Text style={styles.fieldHeadingText}>{'Cheque Details'}</Text>
                </View>
                <View style={styles.chequeView}>
                    <View style={styles.rowContainer}>
                        <View
                            style={[
                            styles.buttonWrapper,
                            {marginHorizontal: 20},
                            {
                                justifyContent: 'center',
                                width: 150,
                                height: 38,
                                borderColor: chequeNumber ? voucherBackground : '#d9d9d9',
                            }
                            ]}>
                            <TextInput
                            style={[
                                styles.chequeButtonText, {color: chequeNumber ? voucherBackground : '#868686'}
                                ]}
                            autoCapitalize = {"characters"}
                            value={chequeNumber.toString()}
                            placeholder={'Cheque #'}
                            placeholderTextColor={'#868686'}
                            returnKeyType={"done"}
                            multiline={true}
                            onChangeText={(text) => setChequeNumber(text)}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                            if (!partyName) {
                                alert('Please select a creditor.');
                            } else if (amountForReceipt == '' || parseInt(amountForReceipt) == 0) {
                                alert('Please enter amount.');
                            } else {
                                setShowClearanceDatePicker(true);
                                setIsClearanceDateSelelected(true);
                            }
                            }}>
                            <View
                            style={[
                                styles.buttonWrapper,
                                {borderColor: (isClearanceDateSelelected && clearanceDate) ? voucherBackground: '#d9d9d9'},
                            ]}>
                            {(isClearanceDateSelelected && clearanceDate) ? (
                                <Text style={[styles.buttonText, { color: voucherBackground }]}>
                                {formatDate(clearanceDate)}
                                </Text>
                            ) : (
                                <Text
                                style={[styles.buttonText, { color: theme.colors.secondaryText }]}>
                                Clearance Date
                                </Text>
                            )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {/* Description */}
            <View style={styles.fieldContainer}>
                <View style={styles.rowContainer}>
                    <Icon name={'path-15'} color={voucherBackground} size={16} />
                    <Text style={styles.fieldHeadingText}>{'Add Description'}</Text>
                </View>
                <View style={styles.chequeView}>
                    <TextInput
                        style={styles.descText}
                        value={addDescription}
                        placeholder={'Note (Opional)'}
                        onChangeText={(text) => setAddDescription(text)}>
                    </TextInput>
                </View>
            </View>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            <DateTimePickerModal
              isVisible={showClearanceDatePicker}
              mode="date"
              onConfirm={handleConfirmClearanceDate}
              onCancel={hideClearanceDatePicker}
            />
            {searchResults?.length > 0 && <RenderSearchList 
                searchData={searchResults} 
                setIsSearchingParty={setIsSearchingParty} 
                setSearchData={setSearchResults}
                setPartyName= {setPartyName} 
                setSearchPartyName= {setSearchPartyName}
                searchAccount={searchAccount} 
                focusRef={focusRef}/>}
            <Loader isLoading={loading} />
            </Animated.ScrollView>
            <AccountsPopUpModalize 
                modalizeRef={accountsModalizeRef} 
                paymentModes={allPaymentModes} 
                setBottomSheetVisible={setBottomSheetVisible} 
                setPaymentMode={setPaymentMode} 
                setIsSelectAccountButtonSelected={setIsSelectAccountButtonSelected}
                paymentMode={paymentMode}/>
            {amountForReceipt != '' && partyName.name && paymentMode.uniqueName != '' && 
                <TouchableOpacity
                    style={{flex: 1, position: 'absolute', right: 10, bottom: 30, backgroundColor: 'white', borderRadius: 60}}
                    onPress={genrateInvoice}>
                    <Icon name={'path-18'} size={48} color={voucherBackground} />
                </TouchableOpacity>
            }
        </KeyboardAvoidingView>
      );
}

export default ContraScreen;

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: theme.colors.solids.white
    },
    searchTextInputStyle: {
        color: theme.colors.text,
        position: 'absolute',
        left: 40,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        width: '60%'
    },
    invoiceAmountText: {
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.xLarge.size
    },
    dateView: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50
    },
    selectedDateText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        marginLeft: 10
    },
    fieldContainer: {
        marginTop: 14,
        marginHorizontal: 16
    },
    fieldHeadingText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        marginLeft: 10,
        alignSelf: 'center'
    },
    buttonWrapper: {
        backgroundColor: theme.colors.solids.white,
        margin: 5,
        borderColor: '#D9D9D9',
        borderRadius: 20,
        borderBottomRightRadius: 0,
        borderWidth: 1.2,
    },
    buttonText: {
        color: theme.colors.secondaryText,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        minWidth: 100,
        margin: 10,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
    },
    chequeButtonText: {
        color: theme.colors.secondaryText,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        marginHorizontal: 5
    },
    searchResultContainer: {
        maxHeight: 300,
        width: '80%',
        backgroundColor: 'white',
        position: 'absolute',
        alignSelf: 'center',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        flexDirection:'row',
        borderRadius: 10,
        overflow: 'hidden'
    },
    searchItemText: { 
        color: theme.colors.solids.black, 
        paddingVertical: 10,
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight
    },
    closeIcon: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        padding: 10,
        alignItems: 'center',
    },
    partyContainer: {
        flexDirection: 'row', 
        minHeight: 50, 
        alignItems: 'center', 
        paddingTop: 14
    },
    partySubView: {
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1
    },
    planText: {
        color: theme.colors.text, 
        marginRight: 16, 
        fontFamily: 'AvenirLTStd-Book'
    },
    amountContainer: {
        flexDirection: 'row', 
        flex: 1
    },
    amountView: {
        paddingVertical: Platform.OS == 'ios'? 10 : 0, 
        paddingHorizontal: 15, 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    dateBtn: {
        flexDirection: 'row', 
        alignItems:'baseline'
    },
    dateBtnStyle: {
        borderColor: '#D9D9D9', 
        borderWidth: 1, 
        paddingHorizontal: 4, 
        paddingVertical: 2
    },
    rowContainer: {
        flexDirection: 'row'
    },
    paymentView: {
        paddingVertical: 6, 
        marginTop: 10
    },
    chequeView: {
        paddingVertical: 6, 
        marginTop: 10, 
        justifyContent: 'space-between'
    },
    descText: {
        marginLeft: 20,
        margin: 10, 
        borderBottomColor: theme.colors.secondaryText, 
        borderBottomWidth: 1.5
    }
})