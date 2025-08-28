import React, { useEffect, useState } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';
import { AuthStack } from './auth.navigator';
import analytics from '@react-native-firebase/analytics';
import AppMainNav from './app.main.navigator';
import {CompanyStack} from './company.navigator';
import { ChatWidgetModal } from '@msg91comm/react-native-hello-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { Host } from 'react-native-portalize';
import SnackBar from '@/components/SnackBar';
import ChatBotSDK from '@/components/ChatBotSDK';
import { DeviceEventEmitter, View } from 'react-native';
import { GDContainer } from '@/core/components/container/container.component';

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
  const [helloConfig, setHelloConfig] = useState<{ widgetToken : string, name?: string|null, mail?: string|null, unique_id?: string|null }>({widgetToken:"88461"});

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
    <GDContainer>
      {
        <NavigationContainer
        ref={navigationRef}
        theme={navigatorTheme}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName
            });
          }
        }}>
          <Host>
            { !props.isUserAuthenticated 
                ? <AuthStack/> 
                : ( props.isUnauth 
                    ? <CompanyStack/>
                    : <AppMainNav />
                  )
            }
            <ChatWidgetModal
              helloConfig={helloConfig}
              widgetColor={'#1A237E'}
              statusBarStyle="dark-content"
              useKeyboardAvoidingView={false}
              preLoaded={true} // Preloads widget content (default: true)
            />
          </Host>
          <SnackBar eventType={APP_EVENTS.DownloadAlert} backgroundColor={'#1A237E'} borderLeftColor={'#1A237E'}/>
        </NavigationContainer>
      }

      <ChatBotSDK/>
    </GDContainer>
  );
};

const mapStateToProps = (state) => {
  return {
    isUserAuthenticated: state.LoginReducer.isUserAuthenticated,
    isUnauth:state.commonReducer.isUnauth
  };
};

export default connect(mapStateToProps)(AppNavigator);
