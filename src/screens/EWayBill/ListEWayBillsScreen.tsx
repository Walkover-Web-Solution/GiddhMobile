import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, Alert, DeviceEventEmitter, FlatList, PermissionsAndroid, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, ToastAndroid, TouchableOpacity } from "react-native";
import { Text, View } from "react-native"
import { useSelector } from "react-redux";
import Feather from 'react-native-vector-icons/Feather'
import { useEffect, useRef, useState } from "react";
import { APP_EVENTS, STORAGE_KEYS } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFetchBlob from 'react-native-blob-util'
import TOAST from "@/components/Toast";
import { commonUrls } from "@/core/services/common/common.url";
import moment from "moment";
import { CommonService } from "@/core/services/common/common.service";
import colors from "@/utils/colors";
import Toast from "@/components/Toast";
import DateFilter from "./component/DateFilte";
import TaxNumbersModalize from "./component/TaxNumbersModalize";
import { setBottomSheetVisible } from "@/components/BottomSheet";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";
import { REDUX_STATE } from "@/redux/types";
import ActionModalize from "./component/ActionModalize";

export const exportFile = async (uniqueName) => {
    // if (isApiCallInProgress) return;
    // setIsApiCallInProgress(true);
    try {
        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Downloading Started... It may take while', open: null });
        const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
        const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

        // fetching base64 string
        const response = await fetch(commonUrls.downloadEWB(uniqueName)
            .replace(':companyUniqueName', activeCompany), {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'session-id': token,
                'user-agent': Platform.OS
            },
        })

        if (!response.ok) {
            TOAST({ message: `Failed to fetch file: ${response.statusText}`, position: 'BOTTOM', duration: 'LONG' })
            //   setIsApiCallInProgress(false);
        }

        const jsonResponse = await response.json();
        //base64 str from response
        const base64String = jsonResponse?.body;

        if (!base64String) {
            TOAST({ message: 'Failed to fetch file', position: 'BOTTOM', duration: 'LONG' });
            //   setIsApiCallInProgress(false);
            throw new Error('Base64 data is missing in the response');
        }

        const { dirs } = RNFetchBlob.fs;
        const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
        const configfb = {
            fileCache: true,
            addAndroidDownloads: {
                notification: true,
                title: `EWAYB`,
                path: `${dirs.DownloadDir}/EWBill-${moment().format('DD-MM-YYYY-hh-mm-ss')}.pdf`,
            },
            notification: true,
            title: `EWAYB`,
            path: `${dirToSave}/EWBill-${moment().format('DD-MM-YYYY-hh-mm-ss')}.pdf`,
            IOSBackgroundTask: true,
        };
        const configOptions = Platform.select({
            ios: configfb,
            android: configfb,
        });

        await RNFetchBlob.fs.writeFile(configfb.path, base64String, 'base64');

        console.log('File saved successfully to:', configfb.path);
        if (Platform.OS === 'ios') {
            RNFetchBlob.ios.previewDocument(configfb.path);
        }
        //coping file to download folder
        if (Platform.OS == "android") {
            let result = await RNFetchBlob.MediaCollection.copyToMediaStore({
                name: 'EWBill-' + moment().format('DD-MM-YYYY-hh-mm-ss'),
                parentFolder: '',
                mimeType: 'application/pdf'
            },
                'Download', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
                configfb.path // Path to the file being copied in the apps own storage
            );
            ToastAndroid.show(
                'File saved to download folder',
                ToastAndroid.LONG,
            );
        }

        //notification for complete download
        RNFetchBlob.android.addCompleteDownload({
            title: configfb.title,
            description: 'File downloaded successfully',
            mime: 'application/pdf',
            path: configfb.path,
            showNotification: true,
        })

        const openFile = Platform.OS === 'android'
            ? () => RNFetchBlob.android.actionViewIntent(configfb.path, 'application/pdf').catch((error) => { console.error('----- Error in File Opening -----', error) })
            : () => RNFetchBlob.ios.openDocument(configfb.path)

        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, {
            message: 'Download Successful!',
            action: 'Open',
            open: openFile
        });

    } catch (e) {
        console.log('----- Error in Export -----', e)
    } finally {
        // setIsApiCallInProgress(false);
    }
};

export const downloadEWayBill = async (uniqueName: string) => {
    try {
        if (Platform.OS == "android" && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
            }
        }
        await exportFile(uniqueName);
    } catch (err) {
        console.warn(err);
    }
}

const RenderItem = ({ item, currency, modalizeRef, setSelectedEWBill }) => {
    const { styles, theme } = useCustomTheme(getStyles);
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={()=>{
            setSelectedEWBill(item);
            setBottomSheetVisible(modalizeRef, true);
            console.log("select4ed item", item);
            
        }}>
            <View style={styles.rowView}>
                <View style={styles.itemView}>
                    <Text style={styles.title}>#{item.docNumber} </Text>
                    <TouchableOpacity onPress={() => downloadEWayBill(item.ewbNo)} style={styles.downloadButton}>
                        <Feather name="download" size={18} color={theme.colors.solids.black} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>{currency?.currency?.symbol} {item.totalValue}</Text>
            </View>
            <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={styles.regularText}>{item.invoiceDate}</Text>
                    <Text style={[styles.regularText, { fontFamily: theme.typography.fontFamily.semiBold }]}>{item.customerName || 'N/A'}</Text>
                </View>
                <Text style={styles.regularText}>Bill#: {item.ewbNo}</Text>
                <Text style={styles.regularText}>Customer GSTIN: {item.customerGstin || 'N/A'}</Text>
                <Text style={styles.regularText}>Bill Date: {item.ewayBillDate}</Text>
            </View>
        </TouchableOpacity>
    )
}

