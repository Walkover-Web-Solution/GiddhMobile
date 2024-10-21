import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, Dimensions, FlatList, PixelRatio, Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import moment from "moment";
import DateFilter from "./Component/TaxDateFilter";
import { TaxServices } from "@/core/services/tax/tax.service";
import Toast from "@/components/Toast";
import { APP_EVENTS, FONT_FAMILY } from "@/utils/constants";
import Loader from "@/components/Loader";
import BottomSheet from "@/components/BottomSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MatButton from "@/components/OutlinedButton";
import { useSelector } from "react-redux";
import Icon from '@/core/components/custom-icon/custom-icon';
import _ from "lodash";
const { height, width } = Dimensions.get('window');

const formatDate = (dateString:string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};


const _Card = ({ item,index, onPress }) => {
    const {statusBar,styles, theme} = useCustomTheme(getStyles);
    
    {/* <View>
        <Text>Start Date {'\n'+item?.start}</Text>
        <Text>End Date {'\n'+item?.end}</Text>
    </View>
    <Text>{item?.due}</Text>
    <Text>{item?.status}</Text> */}
    return(
        <View style={styles.superRowContainer}>
            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.item}>{formatDate(item?.start)}</Text>
                <Text style={styles.item}>{formatDate(item?.end)}</Text>
                <Text style={styles.item}>{formatDate(item?.due)}</Text>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:5 }}>
                <Text style={styles.itemStatus}>{item?.status == "F" ? "Fulfilled" : "Open"}</Text>
                <TouchableOpacity 
                style={{
                    borderWidth:1.2,
                    padding:5,
                    borderRadius:8,
                    width:100,
                    alignItems:'center',
                    borderColor:theme.colors.border
                }}
                onPress={
                    ()=>onPress(item)
                }>
                    <Text style={styles.itemStatus}>{item?.status == "F" ? "View Return" : "File Return"}</Text>
                </TouchableOpacity>
            </View>
        </View>
)}

const Card = React.memo(_Card)


