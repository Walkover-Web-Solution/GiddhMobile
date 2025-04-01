import { Dimensions, Platform, StyleSheet } from 'react-native';
import { GD_ICON_SIZE } from '@/utils/constants';
import colors, { baseColor } from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
const { height, width } = Dimensions.get('window');


export default StyleSheet.create({
    modalMobileContainer: {
        flex: 1,
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        margin: 0,
        paddingTop: Platform.OS == "ios" ? 15 : 0
    },
    modalViewContainer: {
        flex: 1,
    },
    cancelButtonModal: {
        flexDirection: "row",
        alignItems: 'center',
        // justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    cancelButtonTextModal: {
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    switchView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 12
    },
    switchButton: {
        padding: 8,
        flex: 2,
        alignSelf: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#000080',
        borderTopEndRadius: 17,
        borderTopLeftRadius: 17,
        borderBottomLeftRadius: 17,
    },
    groupButton:{
        padding:10,
        marginHorizontal:20,
        marginVertical:5,
        borderBottomWidth:1,
        borderBottomColor:'#EDEDED'
    },
    groupNameText:{
        fontFamily: 'AvenirLTStd-Book',
        fontSize:14
    }
});

export const accountStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
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
  alignLoader: {
    alignItems: 'center',
    marginTop: 150
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
  searchText: { 
    flex: 1,
    fontSize: 16,
    fontFamily: FONT_FAMILY.regular, 
    marginLeft: 10, 
    color: colors.WHITE 
  },
  regularText: { 
    fontFamily: FONT_FAMILY.semibold, 
    fontSize: 16,
    color: '#1C1C1C',
  },
  smallText: { 
    fontFamily: FONT_FAMILY.regular, 
    fontSize: 12,
    color: '#1C1C1C',
  },
  searchResultContainer: {
    maxHeight: 300,
    width: '100%',
    backgroundColor: 'white',
    alignSelf: 'center',
    paddingBottom:3,
  },
  searchItemText: { 
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13, 
  },
  searchHeading: {
    paddingTop:10,
    marginHorizontal:25,
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  recents:{
    paddingHorizontal:10,
    paddingVertical:7,
    marginHorizontal:20,
    marginVertical:0,
    // borderBottomWidth:1,
    // borderBottomColor:'#EDEDED'
}
});

