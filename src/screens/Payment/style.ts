import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '../../utils/constants';
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
    backgroundColor: '#084EAD'
  },
  cashBankButtonWrapper: {
    backgroundColor: '#fff',
    margin: 5,
    borderColor: '#D9D9D9',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    borderWidth: 1.2,
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
  invoiceTypeTextRight: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
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
    backgroundColor: '#fff',
    position: 'absolute',
    alignSelf: 'center',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    flexDirection:'row'
    //borderRadius: 10
  },
  searchTextInputStyle: {
    color: 'white',
    position: 'absolute',
    left: 40,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    width: '60%'
    // backgroundColor: 'grey',
  },

  invoiceAmountText: {
    fontFamily: FONT_FAMILY.bold,
    color: 'white',
    fontSize: 18
  },
  senderAddress: {
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
  addressHeaderText: {
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
    fontSize: 16,
    color: '#FC8345',
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
  }
});