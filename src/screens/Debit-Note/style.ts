import { Dimensions, StyleSheet } from 'react-native';
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
export default StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ff6961',
    height: Dimensions.get('window').height * 0.08, 
  },
  headerConatiner: {
    // backgroundColor: '#ff6961'
  },
  invoiceTypeTextRight: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    color: 'white'
  },

  invoiceType: {
    justifyContent: 'center',
    color: 'white',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16
  },
  invoiceTypeButton: { justifyContent: 'center', flexDirection: 'row', alignItems: 'center' },
  searchResultContainer: {
    maxHeight: 300,
    width: '80%',
    backgroundColor: 'white',
    position: 'absolute',
    alignSelf: 'center',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    flexDirection:'row',
    borderRadius: 10,
    overflow: 'hidden'
  },
  searchItemText: { 
    color: '#1C1C1C', 
    paddingVertical: 10,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14, 
  },
  searchTextInputStyle: {
    color: '#1C1C1C',
    position: 'absolute',
    left: 40,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    width: '60%'
  },
  invoiceAmountText: {
    fontFamily: FONT_FAMILY.bold,
    color: '#1C1C1C',
    fontSize: 18
  },
  senderAddress: {
    marginVertical: 14,
    marginHorizontal: 16
    // padding:20,
    // backgroundColor: 'white',
    // borderRadius: 4,
    // shadowColor: 'grey',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.8,
    // shadowRadius: 2,
    // elevation: 5,
  },
  addressSameCheckBoxText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: '#808080',
    marginTop: 5,
    marginLeft: 5
  },
  dateView: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50
  },
  selectedDateText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
  },
  InvoiceHeading: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    alignSelf: 'center',
    marginTop: -2
  },
  addressHeaderText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
  },
  senderAddressText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13
    // alignSelf: 'left'
  },
  selectedAddressText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: '#808080',
    marginVertical: 6
  },
  inventoryNameText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#1C1C1C',
    width: '50%'
  },
  TaxText: {
    color: '#000',
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    // marginLeft: 22,
    marginTop: 4
    // backgroundColor: 'pink',
  },
  footerItemsTotalText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: 'white'
  },
  addItemDone: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    color: '#ffff',
    alignSelf: 'center'
  },
  footerAddItemConatiner: {
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    backgroundColor: '#F2F2F2',
    height: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  deleteBox: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 80
  },
  bottomSheetSelectTaxText: {
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    marginLeft: 22,
    marginTop: 4
  },
  finalItemAmount: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.bold
  },
  addItemMain: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: '#ff6961',
    alignSelf: 'center'
  },
  text: {
    color: '#1C1C1C',
    paddingVertical: 4,
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
    marginLeft: 20
  },
  regularText: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
  },
  smallText: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 12,
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
  tdsTcsCalculationButton: {
    backgroundColor: 'transparent',
    marginLeft: 20,
    marginTop: 2,
    paddingBottom: 4,
  },
  tdsTcsCalculationButtonText: {
    color: '#ff6961',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 13,
    textAlign: 'left',
  },
  taxCalculationMethodButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  taxCalculationMethodButtonText: {
    color: '#1C1C1C',
    paddingVertical: 4,
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 10,
    fontFamily: FONT_FAMILY.semibold,
  },
  otherTaxButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  otherTaxButtonViewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    flex: 1
  },
  otherTaxButtonViewItemCheckbox: {
    borderRadius: 1,
    borderWidth: 1,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tdsTcsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10
  }
});
