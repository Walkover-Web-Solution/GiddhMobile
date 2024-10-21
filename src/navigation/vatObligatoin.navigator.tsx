import React from 'react';
import routes from '@/navigation/routes';
import { createStackNavigator } from "@react-navigation/stack";
import VATObligationScreen from '@/screens/Tax/VATObligationScreen';
import AppDatePicker from '@/screens/DatePicker/DatePicker';

const { Navigator, Screen } = createStackNavigator();

export const TaxStack = () => {
    return (
      <Navigator
        initialRouteName={routes.VATObligationScreen}
        screenOptions={{
          headerShown: false
        }}>
        <Screen name={routes.VATObligationScreen} component={VATObligationScreen} />
        <Screen component={AppDatePicker} name={'AppDatePicker'} options={{ headerShown: false }} />
      </Navigator>
    );
  };