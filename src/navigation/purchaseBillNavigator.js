import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import PurchaseBill from '../screens/Purchase-Bill/PurchaseBill';
import PurchaseBillOtherDetails from '../screens/Purchase-Bill/PurchaseBillOtherDetails';
import PurchaseAddItem from '@/screens/Purchase-Bill/PurchaseAddItem';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const { Navigator, Screen } = createStackNavigator();

function PurchaseBillStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'PurchaseBillScreen'}>
      <Screen component={PurchaseBill} name={'PurchaseBillScreen'} />
      <Screen component={PurchaseAddItem} name={'PurchaseAddItem'} />
      <Screen component={PurchaseBillOtherDetails} name={'PurchaseBillOtherDetails'} />
      <Screen component={SelectAddress} name={'SelectAddress'} />
      <Screen component={EditAddress} name={'EditAddress'} />
    </Navigator>
  );
}

export default PurchaseBillStack;
