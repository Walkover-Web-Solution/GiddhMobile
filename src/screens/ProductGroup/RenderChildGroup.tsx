import { Pressable, Text, TouchableOpacity, View } from "react-native";
import useCustomTheme from "@/utils/theme";
import makeStyle from "./style";
import MatButton from "@/components/OutlinedButton";
import { useTranslation } from "react-i18next";

const RenderChildGroup = ({groupName,childGroupModalRef,setBottomSheetVisible,isChecked,setIsChecked})=>{
    const {styles,theme,voucherBackground} = useCustomTheme(makeStyle,'Payment');
    const { t } = useTranslation();
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
                    <Pressable style={[styles.fieldHeadingText,{paddingVertical:5}]} onPress={()=>{setIsChecked(!isChecked)}}><Text style={{fontFamily:theme.typography.fontFamily.semiBold}}>{t('productGroup.isChildGroup')}</Text></Pressable>
                </View>
            </View>
            <View>
            {isChecked && <MatButton 
              lable={t('productGroup.selectParentGroup')}
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