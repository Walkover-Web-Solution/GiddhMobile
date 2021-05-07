import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Customer from '../screens/Customer/CustomerMain';

const {Navigator, Screen} = createStackNavigator();

function VendorStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'VendorScreens'}>
      <Screen component={Customer} name={'Customer'} initialParams={{index:1}} />
    </Navigator>
  );
}

export default VendorStack;
