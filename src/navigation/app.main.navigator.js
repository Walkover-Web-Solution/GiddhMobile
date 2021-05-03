import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {HomeNavigator} from './home.navigator';
import DashboardStack from './dashboard.navigator';
import PurchaseBillStack from './purchaseBillNavigator';
import DebitNoteStack from './debitNoteNavigator';

const Drawer = createDrawerNavigator();

export default function AppMainNav() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{gestureEnabled: false}}>
      <Drawer.Screen name="Home" component={HomeNavigator} />
      <Drawer.Screen name="InvoiceScreens" component={DashboardStack} />
      <Drawer.Screen name="PurchaseBillScreens" component={PurchaseBillStack} />
      <Drawer.Screen name="DebitNoteScreens" component={DebitNoteStack} />
    </Drawer.Navigator>
  );
}
