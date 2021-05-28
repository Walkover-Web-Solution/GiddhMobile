import { Dimensions, StyleSheet } from 'react-native';
import { GD_ICON_SIZE } from '@/utils/constants';
import colors from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.BACKGROUND,
    paddingTop: 10
  },
  filterStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 15,
    width: Dimensions.get('window').width * 0.3,
    // backgroundColor: 'pink',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 10,
    right: 5
  },
  dateRangePickerStyle: {
    width: '71%'
  },
  alignLoader: {
    alignItems: 'center',
    marginTop: 150
  },

  iconPlacingStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  iconCard: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 38,
    maxWidth: 38
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon
  }
});
