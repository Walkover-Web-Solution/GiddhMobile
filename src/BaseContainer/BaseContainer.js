import React, { Component } from 'react';
import {
  Platform,
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules
} from 'react-native';
import AppNavigator from '@/navigation/app.navigator';
import AsyncStorage from '@react-native-community/async-storage';
import { connect, useDispatch } from 'react-redux';
import { getCompanyAndBranches, logout, renewAccessToken } from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import AppMainNav from '@/navigation/app.main.navigator';
import { getExpireInTime } from '@/utils/helper';
import { STORAGE_KEYS } from '@/utils/constants';
import { put } from 'redux-saga/effects';
import { logoutUser } from '@/redux/CommonSaga';
import * as CommonActions from '../redux/CommonAction';
import { LOGOUT } from '@/redux/ActionConstants';



class BaseContainer extends Component {
  componentDidMount() {
    SplashScreen.hide();
    // const { RNAlarmNotification } = NativeModules;
    // const RNAlarmEmitter = new NativeEventEmitter(RNAlarmNotification);
    // const openedSubscription = RNAlarmEmitter.addListener(
    //   'OnNotificationOpened', (data) => { console.log(JSON.parse(data)); }
    // );

    if (this.props.isUserAuthenticated) {
      this.checkSessionExpiry();
      // this.props.getCompanyAndBranches();
    }
    // this.listener = DeviceEventEmitter.addListener(APP_EVENTS.invalidAuthToken, () => {
    //   // fire logout action
    //   this.props.renewAccessToken();
    //   store.dispatch.auth.logout();
    // });
  }

  checkSessionExpiry = async () => {
    const expireAt = await AsyncStorage.getItem(STORAGE_KEYS.sessionEnd);
    if (expireAt) {
      console.log('session end is present');
      this.props.clearLogoutTimer();
      let expirationTime = await getExpireInTime(expireAt);
      if (await expirationTime <= new Date()) {
        //session expired.
        console.log('logging out session expired');
        this.props.logout();
        return;
      }
      console.log('setting timer session is valid');
      let expirationTimeInMiliSecond = (expirationTime.getTime()) - new Date().getTime();
      this.props.setLogoutTimer(expirationTimeInMiliSecond);
      this.props.getCompanyAndBranches();
    }
  }

  componentWillUnmount() { }

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }

  render() {
    return <AppNavigator />;
  }
  componentWillUnmount() {
    if (this.listener) {
      this.listener.remove();
    }
  }
}
function mapStateToProps(state) {
  const { commonReducer, LoginReducer } = state;
  return {
    ...commonReducer,
    ...LoginReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
    renewAccessToken: () => {
      dispatch(renewAccessToken());
    },
    logout: () => {
      dispatch(logout());
    },
    setLogoutTimer: () => {
      dispatch(CommonActions.SetLogoutTimer())
    },
    clearLogoutTimer: () => {
      dispatch(CommonActions.ClearLogoutTimer())
    }
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
