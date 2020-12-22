import {StyleSheet, Platform, Dimensions} from 'react-native';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';
import colors from '@/utils/colors';

const {height, width} = Dimensions.get('window');

export default StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
});
