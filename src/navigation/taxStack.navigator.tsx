import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import ListEWayBillsScreen from '@/screens/EWayBill/ListEWayBillsScreen';
const { Navigator, Screen } = createStackNavigator();

export const TaxStack = () => (
  <Navigator initialRouteName={Routes.ListEWayBillsScreen} screenOptions={{headerShown:false}}>
    <Screen name={Routes.ListEWayBillsScreen} component={ListEWayBillsScreen} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
  </Navigator>
);
