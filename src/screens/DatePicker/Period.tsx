import React from 'react';

import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import moment from 'moment';
import styles from './style';
import { ScrollView } from 'react-native-gesture-handler';
import { CompanyService } from '@/core/services/company/company.service';
import colors from '@/utils/colors';

export class Period extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      activeFilter: '',
      currentFinancialYearStartDate: moment().startOf('year').format('DD-MM-YYYY')
    };
  }

  async getFinancialYear () {
    this.setState({ isLoading: true })
    try {
      const response = await CompanyService.getFinancialYear();
      if( response.status === 'success' && response?.body?.financialYears ) {
        let currentFinancialYearStartDate;
        const todayDate = moment().startOf('day').format('DD-MM-YYYY');

        response?.body?.financialYears?.forEach((item: any) => {
          if (moment(todayDate, 'DD-MM-YYYY').isAfter(moment(item?.financialYearStarts, 'DD-MM-YYYY')) && moment(todayDate, 'DD-MM-YYYY').isBefore(moment(item.financialYearEnds, 'DD-MM-YYYY'))) {
            currentFinancialYearStartDate = item.financialYearStarts;
          }
        })

        this.setState({
          currentFinancialYearStartDate
        })
      }
    } catch (error) {
      console.error('------ getFinancialYear -----', error)
    } finally {
      this.setState({ isLoading: false })
    }
  }

  componentDidMount(): void {
    this.getFinancialYear();
  }

  render() {
    return (
      <ScrollView style={styles.periodContainer}>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('TM', 'default');
            this.props.selectDate(moment().startOf('month').format('DD-MM-YYYY'), moment().endOf('month').format('DD-MM-YYYY'));
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
        <TouchableOpacity
          disabled={this.state.isLoading}
          style={styles.periodButton}
          onPress={() => {
            this.props.setActiveDateFilter('FY');
            this.props.selectDate(
              moment(this.state.currentFinancialYearStartDate, 'DD-MM-YYYY').format('DD-MM-YYYY'),
              moment().format('DD-MM-YYYY')
            );
            this.props.navigation.goBack();
          }}>
          <Text style={styles.periodText}>This Financial Year to Date</Text>
          <View style={styles.wrapper}>
            <ActivityIndicator color={colors.PRIMARY_NORMAL} size="small" animating={this.state.isLoading} />
            {this.props.activeDateFilter == 'FY' && <View style={styles.periodDot} />}
          </View>
        </TouchableOpacity>

      </ScrollView>
    );
  }
}

export default Period;
