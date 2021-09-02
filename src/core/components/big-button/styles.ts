import { Dimensions, StyleSheet } from 'react-native';

const windowWidth = Dimensions.get('window').width;

export default StyleSheet.create({
  iconStyle: {
    // textAlign: 'right',
    // height:GD_ICON_SIZE.input_icon,
    // width:GD_ICON_SIZE.input_icon,
    width: 40,
    height: 40,
    alignContent: 'center'
  },
  flexCard: {
    flexDirection: 'row',
    // justifyContent:'space-between',
    position: 'absolute',
    bottom: 20, // space from bottombar
    left: windowWidth / 2 - 29,
    height: 58,
    width: 58,
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
