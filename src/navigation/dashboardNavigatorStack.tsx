import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import TopTabNavigator from '@/screens/Dashboard/TopTabNavigatorScreen';
const { Navigator, Screen } = createStackNavigator();

export const DashboardNavigator = () => (
  <Navigator initialRouteName={Routes.TopTabNavigator} screenOptions={{headerShown:false}}>
    <Screen name={Routes.TopTabNavigator} component={TopTabNavigator} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
  </Navigator>
);
