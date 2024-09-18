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
import ReceiptStack from './receiptNavigator';
import AddEntryStack from './createEntryNavigator';
import PaymentStack from './paymentNavigator'; 
import AdjustLinkInvoice from '@/screens/Accounts/AdjustLinkInvoice';
import MoreStack from './more.navigator';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import AllVoucherScreen from '@/screens/AllVoucherScreen/AllVoucherScreen';
import Routes from './routes';
import SalesVoucherUpdateStack from '@/navigation/voucher-update-navigator/sales-update.navigator';
import PurchaseVoucherUpdateStack from '@/navigation/voucher-update-navigator/purchase-update.navigator';
import CreditNoteUpdateStack from '@/navigation/voucher-update-navigator/credit-note-update.navigator';
import DebitNoteUpdateStack from '@/navigation/voucher-update-navigator/debit-note-update.navigator';
import PdfPreviewScreen from '@/screens/PdfPreviewScreen/PdfPreviewScreen';
import { ProductStack } from './product.navigator';
import ProductGroupScreen from '@/screens/ProductGroup/ProductGroupScreen';
import { ServiceStack } from './components/service.navigator';
// import SubscriptionStack from './subscription.navigator';
import InventoryListScreen from '@/screens/InventoryList/InventoryListScreen';

const Drawer = createDrawerNavigator();

export default function AppMainNav() {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{ gestureEnabled: false , headerShown:false, swipeEnabled:false}}>
      <Drawer.Screen name="Home" component={HomeNavigator} options={{headerShown:false}}/>
      <Drawer.Screen name="InvoiceScreens" component={DashboardStack} />
      <Drawer.Screen name="PurchaseBillScreens" component={PurchaseBillStack} />
      <Drawer.Screen name="CreditNoteScreens" component={CreditNoteStack} />
      <Drawer.Screen name="DebitNoteScreens" component={DebitNoteStack} />
      <Drawer.Screen name="ReceiptScreens" component={ReceiptStack} />
      <Drawer.Screen name="PaymentScreens" component={PaymentStack} />
      <Drawer.Screen name="CustomerVendorScreens" component={CustomerVendorStack} />
      <Drawer.Screen name='ChangeCompany' component={ChangeCompanyStack} />
      <Drawer.Screen name='ChangeCompanyBranch' component={ChangeCompanyBranchStack} />
      <Drawer.Screen name='AddEntryStack' component={AddEntryStack} />
      <Drawer.Screen name='Account.LinkInvoice' component={AdjustLinkInvoice} />
      <Drawer.Screen name='Settings' component={MoreStack} />
      <Drawer.Screen name={Routes.Add} component={DashboardStack}/>
      <Drawer.Screen name={'AppDatePicker'} component={AppDatePicker}/>
      <Drawer.Screen name={'VoucherScreen'} component={AllVoucherScreen}/>
      <Drawer.Screen name={'SalesVoucherUpdateStack'} component={SalesVoucherUpdateStack}/>
      <Drawer.Screen name={'PurchaseVoucherUpdateStack'} component={PurchaseVoucherUpdateStack}/>
      <Drawer.Screen name={'CreditNoteUpdateStack'} component={CreditNoteUpdateStack}/>
      <Drawer.Screen name={'DebitNoteUpdateStack'} component={DebitNoteUpdateStack}/>
      <Drawer.Screen name={'PdfPreviewScreen'} component={PdfPreviewScreen}/>
      <Drawer.Screen name={'ProductScreen'} component={ProductStack} />
      <Drawer.Screen name={'productGroupScreen'} component={ProductGroupScreen} />
      <Drawer.Screen name={'ServiceScreen'} component={ServiceStack} />
      {/* <Drawer.Screen name={'SubscriptionStack'} component={SubscriptionStack} /> */}
      <Drawer.Screen name={'InventoryListScreen'} component={InventoryListScreen} />
    </Drawer.Navigator>
  );
}
