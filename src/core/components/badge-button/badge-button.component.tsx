import * as React from 'react';
import {Component} from 'react';
import {GestureResponderEvent, StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import styles from '@/core/components/badge-button/styles';

type BadgeButtonProps = {
  label: string;
  isActive?: Boolean;
  onPress?: (event?: GestureResponderEvent) => void;
};

type BadgeButtonStat = {};

export class BadgeButton extends Component<BadgeButtonProps, BadgeButtonStat> {
  constructor(props: BadgeButtonProps) {
    super(props);
  }

  render() {
    //Button style pushed into style based on condition
    let btnStyle: StyleProp<ViewStyle>[] = [this.props.isActive ? styles.activeBadgeStyle : styles.badgeStyle];
    let labelStyle: StyleProp<ViewStyle>[] = [this.props.isActive ? styles.activeLabelStyle : styles.labelStyle];

    return (
      <View style={btnStyle}>
        <TouchableOpacity onPress={this.props.onPress}>
          <Text style={labelStyle}>{this.props.label}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
