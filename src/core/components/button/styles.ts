import {StyleSheet, Platform} from 'react-native';
import colors from '@/utils/colors';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';

export default StyleSheet.create({
  circleLabelStyle: {
    color: colors.WHITE,
    textAlign: 'center',
    fontSize: GD_CIRCLE_BUTTON.fontSize,
    marginTop: -5,
    marginLeft: 1,
    fontFamily: 'AvenirLTStd-Book',
  },
  textStyle: {
    color: colors.WHITE,
    textAlign: 'center',
    fontFamily: 'AvenirLTStd-Book',
  },
  button: {
    borderRadius: GD_RADIUS.r_medium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
  },
  // Medium/ Large sizem
  small: {
    minHeight: GD_BUTTON_SIZE.h_small,
    borderRadius: GD_RADIUS.r_small,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: GD_BUTTON_SIZE.font_small,
  },
  medium: {
    minHeight: GD_BUTTON_SIZE.h_medium,
    borderRadius: GD_RADIUS.r_medium,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: GD_BUTTON_SIZE.font_medium,
    height: 44,
  },
  large: {
    minHeight: GD_BUTTON_SIZE.h_large,
    borderRadius: GD_RADIUS.r_large,
    paddingVertical: 13,
    paddingHorizontal: 20,
    fontSize: GD_BUTTON_SIZE.font_large,
  },
  // Primary/ Secondary color
  primary: {
    backgroundColor: colors.PRIMARY_NORMAL,
    color: colors.WHITE,
  },
  primaryBasic: {
    backgroundColor: colors.PRIMARY_BASIC,
    color: colors.WHITE,
  },
  secondary: {
    backgroundColor: colors.SECONDARY_NORMAL,
    color: colors.WHITE,
  },

  // Circle shape
  circle: {
    borderRadius: GD_CIRCLE_BUTTON.radius,
    height: GD_CIRCLE_BUTTON.height,
    width: GD_CIRCLE_BUTTON.width,
  },
  circleFontSize: {
    fontSize: GD_CIRCLE_BUTTON.fontSize,
  },

  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
});
