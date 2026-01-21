import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BottomSheet from './BottomSheet'
import { FONT_FAMILY } from '@/utils/constants'
import { useTranslation } from 'react-i18next'

export const ConfirmationMessages = {
    DELETE_ENTRY: {
      message: 'confirmation.deleteEntry.message',
      description: 'confirmation.deleteEntry.description'
    },
    DELETE_VOUCHER: {
      message: 'confirmation.deleteVoucher.message',
      description: 'confirmation.deleteVoucher.description'
    },
    LOGOUT: {
        message: 'confirmation.logout.message',
        description: 'confirmation.logout.description'
    },
    APPLOCK: {
        message: 'confirmation.appLock.message',
        description: 'confirmation.appLock.description',
        confirmText: 'confirmation.appLock.confirmText',
        rejectText: 'confirmation.appLock.rejectText'
    }
}

const ConfirmationBottomSheet = ({ bottomSheetRef, message, description = '', onConfirm, onReject, confirmText, rejectText }) => {
    const { t } = useTranslation();
    
    return (
        <BottomSheet
            bottomSheetRef={bottomSheetRef}
            headerText={t('confirmation.title')}
            headerTextColor='#864DD3'
        >
            <View style={styles.confirmationSheetView} >
                <Text style={styles.boldText} >
                    {t(message)}
                </Text>
                <Text style={styles.confirmationText} >
                    {description ? t(description) : ''}          
                </Text>
                <View style={styles.confirmationInternalView}>
                    <TouchableOpacity
                        style={styles.confirmationButton}
                        onPress={onConfirm}
                    >
                        <Text style={styles.buttonText} >{t(confirmText) || t('common.yes')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onReject}
                        style={styles.confirmationButton}
                    >
                        <Text style={styles.buttonText} >{t(rejectText) || t('common.no')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheet>
    )
}

ConfirmationBottomSheet.ConfirmationMessages = ConfirmationMessages;

export default ConfirmationBottomSheet

const styles = StyleSheet.create({
    confirmationSheetView: {
        marginHorizontal: 16
    },
    regularText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 16,
        color: '#000000',
        marginVertical: 10
    },
    boldText: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: '#000000',
        marginVertical: 10
    },
    confirmationText: {
        fontFamily: FONT_FAMILY.semibold,
        fontSize: 16,
        color: '#000000',
        lineHeight: 20

    },
    confirmationInternalView: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-end',
        marginVertical: 20
    },
    confirmationButton: {
        borderRadius: 5,
        backgroundColor: '#864DD3',
        padding: 10,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5
    },
    buttonText: {
        fontFamily: FONT_FAMILY.bold,
        fontSize: 16,
        color: '#ffffff',
    },
    swipeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    }
})