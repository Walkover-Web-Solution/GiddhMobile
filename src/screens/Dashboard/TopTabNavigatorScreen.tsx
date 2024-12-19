import useCustomTheme from '@/utils/theme';
import { useIsFocused } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react'
import { ThemeProps } from '@/utils/theme';
import { Platform, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '@/components/Header';
import ChartComponent from './ChartComponent';
import BankAccountList from './BankAccountList';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Routes from '@/navigation/routes';
import BalanceSheetScreen from './BalanceSheetScreen';
import DateFilter from './component/DateFilter';
import moment from 'moment';
import ProfitLossScreen from './ProfitLossScreen';


//custom tab bar design
const CustomTopBar = ({ navigation }) => {
    const {statusBar,styles, theme,voucherBackground} = useCustomTheme(makeStyles, 'Stock');
    const [defaultTab, setDefaultTab] = useState(0);
    return (
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.button,{borderBottomWidth:(defaultTab == 0 ? 2 : 0),borderColor:voucherBackground}]}
          onPress={() => {navigation.navigate(Routes.ProfitLossScreen);setDefaultTab(0);}}
        >
          <Text style={styles.buttonText}>Profit & Loss</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button,{borderBottomWidth:(defaultTab == 1 ? 2 : 0),borderColor:voucherBackground}]}
          onPress={() => {navigation.navigate(Routes.BalanceSheetScreen);setDefaultTab(1);}}
        >
          <Text style={styles.buttonText}>Balance Sheet</Text>
        </TouchableOpacity>
      </View>
    );
  };


const TopTab = () => {
    const TopTabs = createMaterialTopTabNavigator();
    const {theme,voucherBackground} = useCustomTheme(makeStyles, 'Stock');
    // const navigation = useNavigation();
    return (
      <TopTabs.Navigator
        // tabBar={()=><CustomTopBar navigation={navigation} />}
        screenOptions={{
          tabBarLabelStyle:{
            fontFamily:theme.typography.fontFamily.bold,
            fontSize:theme.typography.fontSize.regular.size,
            lineHeight: theme.typography.fontSize.regular.lineHeight,
            textTransform:'none'
          },
          tabBarIndicatorStyle: {
            backgroundColor: voucherBackground,
            
          },
          tabBarPressOpacity:0.7
        }}
      >
        <TopTabs.Screen name={Routes.ProfitLossScreen} component={ProfitLossScreen} options={{title:'Profit & Loss'}}/>
        <TopTabs.Screen name={Routes.BalanceSheetScreen} component={BalanceSheetScreen} options={{title:'Balance Sheet'}}/>
      </TopTabs.Navigator>
    );
  };

const TopTabNavigator = ()=> {
  const {statusBar,styles, theme,voucherBackground} = useCustomTheme(makeStyles, 'Stock');
  const _StatusBar = ({ statusBar }: { statusBar: string }) => {
      const isFocused = useIsFocused();
      return isFocused ? <StatusBar backgroundColor={statusBar} barStyle={Platform.OS === 'ios' ? "dark-content" : "light-content"} /> : null
  }
  return (
    <SafeAreaView style={styles.container}>
      <_StatusBar statusBar={statusBar}/>
      <Header header={'Dashboard'} backgroundColor={voucherBackground} />
      <View style={{flex:1}}>
      <TopTab />
      </View>
    </SafeAreaView>
  );
}
export default TopTabNavigator;


const makeStyles = (theme:ThemeProps)=> StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:theme.colors.solids.white
    },
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: theme.colors.solids.black,
        fontFamily:theme.typography.fontFamily.bold,
        fontSize:theme.typography.fontSize.regular.size,
        lineHeight:theme.typography.fontSize.regular.lineHeight
    },
});