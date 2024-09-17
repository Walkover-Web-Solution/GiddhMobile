import React from 'react';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as material from '@eva-design/material';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {GdIconsPack} from '@/utils/icons-pack';
import {Provider} from 'react-redux';
import '@/utils/i18n';
import {BackHandler, EmitterSubscription, Platform} from 'react-native';
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
import { endConnection, Purchase, purchaseUpdatedListener } from 'react-native-iap'
import { initConnection, flushFailedPurchasesCachedAsPendingAndroid } from 'react-native-iap';

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
const isAndroid = Platform.OS === 'android';
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

const initializeIAP = async () => {
  try {
    await initConnection().then(async (value: boolean) => {
      console.log("hihihihiih",value,isAndroid);
      // isAndroid && (await flushFailedPurchasesCachedAsPendingAndroid());
      isAndroid ? (await flushFailedPurchasesCachedAsPendingAndroid()) : value;
    });
  } catch (error) {
    console.error('Error initializing IAP: ', error);
  }
};

const subscriptionListener = purchaseUpdatedListener(
  (purchase: Purchase) => {
    console.log("purchase info",purchase); // get purchase information
  },
);

export default class App extends React.Component<any> {
  private listener: EmitterSubscription | undefined;
  constructor(props){
    super(props);
    this.state = {
      connection : false,
    }
  }
  static navigationOptions = {
    headerShown: false,
  };

  async componentDidMount() {
    SplashScreen.hide();
    checkForAppUpdate();
    this.setState({connection : initializeIAP()});
  }

  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
    endConnection();
    subscriptionListener.remove();
  }

  render() {
    return (  
      <SafeAreaProvider>
        <IconRegistry icons={[EvaIconsPack, GdIconsPack]} />
        <Provider store={store as any}>
          <PersistGate loading={null} persistor={persistor}>
            <ApplicationProvider customMapping={mapping as any} {...material} theme={material.light}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootSiblingParent>
                  <BaseContainer />
                </RootSiblingParent>
              </GestureHandlerRootView>
            </ApplicationProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    );
  }
}
