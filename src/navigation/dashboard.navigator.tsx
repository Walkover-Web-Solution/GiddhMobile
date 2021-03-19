import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';


import SalesInvoiceScreen from '../screens/Sales-Invoice/SalesInvoice';
import HomeScreen from '@/screens/Home/Home';
import AddInvoiceItemScreen from '@/screens/Sales-Invoice/AddItemScreen';
import OtherDetails from '@/screens/Sales-Invoice/OtherDetails';
const {Navigator, Screen} = createStackNavigator();

function DashboardStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'DashboardScreen'}>
      <Screen component={HomeScreen} name={'Dashboard'} />
      <Screen component={SalesInvoiceScreen} name={'SalesInvoiceScreen'} />    
      <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />      
      <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />      

    </Navigator>
  );
}

export default DashboardStack;