const VATObligationScreen = () => {
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'PdfPreview');
    const [date, setDate] = useState<{ startDate: string, endDate: string }>({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
    const [activeDateFilter, setActiveDateFilter] = useState('');
    const [dateMode, setDateMode] = useState('defaultDates');
    const [isLoading, setIsLoading] = useState(false);
    const [taxNumbersArr, setTaxNumbersArr] = useState<any>([]);
    const [vatObligationsArr, setVatObligationsArr] = useState<any>([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedTaxNumber,setSelectedTaxNumber] = useState('');
    const [selectedBranch,setSelectedBranch] = useState('');
    const [defaultStatus,setDefaultStatus] = useState("All");
    const modalizeRef = useRef(null);
    const confirmationModalRef = useRef(null);
    const optionModalizeRef = useRef(null);
    const branchModalRef = useRef(null);
    const statusModalRef = useRef(null);
    const taxNumbersModalRef = useRef(null);
    const [modalLoading, setModalLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const [vatReport, setVatReport] = useState([]);
    const branchList = useSelector((state) => state?.commonReducer?.branchList);
    const [isRefreshing, setIsRefreshing] = useState(false);
    

    const changeDate = (startDate: string, endDate: string) => {
        setDate({ startDate, endDate });
    }

    const getTimeStamp = () => {
        const timestamp = new Date().toISOString();
        return timestamp;
    }

    const getUserTimeZone = () => {
        let offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
        return (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
    }

    const getClientScreens = () => {
        const screenDimensions = Dimensions.get('screen');
        return `width=${screenDimensions.width}&height=${screenDimensions.height}&scaling-factor=${PixelRatio.get()}&colour-depth=24`;
    }
    
    const  getClientWindowSize = () => {
        const windowDimensions = Dimensions.get('window');
        return `width=${windowDimensions.width}&height=${windowDimensions.height}`;
    }

    const _setActiveDateFilter = (activeDateFilter: string, dateMode: string) => {
        setActiveDateFilter(activeDateFilter);
        setDateMode(dateMode);
    };
    
    const body = {
        "timestamp": getTimeStamp(),
        "Gov-Client-Timezone": "UTC" + getUserTimeZone(),
        "Gov-client-screens": getClientScreens(),
        "Gov-client-window-size": getClientWindowSize()
    }

    const fetchVatObligations = async (taxNumber:string) => {
        try {
            const response = await TaxServices.fetchVatObligations(taxNumber, body, date.startDate, date.endDate, selectedBranch ? selectedBranch?.uniqueName : '', (defaultStatus?.charAt(0)=='A' ? '' : defaultStatus?.charAt(0)));
            if(response?.data && response?.data?.status == 'success'){
                setIsLoading(false);
                setVatObligationsArr(response?.data?.body?.obligations);
            }else{
                setIsLoading(false);
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'});
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Error while fetching vat obligations",error);
        }
    }

    const authorize = async (taxNumber:string) => {
        try {
            const response = await TaxServices.authorize();
            if(response?.data && response?.data?.status == 'success' && response?.data?.body == null){
                const vatArr = fetchVatObligations(taxNumber);
            }else{
                setIsLoading(false);
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'});
            }
        } catch (error) {
            setIsLoading(false);
            console.log("Error while authorizing", error);
        }
    }


    const fetchTaxNumbers = async () => {
        setIsLoading(true);
        try {
            const response = await TaxServices.fetchTaxNumbers();
            if(response?.data && response?.data?.status == 'success'){
                const taxArr = response?.data?.body;
                console.log("tax ARR",taxArr);
                
                setTaxNumbersArr(taxArr);
                setSelectedTaxNumber(taxArr?.[0]);
                if(taxArr?.length > 0){
                    try {
                        const vatArr = authorize(taxArr?.[0]);
                    } catch (error) {
                        setIsLoading(false);
                        console.log("error while authorizing",error);
                    }
                }else{
                    console.log("Empty Tax Numbers Arr!");
                    setIsLoading(false);
                    Toast({message: "No Tax Number Available", position:'BOTTOM',duration:'LONG'});
                }
            }else{
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'}) 
                return null;
            }
        } catch (error) {
            console.log("error while fetching tax numbers",error);
            setIsLoading(false);
            Toast({message: "Error while fetching tax numbers", position:'BOTTOM',duration:'LONG'});
            return null;
        }
    }

    const fetchOpenVatReport = async (start:string, end:string, taxNumber:string) => {
        setModalLoading(true);
        try {
            const response = await TaxServices.fetchOpenVatReport(start, end, taxNumber);
            if(response?.data && response?.data?.status == 'success'){
                setModalLoading(false);
                setVatReport(response?.data?.body?.sections);
            }else{
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'}) 
                modalizeRef?.current?.close();
            }
        } catch (error) {
            setModalLoading(false);
            console.log("error while fetching open vat report");
            
        }
    }

    const fetchFulfilledVatReport = async (start:string, end:string, taxNumber:string, periodKey:string) => {
        try {
            const response = await TaxServices.fetchFulfilledVatReport(start, end, taxNumber, periodKey, body);
            if(response?.data && response?.data?.status == 'success'){
                setVatReport(response?.data?.body?.sections);
            }else{
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'}) 
                modalizeRef?.current?.close();
            }
        } catch (error) {
            console.log("error while fetching fulfilled vat report");
        }
    }

    const submitFileReturn = async (start:string, end:string, taxNumber:string, periodKey:string, branchUniqueName:string) => {
        try {
            const response = await TaxServices.submitFileReturn(start, end, taxNumber, periodKey, branchUniqueName, body);
            console.log("response-=-=--=-=-=",response);
            if(response?.data && response?.data?.status == 'success'){
                //clean and page refresh!!
                onRefresh();
            }else{
                Toast({message: response?.data?.message, position:'BOTTOM',duration:'LONG'}) 
            }
        } catch (error) {
            console.log("error while submitting file return!");
            
        }
    }

    const clearAll = () => {
        resetState();
    };

    console.log("selected iten",selectedItem);
    
    const resetState = ()=> {
        setIsLoading(false);
        // setTaxNumbersArr([]);
        setVatObligationsArr([]);
        setSelectedItem({});
        setActiveDateFilter('');
        setDateMode('defaultDates');
        setDate({ startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'), endDate: moment().format('DD-MM-YYYY') });
        setSelectedTaxNumber(''),
        setSelectedBranch(''),
        setDefaultStatus('All'),
        setVatReport([])
    }

    useEffect(()=>{
        fetchTaxNumbers();
        DeviceEventEmitter.addListener(APP_EVENTS.VATObligationScreenRefresh, async () => {
            clearAll();
            fetchTaxNumbers();
        });
    },[])

    // useEffect(()=>{
    //     if(selectedItem?.status){
    //         if(selectedItem?.status == "F"){
    //             console.log("final api call");
    //             setVatReport([]);
    //             fetchFulfilledVatReport(formatDate(selectedItem?.start), formatDate(selectedItem?.end), selectedTaxNumber, selectedItem?.periodKey);
                
    //         }else if(selectedItem?.status == "O"){
    //             setVatReport([]);
    //             fetchOpenVatReport(formatDate(selectedItem?.start), formatDate(selectedItem?.end), selectedTaxNumber);
    //             console.log("open api call");
    //         }
    //     }
    // },[selectedItem])

    const onOpen = useCallback((item) => {
        setSelectedItem(item);
        modalizeRef.current?.open();
        if(item?.status == "F"){
            console.log("final api call");
            setVatReport([]);
            fetchFulfilledVatReport(formatDate(item?.start), formatDate(item?.end), selectedTaxNumber, item?.periodKey);
        }else if(item?.status == "O"){
            setVatReport([]);
            fetchOpenVatReport(formatDate(item?.start), formatDate(item?.end), selectedTaxNumber);
            console.log("open api call");
        }
    },[selectedTaxNumber]);

    const renderItem = ({item,index})=><Card item={item} index={index} onPress={onOpen}/>

    const onRefresh = () => {
        setIsRefreshing(true)
        DeviceEventEmitter.emit(APP_EVENTS.VATObligationScreenRefresh, {})
        _.delay(() => { setIsRefreshing(false) }, 500)
    }

    const SectionCard = ({ section }) => {
        return (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{section?.section}</Text>
            {section.sections.map((item) => (
              <View key={item?.key} style={styles.rowContainer}>
                <Text style={styles.description}>Box {item?.order} : {item?.description}</Text>
                <Text style={styles.amount}>Amount: £ {item?.amount}</Text>
              </View>
            ))}
          </View>
        );
    };


    const DetailModal = (
        <BottomSheet
        bottomSheetRef={modalizeRef}
        headerText={selectedItem?.status == 'F' ? "View Return" : "File Return"}
        headerTextColor={voucherBackground}
        modalTopOffset={insets.top+50}
        adjustToContentHeight={false}
        >
        <View style={{flex:1,paddingBottom:10}}>
            {vatReport?.length > 0 && (
                <ScrollView>
                {vatReport.map((section) => (<SectionCard key={section?.section} section={section} />))}
                </ScrollView>
            )}
            {vatReport?.length > 0 && selectedItem?.status == "O" && <TouchableOpacity
            style={styles.doneBtn}
            onPress={()=>{
                confirmationModalRef?.current?.open();
            }}
            >
                <Text style={styles.doneBtnText}>Submit File return </Text>
            </TouchableOpacity>}
        </View>
        </BottomSheet>
    )
    
    const ConfirmationModal = (
        <BottomSheet
        bottomSheetRef={confirmationModalRef}
        headerText='Confirmation'
        headerTextColor={voucherBackground}
        adjustToContentHeight={true}
        // modalTopOffset={insets.top+50}
        >
        <View style={styles.options}>
            <Text style={styles.desc}>When you submit this VAT information you are making a legal declaration that the information is true and complete. A false declaration can result in prosecution.</Text>
            <View style={{flexDirection:'row',justifyContent:'flex-end',marginVertical:14}}>
                <TouchableOpacity
                style={styles.btn}
                onPress={()=>{
                    submitFileReturn(formatDate(selectedItem?.start), formatDate(selectedItem?.end), selectedTaxNumber, selectedItem?.periodKey, (selectedBranch ? selectedBranch?.uniqueName : ''));
                    confirmationModalRef?.current?.close();
                    modalizeRef?.current?.close();
                }}
                >
                    <Text style={styles.btnText}>Submit File Return </Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.btn,{marginLeft:14}]}
                onPress={()=>{
                    confirmationModalRef?.current?.close();
                }}
                >
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
        </BottomSheet>
    )

    const OptionModal = (
        <BottomSheet
            bottomSheetRef={optionModalizeRef}
            headerText='Search by'
            headerTextColor={voucherBackground}
            >
            <View style={styles.modalContent}>
                {taxNumbersArr?.length > 1 && <MatButton 
                    lable="Tax Number"
                    value={selectedTaxNumber}
                    onPress={()=>{
                        taxNumbersModalRef?.current?.open();
                        // setBottomSheetVisible(filterByModalizeRef,true)
                    }}
                />}
                <MatButton 
                    lable="Status"
                    value={defaultStatus}
                    onPress={()=>{
                        statusModalRef?.current?.open();
                        // setBottomSheetVisible(filterTypeModalizeRef,true)
                    }}
                    />
                <MatButton 
                    lable="Branch"
                    value={selectedBranch?.name}
                    onPress={()=>{
                        branchModalRef?.current?.open();
                        // setBottomSheetVisible(filterTypeModalizeRef,true)
                    }}
                    />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={() => {
                            optionModalizeRef?.current?.close();
                            setIsLoading(true);
                            fetchVatObligations(selectedTaxNumber);
                        }}
                        >
                        <Text style={styles.doneBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    )
// console.log("branhces",branchList);

    const BranchModal = (
        <BottomSheet
        bottomSheetRef={branchModalRef}
        headerText='Select Branch'
        headerTextColor='#084EAD'
        adjustToContentHeight={false}
        modalTopOffset={insets?.top+50}
        flatListProps={{
            data: branchList,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setSelectedBranch(item);
                    branchModalRef?.current?.close();
                }}
                >
                <Icon name={selectedBranch?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {item?.name}
                </Text>
                </TouchableOpacity>
            );
            },
            ListEmptyComponent: () => {
            return (
                <View style={styles.modalCancelView}>
                <Text
                    style={styles.modalCancelText}>
                    No Branch Available
                </Text>
                </View>

            );
            }
        }}
        />
    )

    const  StatusModal = (
        <BottomSheet
        bottomSheetRef={statusModalRef}
        headerText='Select Status'
        headerTextColor='#084EAD' 
        >
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setDefaultStatus("All");
                    statusModalRef?.current?.close();
                }}
                >
                <Icon name={defaultStatus == "All" ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setDefaultStatus("Open");
                    statusModalRef?.current?.close();
                }}
                >
                <Icon name={defaultStatus == "Open"  ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setDefaultStatus("Fulfilled");
                    statusModalRef?.current?.close();
                }}
                >
                <Icon name={defaultStatus == "Fulfilled"  ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>Fulfilled</Text>
            </TouchableOpacity>
        </BottomSheet>
    )
// const taxData = ['378610137','378610134','378610133','378610132','378610131']
    const TaxNumbersModal = (
        <BottomSheet
        bottomSheetRef={taxNumbersModalRef}
        headerText='Select Tax Number'
        headerTextColor='#084EAD'
        flatListProps={{
            data: taxNumbersArr,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    taxNumbersModalRef?.current?.close();
                    optionModalizeRef?.current?.close();
                    resetState();
                    setSelectedTaxNumber(item);
                    setIsLoading(true);
                    // setVatObligationsArr([]);
                    // setSelectedItem({});
                    fetchVatObligations(item);
                }}
                >
                <Icon name={selectedTaxNumber == item ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                <Text style={styles.radiobuttonText}>
                    {item}
                </Text>
                </TouchableOpacity>
            );
            },
            ListEmptyComponent: () => {
            return (
                <View style={styles.modalCancelView}>
                <Text
                    style={styles.modalCancelText}>
                    No Tax Number Available
                </Text>
                </View>

            );
            }
        }}
        />
    )

