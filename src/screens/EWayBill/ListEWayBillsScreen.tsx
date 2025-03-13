import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Alert, DeviceEventEmitter, Dimensions, FlatList, PermissionsAndroid, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, ToastAndroid, TouchableOpacity } from "react-native";
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
const {height,width} = Dimensions.get('window')

const exportFile = async (uniqueName) => {
    // if (isApiCallInProgress) return;
    // setIsApiCallInProgress(true);
    try {
        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Downloading Started... It may take while', open: null });
        const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
        const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
        
        // fetching base64 string
        const response = await fetch(commonUrls.downloadEWB(uniqueName)
        .replace(':companyUniqueName',activeCompany) ,{
          method: "GET",
          headers: {
            'Accept': 'application/json',
            'session-id' : token,
            'user-agent' : Platform.OS
          },
        })

        if (!response.ok) {
          TOAST({message: `Failed to fetch file: ${response.statusText}`, position:'BOTTOM',duration:'LONG'}) 
        //   setIsApiCallInProgress(false);
        }

        const jsonResponse = await response.json();
        //base64 str from response
        const base64String = jsonResponse?.body;
        
        if (!base64String) {
          TOAST({message: 'Failed to fetch file', position:'BOTTOM',duration:'LONG'});
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
            name: 'EWBill-'+ moment().format('DD-MM-YYYY-hh-mm-ss'), 
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
            ?  () => RNFetchBlob.android.actionViewIntent(configfb.path, 'application/pdf').catch((error) => { console.error('----- Error in File Opening -----', error)})
            :  () => RNFetchBlob.ios.openDocument(configfb.path)

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

const downloadEWayBill = async (uniqueName: string) => {
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

const RenderItem = ( {element, currency} ) => {
    const {styles, theme} = useCustomTheme(getStyles);
    const {item} = element;    

    return (
        <View style={styles.card}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                <Text style={styles.title}>#{item.docNumber} </Text>
                <Text style={styles.title}>{currency?.currency?.symbol} {item.totalValue}</Text>
            </View>
            <View style={styles.detailsContainer}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:5}}>
                    <Text style={styles.regularText}>{item.invoiceDate}</Text>
                    <Text style={[styles.regularText, {fontFamily:theme.typography.fontFamily.semiBold}]}>{item.customerName || 'N/A'}</Text>
                </View>
                <Text style={styles.regularText}>Bill#: {item.ewbNo}</Text>
                <Text style={styles.regularText}>Customer GSTIN: {item.customerGstin || 'N/A'}</Text>
                <Text style={styles.regularText}>Bill Date: {item.ewayBillDate}</Text>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:3}}>
                    <TouchableOpacity onPress={() => {downloadEWayBill(item.ewbNo)}} style={styles.downloadButton}>
                        <Feather name="download" size={20} color={'#1C1C1C'} />
                        {/* <Text style={[styles.title,{marginBottom: 0, marginLeft:5}]}>Download</Text> */}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const ListEWayBillsScreen = () => {
    const {statusBar, styles, voucherBackground, theme} = useCustomTheme(getStyles, 'PdfPreview');
    const { countryV2:currencyDetails } = useSelector(state => state?.commonReducer?.companyDetails);
    const [taxNumbers, setTaxNumbers] = useState([]);
    const [selectedGst, setSelectedGst] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [dateMode, setDateMode] = useState('defaultDates');
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [ewayList, setEWayList] = useState([]);
    const dropDownModalizeRef = useRef(null);

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
            console.log("hi",response);
            if(response && response?.status == "success"){
                setTaxNumbers(response?.body);
                if(response?.body?.length > 0)setSelectedGst(response?.body?.[0]);
            }
        } catch (error) {
            console.log("Error while fetching tax numbers", error);
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'})         
        }
    }

    const fetchEWayBills = async () => {
        try {
            const response = await CommonService.fetchEWayBills(date.startDate, date.endDate, selectedGst);
            console.log("hihihhi", response);
            if(response && response?.status =="success"){
                setEWayList(response?.body?.results);
            }
        } catch (error) {
            console.log("Error while fetching ewaybill list", error);
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'}) 
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        fetchEWayBills();
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
    };

    useEffect(()=>{
        if(selectedGst !=''){
            console.log("bhaisab");
            
            fetchEWayBills();
        }else fetchTaxNumbers();
    }, [selectedGst, date])

    
    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
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
                renderItem={item => <RenderItem element={item} currency={currencyDetails}/>}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={()=>(
                    <View style={{backgroundColor: theme.colors.solids.white,alignItems:'center'}}>
                        <Text style={styles.regularText}>No entries found within given criteria.Do search with some other dates</Text>
                    </View>
                )}
                refreshControl={ 
                    <RefreshControl 
                        progressBackgroundColor={colors.BACKGROUND}
                        colors={[colors.PRIMARY_NORMAL]}
                        refreshing={refreshing} 
                        progressViewOffset={15}
                        onRefresh={onRefresh} 
                    />
                }
            />
            <TaxNumbersModalize modalizeRef={dropDownModalizeRef} setBottomSheetVisible={setBottomSheetVisible} taxData={taxNumbers} setSelectedGst={setSelectedGst}/>
        </SafeAreaView>
    )
}

export default ListEWayBillsScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({
    container : {
        flex:1,
        backgroundColor: theme.colors.solids.white
    },
    subContainer: {
        marginHorizontal: 20, 
        marginVertical: 7,
    },
    card: {
        backgroundColor: 'white',
        padding: 13,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
      },
      detailsContainer: {
        flex: 1,
      },
      title: {
        fontSize: theme.typography.fontSize.large.size,
        fontFamily: theme.typography.fontFamily.bold,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        marginBottom: 8,
      },
      downloadButton:{
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection:'row',
    },
      listContainer: {
        padding: 10,
        backgroundColor: theme.colors.solids.white,
      },
      regularText: {
        fontSize: theme.typography.fontSize.regular.size,
        fontFamily: theme.typography.fontFamily.semiBold,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        marginBottom:1,
      },
})