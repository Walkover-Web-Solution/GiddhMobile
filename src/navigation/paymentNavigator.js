import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Payment from '../screens/Payment/Payment';
import PaymentLinkToInvice from '../screens/Payment/PaymentLinkToInvice';

const { Navigator, Screen } = createStackNavigator();

function PaymentStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'PaymentScreen'}>
      <Screen component={Payment} name={'PaymentScreen'} />
      <Screen component={PaymentLinkToInvice} name={'PaymentLinkToInvice'} />
    </Navigator>
  );
}

export default PaymentStack;
