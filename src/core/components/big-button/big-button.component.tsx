import * as React from 'react';
import {Component} from 'react';
import {Alert, View} from 'react-native';
//import styles from './styles';
import {GdSVGIcons} from '@/utils/icons-pack';
import styles from '@/core/components/big-button/styles';

type BigButtonProps = {
  icon: string;
};

type BigButtonStat = {};

export class BigButton extends Component<BigButtonProps, BigButtonStat> {
  constructor(props: BigButtonProps) {
    super(props);
  }

  render() {
    //Button style pushed into style based on condition
    return (
      <View style={styles.flexCard} onStartShouldSetResponder={() => Alert.alert('View Clicked...')}>
        <GdSVGIcons.plus style={styles.iconStyle} width={60} height={60} />
        {/* <Icon style={styles.iconStyle} pack='Gd' name={this.props.icon}/> */}
      </View>
    );
  }
}
