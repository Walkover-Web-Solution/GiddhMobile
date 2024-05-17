import { Dimensions, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import Pdf from 'react-native-pdf';
import  Modal  from "react-native-modal";
import { Bars } from 'react-native-loader';
import { useEffect, useState } from "react";
import colors from "@/utils/colors";
import AsyncStorage from "@react-native-community/async-storage";
import { STORAGE_KEYS } from "@/utils/constants";
import RNFetchBlob from "rn-fetch-blob";
import Toast from "react-native-root-toast";

const Screen_width = Dimensions.get('window').width;
const PdfPreviewModal = ({modalVisible,setModalVisible,setLoading,isLoading,companyVersionNumber,uniqueName,voucherInfo }) => {
    const [pdfBlobUri,setPdfBlobUri] = useState("");
    
    const exportFile = async () => {
        try {
          const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
          const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
          RNFetchBlob.fetch(
            'POST',
            companyVersionNumber == 1 ? `https://api.giddh.com/company/${activeCompany}/accounts/${uniqueName}/vouchers/download-file?fileType=pdf` :
              `https://api.giddh.com/company/${activeCompany}/download-file?voucherVersion=${companyVersionNumber}&fileType=pdf&downloadOption=VOUCHER`,
            {
              'session-id': `${token}`,
              'Content-Type': 'application/json'
            },
            JSON.stringify(voucherInfo)
          ).then(async (res) => {
            if (res.respInfo.status != 200) {
            //   Platform.OS == "ios" ? this.setState({ DownloadModal: false }) : this.props.downloadModal(false)
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
              return
            }
            let base64Str = res.base64();
            setPdfBlobUri("data:application/pdf;base64,"+base64Str);
            // setModalVisible(false,false);
            setLoading(false);
          })
        } catch (e) {
            ToastAndroid.show("Something went wrong!", ToastAndroid.LONG)
            setModalVisible(false);
            setLoading(false);
        //   Platform.OS == "ios" ? this.setState({ DownloadModal: false }) : this.props.downloadModal(false)
            console.log(e);
        }
      };

    useEffect(() => {
        if(isLoading){
            exportFile();
        }
    },[isLoading])
    
    return ( 
        <Modal
            isVisible={modalVisible}
            backdropColor={'#000'}
            backdropOpacity={0.7}
            animationIn={'zoomIn'}
            animationOut={'zoomOut'}
            animationOutTiming={200}
            deviceHeight={Dimensions.get('window').height+50}
            onBackdropPress={() => {
                setModalVisible(false);
                setLoading(false);
            }}
            onBackButtonPress={()=>{
                setModalVisible(false)
                setLoading(false);
            }}
        >
            {!isLoading ? <View style={styles.container}>
                <Pdf
                    source={{uri:pdfBlobUri}}
                    trustAllCerts={false}
                    onLoadComplete={(numberOfPages,filePath) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page,numberOfPages) => {
                        console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                        ToastAndroid.show("Something went wrong!", ToastAndroid.LONG)
                        setModalVisible(false);
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
                <View style={styles.centeredView}>
                <Bars size={15} color={colors.PRIMARY_NORMAL} />
                </View>
            </View>}
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalStyle: { 
        backgroundColor:'red',borderWidth:2,
        borderColor:'red'
        // overflow: 'hidden',
    },
    container : {
        flex:1,
        margin:10,
        // marginBottom: 50,
        borderRadius:7 
    },
    pdf: {
        flex:1,
        borderRadius:12
        // width:Dimensions.get('window').width,
        // height:Dimensions.get('window').height,
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

export default PdfPreviewModal;