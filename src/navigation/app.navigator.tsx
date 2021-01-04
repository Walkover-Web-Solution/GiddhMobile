import React from 'react';
import SafeAreaView from 'react-native-safe-area-view';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {HomeNavigator} from '@/navigation/home.navigator';
import {connect} from 'react-redux';
import {AuthStack} from './auth.navigator';
import {CompanyInfoStack} from './companyInfo.navigator';
import style from '@/screens/Inventory/style';

const navigatorTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

const AppNavigator = (props: any): React.ReactElement => {
  const {isUserAuthenticated} = props;
  return (
    <SafeAreaView style={{flex: 1}}>
      {
        <NavigationContainer theme={navigatorTheme}>
          {!isUserAuthenticated ? <AuthStack /> : <HomeNavigator />}
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
