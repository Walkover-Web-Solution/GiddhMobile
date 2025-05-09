import { StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import { GD_FONT_SIZE } from '@/utils/constants';

export default StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.WHITE
  },
  alignLoader: {
    alignItems: 'center',
    marginTop: 150
  },
  loginContainer: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#fff',
    paddingBottom: 50
  },
  container: {
    flex: 1,
    // alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
    paddingBottom: 50
  },
  socialLoginContainer: {
    flexDirection: 'column',
    paddingVertical: 10,
    justifyContent: 'center'
    // flex: 1.2,
  },

  logoStyle: {
    resizeMode: 'contain',
    height: 30,
    width: 120,
    alignSelf: 'center'
  },
  logoTwo: {
    resizeMode: 'contain',
    height: 22,
    width: 90,
    alignSelf: 'center'
  },
  titleContainer: {
    flexDirection: 'row'
  },
  loginTextStyle: {
    fontSize: 26,
    fontFamily: 'AvenirLTStd-Black',
    // marginBottom: 30,
    color: colors.TEXT_HEADING
  },
  gmailButton: {
    marginBottom: 10,
    marginRight: 10,
    fontFamily: 'AvenirLTStd-Book',
    backgroundColor: colors.PRIMARY_BASIC
  },
  appleButton: {
    marginBottom: 20,
    marginRight: 10,
    fontFamily: 'AvenirLTStd-Book',
    backgroundColor: colors.INPUT_COLOR
  },

  seperator: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  horizontalRule: {
    borderBottomColor: colors.INPUT_COLOR,
    flex: 1,
    marginLeft: 10,
    marginTop: 5,
    marginRight: 25,
    borderBottomWidth: 1
  },

  loginFormContainer: {
    justifyContent: 'center'
  },

  registerStyle: {
    fontSize: 18,
    fontFamily: 'AvenirLTStd-Book',
    color: colors.TEXT_NORMAL
  },
  formInput: {
    borderRadius: 21
  },
  loginButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  loginButtonStyle: {
    width: 152,
    fontSize: GD_FONT_SIZE.large
  },
  forgotStyle: {
    fontSize: 16,
    fontFamily: 'AvenirLTStd-Book',
    color: colors.TEXT_NORMAL
  },
  troubleLoginContainer: {
    justifyContent: 'center',
    marginTop: 80
  },
  bottomTextStyle: {
    marginBottom: 5,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'AvenirLTStd-Book',
    color: colors.TEXT_NORMAL
  },
  bottomTextSeparater: {
    marginVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'AvenirLTStd-Book',
    color: colors.TEXT_NORMAL,
    opacity: 0.5
  },

  bottomTextStyleLink: {
    marginBottom: 5,
    color: colors.TEXT_LINK,
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: 'AvenirLTStd-Book'
  },
  verticalCenter: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});
