import {StyleSheet, Platform} from 'react-native';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  listItemName: {fontSize: 20, marginLeft: 15},
});
