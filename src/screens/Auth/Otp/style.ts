import { StyleSheet, Dimensions } from 'react-native';
import colors from '@/utils/colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  borderStyleBase: {
    width: 30,
    height: 45
  },

  borderStyleHighLighted: {
    borderColor: '#03DAC6'
  },

  underlineStyleBase: {
    width: 50,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: colors.PRIMARY_BASIC,
    color: colors.PRIMARY_BASIC
  },

  underlineStyleHighLighted: {
    borderColor: colors.PRIMARY_BASIC
  },
  logoStyle: {
    resizeMode: 'contain',
    height: 30,
    width: 120
  },
  upperContainer: {
    backgroundColor: '#e0e0e0',
    width: width,
    height: height * 0.1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: { fontSize: 20, fontFamily: 'AvenirLTStd-Black', marginTop: height * 0.1 },
  message: { fontSize: 18, textAlign: 'center', color: '#808080', marginTop: 10,fontFamily: 'AvenirLTStd-Book' },
  submitButton: {
    backgroundColor: colors.PRIMARY_NORMAL,
    height: 50,
    width: width * 0.8,
    marginTop: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
