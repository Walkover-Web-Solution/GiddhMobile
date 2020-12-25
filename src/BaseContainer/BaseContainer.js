import React, {Component} from 'react';
import {Platform} from 'react-native';
import AppNavigator from '@/navigation/app.navigator';

import {connect} from 'react-redux';
import {getCompanyAndBranches} from '../redux/CommonAction';

class BaseContainer extends Component {
  componentDidMount() {
    if (this.props.isUserAuthenticated) {
      const result = this.props.getCompanyAndBranches();
      // console.log('branches are', result);
    }
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated) {
      console.log(this.props.getCompanyAndBranches());
    }
  }

  render() {
    return <AppNavigator />;
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
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
