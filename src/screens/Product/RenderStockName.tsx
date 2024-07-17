import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import makeStyles from "./style";
import InputField from "@/components/InputField";
import { TextInput } from "react-native-paper";

const RenderStockName = ({
    allData,
    handleInputChange,
    clearAll,
    type
})=>{

    const { theme, styles } = useCustomTheme(makeStyles)
    return (
        <View style={{marginHorizontal:16,paddingTop:5}}>
            <InputField
                lable={'Enter '+ (type === 'PRODUCT'? 'Stock' : 'Service')}
                onChangeText={(text) => 
                    handleInputChange('name',text)
                }
            />
        </View>
    );
}


export default RenderStockName
