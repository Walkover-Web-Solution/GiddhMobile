import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { Dispatch, SetStateAction, useState } from 'react';
import useCustomTheme, { ThemeProps } from '@/utils/theme';
import BottomSheet, { setBottomSheetVisible } from '@/components/BottomSheet';
import InputField from '@/components/InputField';
import colors from '@/utils/colors';
import { validateGST } from '@/utils/helper';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import Toast from '@/components/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface Props {
    bottomSheetRef: any
    setIsLoadingCreateBill: Dispatch<SetStateAction<boolean>>
    onCreateEwayBillAfterLogin: () => Promise<void>
}

const EwayBillLoginBottomSheet: React.FC<Props> = ({ bottomSheetRef, setIsLoadingCreateBill, onCreateEwayBillAfterLogin }) => {
    const { t } = useTranslation();
    const { bottom } = useSafeAreaInsets();
    const { styles } = useCustomTheme(getStyles);
    const [formData, setFormData] = useState({ userName: '', password: '', gstIn: '' });
    const isSubmitButtonEnabled = formData.userName.length > 0 && formData.password.length > 0 && validateGST(formData.gstIn).isValid;

    const handleFormData = (field: keyof typeof formData, value: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, [field]: value }));
    }

    const onLoginEwayBill = async () => {
        setIsLoadingCreateBill(true);
        try {
            const response = await InvoiceService.loginEwayBill(formData);
            if (response?.data?.status === 'success') {
                setBottomSheetVisible(bottomSheetRef, false);
                await onCreateEwayBillAfterLogin();
            }
        } catch (error: any) {
            Toast({ message: error?.data?.message ?? error?.data?.error });
        } finally {
            setIsLoadingCreateBill(false);
        }
    }

    return (
        <BottomSheet
            bottomSheetRef={bottomSheetRef}
            headerText={t('ewayBill.ewayBillCredentials')}
            headerTextColor={'#084EAD'}
            scrollViewProps={{
                keyboardShouldPersistTaps: 'handled'
            }}
        >
            <InputField
                lable={t('ewayBill.username')}
                placeholder={t('ewayBill.enterUsername')}
                containerStyle={styles.inputFieldStyle}
                value={formData.userName}
                onChangeText={(text) => handleFormData('userName', text)}
            />
            <InputField
                lable={t('ewayBill.password')}
                placeholder={t('ewayBill.enterPassword')}
                containerStyle={styles.inputFieldStyle}
                value={formData.password}
                onChangeText={(text) => handleFormData('password', text)}
            />
            <InputField 
                lable={t('ewayBill.gstin')}
                placeholder={t('ewayBill.enterGstin')}
                containerStyle={styles.inputFieldStyle}
                value={formData.gstIn}
                onChangeText={(text) => handleFormData('gstIn', text)}
            />
            <View style={[styles.buttonView, { marginBottom: bottom }]} >
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, { backgroundColor: isSubmitButtonEnabled ? colors.PRIMARY_NORMAL : colors.PRIMARY_DISABLED }]}
                    disabled={!isSubmitButtonEnabled}
                    onPress={onLoginEwayBill}
                >
                    <Text style={styles.buttonText} >{t('ewayBill.saveAndValidate')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.button}
                    onPress={() => setBottomSheetVisible(bottomSheetRef, false)}
                >
                    <Text style={[styles.buttonText, { color: colors.PRIMARY_NORMAL }]} >{t('common.cancel')}</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    )
}

const getStyles = (theme: ThemeProps) => StyleSheet.create({
    buttonView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    buttonText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.solids.white,
    },
    button: {
        borderRadius: 6,
        padding: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5
    },
    inputFieldStyle: {
        marginTop: 8,
        marginHorizontal: 16
    }
})

export default EwayBillLoginBottomSheet;