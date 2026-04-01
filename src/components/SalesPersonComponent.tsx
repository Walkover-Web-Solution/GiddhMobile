import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modalize } from "react-native-modalize";
import BottomSheet from "./BottomSheet";
import { CommonService } from "@/core/services/common/common.service";
import { useTranslation } from "react-i18next";
import InputField from "./InputField";
import Toast from "./Toast";
import SalesPersonIcon from 'react-native-vector-icons/FontAwesome5';import { FONT_FAMILY } from "@/utils/constants";
import AntDesign from "react-native-vector-icons/AntDesign";
import { validateEmail, validatePhoneNumberWithRegion } from "@/utils/helper";
import CountryPicker from "react-native-country-picker-modal";
;

const SalesPersonComponent = ({setSelectedSalesPerson, selectedSalesPerson, themecolor}: {setSelectedSalesPerson: (salesPerson: any) => void, selectedSalesPerson: any, themecolor: string}) => {
    const modalRef = useRef<Modalize>(null);
    const addSalesPersonModalRef = useRef<Modalize>(null);
    const [salesPersonData, setSalesPersonData] = useState<any[]>([]);
    const [newSalesPersonObj, setNewSalesPersonObj] = useState<any>({});
    const [countryDetails, setCountryDetails] = useState<any>({
        countryCode: 'IN',
        countryName: 'India',
        countryCallingCode: '91',
        countryFlag: '🇮🇳'
    });
    const { t } = useTranslation();
    const styles = style(themecolor);

    const fetchSalesPersonData = async () => {
        const response = await CommonService.fetchSalesPersonData(false);
        console.log("response", response?.body?.results);

        setSalesPersonData(response?.body?.results);
    }

    const createSalesPerson = async () => {
        if(!validateTextInput()) {
            return;
        }
        const response = await CommonService.createSalesPerson(newSalesPersonObj?.name, newSalesPersonObj?.email ?? "", newSalesPersonObj?.mobileNumber ? ('+' + countryDetails?.countryCallingCode + newSalesPersonObj?.mobileNumber) : "");
        if(response?.status === "success") {
            fetchSalesPersonData();
            addSalesPersonModalRef.current?.close();
            setNewSalesPersonObj({});
            setCountryDetails({
                countryCode: 'IN',
                countryName: 'India',
                countryCallingCode: '91',
                countryFlag: '🇮🇳'
            });
        } else {
            Toast({message: response?.message, position:'BOTTOM',duration:'LONG'});
        }
    }

    const validateTextInput = () => {
        if(!newSalesPersonObj?.name || newSalesPersonObj?.name?.length < 3) {
            Toast({message: t('common.enterValidName'), position:'BOTTOM',duration:'LONG'});
            return false;
        }
        if(newSalesPersonObj?.email && !validateEmail(newSalesPersonObj?.email)) {
                Toast({message: t('common.enterValidEmail'), position:'BOTTOM',duration:'LONG'});
                return false;
            }
        if(newSalesPersonObj?.mobileNumber && !validatePhoneNumberWithRegion(('+' + countryDetails?.countryCallingCode + newSalesPersonObj?.mobileNumber), countryDetails?.countryCode ?? 'IN')) {
            Toast({message: t('common.enterValidPhoneNumber'), position:'BOTTOM',duration:'LONG'});
            return false;
        }
        return true;
    }

    return (
        <>
            <TouchableOpacity
                style={styles.salesPersonTouchableOpacity}
                onPress={() => {
                    fetchSalesPersonData();
                    modalRef.current?.open();
                    console.log('Sales Person Component');
                }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <SalesPersonIcon style={styles.salesPersonIcon} name={'user-tie'} size={18} color={themecolor} />
                    <Text style={styles.salesPersonText}>{selectedSalesPerson?.name || t('common.salesPerson')}</Text>
                </View>
            </TouchableOpacity>
            <BottomSheet
                bottomSheetRef={modalRef}
                headerText={t('common.selectSalesPerson')}
                headerTextColor={themecolor}
                flatListProps={{
                    data: salesPersonData,
                    renderItem: ({ item }) => {
                        return <TouchableOpacity onPress={() => {
                            setSelectedSalesPerson(item);
                            modalRef.current?.close();
                        }}
                        style={styles.salesPersonItem}
                        >
                            <Text style={styles.salesPersonItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    },
                    ListEmptyComponent: () => {
                        return <View style={styles.emptyContainer}><Text style={styles.emptyContainerText}>{t('common.noSalesPersonFound')}</Text></View>
                    },
                    ListHeaderComponent: () => {
                        return <TouchableOpacity onPress={() => {
                            addSalesPersonModalRef.current?.open();
                        }}
                        activeOpacity={0.7}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 18}}>
                                <Text style={styles.createNewText}>{t('common.createNew')}</Text>
                                <AntDesign name={'plus'} size={20} color={themecolor} />
                            </View>
                        </TouchableOpacity>
                    }
                }}
            />
            <BottomSheet
                bottomSheetRef={addSalesPersonModalRef}
                headerText={t('common.createNewSalesPerson')}
                headerTextColor={themecolor}
                scrollViewProps={{
                    keyboardShouldPersistTaps: 'handled'
                }}
                >
                <View style={{paddingHorizontal: 16, marginTop: 10}}>
                    <InputField
                        lable={t('common.enterSalesPersonName')}
                        containerStyle={{marginVertical:5}}
                        placeholder={t('common.enterSalesPersonName')}
                        value={newSalesPersonObj?.name || ''}
                        onChangeText={(text) => {
                            setNewSalesPersonObj({...newSalesPersonObj, name: text});
                        }}
                    />
                    <InputField
                        lable={t('common.enterSalesPersonEmail')}
                        containerStyle={{marginVertical:5}}
                        keyboardType="email-address"
                        placeholder={t('common.enterSalesPersonEmail')}
                        value={newSalesPersonObj?.email || ''}
                        onChangeText={(text) => {
                            setNewSalesPersonObj({...newSalesPersonObj, email: text});
                        }}
                        isRequired={false}
                    />
                    <InputField
                        value={newSalesPersonObj?.mobileNumber || ''}
                        lable={t('common.enterSalesPersonPhone')}
                        placeholder={t('common.enterSalesPersonPhone')}
                        validate={(text) => validatePhoneNumberWithRegion(('+' + countryDetails?.countryCallingCode + text), countryDetails?.countryCode ?? 'IN')}
                        customErrorMessage={t('common.enterValidMobileNumber')}
                        errorStyle={styles.errorStyle}
                        leftIcon={
                            <CountryPicker
                                onSelect={(country) => {
                                    setCountryDetails({
                                        countryCode: country?.cca2,
                                        countryName: country?.name,
                                        countryCallingCode: country?.callingCode,
                                        countryFlag: country?.flag
                                    });
                                }}
                                countryCode={countryDetails?.countryCode}
                                withFilter
                                withFlag
                                withEmoji
                                containerButtonStyle={{ paddingTop: 0, paddingLeft: 6 }}
                                withCloseButton={false}
                                // @ts-ignore
                                flatListProps={{style: {paddingHorizontal: 15}}}
                                filterProps={{style: styles.pickerFilterStyle}}
                            />
                        }
                        keyboardType={'numeric'}
                        containerStyle={{marginVertical:5}}
                        onChangeText={(text: string) => {
                            setNewSalesPersonObj({...newSalesPersonObj, mobileNumber: text});
                        }}
                        isRequired={false}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                    activeOpacity={0.7}
                     style={styles.clearButton}
                        onPress={() => {
                        setNewSalesPersonObj({});
                        setCountryDetails({
                            countryCode: 'IN',
                            countryName: 'India',
                            countryCallingCode: '91',
                            countryFlag: '🇮🇳'
                        });
                    }}>
                        <Text style={styles.clearButtonText}>{t('common.clear')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                    activeOpacity={0.7}
                    style={styles.clearButton}
                        onPress={() => {
                        createSalesPerson();
                    }}>
                        <Text style={styles.clearButtonText}>{t('common.create')}</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </>
    )
}

export default SalesPersonComponent;

const style = (themecolor: any) => StyleSheet.create({
    salesPersonTouchableOpacity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginTop: 8
    },
    salesPersonText: {
        color: '#1C1C1C',
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 14,
    },
    salesPersonIcon: {
        marginRight: 10
    },
    salesPersonItem: {
        paddingVertical: 5,
        paddingHorizontal: 18,
        borderRadius: 5,
    },
    salesPersonItemText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 14,
    },
    createNewText: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: themecolor
    },
    clearButton: {
        height: 35,
        width: 80,
        borderRadius: 16,
        backgroundColor: themecolor,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical:7
    },
    clearButtonText: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: '#fff'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        alignItems:'center',
        marginTop: 10
    },
    emptyContainer: {
        paddingHorizontal: 18,
        paddingVertical: 10
    },
    emptyContainerText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 14,
        color: '#1C1C1C'
    },
    errorStyle: {
        left: 15,
        bottom: 5
    },
    pickerFilterStyle: {
        flex: 1,
    },
});