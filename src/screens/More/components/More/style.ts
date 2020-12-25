import {StyleSheet, Platform} from 'react-native';
import  colors from "../../../../utils/colors";
import { InputSize } from '../../../../models/enums/input';
import {GD_BUTTON_SIZE, GD_CIRCLE_BUTTON, GD_ICON_SIZE, GD_RADIUS} from '@/utils/constants';

export default StyleSheet.create({
  countriesContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  exampleContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  commonStyle: {
    marginBottom: 15,
  },
  translationButton: {
    marginBottom: 15,
    width: '50%',
  },
  cardContainer: {
    flexDirection: 'row',
  },
  topScroll: {
    paddingHorizontal: 15,
  },
  companyNameText:{ 
    color: colors.INPUT_COLOR,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'OpelSans-Regular' : 'Opel-Sans-Regular',
    marginLeft: 10,
    alignSelf: 'center'
},
companyShortText:{
  color: colors.WHITE,
  textAlign: 'center',
  fontSize: 11,
  fontFamily: Platform.OS === 'ios' ? 'OpelSans-Bold' : 'Opel-Sans-Bold',
  textTransform: 'uppercase'
},
companyShortView:{
  backgroundColor:colors.SECONDARY,
  width: 26,
  height:26,
  borderRadius: 13,
  justifyContent:'center',
  alignItems: 'center', 
  marginLeft: 15,
  alignSelf: 'center'
}, 
companyView:{
  paddingVertical: 10, 
  paddingHorizontal:10, 
  flexDirection: 'row', 
  backgroundColor: colors.BACKGROUND, 
  width: '100%',
  alignItems: 'center', 
  height: 78, 
},
iconStyle: {
  height: GD_ICON_SIZE.input_icon,
  width: GD_ICON_SIZE.input_icon,
},
});
