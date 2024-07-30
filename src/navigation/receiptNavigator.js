import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Receipt from '../screens/Receipt/Receipt';
import ReceiptLinkToInvice from '../screens/Receipt/ReceiptLinkToInvice';

const { Navigator, Screen } = createStackNavigator();

function ReceiptStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'ReceiptScreen'}>
      <Screen component={Receipt} name={'ReceiptScreen'} />
      <Screen component={ReceiptLinkToInvice} name={'ReceiptLinkToInvice'} />
    </Navigator>
  );
}

export default ReceiptStack;
