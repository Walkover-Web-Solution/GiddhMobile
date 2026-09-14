import { Dimensions, Platform, StyleSheet, ToastAndroid, View } from "react-native";
import Pdf from 'react-native-pdf';
import LoaderKit  from 'react-native-loader-kit';
import { useCallback, useEffect, useState } from "react";
import colors from "@/utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/utils/constants";
import RNFetchBlob from 'react-native-blob-util';
import Toast from "react-native-root-toast";
import Header from "@/components/Header";
import { useIsFocused } from "@react-navigation/native";
import useCustomTheme, { ThemeProps } from "@/utils/theme";
import { createEndpoint } from "@/utils/helper";

const Screen_width = Dimensions.get('window').width;
const PdfPreviewScreen = ( props: any ) => {
    const {styles, voucherBackground} = useCustomTheme(getStyles, 'PdfPreview');
    // Supports two usages:
    // 1. As a navigated screen -> params come from props.route.params
    // 2. As an in-screen modal -> params (and onClose) are passed directly as props
    const params = props?.route?.params ?? props;
    const {companyVersionNumber,uniqueName,voucherInfo,onClose} = params;
    const isFocused = useIsFocused();
    const voucherInfoKey = JSON.stringify(voucherInfo);
    const [pdfBlobUri,setPdfBlobUri] = useState("");
    const [pdfKey,setPdfKey] = useState(0);
    const [isLoading,setLoading] = useState(true);

    const exportFile = useCallback(async (isCancelled?: () => boolean) => {
        try {
          setLoading(true);
          setPdfBlobUri("");
          const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
          const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
          const res = await RNFetchBlob.fetch(
            'POST',
            companyVersionNumber == 1 ? createEndpoint(`company/${activeCompany}/accounts/${uniqueName}/vouchers/download-file?fileType=pdf`):
              createEndpoint(`company/${activeCompany}/download-file?voucherVersion=${companyVersionNumber}&fileType=pdf&downloadOption=VOUCHER`),
            {
              'session-id': `${token}`,
              'Content-Type': 'application/json'
            },
            voucherInfoKey
          );
          if (isCancelled?.()) return;
          if (res.respInfo.status != 200) {
            if (Platform.OS == "ios") {
              Toast.show(JSON.parse(res.data).message, {
                duration: Toast.durations.LONG,
                position: -200,
                hideOnPress: true,
                backgroundColor: "#1E90FF",
                textColor: "white",
                opacity: 1,
                shadow: false,
                animation: true,
                containerStyle: { borderRadius: 10 }
              });
            } else {
              ToastAndroid.show(JSON.parse(res.data).message, ToastAndroid.LONG)
            }
            setLoading(false);
            return
          }
          let base64Str = res.base64();
          setPdfBlobUri("data:application/pdf;base64,"+base64Str);
          setPdfKey((prev) => prev + 1);
          setLoading(false);
        } catch (e) {
            if (isCancelled?.()) return;
            ToastAndroid.show("Something went wrong!", ToastAndroid.LONG)
            setLoading(false);
            console.log(e);
        }
      }, [companyVersionNumber, uniqueName, voucherInfoKey]);

    // Refetch whenever preview is opened/focused so stale PDFs are never reused
    // across voucher list, transactions, and create/update screens.
    useEffect(() => {
        if (!isFocused) return;
        let cancelled = false;
        exportFile(() => cancelled);
        return (()=>{
            cancelled = true;
            setLoading(true);
            setPdfBlobUri("");
        })
    },[isFocused, exportFile])
    
    return ( 
        <View style={styles.container}>
            <Header header={'Pdf Preview'} isBackButtonVisible={true} backgroundColor={voucherBackground} onBackButtonPress={onClose} />
            <View style={styles.container}>
                {!isLoading ? <View style={styles.container}>
                    <Pdf
                        key={pdfKey}
                        source={{uri:pdfBlobUri}}
                        renderActivityIndicator={()=>(<></>)}
                        trustAllCerts={false}
                        onLoadComplete={(numberOfPages,filePath) => {
                            console.log(`Number of pages: ${numberOfPages}`);
                        }}
                        onPageChanged={(page,numberOfPages) => {
                            console.log(`Current page: ${page}`);
                        }}
                        onError={(error) => {
                            ToastAndroid.show("Something went wrong!", ToastAndroid.LONG)
                            setLoading(false);
                        }}
                        onPressLink={(uri) => {
                            console.log(`Link pressed: ${uri}`);
                        }}
                        style={styles.pdf}
                    />
                </View>
                : 
                <View style={styles.loadContainer}>
                    <LoaderKit
                        style={{ width: 45, height: 45 }}
                        name={'LineScale'}
                        color={colors.PRIMARY_NORMAL}
                    />
                </View>}
            </View>
        </View>
    );
}

const getStyles = (theme: ThemeProps)=> StyleSheet.create({
    modalStyle: { 
        backgroundColor:'red',borderWidth:2,
        borderColor:'red'
    },
    container : {
        flex:1,
    },
    pdf: {
        flex:1,
        borderRadius:12
    },
    loadContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredView: {
        flexDirection: 'column',
        width: Screen_width * 0.7,
        paddingVertical: 20,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        alignSelf: 'center',
        borderRadius: 15,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default PdfPreviewScreen;
