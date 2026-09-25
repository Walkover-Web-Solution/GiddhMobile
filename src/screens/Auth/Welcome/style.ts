import { StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import { AUTH_LAYOUT } from '@/screens/Auth/Login/authLayout';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.BACKGROUND },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: AUTH_LAYOUT.horizontalPadding
  },
  noShadow: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
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
