import useCustomTheme, { DefaultTheme, ThemeProps } from "@/utils/theme";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@/core/components/custom-icon/custom-icon';
import makeStyles from "./style";

const RenderStockName = ({
    // stockName, 
    // setStockName, 
    // stockUniqueName, 
    // setStockUniqueName, 
    allData,
    handleInputChange,
    clearAll
})=>{

    const { theme, styles } = useCustomTheme(makeStyles)
    return (
        <View>
            <View style={[styles.checkboxContainer, {paddingTop: 14}]}>
                <View style={styles.checkboxContainer}>
                    <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                    <TextInput
                        placeholderTextColor={'#808080'}
                        placeholder={'Enter Stock'}
                        returnKeyType={'done'}
                        // value={allData?.current?.["name"]}
                        onChangeText={(text) => 
                            // setStockName(text)
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
                <Icon name={'Sections'} color={DefaultTheme.colors.secondary} style={{margin: 16}} size={16} />
                <TextInput
                    placeholderTextColor={'#808080'}
                    placeholder={'Unique Name'}
                    returnKeyType={'done'}
                    // value={allData?.current?.["uniqueName"]}
                    onChangeText={(text) => 
                        // setStockUniqueName(text)
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
