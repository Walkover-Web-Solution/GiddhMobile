import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Routes from './routes';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import Scan2Screen from '@/screens/Scan2/Scan2Screen';
import SalesVoucherUpdateStack from '@/navigation/voucher-update-navigator/sales-update.navigator';
import PurchaseVoucherUpdateStack from '@/navigation/voucher-update-navigator/purchase-update.navigator';
import CreditNoteUpdateStack from '@/navigation/voucher-update-navigator/credit-note-update.navigator';
import DebitNoteUpdateStack from '@/navigation/voucher-update-navigator/debit-note-update.navigator';
import ReceiptStack from './receiptNavigator';
import PaymentStack from './paymentNavigator';

const { Navigator, Screen } = createStackNavigator();

/**
 * Voucher flows are nested here so they are pushed on top of Scan2.
 * Back then pops to Scan2 instead of switching the root drawer to Home.
 */
export const Scan2Stack = () => (
  <Navigator
    initialRouteName={Routes.Scan2Screen}
    screenOptions={{ headerShown: false, gestureEnabled: true }}
  >
    <Screen name={Routes.Scan2Screen} component={Scan2Screen} />
    <Screen name="AppDatePicker" component={AppDatePicker} />
    <Screen name="SalesVoucherUpdateStack" component={SalesVoucherUpdateStack} />
    <Screen name="PurchaseVoucherUpdateStack" component={PurchaseVoucherUpdateStack} />
    <Screen name="CreditNoteUpdateStack" component={CreditNoteUpdateStack} />
    <Screen name="DebitNoteUpdateStack" component={DebitNoteUpdateStack} />
    <Screen name="ReceiptScreens" component={ReceiptStack} />
    <Screen name="PaymentScreens" component={PaymentStack} />
  </Navigator>
);

export default Scan2Stack;
