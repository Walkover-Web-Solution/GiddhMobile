import Header from "@/components/Header";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { useIsFocused } from "@react-navigation/native";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductScreen = ()=>{
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }
    const {statusBar,styles, voucherBackground} = useCustomTheme(getStyles, 'Stock');


    return (
        <SafeAreaView>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'Create Stock'} isBackButtonVisible={true} backgroundColor={voucherBackground} />
            <View>
                <Text>
                    jellow
                </Text>
            </View>
        </SafeAreaView>
    )
}

export default ProductScreen;

const getStyles = (theme: ThemeProps)=> StyleSheet.create({

})