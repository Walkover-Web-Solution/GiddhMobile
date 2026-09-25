import { StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import {
  FONT_FAMILY,
  GD_BUTTON_SIZE,
  GD_FONT_SIZE,
  GD_ICON_SIZE,
  GD_RADIUS
} from '@/utils/constants';

export default StyleSheet.create({
  button: {
    borderRadius: GD_RADIUS.r_medium,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    minHeight: GD_BUTTON_SIZE.h_medium,
    paddingHorizontal: 20,
    width: 200,
    paddingVertical: 0,
    height: 44
  },
  labelStyle: {
    color: colors.WHITE,
    textAlign: 'center',
    fontSize: GD_FONT_SIZE.normal,
    borderStyle: 'solid',
    fontFamily: FONT_FAMILY.bold
  },
  iconSize: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon
  },
  seperatorStyle: {
    height: 15,
    width: 10,
    backgroundColor: 'transparent',
    marginLeft: 0,
    marginRight: 0
  }
});
