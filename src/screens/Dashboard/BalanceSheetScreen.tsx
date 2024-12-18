import useCustomTheme, {ThemeProps} from '@/utils/theme';
import moment from 'moment';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
    Alert,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Keyboard,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import DateFilter from './component/DateFilter';
import {useSelector} from 'react-redux';
import Loader from '@/components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import BottomSheet from '@/components/BottomSheet';
import Icon from '@/core/components/custom-icon/custom-icon';
import { formatAmount } from '@/utils/helper';
import { commonUrls } from '@/core/services/common/common.url';
import Feather from 'react-native-vector-icons/Feather'
import RNFetchBlob from 'react-native-blob-util'
import TOAST from "@/components/Toast";

const {height, width} = Dimensions.get('window');

const BalanceSheetScreen = () => {
  const { styles } = useCustomTheme(makeStyles, 'Stock');
  const [date, setDate] = useState<{startDate: string; endDate: string}>({
    startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
    endDate: moment().format('DD-MM-YYYY'),
  });
  const [dateMode, setDateMode] = useState('defaultDates');
  const [activeDateFilter, setActiveDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consolidatedBranch, setConsolidatedBranch] = useState(' ');
  const [refreshing, setRefreshing] = useState(false);
  const branchListModalRef = useRef(null);
  const [selectedBranch, setSelectedBranch] = useState({});
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
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

  const calculateClosingTotal = (items, category) => {
    return items.reduce((total, item) => {
      const closingAmount = item.closingBalance.amount;
      const type = item.closingBalance.type;
      if(category == "Assets") return type === "CREDIT" ? total - closingAmount : total + closingAmount
      return type === "DEBIT" ? total - closingAmount : total + closingAmount;
    }, 0);
  };
  
  const calculateForwardTotal = (items, category) => {
    return items.reduce((total, item) => {
      const forwardAmount = item.forwardedBalance.amount;
      const type = item.forwardedBalance.type;
      if(category == "Assets") return type === "CREDIT" ? total - forwardAmount : total + forwardAmount
      return type === "DEBIT" ? total - forwardAmount : total + forwardAmount;
    }, 0);
  };

  const longDateFormat =  (date:string) => moment(date, 'DD/MM/YYYY').format('DD MMM YY');

  const downloadFile = async (viewType:string) => {
    try {
        if (Platform.OS == "android" && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
            }
        }
        await exportFile(viewType);
    } catch (err) {
        console.warn(err);
    }
    }

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
      }else{
        TOAST({message: result?.message, position:'BOTTOM',duration:'LONG'})
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('Error while fetching balance sheet', error);
    }
  };

  const exportFile = async (viewType: string) => {
    if (isApiCallInProgress) return;
    setIsApiCallInProgress(true);
    try {
        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Downloading Started... It may take while', open: null });
        const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
        const consolidateState = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
        const consolidateBranchName = consolidatedBranch?.length == 1 ? selectedBranch?.uniqueName : '';
        const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
        console.log("called url->", commonUrls.downloadBalanceSheet(date?.startDate, date?.endDate, viewType, consolidateBranchName ? consolidateBranchName : (consolidateState ? consolidateState : '')));
        
        // fetching base64 string
        const response = await fetch(commonUrls.downloadBalanceSheet(date?.startDate, date?.endDate, viewType, consolidateBranchName ? consolidateBranchName : (consolidateState ? consolidateState : ''))
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
          setIsApiCallInProgress(false);
        }

        const jsonResponse = await response.json();
        //base64 str from response
        const base64String = jsonResponse?.body;
        
        if (!base64String) {
          TOAST({message: 'Failed to fetch file', position:'BOTTOM',duration:'LONG'});
          setIsApiCallInProgress(false);
          throw new Error('Base64 data is missing in the response');
        }

        const { dirs } = RNFetchBlob.fs;
        const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
        const configfb = {
          fileCache: true,
          addAndroidDownloads: {
            notification: true,
            title: `BalanceSheet`,
            path: `${dirs.DownloadDir}/BalanceSheet-${moment().format('DD-MM-YYYY-hh-mm-ss')}.xlsx`,
          },
          notification: true,
          title: `BalanceSheet`,
          path: `${dirToSave}/BalanceSheet-${moment().format('DD-MM-YYYY-hh-mm-ss')}.xlsx`,
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
            name: 'BalanceSheet-'+ moment().format('DD-MM-YYYY-hh-mm-ss'), 
            parentFolder: '',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          path: configfb.path,
          showNotification: true,
        })

        const openFile = Platform.OS === 'android' 
            ?  () => RNFetchBlob.android.actionViewIntent(configfb.path, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').catch((error) => { console.error('----- Error in File Opening -----', error)})
            :  () => RNFetchBlob.ios.openDocument(configfb.path)

        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { 
            message: 'Download Successful!', 
            action: 'Open',
            open: openFile
        });

    } catch (e) {
        console.log('----- Error in Export -----', e)
    } finally {
        setIsApiCallInProgress(false);
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
              <Text style={styles.modalCancelText}>No Data</Text>
            </View>
          );
        },
      }}
    />
  );


