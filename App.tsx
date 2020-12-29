import React from 'react';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as material from '@eva-design/material';
import {AppearanceProvider} from 'react-native-appearance';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {GdIconsPack} from '@/utils/icons-pack';
import AppNavigator from '@/navigation/app.navigator';
import {Provider} from 'react-redux';
// import {store} from '@/core/store';
import '@/utils/i18n';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {DeviceEventEmitter, EmitterSubscription} from 'react-native';
import { default as mapping } from './mappings.json';
import { PersistGate } from 'redux-persist/integration/react'
import BaseContainer from './src/BaseContainer/BaseContainer'
import configureStore from './src/redux/store';
const {store, persistor} = configureStore();

export default class App extends React.Component<any> {
  private listener: EmitterSubscription | undefined;
  static navigationOptions = {
    headerShown: false,
  };

  async componentDidMount() {
    // get token and active company name
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
      store.dispatch.auth.logout();
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
              </SafeAreaProvider>
            </ApplicationProvider>
          </AppearanceProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    );
  }

  
}

