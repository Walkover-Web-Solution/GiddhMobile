import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {flex: 1, backgroundColor: 'pink', justifyContent: 'center', alignItems: 'center'},
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
