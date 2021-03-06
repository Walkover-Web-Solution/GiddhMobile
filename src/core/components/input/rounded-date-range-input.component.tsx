import * as React from 'react';
import {Component} from 'react';
import {StyleProp, Text, TextStyle, View, ViewStyle, TouchableOpacity} from 'react-native';
import {InputSize} from '@/models/enums/input';
import moment from 'moment';
import DateRangePicker from 'react-native-daterange-picker';

import styles from '@/core/components/input/styles';
import {GD_DATE_RANGE_FORMAT} from '@/utils/constants';
import {GdSVGIcons} from '@/utils/icons-pack';

type GDRoundedDateRangeInputProps = typeof GDRoundedDateRangeInput.defaultProps & {
  value?: string;
  endDate: any;
  startDate: any;
  displayedDate?: any;
  size?: InputSize;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

type GDRoundedDateRangeInputStat = {
  startDate: object;
  endDate: object;
  processedStartDate: string;
  processedEndDate: string;
  processedDate: string;
  minDate: object;
  maxDate: object;
  displayedDate: any;
  visible: boolean;
};
let processStartDate: string = '',
  processEndDate: string = '';
export class GDRoundedDateRangeInput extends Component<GDRoundedDateRangeInputProps, GDRoundedDateRangeInputStat> {
  static defaultProps = {
    endDate: moment('Dec 25, 2025'),
    startDate: moment(),
    minDate: moment('Dec 25, 1995'),
    maxDate: moment('Dec 25, 2025'),
    size: InputSize.small,
  };

  constructor(props: GDRoundedDateRangeInputProps) {
    super(props);
    this.state = {
      endDate: moment('Dec 25, 2025'),
      startDate: moment(),
      processedDate: '',
      minDate: moment('Dec 25, 1995'),
      maxDate: moment('Dec 25, 2025'),
      displayedDate: moment(),
      visible: true,
    };
  }
  setDates = (dates: any) => {
    processStartDate = dates.startDate
      ? moment(dates.startDate).format(GD_DATE_RANGE_FORMAT)
      : moment(this.state.startDate).format(GD_DATE_RANGE_FORMAT);
    processEndDate = dates.endDate ? ' - ' + moment(dates.endDate).format(GD_DATE_RANGE_FORMAT) : '';
    console.log(dates.startDate);
    console.log(dates.endDate);
    this.setState({
      ...dates,
      processedDate: processStartDate + processEndDate,
    });
    this.props.onChangeDate(dates.startDate, dates.endDate);
  };

  render() {
    const {startDate, endDate, displayedDate, minDate, maxDate}: any = this.state;
    return (
      <DateRangePicker
        {...this.props}
        onChange={this.setDates}
        endDate={this.state.endDate}
        startDate={this.state.startDate}
        minDate={minDate}
        maxDate={maxDate}
        displayedDate={displayedDate}
        range>
        <View style={styles.roundedViewAreaForInput}>
          <View style={styles.roundedIconBox}>
            <GdSVGIcons.calendar width={18} height={18} />
          </View>
          <View style={styles.flexGrow}>
            <Text style={styles.roundedInputTextStyle}>
              {this.state.processedDate.toString() ? this.state.processedDate.toString() : this.props.label}
              {/* {processStartDate} */}
              {/* {processEndDate} */}
            </Text>
          </View>
        </View>
      </DateRangePicker>
    );
  }
}
