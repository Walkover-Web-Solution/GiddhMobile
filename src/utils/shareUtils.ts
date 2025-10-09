import { PermissionsAndroid, Platform } from "react-native";
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share'


export const checkStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') return true;
    if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 33) return true; // Android 13+ doesn't need this permission
    try {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        return granted;
    } catch (error) {
        console.log('Error checking storage permission:', error);
        return false;
    }
}

export const nativeAndroidShare = async (pdfLocation: string, pdfName: string): Promise<boolean> => {
    try {
        if (Platform.OS !== 'android') {
            return false;
        }
        const shareResult = await RNFetchBlob.android.actionViewIntent(
            pdfLocation, 
            'application/pdf'
        );
        console.log('Native Android share result:', shareResult);
        return true;
    } catch (error) {
        console.log('Native Android share failed:', error);
        return false;
    }
};

export const fallbackShare = async (pdfLocation: string, pdfName: string): Promise<boolean> => {
    try {
        await Share.open({
            title: 'This is the report',
            url: `file://${pdfLocation}`,
            subject: 'Transaction report'
        });
        console.log('Fallback share successful');
        return true;
    } catch (error) {
        console.log('Fallback share failed:', error);
        return false;
    }
};

export const attemptShare = async (pdfLocation: string, pdfName: string): Promise<boolean> => {        
    try {
        if (Platform.OS === 'android') {
            const nativeSuccess = await nativeAndroidShare(pdfLocation, pdfName);
            if (nativeSuccess) {
                console.log('Native Android share successful');
                return true;
            }
            console.log('Native Android share failed, trying fallback...');
        }
        
        const fallbackSuccess = await fallbackShare(pdfLocation, pdfName);
        if (fallbackSuccess) {
            console.log('Fallback share successful');
            return true;
        }
        return false;
    } catch (error) {
        console.log(`Share attempt failed:`, error);
        return false;
    }
};