import { Dimensions, StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../utils/constants';
import { ThemeProps } from '@/utils/theme';
const {height,width} = Dimensions.get('window')
const makeStyles = (theme:ThemeProps)=> StyleSheet.create({
  container: {
    flex: 1
  },
  backGround:{
    backgroundColor:'white'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00B795',
    height: Dimensions.get('window').height * 0.08,
  },
  renderConatiner: {
    paddingHorizontal: 20
    // backgroundColor: '#00B795'
  },
  buttonWrapper: {
    backgroundColor: '#fff',
    margin: 5,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    borderWidth: 1.2,
  },
  buttonText: {
    color: '#808080',
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
    minWidth: 100,
    paddingVertical:10,
    fontSize: 14,
  },
  chequeButtonText: {
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 5
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
  invoiceTypeButton: { 
    justifyContent: 'center', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
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
  fieldContainer: {
    marginTop: 14,
    marginHorizontal: 16
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
  fieldHeadingText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    marginLeft: 10,
    alignSelf: 'center'
  },
  senderAddressText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13
  },
  selectedAddressText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: '#808080',
    marginVertical: 6
  },
  addressSameCheckBoxText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#FFF',
    marginTop: 5,
    marginLeft: 5
  },
  inventoryNameText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: '#1C1C1C',
    width: '50%'
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
  TaxText: {
    color: '#000',
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    marginTop: 4
  },
  finalItemAmount: {
    color: '#1C1C1C',
    fontFamily: FONT_FAMILY.bold
  },
  addItemMain: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    color: '#084EAD',
    alignSelf: 'center'
  },
  InvoiceHeading: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    alignSelf: 'center',
    marginTop: -2
  },
  modalView: {
    margin: 80,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  centeredView: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  invoiceText: {
    fontFamily: FONT_FAMILY.regular, 
    padding: 5, 
    color: '#808080'
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: Platform.OS=="ios"? 15:0,
    paddingVertical: 10,
    paddingHorizontal:20,
  },
  button: {
    flexDirection: "row", 
    justifyContent: "flex-start", 
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  radiobuttonText:{
    color: '#1C1C1C', 
    fontFamily: FONT_FAMILY.regular,
    marginLeft: 10
  },
  createBtn:{
    fontFamily: theme.typography.fontFamily.bold ,
    color: '#fff',
    fontSize: 20,
  },
  createButton:{
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical:20
    },
  modalRenderItem :{
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8
  },
  modalCheckBox:{
    borderRadius: 1,
    borderWidth: 1,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText:{
    color: '#1C1C1C',
    paddingVertical: 4,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 20,
  },
  modalCancelView:{
    height: height * 0.3, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8
  },
  modalCancelText :{
    flex: 1,
    color: '#1C1C1C',
    paddingVertical: 4,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    textAlign: 'center',
    alignSelf: 'center'
  },
  checkboxContainer:{
    flexDirection: 'row', 
    flex: 1,
    alignItems:'center'
  },
  textInput:{
    fontFamily:theme.typography.fontFamily.semiBold,
    flex:1
  },
  clearnBtnText:{
    color: '#1C1C1C', 
    marginRight: 16, 
    fontFamily: theme.typography.fontFamily.regular
  },
  rowView:{
    flexDirection: 'row'
  },
  unitGroupView:{
    paddingVertical: 6, 
    marginTop: 10, 
    justifyContent: 'space-between'
  },
  modalBtn:{
    marginHorizontal:20,
    minWidth:140,
    minHeight:40,
    justifyContent:'center'
  },
  taxView: {
    paddingVertical: 6, 
    marginTop: 10, 
    width:Dimensions.get('window').width-100
  },
  taxBtn : {
    marginLeft: 20,
    minWidth:140,
    minHeight:40,
    maxWidth:width-20,
    justifyContent:'center',
    paddingHorizontal:10,
    alignContent:'center'
  },
  dropDownView : {
    backgroundColor: '#E6E6E6',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    height:35
  },
  lineView : {
    flex:1,
    borderBottomWidth:0.2,
    width:'95%',
    alignSelf:'center'
  },
  animatedView:{ 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  deleteText:{ color: '#E04646', marginLeft: 10 },
  editText:{ color: 'green', marginLeft: 10 },
  inputRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },
  inputView:{
    borderWidth: 1, 
    borderColor: '#d9d9d9',
    width:'90%',
    padding: 10, 
    marginTop: 5, 
    fontFamily: theme.typography.fontFamily.regular
  },
  optionTitle : { 
    color: '#1c1c1c', 
    paddingRight: 5, 
    marginTop: 10, 
    fontFamily: theme.typography.fontFamily.regular 
  },
  doneBtn:{
    height: 40,
    width: 80,
    borderRadius: 16,
    backgroundColor: '#084EAD',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:10
  },
  doneBtnText : {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
    fontSize: 16,
  },
  optionCardContainer:{
    backgroundColor: '#f2f8fb',
    flexDirection:'column', 
    paddingHorizontal: 10, 
    borderRadius: 2, 
    marginVertical: 3,
    marginHorizontal:8 
  },
  optionHeadingText:{ 
    fontFamily: theme.typography.fontFamily.bold, 
    fontSize : theme.typography.fontSize.regular.size 
  },
  variantCard : {flexDirection:'row',flexWrap:'wrap'},
  variantCardText :{ 
    backgroundColor: '#fff',
    margin: 5,
    borderColor: '#D9D9D9', 
    borderRadius: 7,
    borderWidth: 1.2,
    padding: 5, 
    paddingHorizontal:8, 
    marginTop: 5 
  },
  variantHeading :{
    marginVertical: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  tableText: {
    margin:15,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  radioGroupContainer :{
    flexDirection: 'row',
    // backgroundColor: 'pink',
    justifyContent: 'space-between',
    marginTop: 10,
    width:'75%',
    alignSelf:'center' 
  },
  radioBtnView:{ 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: 16, 
    marginTop: 15,
  },
  radioBtn:{
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: '#c4c4c4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioBtn:{ 
    height: 14, 
    width: 14, 
    borderRadius: 7, 
    backgroundColor: '#084EAD' 
  },
  radioBtnText:{ 
    marginLeft: 10, 
    fontFamily:theme.typography.fontFamily.semiBold 
  },
  inputContainer:{ 
    marginHorizontal: 15, 
    marginVertical: 10, 
    marginRight: 20, 
    overflow: 'hidden' 
  },
  inputField:{ 
    borderColor: '#D9D9D9', 
    borderBottomWidth: 1,
    fontFamily:theme.typography.fontFamily.regular 
  },
  linkedAccContainer:{ 
    marginHorizontal: 15, 
    marginVertical: 10, 
    marginRight: 20, 
    overflow: 'hidden' 
  },
  linkedModalBtn:{
    marginTop: 5, 
    paddingHorizontal: 10, 
    paddingVertical: 0,
    height: 40, 
    width: "45%", 
    justifyContent: 'space-between',
    fontFamily:theme.typography.fontFamily.regular
  },
  selectedText:{
    color:'#084EAD',
    fontFamily:theme.typography.fontFamily.semiBold
  },
  unitInput:{ 
    borderColor: '#D9D9D9', 
    borderBottomWidth: 1, 
    width:'45%'
  }
});

export default makeStyles;