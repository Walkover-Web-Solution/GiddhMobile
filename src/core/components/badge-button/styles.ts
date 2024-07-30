import { StyleSheet, Dimensions } from 'react-native';
import colors from '@/utils/colors';
import { GD_FONT_SIZE } from '@/utils/constants';

export default StyleSheet.create({
  badgeStyle: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    width: Dimensions.get('window').width * 0.35
  },
  labelStyle: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    color: colors.LABEL_COLOR,
    textAlign: 'center',
    fontSize: GD_FONT_SIZE.normal
  },
  // Active mode
  activeBadgeStyle: {
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.PRIMARY_NORMAL,
    borderRadius: 16,
    borderBottomRightRadius: 0,
    width: Dimensions.get('window').width * 0.35,
    fontFamily: 'AvenirLTStd-Black'
  },
  activeLabelStyle: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    color: colors.PRIMARY_NORMAL,
    textAlign: 'center',
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: 'AvenirLTStd-Black'
  }
});
