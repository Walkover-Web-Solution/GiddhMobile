import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import React, { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from '@/core/components/custom-icon/custom-icon';
import MoreIcon from 'react-native-vector-icons/MaterialIcons';
import makeStyles from "./style";
import InputField from "@/components/InputField";

const RenderOtherInfo = ({handleInputChange,variantsChecked,variantCustomFields,globalData})=>{
    const { t } = useTranslation();
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
                <Text style={[styles.radiobuttonText,{fontFamily: theme.typography.fontFamily.semiBold }]}>{t('otherInfo.other')}</Text>
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
                    <Pressable style={{paddingVertical:5}} onPress={() => {
                        setSelectedCode('hsn')
                        handleInputChange('hsnChecked',true);
                        handleInputChange('sacChecked',false);
                        handleInputChange('sacChecked',"");
                    }}>
                        <Text style={styles.radioBtnText}>{t('otherInfo.hsnCode')}</Text>
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
                    <Pressable style={{paddingVertical:5}} onPress={() =>{
                        setSelectedCode('sac')
                        handleInputChange('hsnChecked',false);
                        handleInputChange('sacChecked',true);
                        handleInputChange('hsnNumber',"");
                    }}>
                        <Text style={styles.radioBtnText}>{t('otherInfo.sacCode')}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={styles.inputContainer}>
                <InputField
                    lable={selectedCode=='hsn' ? t('otherInfo.enterHsnCode') : t('otherInfo.enterSacCode')}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    placeholderTextColor={'#808080'}
                    onChangeText={(text)=>{
                        selectedCode === 'hsn' 
                        ? (
                            handleInputChange('hsnChecked',true),
                            handleInputChange('sacChecked',false),
                            handleInputChange('hsnNumber',text),
                            handleInputChange('sacNumber',"")
                        )
                        : (
                            handleInputChange('hsnChecked',false),
                            handleInputChange('sacChecked',true),
                            handleInputChange('hsnNumber',""),
                            handleInputChange('sacNumber',text)
                        )
                    }}
                />
                {!variantsChecked && 
                <InputField 
                    lable={t('otherInfo.skuCode')}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    placeholderTextColor={'#808080'}
                    onChangeText={(text)=>{
                        handleInputChange('skuCode',text)
                    }}
                />
                }
                <InputField 
                    lable={t('otherInfo.uniqueName')}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    placeholderTextColor={'#808080'}
                    onChangeText={(text) => 
                        handleInputChange('uniqueName',text)
                    }
                />
                {!variantsChecked && <View style={styles.inputRow}>
                    <View style={{width:'48%'}}>
                    <InputField 
                        lable={t('otherInfo.openingQuantity')}
                        isRequired={false}
                        keyboardType="numeric"
                        containerStyle={{marginVertical:5}}
                        placeholderTextColor={'#808080'}
                        onChangeText={(text)=>{
                            handleInputChange('openingQuantity',text)
                        }}
                    />
                    </View>
                    <View style={{width:'48%'}}>
                    <InputField 
                        lable={t('otherInfo.openingAmount')}
                        isRequired={false}
                        keyboardType="numeric"
                        containerStyle={{marginVertical:5}}
                        placeholderTextColor={'#808080'}
                        onChangeText={(text)=>{
                            handleInputChange('openingAmount',text)
                        }}
                    />
                    </View>
                </View>}
                <InputField 
                    lable={t('otherInfo.customField1')}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    placeholderTextColor={'#808080'}
                    onChangeText={(text)=>{
                        handleInputChange('customField1Heading','Custom Field 1')
                        handleInputChange('customField2Heading','Custom Field 2')
                        handleInputChange('customField1Value',text)
                    }}
                />
                <InputField 
                    lable={t('otherInfo.customField2')}
                    isRequired={false}
                    containerStyle={{marginVertical:5}}
                    placeholderTextColor={'#808080'}
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
                            <View key={field.uniqueName} style={[styles.radioGroupContainer,styles.booleanCustomField,{marginTop:10}]}>
                                <View style={{flexDirection:'row'}}>
                                    <Text style={[styles.customFieldTitle]}>{field?.fieldName}</Text>
                                    {field?.isMandatory && <Text style={{color: theme.colors.solids.red.dark}}>  *</Text>}
                                </View>
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
                                        <Text style={styles.radioBtnText}>{t('otherInfo.true')}</Text>
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
                                        <Text style={styles.radioBtnText}>{t('otherInfo.false')}</Text>
                                    </Pressable>
                                </View>
                                </View>
                            </View>
                            )
                        default:
                            return (
                                <InputField 
                                    key={field.uniqueName}
                                    lable={field?.fieldName}
                                    isRequired={field?.isMandatory}
                                    keyboardType={field?.fieldType?.type == 'NUMBER' ? "numeric": ""}
                                    containerStyle={{marginVertical:5}}
                                    placeholderTextColor={'#808080'}
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