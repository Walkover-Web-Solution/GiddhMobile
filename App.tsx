import React, { useState } from 'react';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as material from '@eva-design/material';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {GdIconsPack} from '@/utils/icons-pack';
import {Provider, useSelector} from 'react-redux';
import '@/utils/i18n';
import {AppState, BackHandler, EmitterSubscription, Platform} from 'react-native';
import {default as mapping} from './mappings.json';
import {PersistGate} from 'redux-persist/integration/react';
import BaseContainer from './src/BaseContainer/BaseContainer';
import configureStore from './src/redux/store';
const {store, persistor} = configureStore();
import SplashScreen from 'react-native-splash-screen';
import {LogBox} from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
import DeviceInfo from 'react-native-device-info';
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from 'sp-react-native-in-app-updates';
import { RootSiblingParent } from 'react-native-root-siblings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { injectStore } from '@/utils/helper';
import { injectStoreToInvoiceUrls } from '@/core/services/invoice/invoice.service'
import { injectStoreToHttpInstance } from '@/core/services/http/http.service';
import AppLock from '@/AppLock/AppLock';
import { KeyboardAvoidingView, KeyboardProvider } from "react-native-keyboard-controller";

injectStore(store); // Provides store to formateAmount function
injectStoreToInvoiceUrls(store); // Provides store to invoice urls
injectStoreToHttpInstance(store); // Provides store to HttpInstance

const inAppUpdates = new SpInAppUpdates(
  false // isDebug
);
const appVersion = DeviceInfo.getVersion();

const onStatusUpdate = (event: any) => {
  const { status } = event;

  if (status == 11) {
    inAppUpdates.installUpdate();
  }

  if (status === 3) {
    BackHandler.exitApp();
  }
};

const checkForAppUpdate = () => {
  inAppUpdates.checkNeedsUpdate({ curVersion: appVersion }).then((result) => {
    console.log(`-----*** Giddh V${appVersion} ***-----`);
    console.log(`----- ShouldUpdate ${result.shouldUpdate} -----`);
    if (result.shouldUpdate) {
      let updateOptions: StartUpdateOptions = {};
      if (Platform.OS === 'android') {
        // android only, on iOS the user will be promped to go to your app store page
        updateOptions = {
          updateType: IAUUpdateKind.FLEXIBLE
        };
      } else {
        updateOptions = {
          title: 'Update Available',
          message: "Giddh recommends that you update to the latest version.",
          buttonUpgradeText: 'Update',
          buttonCancelText: 'Cancel',
        }
      }
      inAppUpdates.addStatusUpdateListener(onStatusUpdate);
      inAppUpdates.startUpdate(updateOptions);
    }
  }).catch(error => {
    console.log('----- Error in Checking Update -----', error);
  });
}

export default class App extends React.Component<any> {
  private listener: EmitterSubscription | undefined;
  private appStateSubscription: any;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;
  static navigationOptions = {
    headerShown: false,
  };
  
  async componentDidMount() {
    this.hideSplashScreen();
    checkForAppUpdate();
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange)
  }

  hideSplashScreen = () => {
    try {
      this.hideTimeout = setTimeout(() => {
        try {
          SplashScreen.hide();
          console.log('-----*** Splash screen hidden successfully ***-----');
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('Error setting up splash screen hide:', error);
    }
  };

  handleAppStateChange = (nextAppState: string) => {
    console.log(`-----*** App State Changed to ${nextAppState} ***-----`);
    if (nextAppState === 'active') {
      this.hideSplashScreen();
    }
  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  render() {
    return (  
        <Provider store={store as any}>
          <PersistGate loading={null} persistor={persistor}>
            <SafeAreaProvider>
              <InnerApp />
            </SafeAreaProvider>
          </PersistGate>
        </Provider>
    );
  }
}


const InnerApp = () => {
  const {toggleBiometric} = useSelector((state: any) => state.LoginReducer);  
  const [unlocked, setUnlocked] = useState(false);
  const insets = useSafeAreaInsets();
  
  return (
    
      <KeyboardProvider>
        <KeyboardAvoidingView style={{flex:1}} behavior={"padding"} keyboardVerticalOffset={-(insets.bottom)}>
          <IconRegistry icons={[EvaIconsPack, GdIconsPack]} />
          <ApplicationProvider customMapping={mapping as any} {...material} theme={material.light}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootSiblingParent>
                {toggleBiometric && !unlocked && <AppLock visible={!unlocked} onUnlock={()=>setUnlocked(true)}/>}
                <BaseContainer /> 
              </RootSiblingParent>
            </GestureHandlerRootView>
          </ApplicationProvider>
        </KeyboardAvoidingView>
      </KeyboardProvider>
    
  )
}