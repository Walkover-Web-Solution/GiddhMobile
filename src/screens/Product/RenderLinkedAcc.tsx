import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import { Pressable, Text, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import GeneralLinkedAccComponent from "./GeneralLinkedAccComponent";
import LinkIcon from 'react-native-vector-icons/FontAwesome5';
import React, { useState } from "react";
import makeStyles from "./style";
import { useTranslation } from "react-i18next";

const RenderLinkedAcc = ({
        unit,
        purchaseSubUnitMappingModalRef,
        type,
        salesSubUnitMappingModalRef,
        setBottomSheetVisible,
        purchaseSubUnits,
        salesSubUnits,
        salesAccModalRef,
        purchaseAccModalRef,
        purchaseAccount,
        salesAccount,
        handleRateChange,
        variantsChecked,
        setPurchaseSubUnits,
        setSalesSubUnits,
        subUnits,
        salesAccountArr,
        purchaseAccountArr,
        setPurchaseAccount,
        setSalesAccount
    })=>{
    const [expandAcc, setExpandAcc] = useState(true);
    const {theme,styles} = useCustomTheme(makeStyles);
    const { t } = useTranslation();
    return (
        <View style={{maxHeight:400}}>
            <Pressable 
            style={styles.dropDownView}
            onPress={() => {
                setExpandAcc(!expandAcc);
            }}
            >
            <View style={styles.checkboxContainer}>
                <LinkIcon name='link' size={16} color={DefaultTheme.colors.secondary} />
                <Text style={[styles.radiobuttonText,{fontFamily:theme.typography.fontFamily.semiBold}]}>{type === "purchase" ? t('product.purchaseRate') : t('product.salesRate')}</Text>
            </View>
            <Pressable style={{padding:9}} onPress={() => {
                setExpandAcc(!expandAcc);
                }}>
            <Icon
                style={{ transform: [{ rotate: expandAcc ? '180deg' : '0deg' }] }}
                name={'9'}
                size={16}
                color="#808080"
            />
            </Pressable>
            </Pressable>
            {
                expandAcc && (
                <View> 
                    {type === "purchase" ?
                    <GeneralLinkedAccComponent 
                        linkedAccountText = {t('product.purchaseAccounts')}
                        unitName={unit.uniqueName.length > 0 ? (''+unit?.name+' '+'('+unit?.code+')') : 'Unit' } 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        unitModalRef={purchaseSubUnitMappingModalRef} 
                        subUnits={purchaseSubUnits} 
                        accountModalRef={purchaseAccModalRef}
                        selectedAccount={purchaseAccount}
                        handleRateChange={handleRateChange}
                        variantsChecked={variantsChecked}
                        setSubUnits={setPurchaseSubUnits}
                        unit={unit}
                        subUnitData={subUnits}
                        accountData={purchaseAccountArr}
                        setAccount={setPurchaseAccount}
                    />
                    :<GeneralLinkedAccComponent 
                        linkedAccountText = {t('product.salesAccounts')}
                        unitName={unit.uniqueName.length > 0 ? (''+unit?.name+' '+'('+unit?.code+')') : 'Unit'} 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        unitModalRef={salesSubUnitMappingModalRef} 
                        subUnits={salesSubUnits}
                        accountModalRef={salesAccModalRef}
                        selectedAccount={salesAccount}
                        handleRateChange={handleRateChange}
                        variantsChecked={variantsChecked}
                        setSubUnits={setSalesSubUnits}
                        unit={unit}
                        subUnitData={subUnits}
                        accountData={salesAccountArr}
                        setAccount={setSalesAccount}
                    />}
                </View>
                )
            }
        </View>
    );
}

export default React.memo(RenderLinkedAcc);