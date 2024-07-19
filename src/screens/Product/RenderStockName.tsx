import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import makeStyles from "./style";

const RenderStockName = ({
    allData,
    handleInputChange,
    clearAll
})=>{

    const { theme, styles } = useCustomTheme(makeStyles)
    return (
        <View>
            <View style={[styles.checkboxContainer, {paddingTop: 14}]}>
                <View style={styles.checkboxContainer}>
                    <MaterialCommunityIcons name='alphabetical-variant' color={DefaultTheme.colors.secondary} style={{margin: 16}} size={18} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'Enter Stock'}
                        returnKeyType={'done'}
                        onChangeText={(text) => 
                            handleInputChange('name',text)
                        }
                        style={styles.textInput}
                    />
                </View>
                <TouchableOpacity style={{padding:5}} onPress={()=>clearAll()}>
                    <Text style={styles.clearnBtnText}>Clear All</Text>
                </TouchableOpacity>
            </View>
            <View>
                <View style={styles.checkboxContainer}>
                <MaterialCommunityIcons name='alphabetical' color={DefaultTheme.colors.secondary} style={{margin: 16}} size={18} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Unique Name'}
                    returnKeyType={'done'}
                    onChangeText={(text) => 
                        handleInputChange('uniqueName',text)
                    }
                    style={styles.textInput}
                />
                </View>
            </View>
        </View>
    );
}


export default RenderStockName
