import React from 'react';
import { View, Dimensions, Text, TouchableOpacity } from 'react-native';

import styles from './style';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export class Custom extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      isStartDatePickerVisible: false,
      isEndDatePickerVisible: false,
      //   startDate: moment().subtract(30, 'd').format('DD-MM-YYYY'),
      //   endDate: moment().format('DD-MM-YYYY'),
      startDate: this.props.startDate,
      endDate: this.props.endDate
    };
  }

  showStartDatePicker = () => {
    this.setState({
      isStartDatePickerVisible: true
    });
  };

  hideStartDatePicker = () => {
    this.setState({
      isStartDatePickerVisible: false
    });
  };

  showEndDatePicker = () => {
    this.setState({
      isEndDatePickerVisible: true
    });
  };

  hideEndDatePicker = () => {
    this.setState({
      isEndDatePickerVisible: false
    });
  };

  startDateConfirm = (date) => {
    this.hideStartDatePicker();
    this.setState({ startDate: moment(date).format('DD-MM-YYYY') });
    // console.log('startDate: ', moment(date).format('DD-MM-YYYY'));

    // this.props.selectDate(date, null);
  };

  endDateConfirm = (date) => {
    this.hideEndDatePicker();
    this.setState({ endDate: moment(date).format('DD-MM-YYYY') });
    // console.log('EndDate ', moment(date).format('DD-MM-YYYY'));
    // this.props.selectDate(null, date);
  };

  render () {
    const sDate = moment(this.state.startDate, 'DD-MM-YYYY');
    const eDate = moment(this.state.endDate, 'DD-MM-YYYY');
    return (
      <ScrollView contentContainerStyle={{flexGrow:1,backgroundColor: '#fff',}}>
      <View style={styles.customContainer}>
        <View style={{ height: '5%' }} />

        <Text style={styles.customHeading}>Start Date :</Text>
        <TouchableWithoutFeedback style={styles.customDatePicker} onPress={() => this.showStartDatePicker()}>
          <Text style={styles.customDateStyle}>{this.state.startDate}</Text>
        </TouchableWithoutFeedback>
        <View style={{ height: '2%' }} />
        <Text style={styles.customHeading}>End Date :</Text>
        <TouchableWithoutFeedback style={[styles.customDatePicker,{marginBottom:90}]} onPress={() => this.showEndDatePicker()}>
          <Text style={styles.customDateStyle}>{this.state.endDate}</Text>
        </TouchableWithoutFeedback>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            this.props.selectDate(`${this.state.startDate}`, `${this.state.endDate}`);
            this.props.setActiveDateFilter('', 'custom');
            this.props.navigation.goBack();
          }}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={this.state.isStartDatePickerVisible}
          mode="date"
          date={new Date(sDate)}
          onConfirm={this.startDateConfirm}
          onCancel={this.hideStartDatePicker}
          maximumDate={new Date(eDate)}
        />
        <DateTimePickerModal
          isVisible={this.state.isEndDatePickerVisible}
          mode="date"
          date={new Date(eDate)}
          onConfirm={this.endDateConfirm}
          onCancel={this.hideEndDatePicker}
          minimumDate={new Date(sDate)}
        />
        {/* <TouchableOpacity
          style={{height: 50, width: 150, backgroundColor: 'pink'}}
          // onPress={() => console.log(moment(this.state.startDate, 'DD-MM-YYYY'))}
          onPress={() => console.log(this.state.startDate)}></TouchableOpacity> */}
      </View>
      </ScrollView>
    );
  }
}

export default Custom;
