import { StyleSheet, Platform } from 'react-native';
import {GD_ICON_SIZE} from '@/utils/constants';
import color from '@/utils/colors';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    fontSize: 15,
justifyContent:'space-between'
  },
  goToCompanyText:{
    color: color.TEXT_LINK,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    width: '100%',
    textAlign: 'left',
    paddingHorizontal: 54,
    paddingVertical: 20,

  },
  listItemName: {fontSize: 20, marginLeft: 15},
});
