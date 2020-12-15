import * as React from 'react';
import {Component} from 'react';
import {GestureResponderEvent, StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {ButtonSize} from '@/models/enums/button';
import styles from '@/core/components/login-button/styles';
import {Icon} from '@ui-kitten/components';

type LoginButtonProps = {
  label: string;
  icon: string;
  size: number;
  style?: StyleProp<ViewStyle>;
  onPress?: (event?: GestureResponderEvent) => void;
};

type LoginButtonStat = {};

class LoginButton extends Component<LoginButtonProps, LoginButtonStat> {
  static defaultProps: {};
  constructor(props: LoginButtonProps) {
    super(props);
  }

  render() {
    //Button style pushed into style based on condition

    let btnStyle: StyleProp<ViewStyle>[] = [this.props.style, styles.button];

    return (
      <View>
        <TouchableOpacity onPress={this.props.onPress} style={btnStyle}>
          <Icon pack="Gd" name={this.props.icon} />
          <View style={styles.seperatorStyle} />
          <Text style={styles.labelStyle}>{this.props.label}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

LoginButton.defaultProps = {
  size: ButtonSize.medium,
};

export default LoginButton;
