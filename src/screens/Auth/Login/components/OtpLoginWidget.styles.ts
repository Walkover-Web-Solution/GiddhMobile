import { Platform, StyleSheet } from 'react-native';
import colors from '@/utils/colors';
import { FONT_FAMILY, GD_FONT_SIZE } from '@/utils/constants';

const androidFontFix =
  Platform.OS === 'android' ? { includeFontPadding: false as const } : {};

export default StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1220'
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject
  },
  popupAvoider: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  popupCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.WHITE,
    borderRadius: 28,
    maxHeight: '86%',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#0B1220',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.28,
        shadowRadius: 36
      },
      android: {
        elevation: 16
      }
    })
  },
  cardClip: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.WHITE,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1
  },
  scrollContent: {
    flexGrow: 0,
    paddingBottom: 4
  },
  flagEmoji: {
    fontSize: 20,
    lineHeight: 26,
    marginRight: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  title: {
    fontSize: GD_FONT_SIZE.xxlarge,
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_HEADING,
    flex: 1,
    paddingRight: 12,
    letterSpacing: -0.4
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeText: {
    fontSize: 13,
    color: colors.TEXT_NORMAL,
    fontFamily: FONT_FAMILY.regular,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: Platform.OS === 'ios' ? -1 : 0
  },
  subtitle: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginBottom: 22,
    lineHeight: 21,
    ...androidFontFix
  },
  sectionLabel: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginBottom: 8,
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    ...androidFontFix
  },
  modeRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10
  },
  modeRadioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E6EAF2',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 12
  },
  modeRadioOptionActive: {
    borderColor: colors.PRIMARY_BASIC,
    backgroundColor: '#EEF4FF'
  },
  modeRadioOptionDisabled: {
    opacity: 0.55
  },
  modeRadioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#B8C0D0',
    marginRight: 8,
    backgroundColor: colors.WHITE
  },
  modeRadioDotActive: {
    borderColor: colors.PRIMARY_BASIC,
    backgroundColor: colors.PRIMARY_BASIC
  },
  modeRadioLabel: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL,
    ...androidFontFix
  },
  modeRadioLabelActive: {
    color: colors.PRIMARY_BASIC,
    fontFamily: FONT_FAMILY.bold
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E6EAF2',
    borderRadius: 16,
    backgroundColor: '#F7F9FC',
    height: 56,
    paddingHorizontal: 6,
    marginBottom: 8,
    overflow: 'hidden'
  },
  phoneRowFocused: {
    borderColor: colors.PRIMARY_BASIC,
    backgroundColor: colors.WHITE,
    ...Platform.select({
      ios: {
        shadowColor: colors.PRIMARY_BASIC,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 8
      },
      android: {
        elevation: 0
      }
    })
  },
  phoneRowError: {
    borderColor: '#E04646',
    backgroundColor: '#FFF7F7'
  },
  phoneRowLocked: {
    backgroundColor: '#F2F4F8',
    borderColor: '#E6EAF2',
    opacity: 1
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#DDE3EE',
    marginRight: 6
  },
  callingCode: {
    fontSize: GD_FONT_SIZE.medium,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL,
    marginLeft: 6,
    lineHeight: 20
  },
  countryChevron: {
    fontSize: 11,
    color: colors.LABEL_COLOR,
    marginLeft: 4,
    lineHeight: 14
  },
  phoneInputWrap: {
    flex: 1,
    height: '100%',
    justifyContent: 'center'
  },
  phoneInput: {
    width: '100%',
    fontSize: GD_FONT_SIZE.medium,
    fontFamily: FONT_FAMILY.regular,
    color: colors.TEXT_NORMAL,
    paddingHorizontal: 6,
    paddingRight: 10,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
    margin: 0,
    textAlignVertical: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null)
  },
  phoneInputLocked: {
    color: colors.LABEL_COLOR
  },
  helperText: {
    fontSize: GD_FONT_SIZE.small,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginTop: 0,
    marginBottom: 18,
    lineHeight: 18,
    minHeight: 18,
    ...androidFontFix
  },
  errorText: {
    color: '#E04646'
  },
  otpSection: {
    marginTop: 8,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8ECF4'
  },
  otpHint: {
    fontSize: GD_FONT_SIZE.normal,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    marginBottom: 6,
    lineHeight: 21,
    textAlign: 'center',
    ...androidFontFix
  },
  otpHintStrong: {
    color: colors.TEXT_HEADING,
    fontFamily: FONT_FAMILY.bold
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 10,
    marginBottom: 2,
    paddingVertical: 4,
    position: 'relative',
    overflow: 'visible'
  },
  otpHiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    left: 0,
    top: 0
  },
  otpBox: {
    borderWidth: 1.5,
    borderColor: '#E3E8F2',
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  otpBoxFilled: {
    borderColor: '#C9D8F8',
    backgroundColor: colors.WHITE
  },
  otpBoxFocused: {
    borderColor: colors.PRIMARY_BASIC,
    borderWidth: 2,
    backgroundColor: '#F3F7FF'
  },
  otpDigit: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_HEADING,
    textAlign: 'center',
    padding: 0,
    letterSpacing: 0.3,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null)
  },
  otpCaret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: colors.PRIMARY_BASIC
  },
  primaryButton: {
    marginTop: 22,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.PRIMARY_BASIC,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#0B1220',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      }
    })
  },
  doneButton: {
    marginTop: 4,
    marginBottom: 0
  },
  verifyButton: {
    marginTop: 18
  },
  primaryButtonReady: {
    backgroundColor: colors.PRIMARY_BASIC
  },
  primaryButtonDisabled: {
    backgroundColor: '#DCE5F8',
    shadowOpacity: 0,
    elevation: 0
  },
  primaryButtonLabel: {
    fontSize: GD_FONT_SIZE.large,
    fontFamily: FONT_FAMILY.regular,
    color: colors.WHITE,
    lineHeight: 24,
    letterSpacing: 0.2,
    textAlign: 'center',
    paddingHorizontal: 4,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null)
  },
  primaryButtonLabelDisabled: {
    color: '#8FA3D1'
  },
  buttonSpinner: {
    marginRight: 10
  },
  retrySection: {
    marginTop: 20,
    marginBottom: 2,
    alignItems: 'center',
    paddingHorizontal: 4
  },
  retryHint: {
    fontSize: GD_FONT_SIZE.small_m,
    fontFamily: FONT_FAMILY.regular,
    color: colors.LABEL_COLOR,
    lineHeight: 19,
    textAlign: 'center',
    ...androidFontFix
  },
  retryHintTime: {
    fontFamily: FONT_FAMILY.bold,
    color: colors.TEXT_NORMAL
  },
  retryChannelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%'
  },
  retryChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    marginBottom: 6,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E3E8F2',
    backgroundColor: '#F7F9FC',
    minWidth: 92
  },
  retryChannelLabel: {
    fontSize: GD_FONT_SIZE.small_m,
    fontFamily: FONT_FAMILY.regular,
    color: colors.PRIMARY_BASIC,
    marginLeft: 5,
    lineHeight: 18,
    ...androidFontFix
  },
  changeNumber: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 2,
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  changeNumberText: {
    fontSize: GD_FONT_SIZE.small_m,
    fontFamily: FONT_FAMILY.regular,
    color: colors.PRIMARY_BASIC,
    lineHeight: 20,
    ...androidFontFix
  }
});
