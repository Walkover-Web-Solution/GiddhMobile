import React, { useState } from "react";
import { Dimensions, Platform, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from "react-native-simple-radio-button";
import makeStyle from './style';
import useCustomTheme from "@/utils/theme";
import BottomSheet from "@/components/BottomSheet";
import Icon from '@/core/components/custom-icon/custom-icon';
import Toast from "@/components/Toast";

const GeneralLinkedAccComponent = ({
    rateLabel = "Rate:",
    initialRadioSelection = 1,
    linkedAccountText = "Linked Purchase Accounts",
    // onLinkedAccountPress,
    textInputPlaceholder = "Rate",
    textInputKeyboardType = "number-pad",
    // textInputValue,
    // onTextInputChange,
    unitText = "Unit",
    unitName = "Unit",
    setBottomSheetVisible,
    unitModalRef,
    subUnits,
    accountModalRef,
    selectedAccount,
    // setRate,
    handleRateChange,
    variantsChecked,
    setSubUnits,
    unit,
    subUnitData,
    accountData,
    setAccount
    // setRadioBtn,
    // radioBtn=1
    // onUnitPress
})=>{
    const [radioBtn,setRadioBtn] = useState(1);
    const radio_props = [
        { label: 'MRP (Inclusive)', value: 0 },
        { label: 'Exclusive', value: 1 }
      ];
    const {theme,styles} = useCustomTheme(makeStyle);
    const {height,width} = Dimensions.get('window')

    const RenderSubUnitMappingModal = (
        <BottomSheet
        bottomSheetRef={unitModalRef}
        headerText='Select Unit'
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
                    No Unit Available
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
        headerText='Select Unit'
        headerTextColor='#084EAD'
        // adjustToContentHeight={false}
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
                    No Accounts Available
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
                <View style={[styles.inputRow,,{marginBottom:10}]}>
                    <Text style={[styles.optionTitle,{marginTop:5}]} >{rateLabel}</Text>
                    <RadioForm
                    formHorizontal={true}
                    initial={0}
                    animation={true}
                    style={[styles.radioGroupContainer,{marginTop:5}]}
                    >
                    {
                        radio_props.map((obj, i) => (
                        <RadioButton labelHorizontal={true} key={i} style={{ alignItems: 'center' }} >
                            <RadioButtonInput
                            obj={obj}
                            index={i}
                            isSelected={radioBtn === i}
                            onPress={(val) => { setRadioBtn(val),
                                linkedAccountText == "Linked Purchase Accounts" ? (
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
                                linkedAccountText == "Linked Purchase Accounts" ? (
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
            <View style={styles.inputRow}>
                <Text style={[styles.optionTitle,{marginTop:0}]} >{linkedAccountText}</Text>
                <View style={[styles.rowContainer,styles.buttonWrapper,styles.linkedModalBtn,{borderColor: selectedAccount?.name ? '#084EAD' : '#d9d9d9'  }]}>
                    <TouchableOpacity
                    onPress={() => {
                        setBottomSheetVisible(accountModalRef,true);
                    }} style={{ flex: 1 }}>
                        {selectedAccount?.name ? ( 
                        <Text style={[styles.buttonText, { color: '#084EAD' }]}>
                            {selectedAccount?.name}
                        </Text>
                        ) : (
                        <Text
                            style={[styles.buttonText, { color: '#868686' }]}>
                            Select account
                        </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View> 
            {!variantsChecked && <View style={[styles.inputRow,{marginTop:5}]}>
                <TextInput
                    returnKeyType={'done'}
                    keyboardType="number-pad"
                    onChangeText={(val) => {
                        // setRate(val);
                        linkedAccountText === "Linked Purchase Accounts" ? handleRateChange('purchaseRate',val) : handleRateChange('salesRate',val)
                    }}
                    placeholderTextColor={'rgba(80,80,80,0.5)'}
                    placeholder="Rate"
                    style={[styles.rowContainer, styles.buttonWrapper,styles.linkedModalBtn ]} />
                <View style={[styles.rowContainer,styles.buttonWrapper,styles.linkedModalBtn,{borderColor: subUnits.uniqueName || unitName !=='Unit' ? '#084EAD' : '#d9d9d9'}]}>
                    <TouchableOpacity
                        onPress={() => {
                            unitName !== 'Unit' ? setBottomSheetVisible(unitModalRef,true) : Toast({message: "Please select unit group", position:'BOTTOM',duration:'SHORT'});
                        }} style={{ flex: 1 }}>
                        
                        {subUnits?.uniqueName ? ( 
                        <Text style={[styles.buttonText, { color: '#084EAD',lineHeight:14 }]}>
                            {subUnits?.code}
                        </Text>
                        ) : (
                        <Text
                            style={[styles.buttonText, { color: unitName!=='Unit' ? '#084EAD' :'#868686',lineHeight:14}]}>
                            {unitName}
                        </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>}   
        </View>
        {RenderSubUnitMappingModal}
        {RenderAccountModal}
        </>
    )
}

export default React.memo(GeneralLinkedAccComponent);