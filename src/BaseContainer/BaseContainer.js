import React, { Component } from 'react';

import AppNavigator from '@/navigation/app.navigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { getCompanyAndBranches, logout, renewAccessToken, reset } from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import { getExpireInTime } from '@/utils/helper';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import LogRocket from '@logrocket/react-native';
import { DeviceEventEmitter, Text, View } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import Toast from '@/components/Toast';
// import zipy from 'zipyai-react-native';

export var timer;
class BaseContainer extends Component {
  componentDidMount() {
    SplashScreen.hide();
    this.logoutListner = DeviceEventEmitter.addListener(APP_EVENTS.invalidAuthToken,async ()=>{
      Toast({message: "Your session has expired. Please log in again.", position:'BOTTOM',duration:'LONG'}) 
      appleAuth.Operation.LOGOUT;
      await AsyncStorage.clear();
      await this.props.reset();
    })
    if (this.props.isUserAuthenticated) {
      this.checkSessionExpiry();
    }
  }

  /**
 * Add user deatils to log Rocket
 * @param userName 
 * @param userEmail 
 */
  addUserDeatilsToLogRocket = async() => {
    var userName = await AsyncStorage.getItem(STORAGE_KEYS.userName)
    var userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail)
    if (userName == null) {
      userName = "";
    }
    if (userEmail == null) {
      userEmail = "";
    }
    console.log("LogRocket Details " + "  " + userName + " " + userEmail);
    LogRocket.identify(userEmail, {
      name: userName,
      email: userEmail,
      newUser:false
    });
    // zipy.identify(userEmail,{
    //   email: userEmail,
    // })
  }

  setLogoutTimer = async (expirationTime) => {
    console.log("Session expire in " + expirationTime)
    timer = await setTimeout(async () => {
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
    console.log("----- Checking Session -----")
    timer ? this.clearLogoutTimer() : null;
    const expireAt = await AsyncStorage.getItem(STORAGE_KEYS.sessionEnd);
    if (expireAt) {
      let expirationTime = await getExpireInTime(expireAt);
      if (await expirationTime <= new Date()) {
        //session expired.
        console.log('----- Logging out session expired -----');
        await this.props.logout();
        return;
      }
      console.log("----- Already Logged In -----")
      let expirationTimeInMiliSecond = (expirationTime.getTime()) - new Date().getTime();
      await this.setLogoutTimer(expirationTimeInMiliSecond);
      await this.addUserDeatilsToLogRocket();
    } else {
      console.log('----- Logging Out -----');
      await this.props.logout();
    }
  }

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
    this.logoutListner = undefined;
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
    reset: () => {
      dispatch(reset())
    }
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
