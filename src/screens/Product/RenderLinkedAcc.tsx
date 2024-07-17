import { FONT_FAMILY } from "@/utils/constants";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import { Pressable, Text, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import GeneralLinkedAccComponent from "./GeneralLinkedAccComponent";
import LinkIcon from 'react-native-vector-icons/FontAwesome5';
import React, { useState } from "react";
import makeStyles from "./style";

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
        // setPurchaseRate,
        // setSalesRate,
        handleRateChange,
        variantsChecked,
        setPurchaseSubUnits,
        setSalesSubUnits,
        subUnits,
        salesAccountArr,
        purchaseAccountArr,
        setPurchaseAccount,
        setSalesAccount
        // setPurchaseRadioBtn,
        // setSalesRadioBtn,
        // purchaseRadioBtn,
        // salesRadioBtn
    })=>{
    const [expandAcc, setExpandAcc] = useState(true);
    const {theme,styles} = useCustomTheme(makeStyles);
    // const radio_props = [
    //     { label: 'MRP (Inclusive)', value: 0 },
    //     { label: 'Exclusive', value: 1 }
    //   ];
    // const [radioBtn, setRadioBtn]= useState(1);
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
                <Text style={[styles.radiobuttonText,{fontFamily:theme.typography.fontFamily.semiBold}]}>{type === "purchase"?"Purchase Rate" : "Sales Rate"}</Text>
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
                        linkedAccountText = "Purchase Accounts" 
                        unitName={unit.uniqueName.length > 0 ? (''+unit?.name+' '+'('+unit?.code+')') : 'Unit' } 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        unitModalRef={purchaseSubUnitMappingModalRef} 
                        subUnits={purchaseSubUnits} 
                        accountModalRef={purchaseAccModalRef}
                        selectedAccount={purchaseAccount}
                        // setRate={setPurchaseRate}
                        handleRateChange={handleRateChange}
                        variantsChecked={variantsChecked}
                        setSubUnits={setPurchaseSubUnits}
                        unit={unit}
                        subUnitData={subUnits}
                        accountData={purchaseAccountArr}
                        setAccount={setPurchaseAccount}
                        // setRadioBtn={setPurchaseRadioBtn}
                        // radioBtn={purchaseRadioBtn}
                    />
                    :<GeneralLinkedAccComponent 
                        linkedAccountText = "Sales Accounts" 
                        unitName={unit.uniqueName.length > 0 ? (''+unit?.name+' '+'('+unit?.code+')') : 'Unit'} 
                        setBottomSheetVisible={setBottomSheetVisible} 
                        unitModalRef={salesSubUnitMappingModalRef} 
                        subUnits={salesSubUnits}
                        accountModalRef={salesAccModalRef}
                        selectedAccount={salesAccount}
                        // setRate={setSalesRate}
                        handleRateChange={handleRateChange}
                        variantsChecked={variantsChecked}
                        setSubUnits={setSalesSubUnits}
                        unit={unit}
                        subUnitData={subUnits}
                        accountData={salesAccountArr}
                        setAccount={setSalesAccount}
                        // setRadioBtn={setSalesRadioBtn}
                        // radioBtn={salesRadioBtn}
                    />}
                </View>
                )
            }
        </View>
    );
}

export default React.memo(RenderLinkedAcc);