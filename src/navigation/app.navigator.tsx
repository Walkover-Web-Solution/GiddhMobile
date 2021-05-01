import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {HomeNavigator} from '@/navigation/home.navigator';
import {connect} from 'react-redux';
import {AuthStack} from './auth.navigator';
import {CompanyInfoStack} from './companyInfo.navigator';
import style from '@/screens/Inventory/style';
import analytics from '@react-native-firebase/analytics';
import AppMainNav from './app.main.navigator';

const navigatorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const getActiveRouteName = (navigationState) => {
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
  const {isUserAuthenticated} = props;
  const routeNameRef = React.createRef();
  const navigationRef = React.createRef();
  return (
    <SafeAreaView style={{flex: 1}}>
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
                screen_class: currentRouteName,
              });
            }
          }}>
          {!isUserAuthenticated ? <AuthStack /> : <AppMainNav />}
        </NavigationContainer>
      }
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => {
  return {
    isUserAuthenticated: state.LoginReducer.isUserAuthenticated,
  };
};

export default connect(mapStateToProps)(AppNavigator);
