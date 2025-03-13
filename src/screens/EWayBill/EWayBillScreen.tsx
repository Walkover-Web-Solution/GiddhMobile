import { setBottomSheetVisible } from "@/components/BottomSheet";
import Header from "@/components/Header";
import InputField from "@/components/InputField";
import MatButton from "@/components/OutlinedButton";
import Toast from "@/components/Toast";
import { CommonService } from "@/core/services/common/common.service";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import { InvoiceService } from "@/core/services/invoice/invoice.service";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import TransporterModalize from "./component/TransporterModalize";
import TransportModeModalize from "./component/TransportModeModalize";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import AddTransporterModalize from "./component/AddTransporterModalize";

const {height,width} = Dimensions.get('window')
const ModeOfTransport = [
    {
        name: "Road",
        isRegularChecked: false,
        overDimensionChecked: false,
        key: 'r',
        icon: <MaterialIcons name="directions-car" size={22}/>,
        id: 1
    },{
        name: "Rail",
        isRegularChecked: false,
        key: 't',
        icon: <MaterialIcons name="train" size={22}/>,
        id: 2
    },{
        name: "Air",
        isRegularChecked: false,
        key: 'a',
        icon: <Entypo name="aircraft" size={22}/>,
        id: 3
    },{
        name: "Ship",
        isRegularChecked: false,
        key: 's',
        icon: <MaterialIcons name="directions-boat" size={22}/>,
        id: 4
    }
]

