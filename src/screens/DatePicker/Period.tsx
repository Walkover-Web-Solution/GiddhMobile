import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import moment from 'moment';
import styles from './style';
import { ScrollView } from 'react-native-gesture-handler';

export class Period extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      activeFilter: ''
    };
  }

  render () {
    return (
      <ScrollView style={styles.periodContainer}>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('TM', 'default');
            this.props.selectDate(moment().startOf('month').format('DD-MM-YYYY'), moment().format('DD-MM-YYYY'));
            this.props.navigation.goBack();
          }}>
          <Text style={styles.periodText}>This Month</Text>
          {this.props.activeDateFilter == 'TM' && <View style={styles.periodDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('LM', 'default');

            this.props.selectDate(
              moment().subtract(1, 'months').startOf('month').format('DD-MM-YYYY'),
              moment().subtract(1, 'months').endOf('month').format('DD-MM-YYYY')
            );
            this.props.navigation.goBack();
          }}>
          <Text style={styles.periodText}>Last Month</Text>
          {this.props.activeDateFilter == 'LM' && <View style={styles.periodDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('TQ', 'TQ');

            this.props.selectDate(moment().startOf('quarter').format('DD-MM-YYYY'), moment().format('DD-MM-YYYY'));
            this.props.navigation.goBack();
          }}>
          <Text style={styles.periodText}>This Quarter to Date</Text>
          {this.props.activeDateFilter == 'TQ' && <View style={styles.periodDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('LQ', 'TQ');

            this.props.selectDate(
              moment().subtract(1, 'quarter').startOf('quarter').format('DD-MM-YYYY'),
              moment().subtract(1, 'quarter').endOf('quarter').format('DD-MM-YYYY')
            );
            this.props.navigation.goBack();
          }}>
          <Text style={styles.periodText}>Last Quarter</Text>
          {this.props.activeDateFilter == 'LQ' && <View style={styles.periodDot} />}
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.periodButton}
            onPress={() => {
              this.props.selectDate(moment().startOf('month').format('DD-MM-YYYY'), moment().format('DD-MM-YYYY'));
              this.props.navigation.goBack();
            }}
        >
          <Text style={styles.periodText}>All Time</Text>
          <View style={styles.periodDot} />
        </TouchableOpacity> */}
      </ScrollView>
    );
  }
}

export default Period;
