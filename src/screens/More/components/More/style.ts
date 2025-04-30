import { StyleSheet } from 'react-native';
import colors from '../../../../utils/colors';
import { FONT_FAMILY, GD_ICON_SIZE } from '@/utils/constants';

export default StyleSheet.create({
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  },
  countriesContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row'
  },
  exampleContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 80
  },
  headerText: {
    justifyContent: 'center',
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16
  },
  commonStyle: {
    marginBottom: 15
  },
  translationButton: {
    marginBottom: 15,
    width: '50%'
  },
  cardContainer: {
    flexDirection: 'row'
  },
  topScroll: {
    paddingHorizontal: 15
  },
  companyNameText: {
    color: colors.INPUT_COLOR,
    // textAlign: '',
    fontSize: 14,
    fontFamily: 'AvenirLTStd-Black',
    width: '75%',
    marginLeft: 10
  },
  companyShortText: {
    color: colors.WHITE,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'AvenirLTStd-Book',
    textTransform: 'uppercase'
  },
  companyShortView: {
    backgroundColor: colors.SECONDARY,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    alignSelf: 'center'
  },
  leftView: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    alignSelf: 'center'
  },
  companyView: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    backgroundColor: colors.BACKGROUND,
    width: '100%',
    alignItems: 'center',
    height: 78
  },
  branchView: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    backgroundColor: colors.BACKGROUND,
    width: '100%',
    alignItems: 'center',
    height: 78
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon
  },
  contactUsView: {
    backgroundColor: colors.BACKGROUND,
    marginTop: 10
  },
  contactUsText: { 
    color: 'black', 
    fontFamily: FONT_FAMILY.bold, 
    fontSize: 20, 
    margin: 10, 
    marginVertical: 20 
  },
  emailField: { 
    flexDirection: 'row', 
    margin: 10 
  },
  contactUsButtons: {
    margin: 10,
    backgroundColor: "#E3E8FF",
    borderRadius: 100,
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: '50%'
  },
  contactDtailsText: {
    color: 'black',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 16
  },
  modalView: {
    backgroundColor: '#fff',
    height: '70%',
    width: '100%',
    marginVertical: 80,
    alignSelf: 'center',
    flex: 1,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  renderLoadingView: { 
    height: '100%', 
    width: '100%', 
    alignSelf: 'center', 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  renderErrorView: { 
    height: '100%', 
    width: '100%', 
    alignSelf: 'center', 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  renderErrorText: { 
    color: 'black', 
    fontFamily: FONT_FAMILY.bold, 
    fontSize: 16 
  },
  buttonText: { 
    color: 'black', 
    fontFamily: FONT_FAMILY.semibold, 
    margin: 10 
  },
  logoutButton: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.BACKGROUND
  },
  chip: {
    backgroundColor: colors.BACKGROUND,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    borderRadius: 50
  },
  smallText: {
    color: colors.SECONDARY, 
    fontFamily: FONT_FAMILY.bold, 
    fontSize: 10
  },
  biometicContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    backgroundColor: colors.BACKGROUND,
    width: '100%',
    alignItems: 'center',
    height:76,
    justifyContent:'space-between'
  },
  textView: {
    flexDirection:'row', 
    marginLeft: 15, 
    alignItems:'center'
  },
  tooltip: {
    // backgroundColor: colors.PRIMARY_NORMAL,
    padding: 15,
    borderRadius: 12,
    // width:'100%',
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
  },
});
