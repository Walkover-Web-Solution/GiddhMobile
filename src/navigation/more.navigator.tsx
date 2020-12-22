import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import MoreScreen from '../screens/More/More';
import SettingsScreen from '../screens/Settings/Settings';
import ChangeCompany from '../screens/Change-Company/ChangeCompany';
import HelpScreen from '../screens/Help-Support/Help-Support';

const {Navigator, Screen} = createStackNavigator();

function MoreStack() {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'MoreScreen'}>
      <Screen component={MoreScreen} name={'More'} />
      <Screen component={SettingsScreen} name={'Settings'} />
      <Screen component={ChangeCompany} name={'ChangeCompany'} />
      <Screen component={HelpScreen} name={'HelpScreen'} />
    </Navigator>
  );
}

export default MoreStack;
