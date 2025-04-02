import { useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { BiometricAuth } from '@msg91comm/sendotp-react-native'
import Toast from "@/components/Toast";

const AppLock = ({visible, onUnlock}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
      authenticateUser();
      return (
        ()=>{
            console.log("unmount");
            
        }
      )
    }, []);

    const authenticateUser = async () => {
        const { available, biometryType } = await BiometricAuth.isSensorAvailable();
    
        if (!available) {
            // Toast({message: 'Biometrics not available. Use PIN.', position:'CENTER', duration:'LONG'})
            const {success:response} = await BiometricAuth.simplePrompt({
                promptMessage: 'Enter Pin',
                allowDeviceCredentials: true
            })
            console.log("res", response);
            if (response) {
                setIsAuthenticated(true);
                onUnlock();
            }
            return;
        }
    
        const response = await BiometricAuth.authenticate();
    
        if (response?.success) {
          setIsAuthenticated(true);
          setErrorMessage("");
          onUnlock();
        } else {
            console.log("erroe", response);
            setErrorMessage(response?.error)
        //   Alert.alert('Authentication failed');
        }
      };
    
      if (isAuthenticated) return null; // If authenticated, show nothing (or main app)
    
    return (
        <Modal visible={visible} transparent>
            <TouchableWithoutFeedback>
            <View style={style.modal}>
                <TouchableWithoutFeedback>
                <View style={style.modalInner}>
                    <TouchableOpacity onPress={authenticateUser}>
                        <Text>Unlock First</Text>
                        {errorMessage ? <Text>{errorMessage}</Text> : null}
                    </TouchableOpacity>
                </View>
                </TouchableWithoutFeedback>
            </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}
export default AppLock;

const style = StyleSheet.create({
    loaderContainer: { 
        right: 0, 
        left: 0, 
        top: 0, 
        bottom: 0, 
        position: 'absolute', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backfaceVisibility: 'hidden',
        backgroundColor: 'rgba(4, 4, 4, 0.5)'
    },
    modal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
    
      modalInner: {
        height: '100%',
        width:'100%',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(189, 195, 199, 0.9)'
      },
});