import { useEffect, useState } from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { BiometricAuth } from '@msg91comm/sendotp-react-native'
import Toast from "@/components/Toast";
import { useDispatch } from "react-redux";
import { resetBiometricAuthentication } from "@/screens/Auth/Login/LoginAction";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from "react-i18next";

const AppLock = ({visible, onUnlock}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [availableBiometricType, setAvailableBiometricType] = useState("");
    const {styles, theme} = useCustomTheme(getStyles, 'Payment');
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
      authenticateUser();
    }, []);

    const authenticateUser = async () => {
        try {
            const { available, biometryType } = await BiometricAuth.isSensorAvailable();
            setAvailableBiometricType(biometryType? biometryType : "");
            if (!available) {
                const response = await BiometricAuth.simplePrompt({
                    promptMessage: t('appLock.enterPassword'),
                    allowDeviceCredentials: true
                })
                if (response?.success) {
                    setIsAuthenticated(true);
                    onUnlock();
                }else {
                    if(response?.code == 14){
                        dispatch(resetBiometricAuthentication());
                        Toast({message: response?.error, position:'BOTTOM', duration:'LONG'});
                        return;
                    }
                    if(Platform.OS=='ios' && response?.code == -5){
                        dispatch(resetBiometricAuthentication());
                        Toast({message: response?.error, position:'BOTTOM', duration:'LONG'});
                        return ;
                    }
                    setErrorMessage(t('appLock.authFailed'));
                }
                return;
            }
        
            const response = await BiometricAuth.simplePrompt({
                promptMessage: t('appLock.biometricAuth'),
                allowDeviceCredentials: true
            });
        
            if (response?.success) {
                setIsAuthenticated(true);
                setErrorMessage("");
                onUnlock();
            } else {
                setErrorMessage(response?.error)
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setErrorMessage(t('appLock.authError'));
        }
    };
    
    if (isAuthenticated) return null;
    
    return (
        <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback>
            <View style={styles.modal}>
                <Feather name="lock" size={35} color={theme.colors.solids.white} />
                <Text style={styles.heading}>{t('appLock.locked')}</Text>
                <TouchableOpacity onPress={authenticateUser} style={styles.button} activeOpacity={0.7}>
                    <Text style={styles.buttonText}>
                        {availableBiometricType 
                            ? t('appLock.tryBiometricAgain', { type: availableBiometricType })
                            : t('appLock.tryAgain')}
                    </Text>
                </TouchableOpacity>
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>
        </TouchableWithoutFeedback>
        </Modal>
    )
}
export default AppLock;

const getStyles = (theme:ThemeProps) => StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(3,3,3,0.9)',
      },
      button: {
        backgroundColor: 'rgba(191, 191, 191, 0.77)',
        paddingVertical: 15,
        paddingHorizontal: 19,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop:15,
      },
      buttonText: {
        color: '#333',
        fontSize: theme.typography.fontSize.xLarge.size,
        fontFamily: theme.typography.fontFamily.semiBold,
      },
      heading: {
        color: theme.colors.solids.white,
        fontSize: theme.typography.fontSize.xxxLarge.size,
        fontFamily: theme.typography.fontFamily.bold,
        marginTop:5,
      },
      errorText: {
        color: '#FF6B6B',
        fontSize: theme.typography.fontSize.regular.size,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 10,
        textAlign: 'center',
      },
});