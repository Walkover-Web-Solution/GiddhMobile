import { Dimensions, StyleSheet } from 'react-native';
import * as constants from '@/utils/constants';
import { GD_ICON_SIZE } from '@/utils/constants';
import colors, { baseColor } from '@/utils/colors';

export default StyleSheet.create({
  container: {},
  flatList: {
    justifyContent: 'center'
  },

  viewWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  rowFront: {
    backgroundColor: '#F5F5F5',
    marginTop: 2,

    width: '100%',
    paddingTop: 15,
    paddingHorizontal: 10
  },
  rowBack: {
    backgroundColor: colors.BACKGROUND,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  partiesName: {
    color: colors.INPUT_COLOR,
    marginLeft: 0,
    fontSize: constants.GD_FONT_SIZE.medium,
    width: '60%',
    fontFamily: 'AvenirLTStd-Book'
  },
  subheading: {
    color: colors.LABEL_COLOR,
    fontSize: 13,
    marginLeft: 0,
    paddingBottom: 10
  },
  amountWrap: {
    flex:1,
  },
  customerAmountWrap: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    width: '35%'
    // backgroundColor: 'pink',
  },
  amountStyle: {
    fontFamily: 'AvenirLTStd-Black',
    fontSize: constants.GD_FONT_SIZE.medium
  },
  emptyContainerText: {
    alignSelf: 'center',
    fontFamily: 'AvenirLTStd-Black',
    fontSize: constants.GD_FONT_SIZE.font_25
  },
  iconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    alignSelf: 'flex-start',
    marginTop:4
  },
  customerIconStyle: {
    height: GD_ICON_SIZE.input_icon,
    width: GD_ICON_SIZE.input_icon,
    alignSelf: 'center'
  },
  swipeRight: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    paddingLeft: 20,
    justifyContent: 'flex-start',
    backgroundColor: colors.SWIPE_LEFT
  },
  swipeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingRight: 20,
    justifyContent: 'flex-end',
    backgroundColor: colors.SWIPE_RIGHT
  },
  swipeText: {
    color: colors.WHITE
  },
  seperator: {
    marginTop: 0,
    borderBottomColor: baseColor.BORDER_COLOR,
    borderBottomWidth: 1
  },
  buttonContainer: {
    marginTop: 20,
    backgroundColor: colors.PRIMARY_NORMAL,
    borderRadius: 50,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  buttonText: { 
    color: colors.WHITE, 
    fontFamily: constants.FONT_FAMILY.bold, 
    margin: 10 
  },
  noPartyImage: {
    resizeMode: 'contain', 
    height: 250, 
    width: 300
  }
});
