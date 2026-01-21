import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OtherDetails from '@/screens/Update-Voucher/Sales-Voucher-Update/OtherDetails';
import AddInvoiceItemScreen from '@/screens/Update-Voucher/Sales-Voucher-Update/AddItemScreen';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import SalesInvoice from '@/screens/Update-Voucher/Sales-Voucher-Update/SalesInvoice';

const { Navigator, Screen } = createStackNavigator();

const SalesVoucherUpdateStack = () => {
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

export default SalesVoucherUpdateStack;
