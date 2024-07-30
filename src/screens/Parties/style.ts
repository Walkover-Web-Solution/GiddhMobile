import { StyleSheet } from 'react-native';
import { FONT_FAMILY, GD_ICON_SIZE } from '@/utils/constants';
import colors from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: colors.BACKGROUND,
    //justifyContent: 'flex-start'
  },
  alignLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  filterStyle: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginTop: 0,
    display: 'flex',
    justifyContent: 'space-between'
  },
  dateRangePickerStyle: {
    width: '70%'
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
    paddingHorizontal:10,
    fontSize:12
  },
  searchText: { 
    flex: 1,
    fontSize: 16,
    fontFamily: FONT_FAMILY.regular, 
    marginLeft: 10, 
    color: colors.WHITE 
  }
});
