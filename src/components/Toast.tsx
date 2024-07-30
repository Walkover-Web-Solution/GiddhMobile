import React from 'react'
import { Platform, ToastAndroid } from 'react-native'
import TOAST from 'react-native-root-toast'

interface ToastProps {
    message: any,
    position?: 'BOTTOM' | 'TOP' | 'CENTER',
    duration?: 'LONG' | 'SHORT'
}
const Toast: React.FC<ToastProps> = ({ message, position = 'BOTTOM', duration = 'LONG' }) => {
    let customMessage = '';
    if (typeof message === 'string') {
        customMessage = message
    } else if (typeof message === 'object' && 'message' in message && typeof message.message === 'string') {
        customMessage = message?.message
    }else if (Array.isArray(message) && message.length === 1 && typeof message[0] === 'string') {
        customMessage = message[0];
    }else {
        customMessage = 'Something went wrong';
    }
    let toastPosition = Platform.OS == 'ios' ? TOAST.positions.BOTTOM : ToastAndroid.BOTTOM;
    if (position === 'TOP') {
        toastPosition = Platform.OS == 'ios' ? TOAST.positions.TOP : ToastAndroid.TOP;
    } else if (position === 'CENTER') {
        toastPosition = Platform.OS == 'ios' ? TOAST.positions.CENTER : ToastAndroid.CENTER;
    }
    let toastDuration = Platform.OS == 'ios' ? TOAST.durations.LONG : ToastAndroid.LONG;
    if (duration === 'SHORT') {
        toastDuration = Platform.OS == 'ios' ? TOAST.durations.SHORT : ToastAndroid.SHORT;
    }
    return (
        Platform.OS == 'ios' ?
            TOAST.show(customMessage, { duration: toastDuration, position: toastPosition }) :
            ToastAndroid.show(customMessage, toastDuration)
    )
}

export default Toast;