console.log("date",date);

    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'VAT Obligations'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            <View style={{flex:1}}>
                <DateFilter
                    startDate={date.startDate}
                    endDate={date.endDate}
                    dateMode={dateMode}
                    activeDateFilter={activeDateFilter}
                    disabled={isLoading}
                    changeDate={changeDate}
                    setActiveDateFilter={_setActiveDateFilter}
                    optionModalRef={optionModalizeRef}
                />
                {vatObligationsArr?.length > 0 ? <View style={{flex:1}}>
                    <View style={styles.columnHeader}>
                        <Text style={styles.columnHeading}>Start Date</Text>
                        <Text style={styles.columnHeading}>End Date</Text>
                        <Text style={styles.columnHeading}>Due Date</Text>
                    </View>
                    <FlatList
                        data={vatObligationsArr}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{paddingHorizontal:10,paddingBottom:45}}
                        onEndReachedThreshold={0.5}
                        refreshControl={ 
                            <RefreshControl 
                                refreshing={isRefreshing} 
                                progressViewOffset={15}
                                onRefresh={onRefresh} 
                            />
                        }
                    />
                </View>:<Loader isLoading={isLoading}/>}
            </View>
            {DetailModal}
            {ConfirmationModal}
            {OptionModal}
            {BranchModal}
            {StatusModal}
            {TaxNumbersModal}
        </SafeAreaView>
    )
}

