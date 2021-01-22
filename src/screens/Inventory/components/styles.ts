import {StyleSheet} from 'react-native';
import * as constants from '@/utils/constants';
import {GD_FONT_WEIGHT, GD_ICON_SIZE} from '@/utils/constants';
import colors, {baseColor} from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    justifyContent: 'center',
    paddingTop: 10,
    // paddingBottom: 5,
    // backgroundColor: 'pink',
    marginTop: 10,
  },
  listHeading: {
    color: colors.INPUT_COLOR,
    fontSize: constants.GD_FONT_SIZE.medium,
    fontFamily: 'AvenirLTStd-Black',
  },

  balData: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    justifyContent: 'space-between',
  },

  iconPlacingStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },

  stockWrap: {
    display: 'flex',
    flexDirection: 'row',
  },
  stockRow1: {
    display: 'flex',
    flex: 1.1,
  },
  stockRow2: {
    display: 'flex',
    flex: 0.9,
  },
  stockDataWrap: {
    marginTop: 5,
  },
  stockTitle: {
    color: baseColor.GRAY_LIGHT,
    fontSize: constants.GD_FONT_SIZE.normal,
  },
  stockSubTitle: {
    color: colors.TEXT_NORMAL,
    fontFamily: 'AvenirLTStd-Book',
    fontSize: constants.GD_FONT_SIZE.medium,
  },
  seperator: {
    marginTop: 7,
    borderBottomColor: baseColor.GRAY_LIGHT,
    opacity: 0.2,
    borderBottomWidth: 1,
  },
});
