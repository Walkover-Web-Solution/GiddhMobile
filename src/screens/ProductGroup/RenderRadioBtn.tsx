import useCustomTheme from "@/utils/theme";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import makeStyle from "./style";

const RenderRadioBtn = ({codeNumber,selectedCode,setSelectedCode,setCodeNumber})=>{
    const {theme,styles} = useCustomTheme(makeStyle)
    return (
        <View style={styles.radioBtnView}>
            <View>
            <View style={[styles.checkboxContainer ,{ margin: 16}]}>
                <TouchableOpacity
                style={styles.radioBtn}
                onPress={() => setSelectedCode('hsn')}
                >
                {selectedCode == 'hsn' && (
                    <View style={styles.selectedRadioBtn} />
                )}
                </TouchableOpacity>
                <Pressable onPress={() => setSelectedCode('hsn')}>
                    <Text style={styles.radioText}>HSN Code</Text>
                </Pressable>
            </View>
            <View style={[styles.checkboxContainer ,{ margin: 16}]}>
                <TouchableOpacity
                style={styles.radioBtn}
                onPress={() => setSelectedCode('sac')}>
                {selectedCode == 'sac' && (
                    <View style={styles.selectedRadioBtn} />
                )}
                </TouchableOpacity>
                <Pressable onPress={() => setSelectedCode('sac')}>
                    <Text style={styles.radioText}>SAC Code</Text>
                </Pressable>
            </View>
            </View>
            <TextInput
            placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
            placeholderTextColor={'#808080'}
            value={codeNumber}
            keyboardType={'number-pad'}
            style={styles.codeInput}
            onChangeText={(text)=>{
                setCodeNumber(text);
            }}
            />
        </View>
    )
}

export default RenderRadioBtn;