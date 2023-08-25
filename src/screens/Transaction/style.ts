import { Dimensions, StyleSheet } from 'react-native';
import { FONT_FAMILY, GD_FONT_SIZE, GD_ICON_SIZE } from '@/utils/constants';
import colors from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.BACKGROUND,
    // paddingTop: 10
  },
  filterStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: 15,
    width: Dimensions.get('window').width * 0.3,
    // backgroundColor: 'pink',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 10,
    right: 5
  },
  dateRangePickerStyle: {
    width: '71%'
  },
  alignLoader: {
    alignItems: 'center',
    marginTop: 150
  },

  iconPlacingStyle: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  iconCard: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 38,
    maxWidth: 38
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon
  },
  dataLoadedTime:{
    fontSize:12,
    paddingHorizontal:10,
    marginBottom:5
  },
  underlineStyleBase: {
    width: 35,
    height: 45,
    borderWidth: 1,
    borderColor:'#F5F5F5',
    backgroundColor:'#F5F5F5',
    borderRadius:5,
    color:"black"
  },
  regularText: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  button: {
    flexDirection: "row", 
    alignItems: 'center',
    justifyContent: "flex-start", 
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  buttonText: {
    color: '#1C1C1C', 
    fontFamily: FONT_FAMILY.regular,
    marginLeft: 10
  },
  buttonSmallText: {
    color: '#808080', 
    fontFamily: FONT_FAMILY.regular,
    fontSize: GD_FONT_SIZE.xsmall,
    marginLeft: 10
  }
});
