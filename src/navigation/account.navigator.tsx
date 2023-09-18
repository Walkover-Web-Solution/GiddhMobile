import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import AccountMain from '@/screens/Accounts/Account-Main';
import PartiesTransactions from '@/screens/Parties/Parties-Transactions';
const { Navigator, Screen } = createStackNavigator();

export const AccountNavigator = () => (
  <Navigator>
    <Screen name={Routes.Accounts} component={AccountMain} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
    <Screen component={PartiesTransactions} name={'Account.PartiesTransactions'} options={{ headerShown: false }} />
  </Navigator>
);
