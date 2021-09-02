import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DebiteNote from '../screens/Debit-Note/DebitNote';
import OtherDetails from '../screens/Debit-Note/OtherDetails';
import AddInvoiceItemScreen from '@/screens/Debit-Note/AddItemScreen';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const { Navigator, Screen } = createStackNavigator();

function DebitNoteStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'DebitNoteScreens'}>
      {/* <Screen component={HomeScreen} name={'Dashboard'} /> */}
      <Screen component={DebiteNote} name={'DebiteNote'} />
      <Screen component={AddInvoiceItemScreen} name={'AddInvoiceItemScreen'} />
      {/* <Screen component={AddressStack} name={'AddressStack'} /> */}
      <Screen component={OtherDetails} name={'InvoiceOtherDetailScreen'} />
      <Screen component={SelectAddress} name={'SelectAddress'} />
      <Screen component={EditAddress} name={'EditAddress'} />
    </Navigator>
  );
}

export default DebitNoteStack;
