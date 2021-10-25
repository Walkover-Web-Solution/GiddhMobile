import * as React from 'react';
import { Component } from 'react';
import { GestureResponderEvent, StyleProp, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { InputSize } from '@/models/enums/input';
import { Noop } from '@/utils/helper';
import { Icon } from '@ui-kitten/components';

import styles from '@/core/components/input/styles';

type GDRoundedInputProps = typeof GDRoundedInput.defaultProps & {
  value?: string;
  icon?: string;
  placeholder?: string;
  size?: InputSize;
  svg?: any;
  svgHeight?: number;
  svgWidth?: number;
  enable?: Boolean;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onFocus?: (event?: GestureResponderEvent) => void;
  onChange?: (event?: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

type GDRoundedInputStat = {};

export class GDRoundedInput extends Component<GDRoundedInputProps, GDRoundedInputStat> {
  static defaultProps = {
    value: '',
    placeholder: '',
    size: InputSize.small,
    svg: '',
    svgHeight: 18,
    svgWidth: 18,
    enable: true,
    onFocus: Noop,
    onChange: Noop,
    onBlur: Noop,
    color: 'string'
  };

  constructor (props: GDRoundedInputProps) {
    super(props);
  }

  render () {
    const CustomTag = this.props.svg;
    let checkTag = 1;
    if (this.props.svg === '') {
      checkTag = 0;
    }

    return (
      <View style={styles.roundedViewAreaForTextInput}>
        <View style={styles.roundedIconBox}>
          {checkTag === 1 && <CustomTag width={this.props.svgWidth} height={this.props.svgHeight} />}
          {this.props.icon && <Icon pack="Gd" name={this.props.icon} />}
        </View>
        <View style={styles.flexGrow}>
          <TextInput
            placeholderTextColor={'rgba(80,80,80,0.5)'}
            style={styles.roundedInputTextStyle}
            editable={this.props.enable}
            placeholder={this.props.placeholder}
            value={this.props.value}
            onBlur={this.props.onBlur}
            onFocus={this.props.onFocus}
            onChangeText={this.props.onChange}
            secureTextEntry={this.props.secureTextEntry}
          />
        </View>
      </View>
    );
  }
}
