import useCustomTheme from '@/utils/theme';
import { useIsFocused } from '@react-navigation/native';
import React from 'react'
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
import { ThemeProps } from '@/utils/theme';
import { Dimensions, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '@/components/Header';
import ChartComponent from './ChartComponent';

const {height,width} = Dimensions.get('window')
const HEADER_COLLAPSE = 32;
const HEADER_LIST = 60;
const HEADER_HEIGHT = HEADER_LIST + HEADER_COLLAPSE;
const isAndroid = Platform.OS === 'android';

const ProfitLossScreen = () => {
    const {statusBar,styles, theme,voucherBackground} = useCustomTheme(makeStyles, 'Stock');
    const _StatusBar = ({ statusBar }: { statusBar: string }) => {
        const isFocused = useIsFocused();
        return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
    }

    return (
        <SafeAreaView style={styles.container}>
            <_StatusBar statusBar={statusBar}/>
            <Header header={'Dashboard'} backgroundColor={voucherBackground} />
            <ScrollView>
                <View>
                    <Text>Profit & Loss</Text>
                    <ChartComponent />
                </View>
                <View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ProfitLossScreen;

const makeStyles = (theme:ThemeProps)=> StyleSheet.create({
    container: {
      flex: 1
    },
});