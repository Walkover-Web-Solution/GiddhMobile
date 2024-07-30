import * as React from 'react';
import { Component } from 'react';
import { View } from 'react-native';
// import styles from './styles';
import { Card, Icon, Text } from '@ui-kitten/components';
import styles from '@/core/components/top-card/styles';

type TopCardProps = {
  label: string;
  month: string;
  amount: string;
  icon: string;
};

type TopCardStat = {};

export class TopCard extends Component<TopCardProps, TopCardStat> {
  constructor (props: TopCardProps) {
    super(props);
  }

  render () {
    // Button style pushed into style based on condition

    return (
      <Card style={styles.cardBox}>
        <View style={styles.flexCard}>
          <Text style={styles.labelStyle}>
            {this.props.label} <Text style={styles.monthStyle}>({this.props.month})</Text>
          </Text>
          <Icon style={styles.iconStyle} pack="Gd" name={this.props.icon} />
        </View>
        <Text style={styles.amountStyle}>₹{this.props.amount}</Text>
      </Card>
    );
  }
}
