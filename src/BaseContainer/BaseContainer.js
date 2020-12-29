import React, { Component } from 'react';
import {
  Platform,
  DeviceEventEmitter
} from 'react-native';
import AppNavigator from '@/navigation/app.navigator';

import { connect } from 'react-redux';
import { getCompanyAndBranches, renewAccessToken } from '../redux/CommonAction';


class BaseContainer extends Component {
  componentDidMount() {
    if (this.props.isUserAuthenticated){
      this.props.getCompanyAndBranches()
    }
    // this.listener = DeviceEventEmitter.addListener(APP_EVENTS.invalidAuthToken, () => {
    //   // fire logout action
    //   this.props.renewAccessToken();
    //   store.dispatch.auth.logout();
    // });
  }
  
  componentWillUnmount() {

  }

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated){
      this.props.getCompanyAndBranches()
    }
  }

 

  render() {
    return (
     <AppNavigator/>
    );
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
    ...LoginReducer
  };

}
function mapDispatchToProps(dispatch) {
  return {
   
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches())
    },
    renewAccessToken:()=> {
      dispatch(renewAccessToken())
    }
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent
