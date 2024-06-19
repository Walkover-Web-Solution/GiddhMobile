import { FONT_FAMILY } from "@/utils/constants";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React, { useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import MoreIcon from 'react-native-vector-icons/MaterialIcons';
import makeStyles from "./style";

const RenderOtherInfo = ({handleInputChange,variantsChecked,variantCustomFields,globalData})=>{
    const [expandAcc, setExpandAcc] = useState(false);
    const [selectedCode,setSelectedCode] = useState('hsn');
    const [customFieldsData, setCustomFieldsData] = useState<any>({});
    const {theme,styles} = useCustomTheme(makeStyles)
    const { results:customFields } = variantCustomFields;
    
    const handleCustomFieldsChange = (fieldUniqueName, value)=>{
        
        setCustomFieldsData(prevState=>({
            ...prevState,
            [fieldUniqueName]:value
        }))
        const updatedCustomFields = [...globalData?.customFields];

        const updatedData = updatedCustomFields.map(item => {
            if (item.uniqueName === fieldUniqueName) {
            return { ...item, value: value};
            }
            return item;
        })
        
        handleInputChange('customFields',updatedData);
        
    }

    return (
    <View style={{maxHeight:1000}}>
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
                    style={styles.inputField}
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
                    style={styles.inputField}
                    onChangeText={(text)=>{
                        handleInputChange('skuCode',text)
                    }}
                />
                {!variantsChecked && <View style={styles.inputRow}>
                    <TextInput
                        placeholder={'Opening Quantity'}
                        keyboardType='number-pad'
                        placeholderTextColor={'#808080'}
                        style={styles.unitInput}
                        onChangeText={(text)=>{
                            handleInputChange('openingQuantity',text)
                        }}
                    />
                    <TextInput
                        placeholder={'Closing Amount'}
                        keyboardType='number-pad'
                        placeholderTextColor={'#808080'}
                        style={styles.unitInput}
                        onChangeText={(text)=>{
                            handleInputChange('openingAmount',text)
                        }}
                    />
                </View>}
                <TextInput
                    placeholder={ 'Custom Field 1'}
                    placeholderTextColor={'#808080'}
                    style={styles.inputField}
                    onChangeText={(text)=>{
                        handleInputChange('customField1Heading','Custom Field 1')
                        handleInputChange('customField2Heading','Custom Field 2')
                        handleInputChange('customField1Value',text)
                    }}
                />
                <TextInput
                    placeholder={'Custom Field 2'}
                    placeholderTextColor={'#808080'}
                    style={styles.inputField}
                    onChangeText={(text)=>{
                        handleInputChange('customField1Heading','Custom Field 1')
                        handleInputChange('customField2Heading','Custom Field 2')
                        handleInputChange('customField2Value',text)
                    }}
                />
                {
                !variantsChecked && customFields?.map((field)=>{
                    switch (field?.fieldType?.type) {
                        case "BOOLEAN":
                            return (
                            <View key={field.uniqueName} style={[styles.radioGroupContainer,styles.booleanCustomField]}>
                                <Text style={styles.customFieldTitle}>{field?.isMandatory ? field?.fieldName+'*' : field?.fieldName}</Text>
                                <View style={styles.customFieldContainer}>
                                <View style={[styles.radioBtnView,{marginTop:0}]}>
                                    <TouchableOpacity
                                    style={styles.radioBtn}
                                    onPress={() => {
                                        handleCustomFieldsChange(field?.uniqueName,"true");
                                    }}
                                    >
                                    {
                                        customFieldsData?.[field?.uniqueName] == "true" && <View style={styles.selectedRadioBtn} />
                                    }
                                    </TouchableOpacity>
                                    <Pressable onPress={() => {
                                        handleCustomFieldsChange(field?.uniqueName,"true");
                                    }}>
                                        <Text style={styles.radioBtnText}>True</Text>
                                    </Pressable>
                                </View>
                                <View style={[styles.radioBtnView,{marginTop:0}]}>
                                    <TouchableOpacity
                                    style={styles.radioBtn}
                                    onPress={() =>{
                                        handleCustomFieldsChange(field?.uniqueName,"false");
                                    }}
                                    >
                                    {customFieldsData?.[field?.uniqueName] == "false" && <View style={styles.selectedRadioBtn} />
                                    }
                                    </TouchableOpacity>
                                    <Pressable onPress={() =>{
                                        handleCustomFieldsChange(field?.uniqueName,"false");
                                    }}>
                                        <Text style={styles.radioBtnText}>False</Text>
                                    </Pressable>
                                </View>
                                </View>
                            </View>
                            )
                        default:
                            return (
                                <TextInput
                                    key={field.uniqueName}
                                    placeholder={field?.isMandatory ? field?.fieldName+'(Required*)' : field?.fieldName}
                                    keyboardType={field?.fieldType?.type == 'NUMBER' ? 'number-pad' : 'default'}
                                    placeholderTextColor={'#808080'}
                                    style={styles.inputField}
                                    onChangeText={(text)=>{
                                        handleCustomFieldsChange(field?.uniqueName,text)
                                    }}
                                />
                            )
                    }
                })
                }
            </View>
        </View>
        }
    </View>
    )
}


export default React.memo(RenderOtherInfo);