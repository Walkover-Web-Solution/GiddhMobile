import { StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';

export default StyleSheet.create({
  container: {
    width: '100%'
  },
  sectionTitle: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL,
    marginBottom: 8
  },
  sectionTitleSpaced: {
    marginTop: 22
  },
  hintText: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
    borderRadius: 21,
    backgroundColor: colors.WHITE,
    paddingHorizontal: 14,
    height: 46,
    marginRight: 10
  },
  inputWrapLocked: {
    backgroundColor: '#F5F7FA',
    borderColor: '#E0E6EF'
  },
  phoneWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.BORDER_COLOR,
    borderRadius: 21,
    backgroundColor: colors.WHITE,
    paddingLeft: 6,
    paddingRight: 10,
    height: 46,
    marginRight: 10
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.BORDER_COLOR,
    marginRight: 6
  },
  flag: {
    fontSize: 16,
    marginRight: 4
  },
  dial: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL
  },
  input: {
    flex: 1,
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.INPUT_COLOR,
    paddingVertical: 0
  },
  phoneInput: {
    paddingLeft: 4
  },
  verifiedIcon: {
    marginLeft: 6
  },
  actionButton: {
    minWidth: 92,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.PRIMARY_BASIC,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  actionButtonDisabled: {
    backgroundColor: colors.PRIMARY_DISABLED
  },
  actionButtonSuccess: {
    backgroundColor: colors.TRANSACTION_RECEIPT
  },
  actionButtonLabel: {
    color: colors.WHITE,
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular
  },
  otpBlock: {
    marginTop: 12
  },
  otpLabel: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginBottom: 8
  },
  verifyOtpButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.PRIMARY_BASIC,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14
  }
});
