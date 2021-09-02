import * as React from 'react';
import { Component } from 'react';
import { GestureResponderEvent, StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { InputSize } from '@/models/enums/input';
import { Noop } from '@/utils/helper';
import { Icon } from '@ui-kitten/components';

import styles from '@/core/components/input/styles';

type GDInputProps = typeof GDInput.defaultProps & {
  value?: string;
  icon?: string;
  placeholder?: string;
  size?: InputSize;
  enable?: Boolean;
  label: string;
  required?: Boolean;
  labelStyle?: StyleProp<TextStyle>;
  onFocus?: (event?: GestureResponderEvent) => void;
  onChange?: (event?: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

type GDInputStat = {};

export class GDInput extends Component<GDInputProps, GDInputStat> {
  static defaultProps = {
    value: '',
    size: InputSize.medium,
    enable: true,
    required: false,
    onFocus: Noop,
    onChange: Noop,
    onBlur: Noop
  };

  constructor (props: GDInputProps) {
    super(props);
  }

  render () {
    // Input style pushed into style based on condition
    const labelStyle: StyleProp<TextStyle> =
      this.props.size === InputSize.medium ? styles.labelStyle : styles.labelStyleSmall;
    const inputTextStyle: StyleProp<TextStyle> =
      this.props.size === InputSize.medium ? styles.inputTextStyle : styles.inputTextStyleSmall;

    return (
      <View style={[styles.borderBottom, styles.viewArea]}>
        <View style={styles.iconBox}>
          <Icon style={styles.iconSize} pack="Gd" name={this.props.icon} />
        </View>
        <View style={[styles.flexGrow]}>
          <View style={styles.labelArea}>
            <Text style={labelStyle}>{this.props.label}</Text>
            {this.props.required && <Text style={styles.requiredText}>*</Text>}
          </View>
          <TextInput
            editable={this.props.enable}
            style={inputTextStyle}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
            onChangeText={this.props.onChange}
          />
        </View>
      </View>
    );
  }
}
