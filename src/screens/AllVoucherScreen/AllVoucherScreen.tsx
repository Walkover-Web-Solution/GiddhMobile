import Header from '@/components/Header'
import Loader from '@/components/Loader'
import { CommonService } from '@/core/services/common/common.service'
import useCustomTheme, { ThemeProps } from '@/utils/theme'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, DeviceEventEmitter, EmitterSubscription, FlatList, PermissionsAndroid, Platform, RefreshControl, StatusBar, StyleSheet, Text, ToastAndroid, View } from 'react-native'
import { connect } from 'react-redux'
import Routes from '@/navigation/routes'
import { useIsFocused } from '@react-navigation/native';
import StickyDay from '../Transaction/components/StickyDay'
import TOAST from 'react-native-root-toast';
import moment from 'moment'
import colors from '@/utils/colors'
import _ from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants'
import RNFetchBlob from 'react-native-blob-util'
import Share from 'react-native-share'
import ShareModal from '../Parties/components/sharingModal'
import { Image } from 'react-native'
import DateFilter from './components/DateFilter'
import VoucherCard from './components/VoucherCard'
import Toast from '@/components/Toast'
import ConfirmationBottomSheet, { ConfirmationMessages } from '@/components/ConfirmationBottomSheet'
import { setBottomSheetVisible } from '@/components/BottomSheet'

const ListnerEvents = [
    APP_EVENTS.comapnyBranchChange,
    APP_EVENTS.CreditNoteCreated,
    APP_EVENTS.InvoiceCreated,
    APP_EVENTS.PurchaseBillCreated,
    APP_EVENTS.DebitNoteCreated,
    APP_EVENTS.ReceiptCreated,
    APP_EVENTS.PaymentCreated
]

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & {
    route: any
}

const _StatusBar = ({ statusBar }: { statusBar: string }) => {
    const isFocused = useIsFocused();
    return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
}

