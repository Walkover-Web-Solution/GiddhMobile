import { StyleSheet } from 'react-native';
import * as constants from '@/utils/constants';
import { GD_ICON_SIZE } from '@/utils/constants';
import colors, { baseColor } from '@/utils/colors';

export default StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#FFFFFF'
  },
  flatList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  listHeading: {
    color: colors.INPUT_COLOR,
    fontSize: constants.GD_FONT_SIZE.medium,
    fontFamily: 'AvenirLTStd-Book',
   
  },
  aboutSales: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  leftcontent: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  receiptData: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5
  },
  totalData: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  balanceText: {
    display: 'flex',
    flexDirection: 'row'
  },
  balData: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionTypeBanner: {
    backgroundColor: colors.TRANSACTION_PURCHASE,
    paddingLeft: 10,
    paddingRight: 10,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerText: {
    fontSize: constants.GD_FONT_SIZE.small,
    color: colors.WHITE
  },
  invoiceNumber: {
    color: baseColor.GRAY_LIGHT,
    marginLeft: 10,
    fontSize: constants.GD_FONT_SIZE.small
  },
  invoiceDate: {
    color: baseColor.GRAY_LIGHT,
    fontSize: constants.GD_FONT_SIZE.small
  },
  totalStyle: {
    color: baseColor.GRAY_LIGHT,
    fontSize: constants.GD_FONT_SIZE.small
  },
  balStyle: {
    color: colors.INPUT_COLOR,
    fontSize: constants.GD_FONT_SIZE.normal,
    fontFamily: 'AvenirLTStd-Book'
  },
  iconPlacingStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -10
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
  },
  inventoryData: { marginBottom: 5, color: baseColor.GRAY_LIGHT },
  seperator: {
    marginBottom: 5,
    borderBottomColor: baseColor.GRAY_LIGHT,
    opacity: 0.2,
    borderBottomWidth: 1
  },
  deleteButton: {
    backgroundColor: '#FFDFE0', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50
  }
});
