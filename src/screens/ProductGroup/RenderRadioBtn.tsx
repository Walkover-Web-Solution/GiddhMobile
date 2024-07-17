import useCustomTheme from "@/utils/theme";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";
import InputField from "@/components/InputField";

const RenderRadioBtn = ({codeNumber,selectedCode,setSelectedCode,setCodeNumber})=>{
    const {theme,styles} = useCustomTheme(makeStyle)
    return (
        <View style={[styles.radioBtnView,{marginHorizontal:16}]}>
            <View style={{flexDirection:'row'}}>
                <View style={[styles.checkboxContainer ,{ marginVertical:5,justifyContent:'center'}]}>
                    <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() => setSelectedCode('hsn')}
                    >
                    {selectedCode == 'hsn' && (
                        <View style={styles.selectedRadioBtn} />
                    )}
                    </TouchableOpacity>
                    <Pressable style={{padding:5}} onPress={() => setSelectedCode('hsn')}>
                        <Text style={styles.radioText}>HSN Code</Text>
                    </Pressable>
                </View>
                <View style={[styles.checkboxContainer ,{ marginVertical:5,justifyContent:'center'}]}>
                    <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() => setSelectedCode('sac')}>
                    {selectedCode == 'sac' && (
                        <View style={styles.selectedRadioBtn} />
                    )}
                    </TouchableOpacity>
                    <Pressable style={{padding:5}} onPress={() => setSelectedCode('sac')}>
                        <Text style={styles.radioText}>SAC Code</Text>
                    </Pressable>
                </View>
            </View>
            <View style={{width:'100%'}}>
                <InputField
                    lable={ selectedCode == 'hsn' ? 'Enter HSN Code' : 'Enter SAC Code' }
                    value={codeNumber}
                    isRequired={false}
                    keyboardType="numeric"
                    placeholderTextColor={'#808080'}
                    onChangeText={(text)=>{
                        setCodeNumber(text);
                    }}
                />
            </View>
        </View>
    )
}

export default RenderRadioBtn;