const renderCategory = (category, items) => {
    const closingTotal = calculateClosingTotal(items,category);
    const forwardTotal = calculateForwardTotal(items,category);
    
    return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.headingContainer}>
        <Text style={styles.dateText}>As of {longDateFormat(date?.startDate)}</Text>
        <Text style={styles.dateText}>As of {longDateFormat(date?.endDate)}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.text}>{item.groupName}</Text>
            <View style={styles.headingContainer}>
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
        <View style={[styles.headingContainer,{paddingVertical:3}]}>
            <Text style={styles.totalText}>{formatAmount(closingTotal)}</Text>
            <Text style={styles.totalText}>{formatAmount(forwardTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

  useEffect(() => {
    setTimeout(() => fetchDetailedBalanceSheet(consolidatedBranch?.length == 1 ? selectedBranch?.uniqueName : ''), 1500);
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
        <DateFilter
            startDate={date.startDate}
            endDate={date.endDate}
            dateMode={dateMode}
            activeDateFilter={activeDateFilter}
            disabled={isLoading}
            changeDate={changeDate}
            setActiveDateFilter={_setActiveDateFilter}
            optionModalRef={branchListModalRef}
            consolidatedBranch={consolidatedBranch}
            selectedBranch={selectedBranch}
        />
        <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {!loading ? (
            <View style={{paddingHorizontal: 16}}>
                <FlatList
                data={Object.keys(filteredData)}
                keyExtractor={(item) => item}
                renderItem={({item}) => renderCategory(item, filteredData?.[item])}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
                />
                <View style={styles.downloadBtnContainer}>
                <TouchableOpacity style={styles.downloadBtn} disabled={isApiCallInProgress} onPress={() => downloadFile('collapsed')} >
                    <Feather name="download" size={15} color={'#1C1C1C'} style={{paddingHorizontal:4}}/>
                    <Text style={styles.amountText}>Main Group Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.downloadBtn} disabled={isApiCallInProgress} onPress={()=> downloadFile('expanded')}>
                    <Feather name="download" size={15} color={'#1C1C1C'} style={{paddingHorizontal:4}}/>
                    <Text style={styles.amountText}>Complete Report</Text>
                </TouchableOpacity>
                </View>
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
    },
    downloadBtn :{
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 12,
        paddingVertical:8,
        borderRadius: 8,
        marginVertical: 4,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'baseline',
        width:'47%'
    },
    headingContainer: {
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:12
    },
    dateContainer : {
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      paddingVertical: 10
    },
    matBtn:{
      width: '40%', 
      paddingRight: 16, 
      marginTop: -4
    },
    downloadBtnContainer :{
      flexDirection:'row',
      justifyContent:'space-between',
      paddingBottom:'35%',
      paddingHorizontal:5
    }
  });
