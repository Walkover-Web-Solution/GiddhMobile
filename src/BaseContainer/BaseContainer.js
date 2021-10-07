import React, { Component } from 'react';

import AppNavigator from '@/navigation/app.navigator';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { getCompanyAndBranches, logout, renewAccessToken } from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import { getExpireInTime } from '@/utils/helper';
import { STORAGE_KEYS } from '@/utils/constants';


export var timer;
class BaseContainer extends Component {
  componentDidMount() {
    SplashScreen.hide();
    if (this.props.isUserAuthenticated) {
      this.checkSessionExpiry();
    }
  }

  setLogoutTimer = async (expirationTime) => {
    console.log("Session expire in "+expirationTime)
    timer = await setTimeout(async() => {
      console.log("Auto logout call----")
     await this.props.logout()
    }, expirationTime);
  };

  clearLogoutTimer = async () => {
    if (timer) {
      await clearTimeout(timer);
    }
  };

  checkSessionExpiry = async () => {
    console.log("Checking session-----")
    timer ? this.clearLogoutTimer() : null;
    const expireAt = await AsyncStorage.getItem(STORAGE_KEYS.sessionEnd);
    if (expireAt) {
      console.log('session end is present');
      let expirationTime = await getExpireInTime(expireAt);
      if (await expirationTime <= new Date()) {
        //session expired.
        console.log('logging out session expired');
        await this.props.logout();
        return;
      }
      console.log("Alredy logged In --")
      let expirationTimeInMiliSecond = (expirationTime.getTime()) - new Date().getTime();
      await this.setLogoutTimer(expirationTimeInMiliSecond);
      await this.props.getCompanyAndBranches();
    } else {
      await this.props.logout();
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
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
