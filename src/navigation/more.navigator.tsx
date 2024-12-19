import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import MoreScreen from '../screens/More/More';
import SettingsScreen from '../screens/Settings/Settings';
import ChangeCompany from '../screens/Change-Company/ChangeCompany';
import HelpScreen from '../screens/Help-Support/Help-Support';
import BranchChange from '../screens/Change-Branch/ChangeBranch';
import SalesInvoiceScreen from '../screens/Sales-Invoice/SalesInvoice';

const { Navigator, Screen } = createStackNavigator();

function MoreStack () {
  return (
    <Navigator
      screenOptions={{
        headerShown: false
      }}
      initialRouteName={'MoreScreen'}>
      <Screen component={MoreScreen} name={'MoreScreen'} />
      <Screen component={SettingsScreen} name={'Settings'} />
      {/* <Screen component={ChangeCompany} name={'ChangeCompany'} /> */}
      {/* <Screen component={BranchChange} name={'BranchChange'} /> */}
      <Screen component={HelpScreen} name={'HelpScreen'} />
      <Screen component={SalesInvoiceScreen} name={'SalesInvoiceScreen'} />
    </Navigator>
  );
}

export default MoreStack;
