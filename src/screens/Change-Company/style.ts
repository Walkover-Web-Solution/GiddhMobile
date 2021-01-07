import {StyleSheet} from 'react-native';
import {GD_ICON_SIZE} from '@/utils/constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  listItemName: {fontSize: 20, marginLeft: 15, fontFamily: 'OpenSans'},
});
