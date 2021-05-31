import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EditAddress from '@/core/components/Select-Address/EditAddress';

import CustomerVendor from '../screens/Customer/CustomerMain';

const { Navigator, Screen } = createStackNavigator();

function CustomerStack(props: Props) {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'CustomerVendorScreens'}>
      {props.route.params.index == 0 ? <Screen component={CustomerVendor} name={'Customer'} /> : <Screen component={CustomerVendor} name={'Vendor'} />}
      <Screen component={EditAddress} name={'EditAddressCV'} />
    </Navigator>
  );
}

export default CustomerStack;
