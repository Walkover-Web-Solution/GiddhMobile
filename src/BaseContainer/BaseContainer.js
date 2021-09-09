import React, {Component} from 'react';
import {Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules} from 'react-native';
import AppNavigator from '@/navigation/app.navigator';
import NetInfo from '@react-native-community/netinfo';
import queueFactory from 'react-native-queue';

import {connect} from 'react-redux';
import {getCompanyAndBranches, renewAccessToken, InternetStatus} from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import AppMainNav from '@/navigation/app.main.navigator';
import Invoice from '@/screens/Invoices/Invoice';

class BaseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: null,
    };
    this.init();
  }
  async init() {
    const queue = await queueFactory();
    queue.addWorker('example-job', async (id, payload) => {
      fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'foo',
          body: 'bar',
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => response.json())
        .then((json) => alert(json.title));
    });
    NetInfo.addEventListener((info) => {
      this.props.dispatchInternetStatus(info.isInternetReachable);
      if (info.isInternetReachable == true) {
        alert('queue started');
        queue.start();
      }
      if (info.isInternetReachable == false) {
        alert('queue paused');
        queue.stop();
      }
    });
    this.setState({
      queue,
    });
  }
  componentDidMount() {
    SplashScreen.hide();
    if (this.props.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }
  componentWillUnmount() {
    const unsubscribe = NetInfo.addEventListener((info) => console.log(info));
    unsubscribe();
    if (this.listener) {
      this.listener.remove();
    }
  }
  render() {
    // return <AppNavigator />;
    return <Invoice />;
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
