import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const {Navigator, Screen} = createStackNavigator();

export const AddressStack = () => (
  <Navigator initialRouteName={'SelectAddress'}>
    <Screen component={SelectAddress} name={'SelectAddress'} options={{headerShown: false}} />
    <Screen component={EditAddress} name={'EditAddress'} options={{headerShown: false}} />
  </Navigator>
);
