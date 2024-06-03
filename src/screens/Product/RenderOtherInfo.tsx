import { FONT_FAMILY } from "@/utils/constants";
import { DefaultTheme } from "@/utils/theme";
import React, { useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';

const RenderOtherInfo = ({handleInputChange,variantsChecked})=>{
    const [expandAcc, setExpandAcc] = useState(false);
    const [selectedCode,setSelectedCode] = useState('hsn');
    return (
    <View style={{paddingBottom:0,maxHeight:400}}>
        <View
            style={{
                backgroundColor: '#E6E6E6',
                flexDirection: 'row',
                paddingHorizontal: 16,
                justifyContent: 'space-between'
            }}>
            <View style={{ flexDirection: 'row',paddingVertical: 9 }}>
                <Icon style={{ marginRight: 10 }} name={'Path-12190'} size={16} color={DefaultTheme.colors.secondary} />
                <Text style={{ color: '#1C1C1C', fontFamily: FONT_FAMILY.semibold }}>Other</Text>
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
        </View>
        {expandAcc &&
        <View> 
            <View
                style={{
                flexDirection: 'row',
                // backgroundColor: 'pink',
                justifyContent: 'space-between',
                marginTop: 10,
                width:'75%',
                alignSelf:'center'
                
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 10 }}>
                    <TouchableOpacity
                    style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        backgroundColor: '#c4c4c4',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        setSelectedCode('hsn')
                        handleInputChange('hsnChecked',true);
                        handleInputChange('sacChecked',false);
                        handleInputChange('sacChecked',"");
                    }}
                    >
                    {selectedCode == 'hsn' && (
                        <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#084EAD' }} />
                    )}
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 10 }}>HSN Code</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginTop: 15 }}>
                    <TouchableOpacity
                    style={{
                        height: 20,
                        width: 20,
                        borderRadius: 10,
                        backgroundColor: '#c4c4c4',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() =>{
                        setSelectedCode('sac')
                        handleInputChange('hsnChecked',false);
                        handleInputChange('sacChecked',true);
                        handleInputChange('hsnNumber',"");
                    }}
                    >
                    {selectedCode == 'sac' && (
                        <View style={{ height: 14, width: 14, borderRadius: 7, backgroundColor: '#084EAD' }} />
                    )}
                    </TouchableOpacity>

                    <Text style={{ marginLeft: 10 }}>SAC Code</Text>
                </View>
            </View>
            <View style={{ marginHorizontal: 15, marginVertical: 10, marginRight: 20, overflow: 'hidden' }}>
                <TextInput
                    placeholder={ selectedCode=='hsn'?'Enter HSN Code':'Enter SAC Code'}
                    placeholderTextColor={'#808080'}
                    // value={
                    //     this.state.selectedCode == 'hsn'
                    //     ? this.state.editItemDetails.hsnNumber
                    //     : this.state.editItemDetails.sacNumber
                    // }
                    // keyboardType={'number-pad'}
                    style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
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
                    style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
                    // editable={false}
                    onChangeText={(text)=>{
                        handleInputChange('skuCode',text)
                    }}
                />
                {!variantsChecked && <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <TextInput
                        placeholder={'Opening Quantity'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width:'45%'}}
                        // editable={false}
                        onChangeText={(text)=>{
                            handleInputChange('openingQuantity',text)
                        }}
                    />
                    <TextInput
                        placeholder={'Closing Amount'}
                        placeholderTextColor={'#808080'}
                        // value={
                        //     this.state.selectedCode == 'hsn'
                        //     ? this.state.editItemDetails.hsnNumber
                        //     : this.state.editItemDetails.sacNumber
                        // }
                        // keyboardType={'number-pad'}
                        style={{ borderColor: '#D9D9D9', borderBottomWidth: 1, width:'45%'}}
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
                    style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
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
                    style={{ borderColor: '#D9D9D9', borderBottomWidth: 1 }}
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