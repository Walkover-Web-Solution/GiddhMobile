import {StyleSheet} from 'react-native';
import {GD_ICON_SIZE} from '@/utils/constants';
import colors from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.BACKGROUND,
    paddingTop: 5,
  },
  filterStyle: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginTop: 0,
    display: 'flex',
    justifyContent: 'space-between',
  },
  dateRangePickerStyle: {
    width: '70%',
  },
  iconPlacingStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row',
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
    maxWidth: 38,
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
});
