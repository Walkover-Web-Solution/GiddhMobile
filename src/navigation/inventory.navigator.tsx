import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import Inventory from '@/screens/Inventory/Inventory-Main';
import AppDatePicker from '@/screens/DatePicker/DatePicker';

const { Navigator, Screen } = createStackNavigator();

export const InventoryNavigator = () => (
  <Navigator screenOptions={{headerShown:false}}>
    <Screen name={Routes.Inventory} component={Inventory} options={{ headerShown: false }} />
    <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
  </Navigator>
);
