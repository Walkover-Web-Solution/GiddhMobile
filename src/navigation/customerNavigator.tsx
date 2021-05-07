import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Customer from '../screens/Customer/CustomerMain';

const {Navigator, Screen} = createStackNavigator();

function CustomerStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'CustomerScreens'}>
      <Screen component={Customer} name={'Customer'} />
    </Navigator>
  );
}

export default CustomerStack;
