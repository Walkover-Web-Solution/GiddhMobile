import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import Receipt from '../screens/Receipt/Receipt';
// import ReceiptLinkToInvice from '../screens/Receipt/ReceiptLinkToInvice';
import AddEntry from '@/screens/Accounts/AddEntry';
import AdjustLinkInvoice from '@/screens/Accounts/AdjustLinkInvoice';

const { Navigator, Screen } = createStackNavigator();

function AddEntryStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'AddEntryScreen'}>
      <Screen component={AddEntry} name={'AddEntryScreen'} />
      <Screen component={AdjustLinkInvoice} name={'Account.LinkInvoice'} />
    </Navigator>
  );
}

export default AddEntryStack;
