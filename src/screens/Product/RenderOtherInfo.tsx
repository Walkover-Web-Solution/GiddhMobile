import { FONT_FAMILY } from "@/utils/constants";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React, { useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import MoreIcon from 'react-native-vector-icons/MaterialIcons';
import makeStyles from "./style";

const RenderOtherInfo = ({handleInputChange,variantsChecked})=>{
    const [expandAcc, setExpandAcc] = useState(false);
    const [selectedCode,setSelectedCode] = useState('hsn');
    const {theme,styles} = useCustomTheme(makeStyles)
    return (
    <View style={{maxHeight:400}}>
        <Pressable style={styles.dropDownView} onPress={() => {
                setExpandAcc(!expandAcc);
                }}>
            <View style={styles.checkboxContainer}>
                <MoreIcon name='more' size={16} color={DefaultTheme.colors.secondary} />
                <Text style={[styles.radiobuttonText,{fontFamily: theme.typography.fontFamily.semiBold }]}>Other</Text>
            </View>
            <Pressable style={{padding: 9}} onPress={() => {
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
        {expandAcc &&
        <View> 
            <View
                style={styles.radioGroupContainer}>
                <View style={styles.radioBtnView}>
                    <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() => {
                        setSelectedCode('hsn')
                        handleInputChange('hsnChecked',true);
                        handleInputChange('sacChecked',false);
                        handleInputChange('sacChecked',"");
                    }}
                    >
                    {selectedCode == 'hsn' && (
                        <View style={styles.selectedRadioBtn} />
                    )}
                    </TouchableOpacity>
                    <Pressable onPress={() => {
                        setSelectedCode('hsn')
                        handleInputChange('hsnChecked',true);
                        handleInputChange('sacChecked',false);
                        handleInputChange('sacChecked',"");
                    }}>
                        <Text style={styles.radioBtnText}>HSN Code</Text>
                    </Pressable>
                </View>
                <View style={styles.radioBtnView}>
                    <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() =>{
                        setSelectedCode('sac')
                        handleInputChange('hsnChecked',false);
                        handleInputChange('sacChecked',true);
                        handleInputChange('hsnNumber',"");
                    }}
                    >
                    {selectedCode == 'sac' && (
                        <View style={styles.selectedRadioBtn} />
                    )}
                    </TouchableOpacity>
                    <Pressable onPress={() =>{
                        setSelectedCode('sac')
                        handleInputChange('hsnChecked',false);
                        handleInputChange('sacChecked',true);
                        handleInputChange('hsnNumber',"");
                    }}>
                        <Text style={styles.radioBtnText}>SAC Code</Text>
                    </Pressable>
                </View>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
                    placeholderTextColor={'#808080'}
                    // value={
                    //     this.state.selectedCode == 'hsn'
                    //     ? this.state.editItemDetails.hsnNumber
                    //     : this.state.editItemDetails.sacNumber
                    // }
                    // keyboardType={'number-pad'}
                    style={styles.inputField}
                    // editable={false}
                    onChangeText={(text)=>{
                        selectedCode === 'hsn' 
                        ? (
                            handleInputChange('hsnNumber',text),
                            handleInputChange('sacNumber',"")
                        )
                        : (
                            handleInputChange('hsnNumber',""),
                            handleInputChange('sacNumber',text)
                        )
                    }}
                />
                <TextInput
                    placeholder={'SKU Code'}
                    placeholderTextColor={'#808080'}
                    // value={
                    //     this.state.selectedCode == 'hsn'
                    //     ? this.state.editItemDetails.hsnNumber
                    //     : this.state.editItemDetails.sacNumber
                    // }
                    // keyboardType={'number-pad'}
                    style={styles.inputField}
                    // editable={false}
                    onChangeText={(text)=>{
                        handleInputChange('skuCode',text)
                    }}
                />
                {!variantsChecked && <View style={styles.inputRow}>
                    <TextInput
                        placeholder={'Opening Quantity'}
                        keyboardType='number-pad'
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={styles.unitInput}
                        // editable={false}
                        onChangeText={(text)=>{
                            handleInputChange('openingQuantity',text)
                        }}
                    />
                    <TextInput
                        placeholder={'Closing Amount'}
                        keyboardType='number-pad'
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={styles.unitInput}
                        // editable={false}
                        onChangeText={(text)=>{
                            handleInputChange('openingAmount',text)
                        }}
                    />
                </View>}
                {/* <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold ,marginTop:17}}>Custom Field 1 :</Text> */}
                <TextInput
                    placeholder={ 'Custom Field 1'}
                    placeholderTextColor={'#808080'}
                    // value={
                    //     this.state.selectedCode == 'hsn'
                    //     ? this.state.editItemDetails.hsnNumber
                    //     : this.state.editItemDetails.sacNumber
                    // }
                    // keyboardType={'number-pad'}
                    style={styles.inputField}
                    // editable={false}
                    onChangeText={(text)=>{
                        handleInputChange('customField1Heading','Custom Field 1')
                        handleInputChange('customField2Heading','Custom Field 2')
                        handleInputChange('customField1Value',text)
                    }}
                />
                {/* <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold, marginTop:17 }}>Custom Field 2 :</Text> */}
                <TextInput
                    placeholder={'Custom Field 2'}
                    placeholderTextColor={'#808080'}
                    // value={
                    //     this.state.selectedCode == 'hsn'
                    //     ? this.state.editItemDetails.hsnNumber
                    //     : this.state.editItemDetails.sacNumber
                    // }
                    // keyboardType={'number-pad'}
                    style={styles.inputField}
                    // editable={false}
                    onChangeText={(text)=>{
                        handleInputChange('customField1Heading','Custom Field 1')
                        handleInputChange('customField2Heading','Custom Field 2')
                        handleInputChange('customField2Value',text)
                    }}
                />
            </View>
        </View>
        }
    </View>
    )
}


export default React.memo(RenderOtherInfo);