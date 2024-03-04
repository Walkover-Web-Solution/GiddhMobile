import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import PartiesTransactions from '@/screens/Parties/Parties-Transactions';
import Accounts from '@/screens/Accounts/Accounts';
const { Navigator, Screen } = createStackNavigator();

export const AccountNavigator = () => (
  <Navigator initialRouteName={Routes.Accounts}>
    <Screen name={Routes.Accounts} component={Accounts} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
    <Screen component={PartiesTransactions} name={'Account.PartiesTransactions'} options={{ headerShown: false }} />
  </Navigator>
);
