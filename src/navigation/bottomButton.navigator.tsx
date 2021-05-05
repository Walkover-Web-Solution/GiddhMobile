import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SalesInvoiceScreen from '../screens/Sales-Invoice/SalesInvoice';


const {Navigator, Screen} = createStackNavigator();

function MoreStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'SalesInvoiceScreen'}>
      <Screen component={SalesInvoiceScreen} name={'SalesInvoice'} />
    
    </Navigator>
  );
}

export default MoreStack;
