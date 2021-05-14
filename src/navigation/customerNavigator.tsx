import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import EditAddress from '@/core/components/Select-Address/EditAddress';

import Customer from '../screens/Customer/CustomerMain';

const {Navigator, Screen} = createStackNavigator();

function CustomerStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'CustomerScreens'}>
      <Screen component={Customer} name={'Customer'} initialParams={{index:0}}/>
      <Screen component={EditAddress} name={'EditAddressCV'} />
    </Navigator>
  );
}

export default CustomerStack;
