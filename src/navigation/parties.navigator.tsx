import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import PartiesMain from '@/screens/Parties/PartiesMain';
import PartiesTransactions from '@/screens/Parties/Parties-Transactions';

const {Navigator, Screen} = createStackNavigator();

export const PartiesStack = () => (
  <Navigator initialRouteName={'PartiesMain'}>
    <Screen component={PartiesMain} name={'Parties'} options={{headerShown: false}} />
    <Screen component={PartiesTransactions} name={'PartiesTransactions'} options={{headerShown: false}} />
  </Navigator>
);
