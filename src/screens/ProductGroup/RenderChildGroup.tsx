import { Pressable, Text, TouchableOpacity, View } from "react-native";
import style from "./style";
import colors from "@/utils/colors";
import CheckBox from 'react-native-check-box';
import { useState } from "react";
import useCustomTheme from "@/utils/theme";
import makeStyle from "./style";
import MatButton from "@/components/OutlinedButton";

const RenderChildGroup = ({groupName,childGroupModalRef,setBottomSheetVisible,isChecked,setIsChecked})=>{
    const {styles,theme,voucherBackground} = useCustomTheme(makeStyle,'Payment');
    return (
        <View style={[styles.fieldContainer, {flex: 1,marginTop:10,}]} >
            <View style={[styles.checkboxContainer,{marginLeft:10}]}>
                <TouchableOpacity
                    onPress={()=>setIsChecked(!isChecked)}
                    style={styles.checkBoxView}>
                    <View style={[styles.checkView,{borderColor:voucherBackground}]}>
                    <View style={[styles.tickBox, isChecked && {backgroundColor:voucherBackground}]} />
                    </View>
                </TouchableOpacity>
                <View style={styles.checkboxContainer}>
                    <Pressable style={[styles.fieldHeadingText,{paddingVertical:5}]} onPress={()=>{setIsChecked(!isChecked)}}><Text style={{fontFamily:theme.typography.fontFamily.semiBold}}>Is it a child group?</Text></Pressable>
                </View>
            </View>
            <View>
            {isChecked && <MatButton 
              lable="Select Parent Group"
              value={groupName.length > 0 && groupName}
              onPress={()=>{
                setBottomSheetVisible(childGroupModalRef,true);
              }}
            />}
            </View>
        </View>
    )
}


export default RenderChildGroup;