import { Dimensions, StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../utils/constants';
import { ThemeProps } from '@/utils/theme';
const {height,width} = Dimensions.get('window')
const makeStyle = (theme:ThemeProps)=> StyleSheet.create({
  container: {
    flex: 1
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
    // borderRadius: 20,
    // borderBottomRightRadius: 0,
    borderBottomWidth: 1.2,
  },
  buttonText: {
    color: '#808080',
    fontFamily: FONT_FAMILY.regular,
    // textAlign: 'center',
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
  fieldContainer: {
    marginTop: 0,
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
    fontFamily: FONT_FAMILY.regular,
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
    color: 'blue',
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
  containerView:{
    flex:1,
    backgroundColor:'white'
  },
  createButton:{
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    backgroundColor: '#5773FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: height * 0.01,
  },
  createBtn:{
    fontFamily: theme.typography.fontFamily.bold ,
    color: '#fff',
    fontSize: 20,
  },
  createButtonText :{
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
    fontSize: 20,
  },
  animatedView:{ 
    backgroundColor: 'white', 
    marginBottom:70
  },
  selectedText:{
    color:'#084EAD',
    fontFamily:theme.typography.fontFamily.semiBold
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
    padding:5,
    fontFamily: theme.typography.fontFamily.regular
  },
  radioBtnView:{
    // flexDirection: 'row',
    // backgroundColor: 'pink',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
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
  radioText:{ 
    marginLeft: 10,
    fontFamily:theme.typography.fontFamily.semiBold 
  },
  codeInput:{ 
    borderColor: '#D9D9D9', 
    borderBottomWidth: 1,
    width: '55%',
    marginRight: 16,
    paddingVertical:10,
    fontFamily:theme.typography.fontFamily.regular 
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
    // justifyContent:'center',
    paddingHorizontal:10,
    // alignContent:'center'
  },
  dialogContainer:{ 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  dialogTypeText:{  
    fontSize: 16, 
    fontFamily: theme.typography.fontFamily.regular 
  },
  dialogMessage:{ 
    fontSize: 14, 
    marginTop: 10, 
    textAlign: 'center', 
    fontFamily: theme.typography.fontFamily.regular 
  },
  dialogBtn: {            
    alignItems: 'center',
    width: '70%',
    borderRadius: 30,
    justifyContent:'center',
    marginTop: 30,
    height: 50, marginBottom: 5,
  },
  dialogBtnText: { color: '#fff', fontSize: 20, alignSelf:'center', fontFamily: theme.typography.fontFamily.regular},
  updatedCreateBtn : {
    borderWidth: 2,
    alignSelf: 'center',
    justifyContent: 'center',
    height: height * 0.06,
    width: width * 0.9,
    position: 'absolute',
    bottom: height * 0.01,
    alignItems: 'center',
    marginVertical:7
  },
  updatedCreateBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
  },
  checkBoxView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:5
  },
  checkView:{
      width: 16,
      height: 16,
      borderWidth: 1,
      borderColor: 'blue',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 3,
  },
  tickBox:{
      width: 10,
      height: 10,
  },
  smallText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: '#FFFFFF'
  }
});

export default makeStyle;