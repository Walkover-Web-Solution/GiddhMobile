import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
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
    unitName = "Unit"
    // onUnitPress
})=>{
    const [radioBtn, setRadioBtn] = useState(initialRadioSelection);
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
                            onPress={(val) => { setRadioBtn(val) }}
                            borderWidth={1}
                            buttonInnerColor={'#864DD3'}
                            buttonOuterColor={radioBtn === i ? '#864DD3' : '#808080'}
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
                <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor: '#d9d9d9', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                    onPress={() => {
                        // this.setState({
                        // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                        // filteredCurrencyData: this.state.allCurrency,
                        // })
                    }} style={{ padding: 2, flex: 1 }}>
                        {false ? ( 
                        <Text style={[style.buttonText, { color: '#00B795' }]}>
                            {/* {unit?.name} ({unit?.code}) */}
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
                    // onChangeText={(val) => {
                    // this.setState({ openingBalance: val });
                    // }}
                    placeholderTextColor={'rgba(80,80,80,0.5)'}
                    // value={this.state.openingBalance}
                    placeholder="Rate"
                    style={{ ...style.buttonWrapper, borderWidth: 1, width: '45%', borderColor: '#d9d9d9', height: '70%', paddingStart: 10, marginTop: 5, fontFamily: 'AvenirLTStd-Book' }} />
                <View style={{ ...style.rowContainer, ...style.buttonWrapper, marginTop: 5, paddingHorizontal: 10, paddingVertical: 0, height: 40, width: "45%", borderColor: '#d9d9d9', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        onPress={() => {
                            // this.setState({
                            // isCurrencyModalVisible: !this.state.isCurrencyModalVisible,
                            // filteredCurrencyData: this.state.allCurrency,
                            // })
                        }} style={{ padding: 2, flex: 1 }}>
                        
                        {false ? ( 
                        <Text style={[style.buttonText, { color: '#00B795' }]}>
                            {/* {unit?.name} ({unit?.code}) */}
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