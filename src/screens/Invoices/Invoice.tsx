import React from 'react';

import {View, Text, TouchableOpacity, Animated, Alert} from 'react-native';
import queueFactory from 'react-native-queue';
import {connect} from 'react-redux';
import NetInfo from '@react-native-community/netinfo';

import style from './style';

export class Invoice extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      queue: null,
    };
    // this.init();
  }

  async init() {
    const queue = await queueFactory();
    queue.addWorker('example-job', async (id, payload) => {
      alert(id);
      console.log(payload, 'payload');
      await new Promise((resolve) => {
        setTimeout(() => {
          alert('job completed');
          resolve();
        }, 5000);
      });
    });
    this.setState({
      queue,
    });
  }

  async makeJob(jobName, payload = {}) {
    const queue = await queueFactory();
    queue.createJob(jobName, payload, {}, false);
  }

  render() {
    return (
      <View style={style.container}>
        <TouchableOpacity
          style={{height: 50, width: 50, backgroundColor: 'blue'}}
          onPress={() => {
            this.makeJob('example-job', {'1': 'test payload'});
          }}
          // onPress={() => {
          //   alert(this.props.isInternetReachable);
          // }}
        />
      </View>
    );
  }
}

// export default Invoice;
const mapStateToProps = (state) => {
  const {commonReducer} = state;

  return {
    isLoginInProcess: state.LoginReducer.isAuthenticatingUser,
    ...commonReducer,
    // countries: state.common.countries,
    // isCountriesLoading: state.common.isCountriesLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);
