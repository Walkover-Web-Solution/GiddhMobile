import { Platform, StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';
import { AUTH_LAYOUT } from '@/screens/Auth/Login/authLayout';

const androidFontFix =
  Platform.OS === 'android' ? { includeFontPadding: false as const } : {};

const softShadow = Platform.select({
  ios: {
    shadowColor: colors.PRIMARY_NORMAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10
  },
  android: {
    elevation: 3
  }
});

const chunkyShadow = Platform.select({
  ios: {
    shadowColor: colors.PRIMARY_NORMAL,
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 0
  },
  android: {
    elevation: 4
  }
});

export default StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND
  },
  alignLoader: {
    alignItems: 'center',
    marginTop: 150
  },
  loginContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: colors.BACKGROUND,
    paddingBottom: 50
  },
  socialLoginContainer: {
    flexDirection: 'column',
    paddingVertical: 10,
    justifyContent: 'center'
  },

  logoStyle: {
    resizeMode: 'contain',
    height: AUTH_LAYOUT.scaleW(40),
    width: AUTH_LAYOUT.scaleW(132),
    alignSelf: 'center'
  },
  logoTwo: {
    resizeMode: 'contain',
    height: AUTH_LAYOUT.scaleW(28),
    width: AUTH_LAYOUT.scaleW(112),
    alignSelf: 'center'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  loginTextStyle: {
    fontSize: 26,
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_HEADING
  },
  loginButtonLabelStyle: {
    color: colors.WHITE,
    lineHeight: 16,
    fontFamily: FONT_FAMILY.regular
  },

  heroBlock: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
    paddingTop: 0,
    position: 'relative',
    width: '100%'
  },
  blobSoft: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.PRIMARY_DISABLED,
    opacity: 0.32,
    top: -36,
    left: 8
  },
  blobAccent: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.PRIMARY,
    opacity: 0.38,
    top: 4,
    right: 18
  },
  blobDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.PRIMARY_BASIC,
    opacity: 0.5,
    top: 54,
    left: 42
  },
  logoBubble: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: colors.PRIMARY_DISABLED,
    ...softShadow
  },
  welcomeTitle: {
    marginTop: AUTH_LAYOUT.titleSpacing,
    fontSize: AUTH_LAYOUT.scaleW(28),
    fontFamily: FONT_FAMILY.bold,
    color: colors.SECONDARY,
    textAlign: 'center',
    letterSpacing: 0.2,
    ...androidFontFix
  },
  subtitle: {
    marginTop: 12,
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    textAlign: 'center',
    ...androidFontFix
  },
  authStack: {
    width: '100%',
    maxWidth: AUTH_LAYOUT.contentMaxWidth,
    alignSelf: 'center',
    marginTop: AUTH_LAYOUT.stackMarginTop,
    paddingHorizontal: 4,
    gap: AUTH_LAYOUT.stackGap
  },
  authButtonWrap: {
    width: '100%',
    marginBottom: 0
  },
  authButton: {
    width: '100%',
    height: AUTH_LAYOUT.buttonHeight,
    minHeight: AUTH_LAYOUT.buttonHeight,
    borderRadius: 20,
    backgroundColor: colors.PRIMARY_BASIC,
    marginRight: 0,
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 2.5,
    borderColor: colors.PRIMARY_PRESSED,
    ...chunkyShadow
  },
  googleAuthButton: {
    backgroundColor: colors.WHITE,
    borderWidth: 2.5,
    borderColor: colors.PRIMARY_DISABLED
  },
  googleAuthLabel: {
    color: colors.TEXT_NORMAL,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15
  },
  otpAuthButton: {
    borderWidth: 0
  },
  otpAuthLabel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15
  },
  appleAuthButton: {
    backgroundColor: colors.INPUT_COLOR,
    borderColor: colors.PRIMARY_BLACK
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    width: '100%'
  },
  orLine: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.PRIMARY_DISABLED,
    opacity: 0.6
  },
  orPill: {
    marginHorizontal: 10,
    backgroundColor: colors.WHITE,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.PRIMARY_DISABLED
  },
  orText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.bold,
    color: colors.PRIMARY_NORMAL,
    ...androidFontFix
  },
  signupBlock: {
    marginTop: 28,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 4
  },
  signupHint: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    textAlign: 'center',
    ...androidFontFix
  },
  signupLink: {
    marginTop: 0,
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.bold,
    color: colors.PRIMARY_NORMAL,
    textDecorationLine: 'underline',
    textAlign: 'center',
    ...androidFontFix
  },
  termsWrap: {
    marginTop: 28,
    paddingHorizontal: 8
  },
  termsText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.regular,
    color: '#A0A8B6',
    textAlign: 'center',
    lineHeight: 18,
    ...androidFontFix
  },
  termsLink: {
    color: '#7B8494',
    textDecorationLine: 'underline',
    fontFamily: FONT_FAMILY.regular
  },

  gmailButton: {
    marginBottom: 10,
    marginRight: 10,
    fontFamily: FONT_FAMILY.regular,
    backgroundColor: colors.PRIMARY_BASIC
  },
  appleButton: {
    marginBottom: 10,
    marginRight: 10,
    fontFamily: FONT_FAMILY.regular,
    backgroundColor: colors.INPUT_COLOR
  },
  otpButton: {
    marginBottom: 10,
    marginRight: 10,
    fontFamily: FONT_FAMILY.regular,
    backgroundColor: colors.LOGIN_OPT
  },
  newOtpButton: {
    marginBottom: 20,
    marginRight: 10,
    fontFamily: FONT_FAMILY.regular,
    backgroundColor: colors.PRIMARY_NORMAL
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
    fontFamily: FONT_FAMILY.regular,
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
    padding: 10,
    fontSize: GD_FONT_SIZE.medium
  },
  forgotStyle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.regular,
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
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL
  },
  bottomTextSeparater: {
    marginVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL,
    opacity: 0.5
  },

  bottomTextStyleLink: {
    marginBottom: 5,
    color: colors.TEXT_LINK,
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: FONT_FAMILY.regular
  },
  verticalCenter: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: AUTH_LAYOUT.topPadding,
    paddingBottom: 40
  },
  authScreenContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: AUTH_LAYOUT.horizontalPadding,
    paddingTop: AUTH_LAYOUT.topPadding,
    paddingBottom: 8
  },
  authInner: {
    width: '100%',
    maxWidth: AUTH_LAYOUT.contentMaxWidth,
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  authMain: {
    width: '100%'
  },
  authFooter: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: AUTH_LAYOUT.bottomSafe
  },
  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: colors.PRIMARY_BASIC,
    color: colors.PRIMARY_BASIC,
    marginLeft: 2,
    fontFamily: FONT_FAMILY.bold
  },
  underlineStyleHighLighted: {
    borderColor: colors.PRIMARY_BASIC
  }
});
