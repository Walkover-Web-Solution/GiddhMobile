import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import makeStyles from "./style";
import InputField from "@/components/InputField";

const RenderStockName = ({
    allData,
    handleInputChange,
    clearAll,
    type
})=>{
    const { t } = useTranslation();
    const { theme, styles } = useCustomTheme(makeStyles)
    return (
        <View style={{marginHorizontal:16,paddingTop:5}}>
            <InputField
                lable={type === 'PRODUCT' ? t('productScreen.enterStock') : t('productScreen.enterService')}
                containerStyle={{marginVertical:5}}
                onChangeText={(text) => 
                    handleInputChange('name',text)
                }
            />
        </View>
    );
}


export default RenderStockName
