import { useEffect, useState } from "react";
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { BiometricAuth } from '@msg91comm/sendotp-react-native'
import Toast from "@/components/Toast";
import { useDispatch } from "react-redux";
import { resetBiometricAuthentication, toggleBiometricAuthentication } from "@/screens/Auth/Login/LoginAction";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import Feather from 'react-native-vector-icons/Feather';

const AppLock = ({visible, onUnlock}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [availableBiometricType, setAvailableBiometricType] = useState("");
    const {styles} = useCustomTheme(getStyles, 'Payment');
    const dispatch = useDispatch();
    useEffect(() => {
        console.log("applock mount");
        
      authenticateUser();
      return (
        ()=>{
            console.log("applock unmount");
            
        }
      )
    }, []);

    const authenticateUser = async () => {
        try {
            const { available, biometryType } = await BiometricAuth.isSensorAvailable();
            console.log("bio", biometryType);
            setAvailableBiometricType(biometryType? biometryType : "");
            
            if (!available) {
                // Toast({message: 'Biometrics not available. Use PIN.', position:'CENTER', duration:'LONG'})
                const response = await BiometricAuth.simplePrompt({
                    promptMessage: 'Enter lock screen password',
                    allowDeviceCredentials: true
                })
                console.log("res", response);
                if (response?.success) {
                    setIsAuthenticated(true);
                    onUnlock();
                }else {
                    console.log("error for pin",response);
                    
                    if(response?.code == 14){
                        dispatch(resetBiometricAuthentication());
                        Toast({message: response?.error, position:'BOTTOM', duration:'LONG'});
                        return;
                    }
                    if(Platform.OS=='ios' && response?.code == -5){
                        console.log("bhaisab passcode bhi nahi h");
                        dispatch(resetBiometricAuthentication());
                        Toast({message: response?.error, position:'BOTTOM', duration:'LONG'});
                        return ;
                    }
                    setErrorMessage('Authentication failed. Please try again.');
                }
                return;
            }
        
            const response = await BiometricAuth.simplePrompt({
                promptMessage: 'Biometric Authentication',
                allowDeviceCredentials: true
            });
        
            if (response?.success) {
                setIsAuthenticated(true);
                setErrorMessage("");
                onUnlock();
            } else {
                console.log("erroe", response);
                setErrorMessage(response?.error)
            //   Alert.alert('Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setErrorMessage('Something went wrong during authentication. Please try again.');
        }
    };
    
      if (isAuthenticated) return null; // If authenticated, show nothing (or main app)
    
    return (
        <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback>
            <View style={styles.modal}>
                <Feather name="lock" size={35} color={'#fff'} />
                <Text style={styles.heading}>Giddh Locked</Text>
                <TouchableOpacity onPress={authenticateUser} style={styles.button} activeOpacity={0.7}>
                    <Text style={styles.buttonText}>Try{availableBiometricType ? " "+availableBiometricType+" " : " "}Again</Text>
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
        backgroundColor: 'rgba(191, 191, 191, 0.77)', // soft pink with opacity
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
        color: '#fff',
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