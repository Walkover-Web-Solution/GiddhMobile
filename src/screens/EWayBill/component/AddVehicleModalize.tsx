import BottomSheet from "@/components/BottomSheet";
import InputField from "@/components/InputField";
import MatButton from "@/components/OutlinedButton";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { Dimensions, KeyboardAvoidingView, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import TransportModeModalize from "./TransportModeModalize";
import { useRef, useState } from "react";
import { ModeOfTransport } from "../EWayBillScreen";
import Toast from "@/components/Toast";
import CancelReasonEWBModalize from "./CancelReasonEWBModalize";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import StateModalize from "./StateModalize";
import CityModalize from "./CityModalize";
import { Bubbles } from 'react-native-loader';
import { CommonService } from "@/core/services/common/common.service";
const {height,width} = Dimensions.get('window')

const RsnCodeMap:any = {
    1: "Due to Break Down",
    2: "Due to Transshipment",
    3: "Others",
    4: "First Time"
}

const AddVehicleModalize = ({modalizeRef, setBottomSheetVisible, setVehicleState, stateData, handleRefresh, selectedEWBill}) => {
    const {styles, theme} = useCustomTheme(getStyles);
    const transportModeModalizeRef = useRef(null);
    const cancelReasonModalizeRef = useRef(null);
    const setStateModalizeRef = useRef(null);
    const setCityModalizeRef = useRef(null);
    const [selectedTransportMode, setSelectedTransportMode] = useState({
        isRegularChecked:true,
        overDimensionChecked: false
    });
    const [tempVehicleState, setTempVehicleState] = useState({
        vehicleNo: "",
        fromPlace: "",
        fromState: "",
        reasonCode: "",
        reasonRem: "",
        transDocNo: "",
        transDocDate: "",
        transMode: "",
        vehicleType: "",
        cancelRsnCode: ""
    });
    const debounceTimeout = useRef(null);
    const vehicleNoRegex = /^[A-Z]{2}\d{1,2}[A-Z]{0,2}\d{4}$/i;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
    setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        // setDocDate(moment(date).format('DD/MM/YYYY'));
        setTempVehicleState({
            ...tempVehicleState,
            transDocDate: moment(date).format('DD/MM/YYYY') 
        })
        hideDatePicker();
    };

    const handleTextChange = (text:string) => {
        setTempVehicleState({
            ...tempVehicleState,
            vehicleNo: text
        })
        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
          if (text && !vehicleNoRegex.test(text)) {
            Toast({message: "Vehicle No. format must be like: mp01aa1234", duration:'SHORT', position:'BOTTOM'})
          }
        }, 1000);
      };

    const handleSave = async () => {
        const payload = {
            ewbNo: selectedEWBill?.ewbNo,
            vehicleNo: tempVehicleState?.vehicleNo,
            fromPlace: tempVehicleState?.fromPlace,
            fromState: tempVehicleState?.fromState,
            reasonCode: tempVehicleState?.cancelRsnCode,
            reasonRem: tempVehicleState?.reasonRem,
            transDocNo: tempVehicleState?.transDocNo,
            transDocDate: tempVehicleState?.transDocDate,
            transMode: selectedTransportMode?.id,
            vehicleType: selectedTransportMode?.isRegularChecked ? "R" : "O"
        }
        console.log("hihihihhii", payload);
        if(payload?.fromPlace == "" || payload?.fromState == "" || payload?.reasonCode == "" || payload?.reasonRem == "" || payload?.transDocDate == "" || payload?.transDocNo == "" || payload?.name == "" || payload?.vehicleNo == "" ){
            Toast({ message: "Required fields cannot be left blank.", position: 'BOTTOM', duration: 'LONG' });
            setIsLoading(false);
            return;
        }
        try {
            const response = await CommonService.addVehicleEWayBill(payload);
            setIsLoading(false);
            if(response && response?.status == "success"){
                Toast({ message: response?.body, position: 'BOTTOM', duration: 'LONG' })
                handleRefresh();
            }else{
                Toast({ message: response?.data?.message, position: 'BOTTOM', duration: 'LONG' })
            }
            setBottomSheetVisible(modalizeRef, false);
        } catch (error) {
            Toast({ message: "Error while adding vehicle", position : 'BOTTOM', duration: 'LONG' })
            setIsLoading(false);
        }
    }
    
    return (
        <>
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Add Vehicle'}
            headerTextColor={'#084EAD'}
            modalStyle={{flex:1,}}
            modalTopOffset={100}
            adjustToContentHeight={true}
            customRenderer={
                <KeyboardAvoidingView style={styles.modalStyle}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
                    <MatButton
                        isRequired={true}
                        lable={"Mode of Transportation"}
                        value={ selectedTransportMode?.name }
                        onPress={() => {
                            setBottomSheetVisible(transportModeModalizeRef, true);
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
                        <View style={styles.radioBtnView}>
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
                        </View>
                    </View>}
                    <InputField 
                        lable="Vehicle No."
                        isRequired={true}
                        onChangeText={(text)=>{
                            handleTextChange(text);
                        }}
                        containerStyle={styles.inputView}
                        placeholderTextColor={theme.colors.secondary}
                        value={tempVehicleState?.vehicleNo}
                    />
                    <MatButton
                        isRequired={true}
                        lable={"From Place"}
                        value={ tempVehicleState?.fromPlaceName }
                        onPress={() => {
                            setBottomSheetVisible(setCityModalizeRef, true);
                        }}
                    />
                    <MatButton
                        isRequired={true}
                        lable={"From State"}
                        value={ tempVehicleState?.fromStateName }
                        onPress={() => {
                            setBottomSheetVisible(setStateModalizeRef, true);
                        }}
                    />
                    <MatButton
                        isRequired={true}
                        lable={"Reason"}
                        value={ RsnCodeMap[tempVehicleState?.cancelRsnCode] }
                        onPress={() => {
                            setBottomSheetVisible(cancelReasonModalizeRef, true);
                        }}
                    />
                    <InputField 
                        lable="Remark"
                        isRequired={true}
                        onChangeText={(text)=>{
                            setTempVehicleState({
                                ...tempVehicleState,
                                reasonRem: text
                            })
                        }}
                        containerStyle={styles.inputView}
                        placeholderTextColor={theme.colors.secondary}
                        value={tempVehicleState?.reasonRem}
                    />
                    <InputField 
                        lable="Transporter's Doc No."
                        isRequired={true}
                        onChangeText={(text)=>{
                            setTempVehicleState({
                                ...tempVehicleState,
                                transDocNo: text
                            })
                        }}
                        containerStyle={styles.inputView}
                        placeholderTextColor={theme.colors.secondary}
                        value={tempVehicleState?.transDocNo}
                    />
                    <MatButton
                        isRequired={true}
                        lable={"Transporter's Doc Date"}
                        value={ tempVehicleState?.transDocDate }
                        onPress={showDatePicker}
                    />
                    <View style={{flexDirection:'row', justifyContent:'space-between',paddingHorizontal:5}}>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: (isLoading) ? '#E6E6E6' :'#5773FF'}]}
                            disabled = {isLoading}
                            onPress={()=>{
                                // console.log("------------->",tempVehicleState, selectedTransportMode, );
                                setIsLoading(true);
                                handleSave();
                            }}>
                            {isLoading ? <Bubbles size={3} color="#FFF" /> : <Text style={styles.createBtn}>Save</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: '#5773FF'}]}
                            onPress={() => setBottomSheetVisible(modalizeRef, false)}>
                            <Text style={styles.createBtn}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            }
        />
        <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
        />
        <TransportModeModalize modalizeRef={transportModeModalizeRef} setBottomSheetVisible={setBottomSheetVisible} transportData={ModeOfTransport} transportMode={selectedTransportMode} setTransportMode={setSelectedTransportMode}/>
        <CityModalize modalizeRef={setCityModalizeRef} setBottomSheetVisible={setBottomSheetVisible} data={stateData} tempVehicleState={tempVehicleState} setTempVehicleState={setTempVehicleState}/>
        <StateModalize modalizeRef={setStateModalizeRef} setBottomSheetVisible={setBottomSheetVisible} data={stateData} tempVehicleState={tempVehicleState} setTempVehicleState={setTempVehicleState}/>
        <CancelReasonEWBModalize modalizeRef={cancelReasonModalizeRef} setBottomSheetVisible={setBottomSheetVisible} reasonState={tempVehicleState} setReasonState={setTempVehicleState} data={RsnCodeMap}/> 
        </>
    )
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 21,
        paddingVertical:10
    },
    semiBoldText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.primary,
        marginLeft:10
    },
    button: { 
        paddingVertical: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        color: theme.colors.solids.black,
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
        fontFamily: theme.typography.fontFamily.bold ,
        color: '#fff',
        fontSize: 20,
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
    radioGroupContainer :{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width:'100%',
        alignItems:'center',
        paddingHorizontal:15,
        paddingVertical:5,
        alignContent:'center',
    },
    inputView:{
        marginVertical:3
    }
});

export default AddVehicleModalize;
