import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import Scan2Screen from '@/screens/Scan2/Scan2Screen';

const { Navigator, Screen } = createStackNavigator();

export const Scan2Stack = () => (
  <Navigator initialRouteName={Routes.Scan2Screen} screenOptions={{ headerShown: false }}>
    <Screen name={Routes.Scan2Screen} component={Scan2Screen} options={{ headerShown: false }} />
    <Screen name="AppDatePicker" component={AppDatePicker} options={{ headerShown: false }} />
  </Navigator>
);

export default Scan2Stack;
