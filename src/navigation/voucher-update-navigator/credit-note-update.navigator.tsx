import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import AddInvoiceItemScreen from '@/screens/Update-Voucher/Credit-Note-Update/AddItemScreen';
import OtherDetails from '@/screens/Update-Voucher/Credit-Note-Update/OtherDetails';
import CreditNote from '@/screens/Update-Voucher/Credit-Note-Update/CreditNote';

const { Navigator, Screen } = createStackNavigator();

const CreditNoteUpdateStack = () => {
    return (
        <Navigator initialRouteName={'VoucherUpdateScreen'} screenOptions={{ headerShown: false }}>
            <Screen component={CreditNote} name={'VoucherUpdateScreen'} />
            <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
            <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
            <Screen component={SelectAddress} name={'SelectAddress'} />
            <Screen component={EditAddress} name={'EditAddress'} />
        </Navigator>
    );
}

export default CreditNoteUpdateStack;
