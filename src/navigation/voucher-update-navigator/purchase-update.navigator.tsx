import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import AddInvoiceItemScreen from '@/screens/Update-Voucher/Purchase-Voucher-Update/AddItemScreen';
import OtherDetails from '@/screens/Update-Voucher/Purchase-Voucher-Update/OtherDetails';
import { PurchaseBill } from '@/screens/Update-Voucher/Purchase-Voucher-Update/PurchaseBill';

const { Navigator, Screen } = createStackNavigator();

const PurchaseVoucherUpdateStack = () => {
    return (
        <Navigator initialRouteName={'VoucherUpdateScreen'} screenOptions={{ headerShown: false }}>
            <Screen component={PurchaseBill} name={'VoucherUpdateScreen'} />
            <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
            <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
            <Screen component={SelectAddress} name={'SelectAddress'} />
            <Screen component={EditAddress} name={'EditAddress'} />
        </Navigator>
    );
}

export default PurchaseVoucherUpdateStack;
