import React, { useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from "react-native-simple-radio-button";
import makeStyle from './style';
import useCustomTheme from "@/utils/theme";
import BottomSheet from "@/components/BottomSheet";
import Icon from '@/core/components/custom-icon/custom-icon';
import Toast from "@/components/Toast";
import InputField from "@/components/InputField";
import MatButton from "@/components/OutlinedButton";

const GeneralLinkedAccComponent = ({
    rateLabel,
    initialRadioSelection = 1,
    linkedAccountText,
    textInputPlaceholder,
    textInputKeyboardType = "number-pad",
    unitText = "Unit",
    unitName = "Unit",
    setBottomSheetVisible,
    unitModalRef,
    subUnits,
    accountModalRef,
    selectedAccount,
    handleRateChange,
    variantsChecked,
    setSubUnits,
    unit,
    subUnitData,
    accountData,
    setAccount
})=>{
    const { t } = useTranslation();
    const [radioBtn,setRadioBtn] = useState(1);
    const radio_props = [
        { label: t('product.mrpInclusive'), value: 0 },
        { label: t('product.exclusive'), value: 1 }
      ];
    const {theme,styles} = useCustomTheme(makeStyle);
    const effectiveLinkedAccountText = linkedAccountText || t('product.purchaseAccounts');
    const {height,width} = Dimensions.get('window')

    const RenderSubUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={unitModalRef}
        headerText={t('product.selectUnit')}
        headerTextColor='#084EAD'
        adjustToContentHeight={((subUnitData.length*47) > (height-100)) ? false : true}
        flatListProps={{
            data: subUnitData,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setSubUnits(item);
                    setBottomSheetVisible(unitModalRef, false);
                }}
                >
                {subUnits?.uniqueName 
                ? <Icon name={subUnits?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
                : <Icon name={unit?.uniqueName == item?.uniqueName ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />}
                
                <Text style={styles.radiobuttonText}>
                    {item?.code}
                </Text>
                </TouchableOpacity>
            );
            },
            ListEmptyComponent: () => {
            return (
                <View style={styles.modalCancelView}>
                <Text
                    style={styles.modalCancelText}>
                    {t('product.noUnitAvailable')}
                </Text>
                </View>

            );
            }
        }}
        />
    )

    const RenderAccountModal = (
        <BottomSheet
        bottomSheetRef={accountModalRef}
        headerText={t('product.selectAccount')}
        headerTextColor='#084EAD'
        adjustToContentHeight={((accountData.length*47) > (height-100)) ? false : true}
        flatListProps={{
            data: accountData,
            renderItem: ({item}) => {
            return (
                <TouchableOpacity 
                style={styles.button}
                onPress={() => {
                    setAccount(item);
                    setBottomSheetVisible(accountModalRef, false);
                }}
                >
                <Icon name={selectedAccount?.name == item?.name ? 'radio-checked2' : 'radio-unchecked'} color={"#084EAD"} size={16} />
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
                    {t('product.noAccountsAvailable')}
                </Text>
                </View>

            );
            }
        }}
        />
    )

    return (
        <>
        <View style={styles.linkedAccContainer}>
            <View>
                <View style={[styles.inputRow,{marginBottom:0,paddingHorizontal:15}]}>
                    <RadioForm
                    formHorizontal={true}
                    initial={0}
                    animation={true}
                    style={[styles.radioGroupContainer,{marginTop:5,flex:1,paddingHorizontal:5}]}
                    >
                    {
                        radio_props.map((obj, i) => (
                        <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                            <RadioButtonInput
                            obj={obj}
                            index={i}
                            isSelected={radioBtn === i}
                            onPress={(val) => { setRadioBtn(val),
                                effectiveLinkedAccountText == t('product.purchaseAccounts') ? (
                                    val == 0 ? handleRateChange('purchaseMRPChecked',true) : handleRateChange('purchaseMRPChecked',false)
                                ):(
                                    val == 0 ? handleRateChange('salesMRPChecked',true) : handleRateChange('salesMRPChecked',false)
                                )
                             }}
                            borderWidth={1}
                            buttonInnerColor={'#084EAD'}
                            buttonOuterColor={radioBtn === i ? '#084EAD' : '#808080'}
                            buttonSize={8}
                            buttonOuterSize={15}
                            buttonStyle={{}}
                            buttonWrapStyle={{ marginTop: 10 }}
                            />
                            <RadioButtonLabel
                            obj={obj}
                            index={i}
                            labelHorizontal={true}
                            onPress={(val) => { setRadioBtn(val),
                                effectiveLinkedAccountText == t('product.purchaseAccounts') ? (
                                    val == 0 ? handleRateChange('purchaseMRPChecked',true) : handleRateChange('purchaseMRPChecked',false)
                                ):(
                                    val == 0 ? handleRateChange('salesMRPChecked',true) : handleRateChange('salesMRPChecked',false)
                                )
                             }}
                            labelStyle={{ color: '#808080', fontFamily: theme.typography.fontFamily.regular }}
                            labelWrapStyle={{ marginRight: 10, marginTop: 10 }}
                            />
                        </RadioButton>
                        ))}
                    </RadioForm>
                </View>
            </View> 
            {!variantsChecked && <View style={[styles.inputRow,{marginTop:0}]}>
                <View style={{width:'48%'}}>
                    <InputField 
                        lable={t('product.rate')}
                        keyboardType="numeric"
                        isRequired={false}
                        placeholderTextColor={'#808080'}
                        containerStyle={{marginVertical:5}}
                        onChangeText={(val) => {
                            effectiveLinkedAccountText === t('product.purchaseAccounts') ? handleRateChange('purchaseRate',val) : handleRateChange('salesRate',val)
                        }}
                    />    
                </View>
                <View style={{width:'48%'}}>
                    <MatButton 
                        lable={t('product.unit')}
                        value={subUnits?.uniqueName ? subUnits?.code : unitName==='Unit' ? "":unitName}
                        onPress={() => {
                            unitName !== 'Unit' ? setBottomSheetVisible(unitModalRef,true) : Toast({message: "Please select unit group", position:'BOTTOM',duration:'SHORT'});
                        }}
                    />
                </View>
            </View>}  
            <View style={[styles.inputRow,{marginBottom:5}]}>
                <View style={{width:'100%'}}>
                    <MatButton 
                        lable={effectiveLinkedAccountText === t('product.purchaseAccounts') ? t('product.purchaseAccounts') : t('product.salesAccounts')}
                        value={selectedAccount?.name 
                            ? selectedAccount?.name 
                            : ""
                        }
                        onPress={() => {
                            setBottomSheetVisible(accountModalRef,true);
                        }}
                    />
                </View>
            </View> 
        </View>
        {RenderSubUnitMappingModal}
        {RenderAccountModal}
        </>
    )
}

export default React.memo(GeneralLinkedAccComponent);