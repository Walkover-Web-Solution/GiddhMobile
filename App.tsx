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
import {Alert, DeviceEventEmitter, EmitterSubscription} from 'react-native';
import {default as mapping} from './mappings.json';
import {PersistGate} from 'redux-persist/integration/react';
import BaseContainer from './src/BaseContainer/BaseContainer';
import configureStore from './src/redux/store';
const {store, persistor} = configureStore();
import SplashScreen from 'react-native-splash-screen';
import {LogBox} from 'react-native';
import Invoice from '@/screens/Invoices/Invoice';

LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

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
    SplashScreen.hide();

    const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
    if (token) {
    }

    this.listener = DeviceEventEmitter.addListener(APP_EVENTS.invalidAuthToken, () => {});
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
                  {/* <Invoice /> */}
                  <BaseContainer />
                </SafeAreaProvider>
              </ApplicationProvider>
            </AppearanceProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    );
  }
}