const AllVoucherScreen: React.FC<Props> = ({ _voucherName, companyVoucherVersion, route }) => {
    const voucherName = route?.params?.voucherName ?? _voucherName;
    const isBackButtonVisible = !!route?.params?.voucherName;
    const { theme, styles, statusBar, voucherBackground } = useCustomTheme(getStyles, voucherName);
    const stickyDayRef = useRef<any>(null);
    const confirmationBottomSheetRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [voucherData, setVoucherData] = useState<Array<any>>([]);
    const [pageCount, setPageCount] = useState({ page: 1, count: 25, totalItem: 0 });
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [dateMode, setDateMode] = useState('defaultDates');
    const [voucherToDelete, setVoucherToDelete] = useState({ accountUniqueName: '', voucherUniqueName: '', voucherType: '' });

    const changeDate = (startDate: string, endDate: string) => {
        setDate({ startDate, endDate });
    }

    const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
        setActiveDateFilter(activeDateFilter);
        setDateMode(dateMode);
    };

    const getAllVouchers = async (page: number) => {
        const payload = {
            page:  page,
            count: pageCount.count
        }

        console.log('-----GET ALL VOUCHERS-----', date.startDate, date.endDate)
        
        try {
            const response = await CommonService.getAllVouchers(voucherName.toLocaleLowerCase(), date.startDate, date.endDate,  page  , pageCount.count, companyVoucherVersion, payload)
            if (response?.status === 'success' && Array.isArray(response?.body?.items)) {
                setVoucherData((prevVoucherData) => [...prevVoucherData, ...response?.body?.items])
                setPageCount((prevPageCount) => ({ page: response?.body?.items?.length < 25 ? -1 : page + 1, count: prevPageCount.count, totalItem: response?.body?.totalItems }))
                if (response?.body?.totalItems > 25) {
                    setIsLoadingMore(true);
                }
            }
        } catch (error) {
            throw new Error(`----- Error in GetAllVouchers ${voucherName}: ${error} -----`);
        } finally {
            setIsLoading(false);
            return true;
        }
    }

    const loadMoreVouchers = (page:number) => getAllVouchers(page);
    const throttleLoadMore = useCallback(_.debounce(() => { 
        if(voucherData?.length >= pageCount.totalItem ){
            setIsLoadingMore(false);
        }
        if (pageCount.page === -1) return;
        isLoadingMore && loadMoreVouchers(pageCount.page);
        
    }, 2000, { leading: true, trailing: false }), [pageCount.page, voucherName, date, isLoadingMore])

    const onEndReached = () => {
        throttleLoadMore();
    };

    const ListFooterComponent = () => {
        return (
            <View style={styles.loader}>
                <ActivityIndicator color={colors.PRIMARY_NORMAL} size="small" animating={isLoadingMore} />
            </View>
        );
    };

    const ListEmptyComponent = useCallback(() => {
        if (isLoading) return null;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('@/assets/images/noTransactions.png')}
                    style={{ resizeMode: 'contain', height: 250, width: 300 }}
                />
                <Text style={{ fontFamily: 'AvenirLTStd-Black', fontSize: 25, marginTop: 10 }}>No Transactions</Text>
            </View>
        )
    }, [isLoading])

    const exportFile = async (uniqueName: string, voucherNumber: string) => {
        try {

            DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Downloading Started', open: null });
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

            RNFetchBlob.fetch(
                'POST',
                companyVoucherVersion == 1 ? `https://api.giddh.com/company/${activeCompany}/accounts/${uniqueName}/vouchers/download-file?fileType=pdf` :
                    `https://api.giddh.com/company/${activeCompany}/download-file?voucherVersion=${companyVoucherVersion}&fileType=pdf&downloadOption=VOUCHER`,
                {
                    'session-id': `${token}`,
                    'Content-Type': 'application/json'
                },
                JSON.stringify({
                    voucherNumber: [`${voucherNumber}`],
                    uniqueName: uniqueName,
                    voucherType: `${voucherName.toLocaleLowerCase()}`,
                })
            ).then(async (res) => {
                if (res.respInfo.status != 200) {
                    if (Platform.OS == "ios") {
                        TOAST.show(JSON.parse(res.data).message, {
                            duration: TOAST.durations.LONG,
                            position: -200,
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
                let pdfName = voucherNumber + " - " + moment();
                let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${pdfName}.pdf`;
                try {
                    console.log("PDF location", pdfLocation)
                    RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');

                    const openFile = Platform.OS === 'android' 
                        ?  () => RNFetchBlob.android.actionViewIntent(pdfLocation, 'application/pdf').catch((error) => { console.error('----- Error in File Opening -----', error)})
                        :  () => RNFetchBlob.ios.openDocument(pdfLocation)

                    DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { 
                        message: 'Download Successful!', 
                        action: 'Open',
                        open: openFile
                    });
                } catch (e) {
                    console.log('----- Error in Export -----', e)
                }
            })
        } catch (e) {
            console.log('----- Error in Export -----', e)
        }
    };

    const downloadFile = useCallback(async (uniqueName: string, voucherNumber: string) => {
        try {
            if (Platform.OS == "android" && Platform.Version < 33) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
                }
            }
            await exportFile(uniqueName, voucherNumber);
        } catch (err) {
            console.warn(err);
        }
    }, [])

    const onShare = async (uniqueName: string, voucherNumber: string) => {
        try {

            setIsSharing(true);
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
            let pdfName = voucherNumber + " - " + moment();

            RNFetchBlob.fetch(
                'POST',
                companyVoucherVersion == 1 ? `https://api.giddh.com/company/${activeCompany}/accounts/${uniqueName}/vouchers/download-file?fileType=pdf` :
                    `https://api.giddh.com/company/${activeCompany}/download-file?voucherVersion=${companyVoucherVersion}&fileType=pdf&downloadOption=VOUCHER`,
                {
                    'session-id': `${token}`,
                    'Content-Type': 'application/json'
                },
                JSON.stringify({
                    voucherNumber: [`${voucherNumber}`],
                    uniqueName: uniqueName,
                    voucherType: `${voucherName.toLocaleLowerCase()}`,
                })
            )
                .then(async (res) => {
                    const base64Str = await res.base64();
                    console.log(pdfName)
                    const pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${pdfName}.pdf`;
                    try {
                        await RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
                    } catch (e) {
                        console.log("Error", e)
                        setIsSharing(false);
                        return
                    }
                    setIsSharing(false);
                }).then(async () => {
                    setTimeout(async () => {
                        await Share.open({
                            title: 'This is the report',
                            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${pdfName}.pdf`,
                            subject: 'Transaction report'
                        })
                            .then((res) => {
                                console.log(res);
                            })
                            .catch(() => {
                                setIsSharing(false);
                            })
                    }, 100)
                });
        } catch (e) {
            setIsSharing(false);
            console.log('--- Error in Sharing ---', e);
        }
    };

    const shareFile = useCallback(async (uniqueName: string, voucherNumber: string) => {
        try {
            if (Platform.OS == "android" && Platform.Version < 33) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
                }
            }
            await onShare(uniqueName, voucherNumber);
        } catch (err) {
            console.warn(err);
        }
    }, [])

    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (!viewableItems[0]?.item?.voucherDate) {
            return;
        }
        // Get the day of top most item present in the viewport and pass it to the pulicHandler of stickyDayRef
        stickyDayRef?.current?.publicHandler(moment(viewableItems[0]?.item?.voucherDate, 'DD-MM-YYYY').format('DD MMM YYYY'));
    }, [])

    const getVoucherGroupDate = useCallback((item: any, index: number, voucherData: Array<any>) => {

        if (index == 0) return null;
        if (moment(voucherData[index - 1]?.voucherDate).isSame(moment(voucherData[index]?.voucherDate), 'd') && moment(voucherData[index]?.voucherDate).isSame(moment(voucherData[index + 1]?.voucherDate), 'd')) {
            return null;
        }

        if(moment(voucherData[index - 1]?.voucherDate).isSame(moment(voucherData[index]?.voucherDate), 'd') && !moment(voucherData[index]?.voucherDate).isSame(moment(voucherData[index + 1]?.voucherDate), 'd')){
            return null;
        }

        return moment(item?.voucherDate, 'DD-MM-YYYY').format('DD MMM YYYY')
    }, [])

    const onPressDelete = useCallback((accountUniqueName: string, voucherUniqueName: string, voucherType: string) => {
        setBottomSheetVisible(confirmationBottomSheetRef, true);
        setVoucherToDelete({ accountUniqueName, voucherUniqueName, voucherType });
    }, [])

    const handleVoucherDelete = async () => {
        setBottomSheetVisible(confirmationBottomSheetRef, false);
        const payload = {
            uniqueName: voucherToDelete.voucherUniqueName,
            voucherType: voucherToDelete.voucherType
        }
        
        try {
            const response = await CommonService.deleteVoucher(voucherToDelete.accountUniqueName, companyVoucherVersion, payload)
            if (response?.status === 'success') {
                setVoucherData((prevVoucherData) => prevVoucherData?.filter(item => item?.uniqueName !== voucherToDelete.voucherUniqueName))
                setVoucherToDelete({ accountUniqueName: '', voucherUniqueName: '', voucherType: '' })
            }
        } catch (error: any) {
            console.error('----- Error in Delete Voucher -----', error)
            Toast({ message: error?.data?.message });
        }
    }

    const refreshData = async () => {
        console.log('-------- Refresh Data -----------');
        setPageCount({ page: 1, count: 25, totalItem: 0 });
        setIsLoading(true);
        setIsLoadingMore(false);
        setVoucherData([]);
        getAllVouchers(1);
    }

    const onRefresh = () => {
        setIsRefreshing(true)
        refreshData()
        _.delay(() => { setIsRefreshing(false) }, 500)
    }

    const renderItem = ({ item, index } : { item: any, index: number }) => {
        return (
            <VoucherCard
                name={item?.account?.uniqueName === 'cash' ? item?.account?.customerName : item?.account?.name}
                accountUniqueName={item?.account?.uniqueName}
                amount={item?.grandTotal?.amountForAccount}
                currencySymbol={item?.accountCurrencySymbol}
                voucherNumber={item?.voucherNumber}
                voucherUniqueName={item?.uniqueName}
                voucherDate={item?.voucherDate}
                balanceStatus={item?.balanceStatus}
                dueDate={item?.dueDate}
                dueAmount={item?.balanceDue?.amountForAccount}
                isSalesCashInvoice={item?.account?.uniqueName === 'cash'}
                companyVoucherVersion = {companyVoucherVersion}
                date={getVoucherGroupDate(item, index, voucherData)}
                voucherName={voucherName}
                showDivider={index !== 0}
                shareFile={shareFile}
                downloadFile={downloadFile}
                onPressDelete={onPressDelete}
            />
        )
    }

    useEffect(() => {
        refreshData();

        const listeners : Array<EmitterSubscription> = [];
        
        ListnerEvents.forEach((Event) => {
            listeners.push(DeviceEventEmitter.addListener(Event, refreshData))
        })
    
        return () => {
            listeners.forEach((listener) => listener?.remove());
        }
    }, [voucherName, date])

    return (
        <View style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={voucherName} isBackButtonVisible={isBackButtonVisible} backgroundColor={voucherBackground} />
            <View style={styles.container}>
                <DateFilter
                    startDate={date.startDate}
                    endDate={date.endDate}
                    dateMode={dateMode}
                    activeDateFilter={activeDateFilter}
                    disabled={isLoading}
                    changeDate={changeDate}
                    setActiveDateFilter={_setActiveDateFilter}
                />
                <View style={styles.container}>
                    <StickyDay stickyDayRef={stickyDayRef} />
                    <FlatList
                        data={voucherData}
                        contentContainerStyle={styles.contentContainerStyle}
                        renderItem={renderItem}
                        onViewableItemsChanged={onViewableItemsChanged}
                        onEndReached={onEndReached}
                        keyExtractor={item => JSON.stringify(item)}
                        refreshControl={ 
                            <RefreshControl 
                                progressBackgroundColor={colors.BACKGROUND}
                                colors={[colors.PRIMARY_NORMAL]}
                                refreshing={isRefreshing} 
                                progressViewOffset={15}
                                onRefresh={onRefresh} 
                            />
                        }
                        ListFooterComponent={<ListFooterComponent />}
                        ListEmptyComponent={<ListEmptyComponent />}
                    />
                </View>
                <Loader isLoading={isLoading} />
            </View>

            <ShareModal modalVisible={isSharing} />
            <ConfirmationBottomSheet
                bottomSheetRef={confirmationBottomSheetRef}
                message={ConfirmationMessages.DELETE_VOUCHER.message}
                description={ConfirmationMessages.DELETE_VOUCHER.description}
                onConfirm={handleVoucherDelete}
                onReject={() => setBottomSheetVisible(confirmationBottomSheetRef, false)}
            />
        </View>
    )
}

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.solids.grey.light,
    },
    loader: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentContainerStyle: {
        flexGrow: 1,
        paddingTop: 30,
        paddingBottom: 60
    }
})

const mapStateToProps = (state: any, ownProps: any) => {
    console.log(ownProps?.route?.name, state.commonReducer.companyVoucherVersion)
    return {
        _voucherName: state.commonReducer.selectedVouchersForBottomTabs[ownProps?.route?.name === Routes.BottomTabScreen1 ? 0 : 1],
        companyVoucherVersion: state.commonReducer.companyVoucherVersion
    }
}

export default connect(mapStateToProps)(AllVoucherScreen);
