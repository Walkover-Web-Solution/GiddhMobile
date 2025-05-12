import BottomSheet from "@/components/BottomSheet";
import { APP_EVENTS, STORAGE_KEYS } from "@/utils/constants";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import moment from "moment";
import TOAST from "@/components/Toast";
import { Alert, DeviceEventEmitter, PermissionsAndroid, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { commonUrls } from "@/core/services/common/common.url";
import RNFetchBlob from 'react-native-blob-util'
import { CustomerVendorService } from "@/core/services/customer-vendor/customer-vendor.service";
import { useState } from "react";

const exportFile = async (uniqueName) => {
    try {
        console.log("hihiihih", uniqueName);
        
        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, { message: 'Downloading Started... It may take while', open: null });
        const activeBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
        const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
        const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

        // fetching base64 string
        const response = await fetch(commonUrls.downloadDetailedEWB(uniqueName)
            .replace(':companyUniqueName', activeCompany)
            .replace(':branchUniqueName', activeBranch), {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'session-id': token,
                'user-agent': Platform.OS
            },
        })

        if (!response.ok) {
            TOAST({ message: `Failed to fetch file: ${response.statusText}`, position: 'BOTTOM', duration: 'LONG' })
            //   setIsApiCallInProgress(false);
        }

        const jsonResponse = await response.json();
        //base64 str from response
        const base64String = jsonResponse?.body;

        if (!base64String) {
            TOAST({ message: 'Failed to fetch file', position: 'BOTTOM', duration: 'LONG' });
            //   setIsApiCallInProgress(false);
            throw new Error('Base64 data is missing in the response');
        }

        const { dirs } = RNFetchBlob.fs;
        const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
        const configfb = {
            fileCache: true,
            addAndroidDownloads: {
                notification: true,
                title: `DetailedEWAYB`,
                path: `${dirs.DownloadDir}/DetailedEWBill-${moment().format('DD-MM-YYYY-hh-mm-ss')}.pdf`,
            },
            notification: true,
            title: `DetailedEWAYB`,
            path: `${dirToSave}/DetailedEWBill-${moment().format('DD-MM-YYYY-hh-mm-ss')}.pdf`,
            IOSBackgroundTask: true,
        };
        const configOptions = Platform.select({
            ios: configfb,
            android: configfb,
        });

        await RNFetchBlob.fs.writeFile(configfb.path, base64String, 'base64');

        console.log('File saved successfully to:', configfb.path);
        if (Platform.OS === 'ios') {
            RNFetchBlob.ios.previewDocument(configfb.path);
        }
        //coping file to download folder
        if (Platform.OS == "android") {
            let result = await RNFetchBlob.MediaCollection.copyToMediaStore({
                name: 'DetailedEWBill-' + moment().format('DD-MM-YYYY-hh-mm-ss'),
                parentFolder: '',
                mimeType: 'application/pdf'
            },
                'Download', // Media Collection to store the file in ("Audio" | "Image" | "Video" | "Download")
                configfb.path // Path to the file being copied in the apps own storage
            );
            ToastAndroid.show(
                'File saved to download folder',
                ToastAndroid.LONG,
            );
        }

        //notification for complete download
        RNFetchBlob.android.addCompleteDownload({
            title: configfb.title,
            description: 'File downloaded successfully',
            mime: 'application/pdf',
            path: configfb.path,
            showNotification: true,
        })

        const openFile = Platform.OS === 'android'
            ? () => RNFetchBlob.android.actionViewIntent(configfb.path, 'application/pdf').catch((error) => { console.error('----- Error in File Opening -----', error) })
            : () => RNFetchBlob.ios.openDocument(configfb.path)

        DeviceEventEmitter.emit(APP_EVENTS.DownloadAlert, {
            message: 'Download Successful!',
            action: 'Open',
            open: openFile
        });

    } catch (e) {
        console.log('----- Error in Export -----', e)
    } finally {
        // setIsApiCallInProgress(false);
    }
};

const downloadEWayBill = async (uniqueName: string) => {
    try {
        if (Platform.OS == "android" && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
            }
        }
        await exportFile(uniqueName);
    } catch (err) {
        console.warn(err);
    }
}

const ActionModalize = ({modalizeRef, setBottomSheetVisible, selectedEWBill, cancelModalizeRef, addVehicleModalizeRef, setStateData}) => {
    const {styles} = useCustomTheme(getStyles);

    console.log("hello modal", selectedEWBill);

    const fetchAllStates = async () => {
        try {
            const response = await CustomerVendorService.getAllStateName("IN");
            if(response && response?.status == "success"){
                setStateData(response?.body?.stateList)
            }
        } catch (error) {
            console.log("Error while fetching states");
        }
    }
    
    return (
        <BottomSheet
            bottomSheetRef={modalizeRef}
            headerText={'Actions'}
            headerTextColor={'#084EAD'}
            adjustToContentHeight
            customRenderer={
                <View style={styles.modalStyle} >
                    <TouchableOpacity style={styles.button} onPress={()=>{
                        fetchAllStates();
                        setBottomSheetVisible(modalizeRef, false);
                        setBottomSheetVisible(addVehicleModalizeRef, true);
                    }}>
                        <Text style={styles.modalText}>Add vehicle details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={()=>{
                        downloadEWayBill(selectedEWBill?.ewbNo);
                        setBottomSheetVisible(modalizeRef, false);
                    }}>
                        <Text style={styles.modalText}>Download detailed eway</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={()=>{
                        setBottomSheetVisible(modalizeRef, false);
                        setBottomSheetVisible(cancelModalizeRef, true);
                    }}>
                        <Text style={styles.modalText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            }
        />
    )
}
const getStyles = (theme: ThemeProps) => StyleSheet.create({
    modalStyle: {
        backgroundColor: theme.colors.secondaryBackground,
        paddingHorizontal: 21,
        paddingVertical:10
    },
    semiBoldText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.fontSize.regular.size,
        lineHeight: theme.typography.fontSize.regular.lineHeight,
        color: theme.colors.primary,
        marginLeft:10
    },
    button: { 
        paddingVertical: 10,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.fontSize.large.size,
        lineHeight: theme.typography.fontSize.large.lineHeight,
        color: theme.colors.solids.black,
    }
});

export default ActionModalize;
