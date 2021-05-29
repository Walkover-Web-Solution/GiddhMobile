import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Customer from '../screens/Customer/CustomerMain';
import EditAddress from '@/core/components/Select-Address/EditAddress';

const { Navigator, Screen } = createStackNavigator();

function VendorStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'VendorScreens'}>
      <Screen component={Customer} name={'Customer'} initialParams={{ index: 1 }} />
      <Screen component={EditAddress} name={'EditAddressCV'} />
    </Navigator>
  );
}

export default VendorStack;
