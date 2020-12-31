import {StyleSheet, Platform} from 'react-native';
import colors from '@/utils/colors';
import {GD_FONT_SIZE} from '@/utils/constants';

export default StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  alignLoader: {
    alignItems: 'center',
    marginTop: 150,
  },
  loginContainer: {
    flex: 1,

    paddingHorizontal: 30,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  socialLoginContainer: {
    flexDirection: 'column',
    paddingVertical: 10,
    justifyContent: 'center',
    // flex: 1.2,
  },

  logoStyle: {
    resizeMode: 'contain',
    height: 30,
    width: 120,
    alignSelf: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
  },
  loginTextStyle: {
    fontSize: 26,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    fontWeight: 'bold',
    // marginBottom: 30,
    color: colors.TEXT_HEADING,
  },
  gmailButton: {
    marginBottom: 10,
    marginRight: 10,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    backgroundColor: colors.PRIMARY_BASIC,
  },
  appleButton: {
    marginBottom: 20,
    marginRight: 10,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    backgroundColor: colors.INPUT_COLOR,
  },

  seperator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalRule: {
    borderBottomColor: colors.INPUT_COLOR,
    flex: 1,
    marginLeft: 10,
    marginTop: 5,
    marginRight: 25,
    borderBottomWidth: 1,
  },

  loginFormContainer: {
    justifyContent: 'center',
  },

  registerStyle: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    fontWeight: 'bold',
    color: colors.TEXT_NORMAL,
  },
  formInput: {
    borderRadius: 21,
  },
  loginButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  loginButtonStyle: {
    width: 152,
    fontSize: GD_FONT_SIZE.large,
  },
  forgotStyle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    color: colors.TEXT_NORMAL,
  },
  troubleLoginContainer: {
    justifyContent: 'center',
    marginTop: 80,
  },
  bottomTextStyle: {
    marginBottom: 5,
    marginRight: 10,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    color: colors.TEXT_NORMAL,
  },
  bottomTextSeparater: {
    marginVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    color: colors.TEXT_NORMAL,
    opacity: 0.5,
  },

  bottomTextStyleLink: {
    marginBottom: 5,
    color: colors.TEXT_LINK,
    fontSize: 16,
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
  },
});
