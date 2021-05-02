import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import CreditNote from '../screens/Credit-Note/CreditNote';
import CreditNoteOtherDetails from '../screens/Credit-Note/OtherDetails';
import CreditNoteAddItem from '@/screens/Credit-Note/AddItemScreen';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const {Navigator, Screen} = createStackNavigator();

function CreditNoteStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'CreditNoteScreen'}>
      <Screen component={CreditNote} name={'CreditNoteScreen'} />
      <Screen component={CreditNoteAddItem} name={'CreditNoteAddItem'} />
      <Screen component={CreditNoteOtherDetails} name={'CreditNoteOtherDetails'} />
      <Screen component={SelectAddress} name={'SelectAddress'} />
      <Screen component={EditAddress} name={'EditAddress'} />
    </Navigator>
  );
}

export default CreditNoteStack;
