import { Pressable, Text, TouchableOpacity, View } from "react-native";
import colors from "@/utils/colors";
import useCustomTheme from "@/utils/theme";
import makeStyle from "./style";

const RenderChildGroup = ({groupName,childGroupModalRef,setBottomSheetVisible,isChecked,setIsChecked})=>{
    const {styles,theme,voucherBackground} = useCustomTheme(makeStyle,'Payment');
    return (
        <View style={[styles.fieldContainer, {flex: 1}]} >
            <View style={styles.checkboxContainer}>
                <TouchableOpacity
                    onPress={()=>setIsChecked(!isChecked)}
                    style={styles.checkBoxView}>
                    <View style={[styles.checkView,{borderColor:voucherBackground}]}>
                    <View style={[styles.tickBox, isChecked && {backgroundColor:voucherBackground}]} />
                    </View>
                </TouchableOpacity>
                <View style={styles.checkboxContainer}>
                    <Pressable style={styles.fieldHeadingText} onPress={()=>{setIsChecked(!isChecked)}}><Text style={{fontFamily:theme.typography.fontFamily.semiBold}}>Is it a child group?</Text></Pressable>
                </View>
            </View>
            <View>
            {isChecked && <View style={{marginTop:20}}>
                <TouchableOpacity style={styles.checkboxContainer} onPress={()=>{
                    setBottomSheetVisible(childGroupModalRef,true);
                }}
                textColor={{colors}}>
                    <View
                        style={[
                        styles.buttonWrapper,
                        {marginLeft: 20,minWidth:170},
                        {borderColor: groupName.length > 0 ? '#084EAD' : '#d9d9d9'},
                        ]}>
                        <Text
                        style={[
                            styles.buttonText,
                            {color: '#868686'},
                        ]}>
                        {groupName.length > 0 ? <Text style={styles.selectedText}>{groupName}</Text> : 'Select Parent Group'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>}
            </View>
        </View>
    )
}


export default RenderChildGroup;