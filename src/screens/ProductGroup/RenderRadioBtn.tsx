import useCustomTheme from "@/utils/theme";
import { useState } from "react";
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
                <Pressable style={{padding:5}} onPress={() => setSelectedCode('hsn')}>
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
                <Pressable style={{padding:5}} onPress={() => setSelectedCode('sac')}>
                    <Text style={styles.radioText}>SAC Code</Text>
                </Pressable>
            </View>
            </View>
            <TextInput
            placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
            placeholderTextColor={'#808080'}
            // value={
            //     this.state.selectedCode == 'hsn'
            //     ? this.state.editItemDetails.hsnNumber
            //     : this.state.editItemDetails.sacNumber
            // }
            value={codeNumber}
            keyboardType={'number-pad'}
            style={[styles.codeInput,{paddingHorizontal:10}]}
            // editable={false}
            onChangeText={(text)=>{
                setCodeNumber(text);
            }}
            // onChangeText={(text) => {
            //     const item = this.state.editItemDetails;
            //     if (this.state.selectedCode == 'hsn') {
            //     item.hsnNumber = text;
            //     this.setState({ editItemDetails: item });
            //     } else {
            //     item.sacNumber = text;
            //     this.setState({ editItemDetails: item });
            //     }
            // }}
            />
        </View>
    )
}

export default RenderRadioBtn;