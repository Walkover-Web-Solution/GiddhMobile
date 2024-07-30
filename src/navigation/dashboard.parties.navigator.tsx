import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '@/screens/Home/Home';
import PartiesTransactions from '@/screens/Parties/Parties-Transactions';
import BulkPayment from '@/screens/Parties/components/BulkPayment';
import BulkPaymentOTP from '@/screens/Parties/components/BulkPaymentOTP';
import AppDatePicker from '@/screens/DatePicker/DatePicker';

const { Navigator, Screen } = createStackNavigator();

export const DashPartyStack = () => (
  <Navigator initialRouteName={'DashParty'}>
    <Screen component={HomeScreen} name={'Dash'} options={{ headerShown: false }} />
    <Screen component={PartiesTransactions} name={'Dash.PartiesTransactions'} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
  </Navigator>
);
