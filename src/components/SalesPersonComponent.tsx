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
;

const SalesPersonComponent = ({setSelectedSalesPerson, selectedSalesPerson, themecolor}: {setSelectedSalesPerson: (salesPerson: any) => void, selectedSalesPerson: any, themecolor: string}) => {
    console.log("themecolor", themecolor);
    const modalRef = useRef<Modalize>(null);
    const addSalesPersonModalRef = useRef<Modalize>(null);
    const [salesPersonData, setSalesPersonData] = useState<any[]>([]);
    const [newSalesPersonObj, setNewSalesPersonObj] = useState<any>({});
    const { t } = useTranslation();
    const styles = style(themecolor);

    const fetchSalesPersonData = async () => {
        const response = await CommonService.fetchSalesPersonData(false);
        console.log("response", response?.body?.results);

        setSalesPersonData(response?.body?.results);
    }

    const createSalesPerson = async () => {
        const response = await CommonService.createSalesPerson(newSalesPersonObj?.name, newSalesPersonObj?.email, newSalesPersonObj?.mobileNumber);
        if(response?.status === "success") {
            fetchSalesPersonData();
            addSalesPersonModalRef.current?.close();
            setNewSalesPersonObj({});
        } else {
            Toast({message: response?.message, position:'BOTTOM',duration:'LONG'});
        }
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
                            console.log('Add Sales Person');
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
                headerTextColor={themecolor}>
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
                        placeholder={t('common.enterSalesPersonEmail')}
                        value={newSalesPersonObj?.email || ''}
                        onChangeText={(text) => {
                            setNewSalesPersonObj({...newSalesPersonObj, email: text});
                        }}
                    />
                    <InputField
                        lable={t('common.enterSalesPersonPhone')}
                        containerStyle={{marginVertical:5}}
                        placeholder={t('common.enterSalesPersonPhone')}
                        value={newSalesPersonObj?.mobileNumber || ''}
                        onChangeText={(text) => {
                            setNewSalesPersonObj({...newSalesPersonObj, mobileNumber: text});
                        }}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                    activeOpacity={0.7}
                     style={styles.clearButton}
                        onPress={() => {
                        setNewSalesPersonObj({});
                        addSalesPersonModalRef.current?.close();
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
    }
});