import {StyleSheet} from 'react-native';
import colors from '@/utils/colors';
import {GD_FONT_SIZE, GD_ICON_SIZE} from '@/utils/constants';

export default StyleSheet.create({
  cardBox: {
    marginHorizontal: 5,
    marginVertical: 10,
    padding: 0,
    borderWidth: 0,
    borderRadius: 5,
    shadowColor: '#00000029',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    opacity: 1,
  },
  labelStyle: {
    color: colors.LABEL_COLOR,
    textAlign: 'left',
    fontSize: GD_FONT_SIZE.normal,
    paddingRight: 10,
  },
  monthStyle: {
    color: colors.LABEL_COLOR,
    textAlign: 'left',
    fontSize: GD_FONT_SIZE.xsmall,
  },
  iconStyle: {
    textAlign: 'right',
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
  amountStyle: {
    color: colors.INPUT_COLOR,
    textAlign: 'left',
    fontSize: GD_FONT_SIZE.normal,
  },
  flexCard: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
