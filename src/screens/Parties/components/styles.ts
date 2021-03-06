import {StyleSheet, Platform} from 'react-native';
import * as constants from '@/utils/constants';
import {GD_ICON_SIZE} from '@/utils/constants';
import colors, {baseColor} from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    justifyContent: 'center',
    paddingTop: 15,
  },

  viewWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },

  rowFront: {
    backgroundColor: colors.BACKGROUND,
    width: '100%',
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
    marginLeft: 5,
    fontSize: constants.GD_FONT_SIZE.medium,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
  },
  subheading: {
    color: colors.LABEL_COLOR,
    fontSize: 10,
    marginLeft: 5,
    paddingBottom: 10,
  },
  amountWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  amountStyle: {
    fontWeight: 'bold',
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