const EWayBillScreenComponent = ( {route} ) => {
    const {statusBar,styles, voucherBackground, theme} = useCustomTheme(getStyles, 'PdfPreview');
    const { isSalesCashInvoice, accountUniqueName : uniqueName, companyVersionNumber, voucherInfo, accountDetail,key } = route.params;
    const transporterModalizeRef = useRef(null);
    const addTransporterModalize = useRef(null);
    const transportModeModalizeRef = useRef(null);
    const [receiverDetail, setReceiverDetail] = useState({});
    const [transporterDetails, setTransporterDetails] = useState([]);
    const [voucherDetails, setVoucherDetails] = useState({});
    const { baseCurrency } = useSelector((state:any) => state.commonReducer.companyDetails)
    const [selectedTransporter, setSelectedTransporter] = useState({});
    const [distance, setDistance] = useState('');
    const [selectedTransportMode, setSelectedTransportMode] = useState(null);
    const [docType, setDocType] = useState("Bill of Supply");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [docDate, setDocDate] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [docNo, setDocNo] = useState("");
    const [pincode, setPincode] = useState(accountDetail?.billingDetails?.pincode);
    const [hasNonNilRatedTax, setHasNonNilRatedTax] = useState(false);
    const [subType, setSubType] = useState(baseCurrency === accountDetail?.currency?.code ? "Supply" : "Export");
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    console.log("key", key, voucherInfo);
    

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
    setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setDocDate(moment(date).format('DD/MM/YYYY'));
        hideDatePicker();
    };

    const onRefresh = () => {
        setRefreshing(true);
        resetAll();
        setHasNonNilRatedTax(false);
        fetchReceiverDetail();
        fetchTransporterDetails();
        fetchVoucherDetails();
        setTimeout(() => {
          setRefreshing(false);
        }, 2000);
    };

    const fetchReceiverDetail = async () => {
        try {
            const response = await InvoiceService.fetchReceiverDetail();
            if(response && response?.status =="success"){
                console.log("response-----",response);
                setReceiverDetail(response?.body);
            }
        } catch (error) {
            console.log("Error while fetching receiver details", error);
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'})            
        }
    }

    const fetchTransporterDetails = async () => {
        try {
            const response = await InvoiceService.fetchTransporterDetails();
            if(response && response?.status =="success"){
                console.log("response----tras-",response);
                setTransporterDetails(response?.body?.results);
            }
        } catch (error) {
            console.log("Error while fetching transporter details", error);
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'})            
        }
    }

    const fetchVoucherDetails = async () => {
        try {
            const accountUniqueName = isSalesCashInvoice ? 'cash' : (uniqueName ?? '');
            const payload = {
              number: voucherInfo?.voucherNumber ?? '',
              uniqueName: voucherInfo?.uniqueName ?? '',
              type: voucherInfo?.voucherType ?? ''
            }
            const response = await CommonService.getVoucher(accountUniqueName, companyVersionNumber, payload)
            if(response && response?.status === 'success'){
                console.log("hellow-=-=-=-=-",response);
                setVoucherDetails(response?.body);
                const hasNonNilRatedTax = response?.body?.entries?.some((entry: any) =>
                    entry?.taxes?.some((tax: any) => tax.taxPercent !== 0)
                );
                if(hasNonNilRatedTax){
                    setDocType("Invoice")
                }else{
                    setDocType("Bill of Supply")
                }
            }
            
        } catch (error) {
            console.log("Error while fetching voucher detailed object", error);
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'})
        }
  
    }

    const resetAll = () => {
        setSelectedTransporter({});
        setDistance('');
        setSelectedTransportMode(null);
        setDocDate("");
        setVehicleNo("");
        setDocNo("");
        setPincode(accountDetail?.billingDetails?.pincode)
    }

    const handleGenerate = async () => {
        try {
            const payload = {
                toPinCode: pincode,
                transporterId: selectedTransporter ? selectedTransporter?.transporterId : null,
                transDistance: distance,
                transMode: selectedTransportMode ? selectedTransportMode?.id : null,
                vehicleType: (selectedTransportMode?.key == 'r') ? (selectedTransportMode?.overDimensionChecked ? 'O' : 'R') : null,
                vehicleNo: vehicleNo ? vehicleNo : null,
                transDocNo: docNo ? docNo : null,
                transDocDate: docDate ? docDate : null,
                supplyType: "O",
                transactionType: "1",
                invoiceNumber: voucherInfo?.voucherNumber,
                toGstIn: receiverDetail?.gstIn,
                uniqueName: voucherInfo?.uniqueName
            }
            const response = await CommonService.generateEWayBill(payload);
            console.log("response", response);
            
            if(response && response?.status == "success"){
                Toast({message: "E-Way bill "+response?.body?.ewayBillNo+" generated successfully.", duration:'SHORT', position:'BOTTOM'});
                navigation.navigate('ListEWayBillsScreen');
                resetAll();
            }else{
                Toast({message: response?.data?.message, duration:'SHORT', position:'BOTTOM'})
            }
        } catch (error) {
            console.log("Error while generating eway bill");
            Toast({message: error?.message, duration:'SHORT', position:'BOTTOM'})
        }
    }
    
    const CreateButton = (
        <View style={{flexDirection:'row', justifyContent:'space-between',paddingHorizontal:20}}>
            <TouchableOpacity
                style={[styles.createButton,{backgroundColor: (distance?.length == 0 || pincode?.length == 0) ? '#E6E6E6' :'#5773FF'}]}
                disabled = {distance?.length == 0 || pincode?.length == 0}
                onPress={()=>handleGenerate()}>
                <Text style={styles.createBtn}>Generate</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.createButton,{backgroundColor: '#5773FF'}]}
                onPress={()=>{resetAll()}}>
                <Text style={styles.createBtn}>Cancel</Text>
            </TouchableOpacity>
        </View>
    )

    useEffect(() => {
        setHasNonNilRatedTax(false);
        fetchReceiverDetail();
        fetchTransporterDetails();
        fetchVoucherDetails();
    }, []);

    return (
        <KeyboardAvoidingView behavior={ Platform.OS == 'ios' ? "padding" : undefined } style={styles.container} key={key}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'Generate E-way Bill'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.subContainer}>
                    <Text style={styles.heading}>Part A</Text>
                    <InputField 
                        lable="Sub Type"
                        isRequired={false}
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        editable={false}
                        value={subType}
                    />
                    <InputField 
                        lable="Document Type"
                        isRequired={false}
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        editable={false}
                        value={docType}
                    />
                    <InputField 
                        lable="GSTIN of Receiver"
                        isRequired={false}
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        editable={false}
                        value={receiverDetail?.gstIn}
                    />
                    <InputField 
                        lable="Pincode of Receiver"
                        isRequired={true}
                        keyboardType='numeric'
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        value={pincode}
                        onChangeText={(text) => {
                            setPincode(text);
                        }}
                    />
                    <Text style={styles.subHeading}>Transportation Details</Text>
                    <MatButton 
                        lable="Transporter"
                        value={selectedTransporter?.transporterName}
                        onPress={()=>{
                            setBottomSheetVisible(transporterModalizeRef,true);
                        }}
                    />
                    <InputField 
                        lable="Distance in KM"
                        isRequired={false}
                        keyboardType='numeric'
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        onChangeText={(text:string) => {
                            setDistance(text)
                        }}
                        value={distance}
                    />
                </View>
                <View style={styles.subContainer}>
                    <Text style={styles.heading}>Part B</Text>
                    <MatButton 
                        lable="Mode of Transportation"
                        value={selectedTransportMode?.name}
                        onPress={()=>{
                            setBottomSheetVisible(transportModeModalizeRef,true);
                        }}
                    />
                    {<View style={styles.radioGroupContainer}>
                        <View style={styles.radioBtnView}>
                            <TouchableOpacity
                            style={styles.radioBtn}
                            onPress={() => {
                                setSelectedTransportMode((prev) => ({
                                    ...prev,
                                    isRegularChecked:true,
                                    overDimensionChecked: false
                                }))
                            }}
                            >
                            {selectedTransportMode?.isRegularChecked && (
                                <View style={styles.selectedRadioBtn} />
                            )}
                            </TouchableOpacity>
                            <Pressable style={{paddingVertical:5}} onPress={() => {
                                setSelectedTransportMode((prev) => ({
                                    ...prev,
                                    isRegularChecked:true,
                                    overDimensionChecked: false
                                }))
                            }}>
                                <Text style={styles.radioBtnText}>Regular</Text>
                            </Pressable>
                        </View>
                        {selectedTransportMode?.name === "Road" && <View style={styles.radioBtnView}>
                            <TouchableOpacity
                            style={styles.radioBtn}
                            onPress={() =>{
                                setSelectedTransportMode((prev) => ({
                                    ...prev,
                                    overDimensionChecked:true,
                                    isRegularChecked:false
                                }))
                            }}
                            >
                            {selectedTransportMode?.overDimensionChecked && (
                                <View style={styles.selectedRadioBtn} />
                            )}
                            </TouchableOpacity>
                            <Pressable style={{paddingVertical:5}} onPress={() =>{
                                setSelectedTransportMode((prev) => ({
                                    ...prev,
                                    overDimensionChecked:true,
                                    isRegularChecked:false
                                }))
                            }}>
                                <Text style={styles.radioBtnText}>Over Dimensional Cargo</Text>
                            </Pressable>
                        </View>}
                    </View>}
                    <InputField 
                        lable="Vehicle No."
                        isRequired={false}
                        containerStyle={styles.inputFieldStyle}
                        value={vehicleNo}
                        placeholderTextColor={theme.colors.secondary}
                        onChangeText={(text) => {
                            setVehicleNo(text)
                        }}
                    />
                    <InputField 
                        lable="Transporter’s Doc No"
                        isRequired={false}
                        containerStyle={styles.inputFieldStyle}
                        value={docNo}
                        placeholderTextColor={theme.colors.secondary}
                        onChangeText={(text) => {
                            setDocNo(text)
                        }}
                    />
                    <MatButton 
                        lable="Transporter's Doc Date"
                        value={docDate}
                        onPress={()=>showDatePicker()}
                    />
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
                {CreateButton}
            </ScrollView>
            <TransporterModalize modalizeRef={transporterModalizeRef} setBottomSheetVisible={setBottomSheetVisible} transporterData={transporterDetails} setTransporter={setSelectedTransporter} addTrasporterModalRef={addTransporterModalize}/>
            <AddTransporterModalize modalizeRef={addTransporterModalize} setBottomSheetVisible={setBottomSheetVisible} setTransporter={setTransporterDetails}/>
            <TransportModeModalize modalizeRef={transportModeModalizeRef} setBottomSheetVisible={setBottomSheetVisible} transportData={ModeOfTransport} setTransportMode={setSelectedTransportMode}/>
        </KeyboardAvoidingView>
    )
}

