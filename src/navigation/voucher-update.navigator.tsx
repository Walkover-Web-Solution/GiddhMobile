import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OtherDetails from '../screens/Update-Sales-Invoice/OtherDetails';
import AddInvoiceItemScreen from '@/screens/Update-Sales-Invoice/AddItemScreen';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import { SalesInvoice } from '@/screens/Update-Sales-Invoice/SalesInvoice';

const { Navigator, Screen } = createStackNavigator();

const VoucherUpdateStack = () => {
  return (
    <Navigator initialRouteName={'VoucherUpdateScreen'} screenOptions={{ headerShown: false }}>
      <Screen component={SalesInvoice} name={'VoucherUpdateScreen'} />
      <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
      <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
      <Screen component={SelectAddress} name={'SelectAddress'} />
      <Screen component={EditAddress} name={'EditAddress'} />
    </Navigator>
  );
}

export default VoucherUpdateStack;
