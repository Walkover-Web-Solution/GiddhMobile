import {StyleSheet, Dimensions, Platform} from 'react-native';
import colors from '@/utils/colors';
import {GD_FONT_SIZE} from '@/utils/constants';

const {width, height} = Dimensions.get('window');

export default StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loginContainer: {
    flex: 1,
    display: 'flex',
    paddingHorizontal: 30,
    alignContent: 'space-around',
  },
  socialLoginContainer: {
    flexDirection: 'column',
    display: 'flex',
    paddingVertical: 10,
    justifyContent: 'center',
    flex: 1.8,
  },
  upperContainer: {
    backgroundColor: '#e0e0e0',
    width: width,
    height: height * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStyle: {
    resizeMode: 'contain',
    height: 16,
    width: 139,
    alignSelf: 'center',
    paddingVertical: 50,
  },
  titleContainer: {
    flexDirection: 'row',
    display: 'flex',
  },
  loginTextStyle: {
    fontSize: 26,
    fontFamily: 'OpenSans-Bold',
    marginBottom: 30,
    color: colors.TEXT_HEADING,
  },
  socialButton: {
    marginBottom: 20,
    marginRight: 80,
  },

  seperator: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
  },
  horizontalRule: {
    borderBottomColor: colors.INPUT_COLOR,
    flex: 1,
    marginLeft: 10,
    marginTop: 5,
    marginRight: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  loginFormContainer: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
  },

  registerStyle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    color: colors.TEXT_NORMAL,
  },
  formInput: {
    marginTop: 20,
    borderRadius: 20,
  },
  loginButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  requestButtonStyle: {
    width: 150,
  },
  loginStyle: {
    fontSize: GD_FONT_SIZE.medium,
    fontFamily: 'OpenSans',
    color: colors.TEXT_NORMAL,
  },
  troubleLoginContainer: {
    display: 'flex',
    justifyContent: 'center',

    flex: 1,
  },
  bottomTextStyle: {
    marginBottom: 5,
    marginRight: 10,
    fontSize: 14,
    fontFamily: 'OpenSans',
    color: colors.TEXT_NORMAL,
  },

  bottomTextStyleLink: {
    marginBottom: 5,
    color: colors.TEXT_LINK,
    fontSize: GD_FONT_SIZE.normal,
    textDecorationLine: 'underline',
    fontFamily: 'OpenSans',
  },

  resetHead: {
    fontSize: GD_FONT_SIZE.xlarge,
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center',
    paddingBottom: 20,
  },

  resetBody: {
    fontSize: GD_FONT_SIZE.medium,
    color: colors.LABEL_COLOR,
    textAlign: 'center',
    paddingBottom: 40,
  },
});
