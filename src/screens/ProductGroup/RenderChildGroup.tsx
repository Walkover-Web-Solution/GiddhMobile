import { Pressable, Text, TouchableOpacity, View } from "react-native";
import style from "../Product/style";
import colors from "@/utils/colors";
import CheckBox from 'react-native-check-box';
import { useState } from "react";

const RenderChildGroup = ({groupName,childGroupModalRef,setBottomSheetVisible,isChecked,setIsChecked})=>{

    return (
        <View style={[style.fieldContainer, {flex: 1}]} >
            <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                <CheckBox
                    checkBoxColor={'#1CB795'}
                    uncheckedCheckBoxColor={'#1CB795'}
                    style={{marginLeft: -4}}
                    isChecked={isChecked}
                    onClick={()=>{
                        setIsChecked(!isChecked);
                    }}

                />
                <View style={{flexDirection: 'row', flex: 1}}>
                    <Pressable style={[style.fieldHeadingText, {marginLeft: 5}]} onPress={()=>{setIsChecked(!isChecked)}}><Text>Is it a child group?</Text></Pressable>
                </View>
            </View>
            <View>
            {/* <Entypo name="edit" size={16} color={'#00B795'} style={{ paddingRight: 10}}/> */}
            {isChecked && <View style={{flexDirection: 'row',marginTop:20}}>
                <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>{
                    // setIsChecked(false);
                    setBottomSheetVisible(childGroupModalRef,true);
                }}
                textColor={{colors}}>
                    <View
                        style={[
                        style.buttonWrapper,
                        {marginLeft: 20,minWidth:170},
                        {borderColor: false ? '#00B795' : '#d9d9d9'},
                        ]}>
                        <Text
                        style={[
                            style.buttonText,
                            {
                            color: false ? '#00B795' : '#868686',
                            },
                        ]}>
                        {groupName.length > 0 ? <Text>{groupName}</Text> : 'Select Parent Group'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>}
            </View>
        </View>
    )
}


export default RenderChildGroup;