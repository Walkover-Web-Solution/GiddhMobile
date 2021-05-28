import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import SalesInvoiceScreen from '../screens/Sales-Invoice/SalesInvoice';
import OtherDetails from '../screens/Sales-Invoice/OtherDetails';
import AddInvoiceItemScreen from '@/screens/Sales-Invoice/AddItemScreen';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const { Navigator, Screen } = createStackNavigator();

function DashboardStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'SalesInvoiceScreen'}>
      {/* <Screen component={HomeScreen} name={'Dashboard'} /> */}
      <Screen component={SalesInvoiceScreen} name={'SalesInvoiceScreen'} />
      <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
      {/* <Screen component={AddressStack} name={'AddressStack'} /> */}
      <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
      <Screen component={SelectAddress} name={'SelectAddress'} />
      <Screen component={EditAddress} name={'EditAddress'} />
    </Navigator>
  );
}

export default DashboardStack;
