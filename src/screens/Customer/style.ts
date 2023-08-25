import { StyleSheet,Platform,Dimensions } from 'react-native';
import { FONT_FAMILY, GD_FONT_SIZE } from '../../utils/constants';
const { height, width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerConatiner: {
    backgroundColor: '#864DD3'
  },
  invoiceTypeTextRight: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: 'white'
  },

  invoiceType: {
    justifyContent: 'center',
    color: 'white',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    marginLeft: 20,
  },
  invoiceTypeButton: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 10
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
  customerMainContainer: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: Platform.OS=="ios"? 15:0,
    paddingVertical: 10,
    paddingHorizontal:20,
  },
  input: {
    // flex: 1,
    width: '100%',
    height: 40,
    color: '#1c1c1c',
    paddingLeft: 10,
    fontFamily:'AvenirLTStd-Book',
  },
  GreyText: {
    color: '#808080',
    marginLeft: 35,
    marginTop: 15,
    fontSize: 13
  },
  inputStyle: {
    paddingLeft: 35,
    borderBottomColor: '#808080',
    borderBottomWidth: 0.55,
    paddingBottom: -5
  },
  dropDown: {
    paddingLeft: 35,
    marginVertical: 10,
    borderBottomWidth: 0.55,
    borderBottomColor: '#808080',
    paddingBottom: 10,
    marginTop: 15
  },
  saveBtn: {
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 30,
    backgroundColor: '#5773FF',
    marginBottom: 5
  },
  addressDetails: {
    color: '#1C1C1C',
    fontSize: 16,
    paddingLeft: 15,
    fontFamily: FONT_FAMILY.bold
  },
  modalMobileContainer: {
    flex: 1,
    backgroundColor: "white",
    height: "100%",
    width:"100%",
    margin:0,
    paddingTop:Platform.OS=="ios"?15:0
  },
  modalViewContainer: {
    flex: 1,
  },
  modalViewHeading: {
    marginHorizontal: 20,
    fontSize: 19,
    color: "black",
  },
  cancelButtonModal: {
    flexDirection:"row",
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  cancelButtonTextModal: {
    padding:5,
    justifyContent: "center",
    alignItems: "center",
  },
  borderInModal: {
    width: "100%",
    borderBottomWidth: 0.27,
    opacity:0.15,
    borderBottomColor: "grey",
    marginTop: 5
  },
  saveButton:{
    height: height * 0.06,
    width: width * 0.9,
    borderRadius: 25,
    backgroundColor: '#5773FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10
  },
  saveText:{
    fontFamily: 'AvenirLTStd-Black',
    color: '#fff',
    fontSize: 20
  },
  scrollViewContainerStyle: {
    paddingBottom: height * 0.2,
  },
  button: {
    flexDirection: "row", 
    justifyContent: "flex-start", 
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  buttonText: {
    color: '#1C1C1C', 
    fontFamily: FONT_FAMILY.regular,
    marginLeft: 10
  }
});
