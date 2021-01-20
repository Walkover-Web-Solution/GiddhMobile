import {StyleSheet, Platform, Dimensions} from 'react-native';
import colors, {baseColor} from '@/utils/colors';
import {GD_FONT_SIZE, GD_ICON_SIZE} from '@/utils/constants';

export default StyleSheet.create({
  flexGrow: {
    flexGrow: 0.97,
  },
  inputTextStyle: {
    fontSize: GD_FONT_SIZE.medium,
    color: colors.INPUT_COLOR,
    paddingTop: 9,
    width: '100%',
  },
  inputTextStyleSmall: {
    fontSize: GD_FONT_SIZE.normal,
  },
  viewArea: {
    minHeight: 50,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  labelArea: {
    display: 'flex',
    flexDirection: 'row',
  },
  labelStyle: {
    color: colors.LABEL_COLOR,
    fontSize: GD_FONT_SIZE.normal,
  },
  labelStyleSmall: {
    fontSize: GD_FONT_SIZE.small,
  },
  requiredText: {
    color: baseColor.PRIMARY_RED,
    paddingLeft: 1,
  },
  iconBox: {
    backgroundColor: '#fefefe',
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    marginRight: 10,
  },
  iconSize: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    color: colors.WHITE,
  },
  borderBottom: {
    borderBottomColor: colors.BORDER_COLOR,
    borderBottomWidth: 1,
  },

  //Rounded input
  datePickerStyle: {
    borderColor: colors.BORDER_COLOR,
  },
  roundedInputTextStyle: {
    fontSize: GD_FONT_SIZE.small_m,
    color: colors.INPUT_COLOR,
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
    paddingLeft: 5,
    fontFamily: 'OpenSans',
  },
  roundedViewArea: {
    height: 48,
    minHeight: 42,
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'row',
    borderColor: colors.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    flexGrow: 0.97,
    marginVertical: 12,
    paddingVertical: 0,
  },

  roundedViewAreaForInput: {
    height: 38,
    width: Dimensions.get('window').width * 0.75,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    textAlign: 'left',
    flexDirection: 'row',
    borderColor: colors.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    marginLeft: 15,
  },
  roundedViewAreaForTextInput: {
    height: 38,
    width: Dimensions.get('window').width * 0.8,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    textAlign: 'left',
    flexDirection: 'row',
    borderColor: colors.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
  },
  roundedIconBox: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    marginRight: 0,
    // textAlign: 'center',
    justifyContent: 'center',
    flexGrow: 0.03,
  },
});
