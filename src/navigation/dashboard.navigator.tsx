import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SalesInvoiceScreen from '../screens/Sales-Invoice/SalesInvoice';
import HomeScreen from '@/screens/Home/Home';
import AddButton from './components/AddButton';
import AddInvoiceItemScreen from '@/screens/Sales-Invoice/AddItemScreen';
import {AddressStack} from './addressNavigator';

const {Navigator, Screen} = createStackNavigator();

function DashboardStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'SalesInvoiceScreen'}>
      {/* <Screen component={HomeScreen} name={'Dashboard'} /> */}
      <Screen component={SalesInvoiceScreen} name={'SalesInvoiceScreen'} />
      <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
      <Screen component={AddressStack} name={'AddressStack'} />
    </Navigator>
  );
}

export default DashboardStack;
