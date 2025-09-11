import { StyleSheet } from 'react-native';
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
export default StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerConatiner: {
    backgroundColor: '#229F5F'
  },
  invoiceTypeTextRight: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: 'white'
  },
  accountFlowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  accountFlowText: {
    justifyContent: 'center',
    color: 'white',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 14,
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
    // borderRadius: 10,
    flexDirection: 'row'
  },
  searchTextInputStyle: {
    color: 'white',
    position: 'absolute',
    left: 40,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    width: '60%'
  },
  invoiceAmountText: {
    fontFamily: FONT_FAMILY.bold,
    color: 'white',
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
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 45
  },
  dueDateView: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 45
  },
  selectedDateText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
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
    color: '#229F5F',
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
  boldText: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.bold,
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
  cashBankButtonWrapper: {
    backgroundColor: '#fff',
    margin: 5,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    borderWidth: 1.2,
    alignItems:'center',
    justifyContent:'center'
  },
  cashBankButtonText: {
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    minWidth: 100,
    margin: 10,
    fontSize: 14,
  },
  chequeButtonText: {
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 5
  },
  sectionMainView: {
    marginHorizontal: 16,
    marginVertical: 5
  },
  sectionView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sectionText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
  },
  sectionButton: {
    backgroundColor: '#fff',
    margin: 5,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    borderWidth: 1.2,
    width: 150,
    height: 40,
    marginLeft: 20,
    alignItems:'center',
    justifyContent:'center'
  },
  generateVoucherView: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 20
  },
  saveButton: {
    marginHorizontal: 16,
    backgroundColor: '#5773FF',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  tagListVeiw: {
    flexDirection: 'row',
    maxWidth: '100%',
    flexWrap: 'wrap',
    marginLeft: 20

  },
  tagListItem:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:10,
    marginVertical:2,
    paddingHorizontal:20
  },
  tagText:{
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    paddingHorizontal:5
  },
  selectedTagText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    marginLeft: 10,
  },
  selectedTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: '#229F5F',
    justifyContent: 'space-between',
    margin: 2
  },
  voucherOptionsField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  adjustVoucherView: {
    flexDirection: 'row',
    marginVertical: 20
  },
  discountSheetView: {
    marginHorizontal: 16

  },
  discountField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    justifyContent: 'space-between'
  },
  discountInputField: {
    borderBottomColor: '#5773FF',
    borderBottomWidth: 1,
    maxWidth: '50%',
    minWidth: 100,
    fontFamily: FONT_FAMILY.regular,
    minHeight:40
  },
  discountOptions: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14
  },
  discountListItem:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical:10,
    marginVertical:2
  },
  discountListView:{
    marginVertical:20
  },
  discountListSeparator:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical:10
  },
  line:{
    flex: 1,
    height: 1,
    backgroundColor: '#808080', 
    marginHorizontal: 5,
  },
  discountListText:{
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginHorizontal:5
  },
  checkBoxView: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  checkBoxText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
  },
  checkBoxSmallText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 10,
    alignSelf: 'center'
  },
  attchFileView: {
    marginHorizontal: 16,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  attachFileButton: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  attachFileText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    marginLeft: 10
  },
  attachedTextView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmountView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between'
  },
  totalAmoutText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 16,
    color: '#000000'
  },
  reverseChargeView: {
    marginHorizontal: 16
  },
  reverseChargeNoteText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#868686',
    marginVertical: 10
  },
  reverseChargeConfirmationText: {
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 16,
    color: '#000000',
    
  },
  reverseChargeConfirmView: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-end',
    marginVertical:20
  },
  reverseChargeConfirmButton: {
    borderRadius: 5,
    backgroundColor: '#229F5F',
    padding: 10,
    width: 100,
    alignItems:'center',
    justifyContent:'center',
    marginHorizontal:5
  },
  reverseChargeConfirmButtonText:{
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: '#ffffff',
  },
  touristSchemeView:{
    marginHorizontal:16
  },
  tdsTcsCalculationButton: {
    backgroundColor: 'transparent',
    marginLeft: 20,
    marginTop: 2,
    paddingBottom: 4,
  },
  tdsTcsCalculationButtonText: {
    color: '#229F5F',
    fontFamily: FONT_FAMILY.semibold,
    fontSize: 13,
    textAlign: 'left',
  }
});
