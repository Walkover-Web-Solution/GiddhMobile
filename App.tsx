import React from 'react';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as material from '@eva-design/material';
import {AppearanceProvider} from 'react-native-appearance';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {GdIconsPack} from '@/utils/icons-pack';
import AppNavigator from '@/navigation/app.navigator';
import {Provider} from 'react-redux';
import '@/utils/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {DeviceEventEmitter, EmitterSubscription} from 'react-native';
import {default as mapping} from './mappings.json';
import {PersistGate} from 'redux-persist/integration/react';
import BaseContainer from './src/BaseContainer/BaseContainer';
import configureStore from './src/redux/store';
import Invoice from '@/screens/Invoices/Invoice';
const {store, persistor} = configureStore();
import SplashScreen from 'react-native-splash-screen';
import AppDatePicker from '@/screens/DatePicker/DatePicker';
import PartiesMain from '@/screens/Parties/PartiesMain';
import {PartiesStack} from '@/navigation/parties.navigator';
import {NavigationContainer} from '@react-navigation/native';
import PartiesTransactionScreen from '@/screens/Parties/Parties-Transactions';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
import NoteDenomination from '@/core/components/note-denomination/noteDenomination';
import Otp from '@/screens/Auth/Otp/Otp';
import SelectAddress from '@/core/components/Select-Address/SelectAddress';
import EditAddress from '@/core/components/Select-Address/EditAddress';
import {AddressStack} from '@/navigation/addressNavigator';
import DashboardStack from '@/navigation/dashboard.navigator';
import AppMainNav from '@/navigation/app.main.navigator';
import EditItemDetails from '@/screens/Sales-Invoice/EditItemDetails';

const demoData = {
  applicableDiscounts: [],
  applicableTaxes: [],
  category: 'income',
  currency: {
    code: 'INR',
    symbol: '₹',
  },
  groupTaxes: [],
  hsnNumber: null,
  name: 'sales 233',
  oppositeAccount: null,
  parentGroups: ['revenuefromoperations', 'sales'],
  quantity: 1,
  rate: '100',
  sacNumber: null,
  stock: null,
  taxes: [],
  uniqueName: 'sales233',
};

export default class App extends React.Component<any> {
  private listener: EmitterSubscription | undefined;
  static navigationOptions = {
    headerShown: false,
  };

  async componentDidMount() {
    // get token and active company name
    SplashScreen.hide();

    const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

    // check if token is present, means user is logged in
    if (token) {
      // get user's state details actions
      // await store.dispatch.common.getStateDetailsAction();
      // get active company details
      // await store.dispatch.company.getCompanyDetailsAction();
      // await store.dispatch.company.getCompanyListAndBranchAction();
    }

    // listen for invalid auth token event
    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.invalidAuthToken, () => {
      // fire logout action
      // store.dispatch.auth.logout();
    });
  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
  }

  render() {
    return (
      <SafeAreaProvider>
        <IconRegistry icons={[EvaIconsPack, GdIconsPack]} />
        <Provider store={store as any}>
          <PersistGate loading={null} persistor={persistor}>
            <AppearanceProvider>
              <ApplicationProvider customMapping={mapping as any} {...material} theme={material.light}>
                <SafeAreaProvider>
                  <BaseContainer />
                  {/* <EditItemDetails itemDetails={demoData} /> */}
                  {/* <PartiesMain /> */}
                  {/* <AppDatePicker /> */}
                  {/* <BaseContainer /> */}
                  {/* <Invoice /> */}

                  {/* <Otp /> */}
                  {/* <NavigationContainer>
                   
                  </NavigationContainer> */}
                </SafeAreaProvider>
              </ApplicationProvider>
            </AppearanceProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    );
  }
}
