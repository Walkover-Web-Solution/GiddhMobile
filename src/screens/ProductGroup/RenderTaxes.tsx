import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import style from "./style"
import Icon from '@/core/components/custom-icon/custom-icon';
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import color from '@/utils/colors';
import makeStyle from "./style";
import MatButton from "@/components/OutlinedButton";

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef})=>{
    const {styles, theme} = useCustomTheme(makeStyle);
    const {height,width } = Dimensions.get('window');
    return (
    <View style={styles.fieldContainer}>
        <MatButton 
            lable="Tax"
            value={Object.keys(selectedUniqueTax).length > 0 && Object.keys(selectedUniqueTax).map((item)=> selectedUniqueTax?.[item]?.name)+"  " }
            onPress={()=>{
            setBottomSheetVisible(taxModalRef,true);
            }}
        />
    </View>
    )
}


export default RenderTaxes;