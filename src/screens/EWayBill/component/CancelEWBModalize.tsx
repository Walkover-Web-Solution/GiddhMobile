import BottomSheet from "@/components/BottomSheet";
import InputField from "@/components/InputField";
import MatButton from "@/components/OutlinedButton";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useState } from "react";
import { Dimensions, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RsnCodeMap } from "../ListEWayBillsScreen";
import { CommonService } from "@/core/services/common/common.service";
import Toast from "@/components/Toast";
import CancelReasonEWBModalize from "./CancelReasonEWBModalize";

const {height,width} = Dimensions.get('window')

const CancelEWBModalize = ({modalizeRef, setBottomSheetVisible, cancelReasonModalizeRef, selectedEWBill, handleRefresh}) => {
    const {styles, theme} = useCustomTheme(getStyles);
    const [tempReasonState, setTempReasonState] = useState({
        cancelRmrk:"",
        cancelRsnCode:0
    })

    const handleCancel = async () => {
        if(tempReasonState?.cancelRsnCode == 0){
            Toast({ message: "Cancel reason cannot be left blank.", position: 'BOTTOM', duration: 'LONG' });
            return;
        }
        const payload = {
            ...tempReasonState,
            ewbNo: selectedEWBill?.ewbNo
        }
        try {
            const response = await CommonService.cancelEWayBill(payload);
            if(response && response?.status == "success"){
                Toast({ message: response?.body, position: 'BOTTOM', duration: 'LONG' })
                setBottomSheetVisible(modalizeRef, false);
                handleRefresh();
            }else{
                Toast({ message: response?.data?.message, position: 'BOTTOM', duration: 'LONG' })
                setBottomSheetVisible(modalizeRef, false);
            }
        } catch (error) {
            Toast({ message: "Error while cancelling ewaybill", position : 'BOTTOM', duration: 'LONG' })
        }
    }
    
    return (
        <>
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Reasons For Cancellation'}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    <MatButton
                        isRequired={true}
                        lable={"Reason"}
                        value={ RsnCodeMap[tempReasonState?.cancelRsnCode] ?? "" }
                        onPress={() => {
                            Keyboard.dismiss();
                            setBottomSheetVisible(cancelReasonModalizeRef, true);
                        }}
                    />
                    <InputField 
                        lable="Remark"
                        isRequired={false}
                        onChangeText={(text)=>{
                            setTempReasonState({
                                ...tempReasonState,
                                cancelRmrk: text
                            })
                        }}
                        // containerStyle={styles.inputFieldStyleWithBackground}
                        placeholderTextColor={theme.colors.secondary}
                        value={tempReasonState?.cancelRmrk}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: (false) ? '#E6E6E6' :'#5773FF'}]}
                            disabled = {false}
                            onPress={handleCancel}>
                            <Text style={styles.createBtn}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: '#5773FF'}]}
                            onPress={() => setBottomSheetVisible(modalizeRef, false)}>
                            <Text style={styles.createBtn}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        />
        <CancelReasonEWBModalize key={"_"+selectedEWBill?.ewbNo} modalizeRef={cancelReasonModalizeRef} setBottomSheetVisible={setBottomSheetVisible} reasonState={tempReasonState} setReasonState={setTempReasonState} data={RsnCodeMap}/> 
        </>
    )
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 21,
        paddingVertical:3
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
        alignSelf: 'center'
    },
    createBtn:{
        fontFamily: theme.typography.fontFamily.bold ,
        color: '#fff',
        fontSize: 20,
    },
    buttonContainer: {
        flexDirection:'row', 
        justifyContent:'space-between',
        paddingHorizontal:5, 
        marginTop:15
    }
});

export default CancelEWBModalize;
