import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import BottomSheet from './BottomSheet'
import { FONT_FAMILY } from '@/utils/constants'

export const ConfirmationMessages = {
    DELETE_ENTRY: {
      message: 'Do you want to delete the selected Entry?',
      description: 'All their corresponding vouchers and invoices will be deleted permanently and will no longer be accessible from other modules.'
    },
    DELETE_VOUCHER: {
      message: 'Do you want to delete the voucher/invoice?',
      description: 'It will be deleted permanently and will no longer be accessible from any other module.'
    },
    LOGOUT: {
        message: 'Are you sure you want to logout?',
        description: 'You will lose all of your entries.'
    }
}

const ConfirmationBottomSheet = ({ bottomSheetRef, message, description = '', onConfirm, onReject }) => {
    return (
        <BottomSheet
            bottomSheetRef={bottomSheetRef}
            headerText='Confirmation'
            headerTextColor='#864DD3'
        >
            <View style={styles.confirmationSheetView} >
                <Text style={styles.boldText} >
                    {message}
                </Text>
                <Text style={styles.confirmationText} >
                    {description}          
                </Text>
                <View style={styles.confirmationInternalView}>
                    <TouchableOpacity
                        style={styles.confirmationButton}
                        onPress={onConfirm}
                    >
                        <Text style={styles.buttonText} >Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onReject}
                        style={styles.confirmationButton}
                    >
                        <Text style={styles.buttonText} >No</Text>
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
        width: 100,
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