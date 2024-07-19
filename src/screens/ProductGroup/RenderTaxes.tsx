import { View } from "react-native";
import useCustomTheme, { DefaultTheme } from "@/utils/theme";
import makeStyle from "./style";
import MatButton from "@/components/OutlinedButton";

const RenderTaxes = ({selectedUniqueTax,setBottomSheetVisible,taxModalRef})=>{
    const {styles, theme} = useCustomTheme(makeStyle);
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