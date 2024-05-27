import { useState } from "react";
import { Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from "react-native-simple-radio-button";
import style from './style';

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
    // setRadioBtn,
    // radioBtn=1
    // onUnitPress
})=>{
    const [radioBtn,setRadioBtn] = useState(1);
    const radio_props = [
        { label: 'MRP (Inclusive)', value: 0 },
        { label: 'Exclusive', value: 1 }
      ];
    return (
        <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
            <View>
                <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'space-between' }}>
                    <Text style={{ color: '#1c1c1c', paddingRight: 5, fontFamily: 'AvenirLTStd-Book' }} >{rateLabel}</Text>
                    <RadioForm
                    formHorizontal={true}
                    initial={0}
                    animation={true}
                    style={{justifyContent:'space-between',width:'70%'}}
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
                            onPress={() => { }}
                            labelStyle={{ color: '#808080', fontFamily: 'AvenirLTStd-Book' }}
                            labelWrapStyle={{ marginRight: 10, marginTop: 10 }}
                            />
                        </RadioButton>
                        ))}
                    </RadioForm>
                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' ,}}>
                <Text style={{ color: '#1c1c1c', paddingRight: 5, marginTop: 10, fontFamily: 'AvenirLTStd-Book' }} >{linkedAccountText}</Text>
                <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor: selectedAccount?.name ? '#084EAD' : '#d9d9d9', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                    onPress={() => {
                        setBottomSheetVisible(accountModalRef,true);
                    }} style={{ padding: 2, flex: 1 }}>
                        {selectedAccount?.name ? ( 
                        <Text style={[style.buttonText, { color: '#084EAD' }]}>
                            {selectedAccount?.name}
                        </Text>
                        ) : (
                        <Text
                            style={[style.buttonText, { color: '#868686' }]}>
                            None
                        </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View> 
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                <TextInput
                    returnKeyType={'done'}
                    keyboardType="number-pad"
                    onChangeText={(val) => {
                        // setRate(val);
                        linkedAccountText === "Linked Purchase Accounts" ? handleRateChange('purchaseRate',val) : handleRateChange('salesRate',val)
                    }}
                    placeholderTextColor={'rgba(80,80,80,0.5)'}
                    // value={this.state.openingBalance}
                    placeholder="Rate"
                    style={{ ...style.buttonWrapper, borderWidth: 1, width: '45%', borderColor: '#d9d9d9', height: '70%', paddingStart: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} />
                <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor:subUnits?.uniqueName ? '#084EAD' : '#d9d9d9', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        onPress={() => {
                            unitName !== 'Unit' ? setBottomSheetVisible(unitModalRef,true) : ToastAndroid.show("Please select unit group",ToastAndroid.SHORT);
                            // this.setState({
                            // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                            // filteredCurrencyData: this.state.allCurrency,
                            // })
                        }} style={{ padding: 2, flex: 1 }}>
                        
                        {subUnits?.uniqueName ? ( 
                        <Text style={[style.buttonText, { color: '#084EAD' }]}>
                            {subUnits?.code}
                        </Text>
                        ) : (
                        <Text
                            style={[style.buttonText, { color: '#868686' }]}>
                            {unitName}
                        </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>   
        </View>
    )
}

export default GeneralLinkedAccComponent;