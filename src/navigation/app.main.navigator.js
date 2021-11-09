import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeNavigator } from './home.navigator';
import DashboardStack from './dashboard.navigator';
import PurchaseBillStack from './purchaseBillNavigator';
import CreditNoteStack from './creditNoteNavigator';
import CustomerVendorStack from './customerVendorNavigator';
import DebitNoteStack from './debitNoteNavigator';
import { ChangeCompanyStack } from './change.company.navigator';
import { ChangeCompanyBranchStack } from './change.companyBranch.navigator';

const Drawer = createDrawerNavigator();

export default function AppMainNav() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ gestureEnabled: false }}>
      <Drawer.Screen name="Home" component={HomeNavigator} />
      <Drawer.Screen name="InvoiceScreens" component={DashboardStack} />
      <Drawer.Screen name="PurchaseBillScreens" component={PurchaseBillStack} />
      <Drawer.Screen name="CreditNoteScreens" component={CreditNoteStack} />
      <Drawer.Screen name="DebitNoteScreens" component={DebitNoteStack} />
      <Drawer.Screen name="CustomerVendorScreens" component={CustomerVendorStack} />
      <Drawer.Screen name='ChangeCompany' component={ChangeCompanyStack} />
      <Drawer.Screen name='ChangeCompanyBranch' component={ChangeCompanyBranchStack} />
    </Drawer.Navigator>
  );
}
