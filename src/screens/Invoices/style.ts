import {StyleSheet, Platform, Dimensions} from 'react-native';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';
import colors from '@/utils/colors';

const {height, width} = Dimensions.get('window');

export default StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
  overlay: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    top: 0,
    left: 0,
    // backgroundColor: '#007aff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007aff',
    zIndex: 1,
  },
});
