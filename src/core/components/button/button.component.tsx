import * as React from 'react';
import {Component} from 'react';
import {GestureResponderEvent, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native';
import {ButtonShape, ButtonSize, ButtonType} from '@/models/enums/button';
import {Noop} from '@/utils/helper';
import styles from '@/core/components/button/styles';

type GDButtonProps = typeof GDButton.defaultProps & {
  size?: ButtonSize;
  type?: ButtonType;
  shape?: ButtonShape;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  onPress?: (event?: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
};

type GDButtonStat = {};

export class GDButton extends Component<GDButtonProps, GDButtonStat> {
  static defaultProps = {
    size: ButtonSize.small,
    type: ButtonType.primary,
    shape: ButtonShape.rounded,
    onPress: Noop,
  };

  constructor(props: GDButtonProps) {
    super(props);
  }

  // Button Size small|medium|large
  checkSize = (btnStyle: any) => {
    switch (this.props.size) {
      case ButtonSize.small:
        btnStyle.push(styles.small);
        break;
      case ButtonSize.medium:
        btnStyle.push(styles.medium);
        break;
      case ButtonSize.large:
        btnStyle.push(styles.large);
        break;
      default:
        btnStyle.push(styles.small);
    }
  };

  // Button Type primary|secondary
  checkType = (btnStyle: any) => {
    switch (this.props.type) {
      case ButtonType.primary:
        btnStyle.push(styles.primary);
        break;
      case ButtonType.secondary:
        btnStyle.push(styles.secondary);
        break;
      default:
        btnStyle.push(styles.primary);
    }
    return btnStyle;
  };

  render() {
    //Button style pushed into style based on condition
    let btnStyle: StyleProp<ViewStyle>[] = [this.props.style, styles.button];
    let labelStyle: StyleProp<TextStyle> =
      this.props.shape === ButtonShape.circle ? styles.circleLabelStyle : this.props.labelStyle || styles.textStyle;

    if (this.props.shape === ButtonShape.circle) {
      btnStyle.push(styles.circle);
      this.checkType(btnStyle);
    } else {
      this.checkSize(btnStyle);
      this.checkType(btnStyle);
    }

    return (
      <View>
        <TouchableOpacity style={btnStyle} onPress={this.props.onPress}>
          <Text style={labelStyle}>{this.props.label}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
