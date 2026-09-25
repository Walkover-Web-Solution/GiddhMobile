import * as React from 'react';
import { Component, ReactNode } from 'react';
import {
  GestureResponderEvent,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { ButtonSize } from '@/models/enums/button';
import styles from '@/core/components/login-button/styles';
import { Icon } from '@ui-kitten/components';

type LoginButtonProps = {
  label: string;
  icon?: string;
  iconElement?: ReactNode;
  size: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  onPress?: (event?: GestureResponderEvent) => void;
};

type LoginButtonStat = {};

class LoginButton extends Component<LoginButtonProps, LoginButtonStat> {
  static defaultProps: {};
  constructor (props: LoginButtonProps) {
    super(props);
  }

  render () {
    const btnStyle: StyleProp<ViewStyle>[] = [styles.button, this.props.style];
    const hasIcon = Boolean(this.props.iconElement || this.props.icon);

    return (
      <View style={{ width: '100%' }}>
        <TouchableOpacity
          onPress={this.props.onPress}
          style={btnStyle}
          activeOpacity={0.7}
        >
          {this.props.iconElement
            ? this.props.iconElement
            : this.props.icon
              ? <Icon pack="Gd" name={this.props.icon} />
              : null}
          {hasIcon ? <View style={styles.seperatorStyle} /> : null}
          <Text style={[styles.labelStyle, this.props.labelStyle]}>{this.props.label}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

LoginButton.defaultProps = {
  size: ButtonSize.medium
};

export default LoginButton;
