import BottomSheet from "@/components/BottomSheet";
import InputField from "@/components/InputField";
import Toast from "@/components/Toast";
import { InvoiceService } from "@/core/services/invoice/invoice.service";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const {height,width} = Dimensions.get('window')

const AddTransporterModalize = ({modalizeRef, setBottomSheetVisible, setTransporter, transporterData}) => {
    const { t } = useTranslation();
    const {styles, theme} = useCustomTheme(getStyles);
    const [transporterName, setTransporterName] = useState("");
    const [transporterId, setTransporterId] = useState("");

    const handleSave = async () => {
        try {
            const regex = /^[0-9]{2}[0-9A-Z]{13}$/;
            const isMatch = regex.test(transporterId);
            if(!isMatch){
                Toast({message: t('ewayBill.transporterIdValidation'), duration:'LONG', position:'BOTTOM'}) 
                return ;
            }
            const payload = {
                transporterName: transporterName,
                transporterId: transporterId
            }
            const response = await InvoiceService.addTransporter(payload);
            if(response && response?.status =="success"){
                setTransporter([...transporterData, {...response?.body}]);
                setTransporterName("");
                setTransporterId("");
                setBottomSheetVisible(modalizeRef, false);
            }else{
                Toast({message: response?.data?.message, duration:'SHORT', position:'BOTTOM'})            
            }
        } catch (error) {
            console.log("Error while creating transporter", error);
        }
    }

    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={t('ewayBill.addTransporter')}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle}>
                    <InputField 
                        lable={t('ewayBill.transporterName')}
                        isRequired={true}
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        value={transporterName}
                        onChangeText={(text) => {
                            setTransporterName(text);
                        }}
                        />
                    <InputField 
                        lable={t('ewayBill.transporterId')}
                        isRequired={true}
                        containerStyle={styles.inputFieldStyle}
                        placeholderTextColor={theme.colors.secondary}
                        value={transporterId}
                        onChangeText={(text) => {
                            setTransporterId(text);
                        }}
                    />
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: (false) ? '#E6E6E6' :'#5773FF'}]}
                            disabled = {false}
                            onPress={()=>{handleSave()}}>
                            <Text style={styles.createBtn}>{t('otherDetails.save')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton,{backgroundColor: '#5773FF'}]}
                            onPress={()=>{
                                setTransporterName("");
                                setTransporterId("");
                            }}>
                            <Text style={styles.createBtn}>{t('ewayBill.clear')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        />
    )
}

export default AddTransporterModalize;


const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 18,
        paddingVertical:10
    },
    semiBoldText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.primary,
    },
    button: { paddingVertical: 7},
    inputFieldStyle: { marginVertical:4 },
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
    modalView:{
        flexDirection:'row', 
        justifyContent:'space-between',
        paddingHorizontal:5
    }
});