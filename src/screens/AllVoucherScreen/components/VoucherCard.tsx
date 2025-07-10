import { capitalizeName, formatAmount } from '@/utils/helper'
import useCustomTheme, { ThemeProps } from '@/utils/theme'
import moment from 'moment'
import React, { memo, useRef, useState } from 'react'
import { DeviceEventEmitter, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { Swipeable } from 'react-native-gesture-handler'
import DateChipSeparator from './DateChipSeparator'
import { useNavigation } from '@react-navigation/native'
import { APP_EVENTS } from '@/utils/constants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PdfPreviewModal from '@/screens/Parties/components/PdfPreviewModal'
import BottomSheet from '@/components/BottomSheet'
import Toast from '@/components/Toast'

type Props = {
    ref:any,
    name: string
    accountUniqueName: string
    amount: number
    currencySymbol: string
    voucherNumber: string
    voucherUniqueName: string
    voucherDate: string
    balanceStatus: 'PAID' | 'UNPAID' | 'PARTIAL-PAID' | 'HOLD' | 'OPEN' | 'ISSUED' | string
    dueDate: string
    dueAmount: number
    date: string | null
    voucherName : string
    showDivider: boolean
    isSalesCashInvoice: boolean
    companyVoucherVersion: number
    shareFile: (uniqueName: string, voucherNumber: string) => void
    downloadFile: (uniqueName: string, voucherNumber: string) => void
    onPressDelete: (accountUniqueName: string, voucherUniqueName: string, voucherType: string) => void,
    accountDetail: any
}

const _RenderVoucher : React.FC<Props> = ({ 
    ref,
    name,
    accountUniqueName,
    amount,
    currencySymbol,
    voucherNumber,
    voucherUniqueName,
    voucherDate,
    balanceStatus,
    dueDate,
    dueAmount,
    date, 
    voucherName, 
    showDivider, 
    isSalesCashInvoice,
    companyVoucherVersion,
    shareFile, 
    downloadFile,
    onPressDelete, 
    accountDetail
}) => {
    const swipeableRef = useRef<Swipeable>(null);
    const navigation = useNavigation();
    const { theme, styles } = useCustomTheme(getVoucherStyles)
    const overDueDays : number = moment().clone().startOf('day').diff(moment(dueDate, 'DD MM YYYY'), 'days')
    const [pdfPreviewLoading,setpdfPreviewLoading] = useState(false);
    const [pdfModalVisible,setpdfModalVisible] = useState(false);
    const moreActionModalizeRef = useRef(null);
    const isOverDue : boolean =(balanceStatus !== 'PAID' && balanceStatus !== 'HOLD' && balanceStatus !== 'CANCEL') && (!!dueDate && overDueDays >= 0)

    const setBottomSheetVisible = (modalRef: React.Ref<BottomSheet>, visible: boolean) => {
        if(visible){
          Keyboard.dismiss();
          modalRef?.current?.open();
        } else {
          modalRef?.current?.close();
        }
    };


    return (
        <>
            <DateChipSeparator date={date} showDivider={showDivider}/>
            <Swipeable
                ref={swipeableRef}
                renderRightActions={(progress, dragX) => {
                    const trans = dragX.interpolate({
                        inputRange: [-200, -80, 0],
                        outputRange: [10, 0, 90],
                    });
                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.deleteButton, { transform: [{ translateX: trans }] }]}
                            onPress={() => {
                                swipeableRef?.current?.close();
                                onPressDelete(accountUniqueName, voucherUniqueName, voucherName.toLowerCase())
                            }}

                        >
                            <Feather name="trash-2" size={17} color={'#1C1C1C'} />
                        </TouchableOpacity>
                    )
                }}
                {...( voucherName.toLowerCase() !== 'receipt' && voucherName.toLowerCase() !== 'payment' &&
                    { renderLeftActions: (progress, dragX) => {
                        const trans = dragX.interpolate({
                            inputRange: [0, 80, 200],
                            outputRange: [-90, 0, -10],
                        });
                        return (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.editButton, { transform: [{ translateX: trans }] }]}
                                onPress={() => {
                                    console.log(voucherName.toLowerCase())
                                    swipeableRef?.current?.close();
                                    if(voucherName.toLowerCase() !== 'sales' && voucherName.toLowerCase() !== 'purchase' && voucherName.toLowerCase() !== 'credit note' && voucherName.toLowerCase() !== 'debit note'){
                                        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Currently we do not support updating Receipt and Payment vouchers on mobile app.', open: null })
                                        return;
                                    }

                                    const params = {
                                        accountUniqueName: isSalesCashInvoice ? name : accountUniqueName, 
                                        voucherUniqueName,
                                        voucherNumber,
                                        voucherName: voucherName.toLowerCase(),
                                        isSalesCashInvoice,
                                        refetchDataOnNavigation: Math.floor(Math.random() * 1000).toString().padStart(3, '0') // A random string to trigger data refresh on navigating update voucher screen
                                    }
                                    if (voucherName.toLowerCase() === 'sales') {
                                        navigation.navigate('SalesVoucherUpdateStack', { screen: 'VoucherUpdateScreen', params })
                                    }
                                    if (voucherName.toLowerCase() === 'purchase') {
                                        navigation.navigate('PurchaseVoucherUpdateStack', { screen: 'VoucherUpdateScreen', params })
                                    } 
                                    if (voucherName.toLowerCase() === 'credit note') {
                                        navigation.navigate('CreditNoteUpdateStack', { screen: 'VoucherUpdateScreen', params })
                                    } 
                                    if (voucherName.toLowerCase() === 'debit note') {
                                        navigation.navigate('DebitNoteUpdateStack', { screen: 'VoucherUpdateScreen', params })
                                    } 
                                }}

                            >
                                <Feather name="edit-3" size={17} color={'#1C1C1C'} />
                            </TouchableOpacity>
                        )
                    }}
                )}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles?.button}
                    onPress={() => ref?.current?.open({
                        voucherName,
                        voucherUniqueName,
                        voucherNumber,
                        companyVoucherVersion,
                        accountUniqueName,
                        accountDetail,
                        isSalesCashInvoice
                    })}
                >
                    <View style={styles.row}>
                        <Text style={styles?.name}>{name}</Text>
                        <Text style={styles.amount}>{`${currencySymbol} ${formatAmount(amount)}`}</Text>
                    </View>
                    <View style={styles.voucherNumberRow}>
                        <Text style={styles.voucherNumber}>{`#${voucherNumber}`}</Text>
                        <Text style={styles.smallMediumText}>{`Due: ${currencySymbol} ${formatAmount(dueAmount)}`}</Text>
                    </View>
                    { !(voucherName === 'Receipt' || voucherName === 'Payment') &&
                        <View style={styles.row}>
                            { !isOverDue 
                                ?
                                    <View 
                                        style={[styles.chip, 
                                            { 
                                                backgroundColor: balanceStatus === 'PARTIAL-PAID' ? '#6C63FF' 
                                                    :  (balanceStatus === 'PAID' || balanceStatus === 'ISSUED') ? '#229F5F' 
                                                        : balanceStatus === 'CANCEL' ? '#DC143C'
                                                            : balanceStatus === 'HOLD' ? '#999999'
                                                                : '#E49D19'
                                            }
                                        ]}
                                    >
                                        <Text style={styles.chipText}>
                                            {capitalizeName(balanceStatus)}
                                        </Text>
                                    </View>
                                :   
                                    <Text style={styles.overDueText}><AntDesign name="exclamationcircleo" size={12} /> Overdue By {overDueDays === 0 ? 'Today' : `${overDueDays} Days`}</Text>
                            }
                        </View>
                    }
                </TouchableOpacity>
            </Swipeable>
        </>
    )
}

const RenderVoucher = memo(_RenderVoucher);


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
        flexDirection:'row',
        alignItems:'center'
    },
    iconContainer: {
        paddingHorizontal:18
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

export default RenderVoucher;