const EWayBillScreen = (props:any) => <EWayBillScreenComponent key={props.route.params.key} {...props}/>

const getStyles = (theme: ThemeProps)=> StyleSheet.create({
    container : {
        flex:1,
        backgroundColor: theme.colors.solids.white
    },
    subContainer: {
        marginHorizontal: 20, 
        marginVertical: 7,
    },
    heading: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.solids.black,
        marginVertical:5
    },
    subHeading: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.solids.black,
        marginTop:10
    },
    inputFieldStyle: { marginVertical:4 },
    radioGroupContainer :{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width:'100%',
        alignItems:'center',
        paddingHorizontal:15,
        paddingVertical:5,
        alignContent:'center',
    },
    radioBtnView:{ 
        flexDirection: 'row', 
        alignItems: 'center',
    },
    radioBtn:{
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: '#c4c4c4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedRadioBtn:{ 
        height: 14, 
        width: 14, 
        borderRadius: 7, 
        backgroundColor: '#084EAD' 
    },
    radioBtnText:{ 
        marginLeft: 10, 
        fontFamily:theme.typography.fontFamily.semiBold 
    },
    createButton:{
        height: height * 0.06,
        width: width * 0.4,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical:20
    },
    createBtn:{
        fontFamily: theme.typography.fontFamily.semiBold ,
        lineHeight: theme.typography.fontSize.xLarge.lineHeight,
        fontSize: theme.typography.fontSize.xLarge.size,
        color: '#fff',
    },
})

export default EWayBillScreen;