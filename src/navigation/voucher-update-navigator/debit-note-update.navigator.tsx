import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import AddInvoiceItemScreen from '@/screens/Update-Voucher/Debit-Note-Update/AddItemScreen';
import OtherDetails from '@/screens/Update-Voucher/Debit-Note-Update/OtherDetails';
import DebitNote from '@/screens/Update-Voucher/Debit-Note-Update/DebitNote';

const { Navigator, Screen } = createStackNavigator();

const DebitNoteUpdateStack = () => {
    return (
        <Navigator initialRouteName={'VoucherUpdateScreen'} screenOptions={{ headerShown: false }}>
            <Screen component={DebitNote} name={'VoucherUpdateScreen'} />
            <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
            <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
            <Screen component={SelectAddress} name={'SelectAddress'} />
            <Screen component={EditAddress} name={'EditAddress'} />
        </Navigator>
    );
}

export default DebitNoteUpdateStack;