const ListEWayBillsScreen = () => {
    const { statusBar, styles, voucherBackground, theme } = useCustomTheme(getStyles, 'PdfPreview');
    const { countryV2: currencyDetails } = useSelector((state: REDUX_STATE) => state?.commonReducer?.companyDetails);
    const [taxNumbers, setTaxNumbers] = useState([]);
    const [selectedGst, setSelectedGst] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [dateMode, setDateMode] = useState('defaultDates');
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [ewayList, setEWayList] = useState([]);
    const [pageData, setPageData] = useState({ page: 1, totalPages: 1 });
    const dropDownModalizeRef = useRef(null);
    const actionModalizeRef = useRef(null);
    const [selectedEWBill, setSelectedEWBill] = useState(null);

    const changeDate = (startDate: string, endDate: string) => {
        setDate({ startDate, endDate });
    }

    const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
        setActiveDateFilter(activeDateFilter);
        setDateMode(dateMode);
    };

    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }

    const fetchTaxNumbers = async () => {
        try {
            const response = await CommonService.fetchTaxNumbers();
            if (response && response?.status == "success") {
                setTaxNumbers(response?.body);
                if (response?.body?.length > 0) setSelectedGst(response?.body?.[0]);
            }
        } catch (error) {
            console.log("Error while fetching tax numbers", error);
            Toast({ message: error?.message, duration: 'SHORT', position: 'BOTTOM' })
        }
    }

    const fetchEWayBills = async (page?: number) => {
        try {
            const _page = page ?? pageData.page + 1;
            const response = await CommonService.fetchEWayBills(date.startDate, date.endDate, selectedGst, _page);
            if (response && response?.status == "success") {
                const { results, page, totalPages } = response?.body;
                setEWayList((prev) => _page > 1 ? [...prev, ...results] : results);
                setPageData({ page, totalPages });
            }
        } catch (error) {
            console.log("Error while fetching ewaybill list", error);
            Toast({ message: error?.message, duration: 'SHORT', position: 'BOTTOM' })
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEWayBills(1);
        setRefreshing(false);
    };

    useEffect(() => {
        if (selectedGst != '') {
            setIsLoading(true);
            fetchEWayBills(1).then(() => setIsLoading(false));
        } else {
            fetchTaxNumbers();
        }

        const subscribe = DeviceEventEmitter.addListener(
            APP_EVENTS.ListEWayBillsScreenRefresh,
            () => setDate({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') })
        );

        return () => {
            subscribe.remove();
        }
    }, [selectedGst, date])

    const ListFooterComponent = (
        <View style={styles.loader}>
            <ActivityIndicator color={colors.PRIMARY_NORMAL} size="small" animating={pageData.page < pageData.totalPages} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar} />
            <Header header={'E-way Bills'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            <DateFilter
                startDate={date.startDate}
                endDate={date.endDate}
                dateMode={dateMode}
                activeDateFilter={activeDateFilter}
                disabled={false}
                changeDate={changeDate}
                setActiveDateFilter={_setActiveDateFilter}
                optionModalRef={dropDownModalizeRef}
                showDropdown={true}
                dropdownLabel={'GSTIN'}
                dropdownValue={selectedGst}
            />
            <FlatList
                data={ewayList}
                keyExtractor={(item) => item.ewbNo}
                renderItem={({ item }) => <RenderItem item={item} currency={currencyDetails} modalizeRef={actionModalizeRef} setSelectedEWBill={setSelectedEWBill}/>}
                contentContainerStyle={styles.listContainer}
                ListFooterComponent={ListFooterComponent}
                ListEmptyComponent={
                    !isLoading ? (
                        <NoData
                            primaryMessage="No Records found."
                            secondaryMessage="There is no E-way Bill recorded in the selected date range."
                        />
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        progressBackgroundColor={colors.BACKGROUND}
                        colors={[colors.PRIMARY_NORMAL]}
                        refreshing={refreshing}
                        progressViewOffset={15}
                        onRefresh={onRefresh}
                    />
                }
                onEndReachedThreshold={2}
                onEndReached={() => (pageData.page < pageData.totalPages) && fetchEWayBills()}
            />
            <Loader isLoading={isLoading} />
            <TaxNumbersModalize modalizeRef={dropDownModalizeRef} setBottomSheetVisible={setBottomSheetVisible} taxData={taxNumbers} setSelectedGst={setSelectedGst} />
            <ActionModalize modalizeRef={actionModalizeRef} setBottomSheetVisible={setBottomSheetVisible} selectedEWBill={selectedEWBill}/>
        </SafeAreaView>
    )
}

export default ListEWayBillsScreen;

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.solids.white
    },
    subContainer: {
        marginHorizontal: 20,
        marginVertical: 7,
    },
    card: {
        marginHorizontal: 12,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderColor: '#D9D9D9',
        borderWidth: 1
    },
    detailsContainer: {
        flex: 1,
    },
    title: {
        fontSize: theme.typography.fontSize.large.size,
        fontFamily: theme.typography.fontFamily.extraBold,
        // lineHeight: theme.typography.fontSize.large.lineHeight
    },
    downloadButton: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
    },
    listContainer: {
        flexGrow: 1
    },
    regularText: {
        fontSize: theme.typography.fontSize.regular.size,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        marginBottom: 1,
    },
    loader: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
    },
    rowView: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    itemView: {
        flexDirection:'row',
        alignItems:'baseline',
        paddingBottom:8
    }
})