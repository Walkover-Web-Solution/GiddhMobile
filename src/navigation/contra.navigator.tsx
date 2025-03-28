import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import ContraScreen from '@/screens/Contra/ContraScreen';
const { Navigator, Screen } = createStackNavigator();

export const ContraStack = () => (
  <Navigator initialRouteName={Routes.ContraScreen} screenOptions={{headerShown:false}}>
    <Screen name={Routes.ContraScreen} component={ContraScreen} options={{ headerShown: false }} />
    {/* <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} /> */}
  </Navigator>
);
