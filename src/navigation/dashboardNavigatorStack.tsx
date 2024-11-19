import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import ProfitLossScreen from '@/screens/Dashboard/ProfitLossScreen';
const { Navigator, Screen } = createStackNavigator();

export const DashboardNavigator = () => (
  <Navigator initialRouteName={Routes.ProfitLossScreen} screenOptions={{headerShown:false}}>
    <Screen name={Routes.ProfitLossScreen} component={ProfitLossScreen} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
  </Navigator>
);
