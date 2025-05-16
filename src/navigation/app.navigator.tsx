import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';
import { AuthStack } from './auth.navigator';
import analytics from '@react-native-firebase/analytics';
import AppMainNav from './app.main.navigator';
import {CompanyStack} from './company.navigator';
import ChatWidget from '@msg91comm/react-native-hello-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { Host } from 'react-native-portalize';
import SnackBar from '@/components/SnackBar';
import ChatBotSDK from '@/components/ChatBotSDK';
import { DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const navigatorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent'
  }
};

const getActiveRouteName = (navigationState: any) => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // Dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
};

const AppNavigator = (props: any): React.ReactElement => {
  const routeNameRef = React.createRef();
  const navigationRef = React.createRef();
const [helloConfig, setHelloConfig] = useState<object>({});

useEffect(() => {
  const setValues = async () => {
    let name = await AsyncStorage.getItem(STORAGE_KEYS.userName);
    let mail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    setHelloConfig({
      widgetToken: "88461",
      name,
      mail,
      unique_id: mail
    });
  }
  setValues();

  const subscribe = DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => setValues());

  return () => {
      subscribe.remove();
  }
}, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {
        <NavigationContainer
          ref={navigationRef}
          theme={navigatorTheme}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current.getCurrentRoute().name;
            if (previousRouteName !== currentRouteName) {
              // console.log('currentScreen is', currentRouteName);
              await analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName
              });
            }
          }}>
          <Host>
            { !props.isUserAuthenticated 
                ? <AuthStack/> 
                : ( !props.isUnauth 
                    ? <AppMainNav />
                    : <CompanyStack/>
                  )
            }
          </Host>
          <SnackBar eventType={APP_EVENTS.DownloadAlert} backgroundColor={'#1A237E'} borderLeftColor={'#1A237E'}/>
        </NavigationContainer>
      }

      <ChatWidget
        preLoaded={true}
        widgetColor={'#1A237E'}
        helloConfig={helloConfig}
      />
      <ChatBotSDK/>
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => {
  return {
    isUserAuthenticated: state.LoginReducer.isUserAuthenticated,
    isUnauth:state.commonReducer.isUnauth
  };
};

export default connect(mapStateToProps)(AppNavigator);