export default VATObligationScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({
    container : {
        flex:1,
        marginTop:0,
        borderRadius:7,
        backgroundColor:'#fff'
    },
    card: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // For Android shadow
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.large.size,
    fontFamily: theme.typography.fontFamily.extraBold,
    lineHeight: theme.typography.fontSize.large.lineHeight,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'column',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  description: {
    fontSize: theme.typography.fontSize.regular.size,
    fontFamily: theme.typography.fontFamily.semiBold,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
  },
  amount: {
    marginTop:3,
    fontSize: theme.typography.fontSize.regular.size,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: theme.colors.secondary,
  },
  doneBtn:{
    padding:15,
    margin:15,
    borderRadius: 8,
    backgroundColor: '#084EAD',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:7
  },
  doneBtnText : {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
    fontSize: theme.typography.fontSize.large.size,
    lineHeight: theme.typography.fontSize.large.lineHeight
  },
  superRowContainer: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff', 
    borderBottomWidth: 1,    
    borderBottomColor: '#e0e0e0',
  },
  item: {
    fontSize: theme.typography.fontSize.regular.size,
    fontFamily: theme.typography.fontFamily.medium,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: '#333',
  },
  desc:{
    fontSize: theme.typography.fontSize.large.size,
    fontFamily: theme.typography.fontFamily.semiBold,
    lineHeight: theme.typography.fontSize.large.lineHeight,
  },
  itemStatus: {
    fontSize: theme.typography.fontSize.regular.size,
    fontFamily: theme.typography.fontFamily.semiBold,
    lineHeight: theme.typography.fontSize.regular.lineHeight,
    color: '#333',
  },
  columnHeader:{
    flexDirection:'row',
    paddingHorizontal:17,
    paddingVertical:10,
    justifyContent:'space-between'
},
columnHeading:{
    fontFamily:theme.typography.fontFamily.medium,
    color:theme.colors.secondary
},
options: {
    width: '90%',
    paddingVertical: 10,
    alignSelf: 'center',
},
btn:{
    paddingHorizontal:15,
    paddingVertical:10,
    borderRadius: 8,
    backgroundColor: '#084EAD',
    justifyContent: 'center',
    alignItems: 'center',
  },
btnText : {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.large.size,
    lineHeight: theme.typography.fontSize.large.lineHeight,
    color: '#fff',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical:10,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
},
buttonContainer:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:10
},
button: {
    flexDirection: "row", 
    justifyContent: "flex-start", 
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  radiobuttonText:{
    color: '#1C1C1C', 
    fontFamily: FONT_FAMILY.regular,
    marginLeft: 10
  },
  modalCancelView:{
    height: height * 0.3, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8
  },
  modalCancelText :{
    flex: 1,
    color: '#1C1C1C',
    paddingVertical: 4,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'center',
    alignSelf: 'center'
  },
})