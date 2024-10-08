import { StyleSheet, Dimensions } from 'react-native';
import colors from '@/utils/colors';

const { width, height } = Dimensions.get('window');
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    padding: 5
  },
  createAccount: {
    fontSize: 20,
    color: 'white'
  },
  login: {
    fontSize: 18,
    color: colors.PRIMARY_BASIC,
    fontFamily: 'AvenirLTStd-Medium'
  },
  createAccountButton: {
    height: 50,
    width: width * 0.9,
    backgroundColor: colors.PRIMARY_BASIC,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButton: {
    height: 50,
    marginTop: 10,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.PRIMARY_BASIC
  },
  paginationWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1
  },
  paginationDots: {
    height: 8,
    width: 8,
    borderRadius: 8 / 2,
    backgroundColor: '#5773FF',
    marginLeft: 10
  }
});
