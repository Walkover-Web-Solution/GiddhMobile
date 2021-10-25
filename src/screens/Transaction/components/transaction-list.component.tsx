import React from 'react';
import { Alert, Text, View, PermissionsAndroid, TouchableOpacity, Linking, Platform, Dimensions, ToastAndroid } from 'react-native';
import styles from '@/screens/Transaction/components/styles';
import colors from '@/utils/colors';
import { GdSVGIcons } from '@/utils/icons-pack';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-community/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import getSymbolFromCurrency from 'currency-symbol-map';
import { Bars } from 'react-native-loader';
import color from '@/utils/colors';
import ShareModal from '../../Parties/components/sharingModal';
import DownloadModal from '../../Parties/components/downloadingModal';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import TOAST from 'react-native-root-toast';

class TransactionList extends React.Component {
  listData = [
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Sales',
      invoice: '9879',
      date: '05 Jul 20',
      total: '500000',
      bal: '500000',
      email: 'proxqima@appdividend.com'
    },
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Purchase',
      invoice: '9879',
      date: '05 Jul 20',
      total: '500000',
      bal: '10000',
      email: 'ebofny@appdividend.com'
    },
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Contra',
      invoice: '9879',
      date: '05 Jul 20',
      bal: '10000',
      email: 'proxafaima@appdividend.com'
    },
    {
      title: 'Shubhendra Agrawal',
      type: 'Payment',
      invoice: '9879',
      date: '05 Jul 20',
      bal: '10000',
      email: 'ebsonyfa@appdividend.com'
    }
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      DownloadModal: false,
      iosShare: false
    };
  }

  componentDidMount() { }

  downloadFile = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.exportFile();
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.exportFile();
        } else {
          this.props.downloadModal(false);
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      this.props.downloadModal(false);
      console.warn(err);
    }
  };

  shareFile = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.onShare();
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.onShare();
        } else {
          this.setState({ iosShare: false });
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      this.setState({ iosShare: false });
      console.warn(err);
    }
  };

  exportFile = async () => {
    try {
      await Platform.OS == "ios" ? this.setState({ DownloadModal: true }) : null
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'POST',
        `https://api.giddh.com/company/${activeCompany}/accounts/${this.props.item.particular.uniqueName}/vouchers/download-file?fileType=pdf`,
        {
          'session-id': `${token}`,
          'Content-Type': 'application/json'
        },
        JSON.stringify({
          voucherNumber: [`${this.props.item.voucherNo}`],
          voucherType: `${this.props.item.voucherName}`
        })
      ).then(async (res) => {
        if (res.respInfo.status != 200) {
          Platform.OS == "ios" ? this.setState({ DownloadModal: false }) : this.props.downloadModal(false)
          if (Platform.OS == "ios") {
            TOAST.show(JSON.parse(res.data).message, {
              duration: TOAST.durations.LONG,
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
        let base64Str = await res.base64();
        let pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo + " " + new Date()}.pdf`;
        await RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
        if (Platform.OS === "ios") {
          let pdfLocation = await `${RNFetchBlob.fs.dirs.DocumentDir}/${this.props.item.voucherNo + " " + new Date()}.pdf`;
          await this.setState({ DownloadModal: false })
          await setTimeout(() => { RNFetchBlob.ios.openDocument(pdfLocation) }, 200)
        } else {
          this.props.downloadModal(false)
        }
      })
    } catch (e) {
      Platform.OS == "ios" ? this.setState({ DownloadModal: false }) : this.props.downloadModal(false)
      console.log(e);
    }
  };

  onShare = async () => {
    try {
      // await Platform.OS == "ios" ? this.setState({ DownloadModal: true }) : null
      const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
      RNFetchBlob.fetch(
        'POST',
        `https://api.giddh.com/company/${activeCompany}/accounts/${this.props.item.particular.uniqueName}/vouchers/download-file?fileType=pdf`,
        {
          'session-id': `${token}`,
          'Content-Type': 'application/json'
        },
        JSON.stringify({
          voucherNumber: [`${this.props.item.voucherNo}`],
          voucherType: `${this.props.item.voucherName}`
        })
      )
        .then(async (res) => {
          const base64Str = await res.base64();
          const pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${this.props.item.voucherNo}.pdf`;
          await RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          await this.setState({ iosShare: false });
          if (Platform.OS === "ios") {
            // await this.setState({ DownloadModal: false })
            await RNFetchBlob.ios.previewDocument(pdfLocation)
          }
          // else {
          //   await this.props.downloadModal(false);
          // }
        }).then(async () => {
          await Share.open({
            title: 'This is the report',
            //message: 'Message:',
            url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.CacheDir}/${this.props.item.voucherNo}.pdf`,
            subject: 'Transaction report'
          })
            .then((res) => {
              console.log(res);
            })
            .catch(() => {
              // err && console.log(err);
            });
        });
    } catch (e) {
      this.setState({ iosShare: false });
      // this.props.downloadModal(false);
      // this.setState({ DownloadModal: false })
      console.log(e);
    }
  };

  permissonWhatsapp = async () => {
    try {
      if (Platform.OS == "ios") {
        await this.onWhatsApp();
      } else {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('yes its granted');
          await this.onWhatsApp();
        } else {
          Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onWhatsApp = async () => {
    Linking.canOpenURL(`whatsapp://send?phone=${this.props.phoneNo.replace(/\D/g, '')}&text=${''}`)
      .then(async (supported) => {
        if (!supported) {
          Alert.alert('', 'Please install whats app to send direct message via whats app');
        } else {
          try {
            this.setState({ iosShare: true })
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
            const shareOptions = {
              title: 'Share via',
              message: 'Voucher share',
              url: `file://${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`,
              social: Share.Social.WHATSAPP,
              whatsAppNumber: this.props.phoneNo.replace(/\D/g, ''),
              filename: 'Voucher share'
            };
            RNFetchBlob.fetch(
              'POST',
              `https://api.giddh.com/company/${activeCompany}/accounts/${this.props.item.particular.uniqueName}/vouchers/download-file?fileType=pdf`,
              {
                'session-id': `${token}`,
                'Content-Type': 'application/json'
              },
              JSON.stringify({
                voucherNumber: [`${this.props.item.voucherNo}`],
                voucherType: `${this.props.item.voucherName}`
              })
            )
              .then(async (res) => {
                // console.log(res.base64());
                const base64Str = await res.base64();
                const pdfLocation = await `${Platform.OS == 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`;
                await RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
                await this.setState({ iosShare: false })
                if (Platform.OS === "ios") {
                  await RNFetchBlob.ios.previewDocument(pdfLocation)
                }
              })
              .then(async () => {
                await Share.shareSingle(shareOptions)
                  .then((res) => {
                    console.log('whatsapp res is', res);
                  })
                  .catch((err) => {
                    err && console.log('whatsapp error is', err);
                  });
              });
          } catch (e) {
            this.setState({ iosShare: false })
            console.log(e);
            console.log(e);
          }
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  numberWithCommas = (x) => {
    if (x == null) {
      return '0';
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  max = this.props.item.otherTransactions.reduce(function (prev, current) {
    return prev.amount > current.amount ? prev : current;
  });

  render() {
    return (
      <View style={styles.container}>
        {this.props.showDate == false ? <View style={[styles.seperator, { marginBottom: 15, marginTop: -5 }]} /> : null}
        {this.props.showDate &&
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center", marginBottom: 5 }}>
            <View style={{ borderBottomColor: '#8E8E8E', borderBottomWidth: 0.6, opacity: 0.5, width: "32.5%" }} />
            <Text style={{ textAlign: "center", borderRadius: 15, borderWidth: 0.3, paddingHorizontal: 5, paddingVertical: 3, borderColor: '#8E8E8E', width: "35%" }}>{moment(this.props.item.entryDate, 'DD-MM-YYYY').format('DD MMM YYYY')}</Text>
            <View style={{ borderBottomColor: '#8E8E8E', borderBottomWidth: 0.6, opacity: 0.5, width: "32.5%" }} />
          </View>}
        <View style={styles.flatList}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
            <Text numberOfLines={1} style={[styles.listHeading, { width: this.props.transactionType != 'partyTransaction' ? "60%" : "100%" }]}>
              {this.props.transactionType == 'partyTransaction'
                ? this.max.particular.name
                : this.props.item.particular.name}</Text>
            {this.props.transactionType != 'partyTransaction' && <Text numberOfLines={1} style={[styles.balStyle, , { width: "40%", textAlign: "right" }]}>
              {getSymbolFromCurrency(this.props.item.otherTransactions[0].particular.currency.code)}
              {this.props.item.creditAmount
                ? this.numberWithCommas(this.props.item.creditAmount)
                : this.numberWithCommas(this.props.item.debitAmount)}
            </Text>}
          </View>
          <View style={styles.receiptData}>
            <View style={styles.aboutSales}>
              <View style={styles.leftcontent}>
                <View style={this.bannerColorStyle(this.props.item.voucherName)}>
                  <Text style={styles.bannerText}>{this.props.item.voucherName} </Text>
                </View>
                <Text style={styles.invoiceNumber}> {this.props.item.voucherNo == null ? "" : "#" + this.props.item.voucherNo}</Text>
              </View>
              {/* right content */}
              {this.props.showDate == null || this.props.showDate == undefined ?
                <Text style={styles.invoiceDate}> {this.props.item.entryDate} </Text>
                : <View style={[styles.iconPlacingStyle, { alignItems: "flex-end", }]}>
                  {this.props.item.voucherNo && (
                    <TouchableOpacity
                      delayPressIn={0}
                      style={{ padding: 5, paddingRight: 5, paddingVertical: 10, }}
                      onPress={() => {
                        this.setState({ iosShare: true })
                        this.shareFile();
                      }}>
                      <GdSVGIcons.send style={styles.iconStyle} width={18} height={18} />
                    </TouchableOpacity>
                  )}
                  {this.props.item.voucherNo && (
                    <TouchableOpacity
                      delayPressIn={0}
                      style={{ padding: 5, paddingRight: 0, paddingLeft: 10, paddingVertical: 10, }}
                      onPress={async () => {
                        await Platform.OS != "ios" ? this.props.downloadModal(true) : null
                        await this.downloadFile();
                      }}>
                      <AntDesign name="download" size={17} color={'#8E8E8E'} />
                    </TouchableOpacity>
                  )}</View>}
            </View>
          </View>
          {this.props.item.otherTransactions[0].inventory && <Text style={styles.inventoryData}>Inventory</Text>}
          <View style={[styles.balData, { marginTop: this.props.item.otherTransactions[0].inventory ? 0 : 5 }]}>
            {this.props.transactionType == 'partyTransaction' && <View style={styles.balanceText}>
              <Text style={styles.balStyle}>Total: </Text>
              <Text style={styles.balStyle}>
                {getSymbolFromCurrency(this.props.item.otherTransactions[0].particular.currency.code)}
                {this.props.item.creditAmount
                  ? this.numberWithCommas(this.props.item.creditAmount)
                  : this.numberWithCommas(this.props.item.debitAmount)}
              </Text>
            </View>}
            <View style={styles.iconPlacingStyle}>
              {this.props.transactionType == 'partyTransaction' &&
                this.props.item.voucherNo && (
                  <TouchableOpacity
                    delayPressIn={0}
                    style={{ padding: 5, paddingVertical: 10, }}
                    onPress={() => {
                      this.setState({ iosShare: true })
                      this.shareFile();
                    }}>
                    <GdSVGIcons.send style={styles.iconStyle} width={19} height={18} />
                  </TouchableOpacity>
                )}
              {this.props.transactionType == 'partyTransaction' &&
                this.props.item.voucherNo && (
                  <TouchableOpacity
                    delayPressIn={0}
                    style={{ padding: 5, marginLeft: 4, paddingVertical: 10, }}
                    onPress={async () => {
                      await Platform.OS != "ios" ? this.props.downloadModal(true) : null
                      await this.downloadFile();
                    }}>
                    <AntDesign name="download" size={17} color={'#8E8E8E'} />
                  </TouchableOpacity>
                )}

              <View style={{ width: 5 }} />
              {this.props.transactionType == 'partyTransaction' && this.props.item.voucherNo && this.props.phoneNo ? (
                <TouchableOpacity
                  delayPressIn={0}
                  style={{ padding: 3, marginLeft: 0, paddingVertical: 10, }}
                  // onPress={() => console.log(this.props.phoneNo ? this.props.phoneNo.replace(/\D/g, '') : 'no phono')}
                  onPress={() => {
                    this.permissonWhatsapp();
                  }}>
                  <MaterialCommunityIcons name="whatsapp" size={20} color={'#075e54'} />
                </TouchableOpacity>
              ) : null}
              {/* <TouchableOpacity delayPressIn={0} onPress={() => console.log(this.props.item.otherTransactions)}>
              <GdSVGIcons.more style={styles.iconStyle} width={18} height={18} />
            </TouchableOpacity> */}
              {/* <TouchableOpacity
              style={{height: 30, width: 40, backgroundColor: 'pink'}}
              onPress={() => console.log(this.props.item)}></TouchableOpacity> */}
            </View>
          </View>

          {this.props.transactionType == 'partyTransaction' && <View style={styles.seperator} />}
        </View>
        <DownloadModal modalVisible={this.state.DownloadModal} />
        <ShareModal modalVisible={this.state.iosShare} />
      </View>
    );
  }

  private bannerColorStyle(type: string) {
    let bgColor = colors.TRANSACTION_PURCHASE;
    if (type === 'sales') {
      bgColor = colors.TRANSACTION_RECEIPT;
    } else if (type === 'payment') {
      bgColor = '#084EAD';
    } else if (type === 'contra') {
      bgColor = colors.TRANSACTION_CONTRA;
    } else if (type === 'purchase') {
      bgColor = bgColor;
    } else if (type === 'receipt') {
      bgColor = '#00b795';
    } else if (type === 'credit note') {
      bgColor = '#3497fd';
    } else if (type === 'debit note') {
      bgColor = '#ff6961';
    } else if (type === 'Customer') {
      bgColor = '#864dd3';
    } else if (type === 'Vendor') {
      bgColor = '#ff72be';
    } else if (type === 'advance receipt') {
      bgColor = '#51c445';
    } else if (type === 'journal voucher') {
      bgColor = '#4e4eef';
    }
    return {
      backgroundColor: bgColor,
      paddingLeft: 10,
      paddingRight: 10,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center'
    };
  }
}
export default TransactionList;
