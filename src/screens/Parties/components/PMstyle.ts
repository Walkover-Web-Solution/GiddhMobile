import {StyleSheet, Platform} from 'react-native';
import * as constants from '@/utils/constants';
import {GD_ICON_SIZE} from '@/utils/constants';
import colors, {baseColor} from '@/utils/colors';

export default StyleSheet.create({
  container: {},
  flatList: {
    justifyContent: 'center',
  },

  viewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowFront: {
    backgroundColor: '#eeeeee',
    marginVertical: 5,
    marginHorizontal: 5,
    marginRight: 10,
    width: '100%',
    paddingTop: 15,
    paddingHorizontal: 16,
  },
  rowBack: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partiesName: {
    color: colors.INPUT_COLOR,
    marginLeft: 0,
    fontSize: constants.GD_FONT_SIZE.medium,
    width: '65%',
    fontFamily: 'OpenSans',
  },
  subheading: {
    color: colors.LABEL_COLOR,
    fontSize: 13,
    marginLeft: 0,
    paddingBottom: 10,
  },
  amountWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  amountStyle: {
    fontFamily: 'OpenSans-Bold',
    fontSize: constants.GD_FONT_SIZE.medium,
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    alignSelf: 'center',
    marginRight: 5,
  },
  swipeRight: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    paddingLeft: 20,
    justifyContent: 'flex-start',
    backgroundColor: colors.SWIPE_LEFT,
  },
  swipeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: 20,
    justifyContent: 'flex-end',
    backgroundColor: colors.SWIPE_RIGHT,
  },
  swipeText: {
    color: colors.WHITE,
  },
  seperator: {
    marginTop: 0,
    borderBottomColor: baseColor.BORDER_COLOR,
    borderBottomWidth: 1,
  },
});
