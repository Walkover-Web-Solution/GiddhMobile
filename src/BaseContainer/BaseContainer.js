import React, {Component} from 'react';
import {Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules} from 'react-native';
import AppNavigator from '@/navigation/app.navigator';
import NetInfo from '@react-native-community/netinfo';

import {connect} from 'react-redux';
import {getCompanyAndBranches, renewAccessToken, InternetStatus} from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import AppMainNav from '@/navigation/app.main.navigator';

class BaseContainer extends Component {
  componentDidMount() {
    SplashScreen.hide();
    NetInfo.addEventListener((info) => this.props.dispatchInternetStatus(info.isInternetReachable));
    if (this.props.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }

  render() {
    return <AppNavigator />;
  }
  componentWillUnmount() {
    const unsubscribe = NetInfo.addEventListener((info) => console.log(info));
    unsubscribe();
    if (this.listener) {
      this.listener.remove();
    }
  }
}
function mapStateToProps(state) {
  const {commonReducer, LoginReducer} = state;
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
    dispatchInternetStatus: (status) => {
      dispatch(InternetStatus(status));
    },
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
