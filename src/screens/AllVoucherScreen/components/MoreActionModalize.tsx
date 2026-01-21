import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet from '@/components/BottomSheet';
import Toast from '@/components/Toast';
import { APP_EVENTS } from '@/utils/constants';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const _MoreActionBottomSheet: React.ForwardRefRenderFunction<{}, { open: (data: any) => void;}> = ({downloadFile, shareFile }, ref) => {
    const [data, setData]:any = useState({});
    const bottomSheetRef = useRef(null);
    const navigation = useNavigation();
    const { styles } = useCustomTheme(getVoucherStyles);
    const { t } = useTranslation();
    useImperativeHandle(ref, () => ({
        open: (data: any) => {
            setData(data);
            bottomSheetRef?.current?.open();
        }
    }));
    
    return (
    <BottomSheet
      bottomSheetRef={bottomSheetRef}
      headerText={t('common.voucherOptions')}
      headerTextColor="#084EAD"
      adjustToContentHeight
      customRenderer={(
        <View style={styles.iconContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={styles.iconButton}
            onPress={() => {
              bottomSheetRef.current?.close();
              shareFile(data?.voucherUniqueName, data?.voucherNumber);
            }}
          >
            <Feather name="send" size={20} color="#1C1C1C" />
            <Text style={styles.modalText}>{t('common.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10 }}
            style={styles.iconButton}
            onPress={() => {
              bottomSheetRef.current?.close();
              downloadFile(data?.voucherUniqueName, data?.voucherNumber);
            }}
          >
            <Feather name="download" size={20} color="#1C1C1C" />
            <Text style={styles.modalText}>{t('common.download')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10 }}
            onPress={() => {
              bottomSheetRef.current?.close();
              navigation.navigate('PdfPreviewScreen', {
                companyVersionNumber: data?.companyVoucherVersion,
                uniqueName: data?.accountUniqueName,
                voucherInfo: {
                  voucherNumber: [data?.voucherNumber],
                  uniqueName: data?.voucherUniqueName,
                  voucherType: data?.voucherName.toLowerCase(),
                },
              });
            }}
          >
            <MaterialCommunityIcons name="file-eye-outline" size={20} color="#000" />
            <Text style={styles.modalText}>{t('common.preview')}</Text>
          </TouchableOpacity>

          {data?.voucherName === "Sales" && !(data?.isConsolidatedBranch) && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.iconButton}
                hitSlop={{ top: 10, bottom: 10 }}
                onPress={async () => {
                  if (
                    data?.accountDetail?.billingDetails?.pincode &&
                    data?.accountDetail?.billingDetails?.pincode?.length > 0
                  ) {
                    bottomSheetRef.current?.close();
                    await DeviceEventEmitter.emit(APP_EVENTS.EWayBillScreenRefresh, {});
                    navigation.navigate('EWayBillScreen', {
                      isSalesCashInvoice:data?.isSalesCashInvoice,
                      accountUniqueName:data?.accountUniqueName,
                      companyVersionNumber:data?.companyVoucherVersion,
                      voucherInfo: {
                        voucherNumber:data?.voucherNumber,
                        uniqueName: data?.voucherUniqueName,
                        voucherType: data?.voucherName.toLowerCase(),
                      },
                      accountDetail: data?.accountDetail,
                      key: data?.voucherUniqueName,
                    });
                  } else {
                    Toast({
                      message: t('common.pleaseUpdatePincode'),
                      position: 'BOTTOM',
                      duration: 'LONG',
                    });
                  }
                }}
              >
                <MaterialCommunityIcons name="truck-fast-outline" size={20} color="#000" />
                <Text style={styles.modalText}>{t('common.generateEWayBill')}</Text>
              </TouchableOpacity>
          )}
        </View>
      )}
    />
);
}

const MoreActionBottomSheet = forwardRef(_MoreActionBottomSheet)
export { MoreActionBottomSheet }


const getVoucherStyles = (theme: ThemeProps) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    voucherNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    name: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text
    },
    amount: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize.large.size,
        color: theme.colors.text
    },
    voucherNumber: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.text
    },
    iconButton: {
        paddingVertical:11,
        paddingHorizontal:18,
        flexDirection:'row',
        alignItems:'center'
    },
    iconContainer: {
        paddingHorizontal:0
    },
    date: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        color: theme.colors.text
    },
    smallMediumText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.text
    },
    chip: {
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 5 
    },
    chipText : {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.solids.white
    },
    overDueText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.small.size,
        color: theme.colors.solids.red.dark
    },
    deleteButton: {
        backgroundColor: theme.colors.solids.red.light, 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingHorizontal: 28,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50
    },
    editButton: {
        backgroundColor: theme.colors.solids.green.light, 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingHorizontal: 28,
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50
    },
    modalText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        color: theme.colors.solids.black,
        marginLeft:12
    }
})
