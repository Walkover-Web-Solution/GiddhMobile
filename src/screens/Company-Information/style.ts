import {StyleSheet, Platform, Dimensions} from 'react-native';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';
import colors from '@/utils/colors';

const {height, width} = Dimensions.get('window');

export default StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white', paddingHorizontal: 15},
  heading: {fontSize: 28, fontWeight: 'bold', marginTop: 20},
  message: {fontSize: 18, marginTop: 10, color: '#808080'},
  buttonOne: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    backgroundColor: colors.PRIMARY_BASIC,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  buttonContainer: {flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center'},
  buttonTwo: {
    height: 50,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonThree: {
    height: 50,
    width: '50%',
    borderRadius: 25,
    backgroundColor: colors.PRIMARY_BASIC,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {fontSize: 20, color: colors.PRIMARY_BASIC},
});
