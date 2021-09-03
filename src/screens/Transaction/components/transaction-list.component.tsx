import React from 'react';
import { Alert, Text, View, PermissionsAndroid, TouchableOpacity, Linking } from 'react-native';
import styles from '@/screens/Transaction/components/styles';
import colors from '@/utils/colors';
import { GdSVGIcons } from '@/utils/icons-pack';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-community/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import getSymbolFromCurrency from 'currency-symbol-map';

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

  constructor (props: any) {
    super(props);
  }

  componentDidMount () {}

  downloadFile = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        // await this.onShare();
        await this.generatePdf();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  onShare = async () => {
    try {
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
        .then((res) => {
          const base64Str = res.base64();
          const pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`;
          RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
          this.props.downloadModal(false);
        })
        .then(() => {
          Share.open({
            title: 'This is the report',
            message: 'Message:',
            url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`,
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
      this.props.downloadModal(false);
      console.log(e);
      console.log(e);
    }
  };

  permissonWhatsapp = async () => {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes its granted');
        await this.onWhatsApp();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
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
            this.props.downloadModal(true);
            const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
            const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
            const shareOptions = {
              title: 'Share via',
              message: 'Voucher share',
              url: `file://${RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`,
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
              .then((res) => {
                // console.log(res.base64());
                const base64Str = res.base64();
                const pdfLocation = `${RNFetchBlob.fs.dirs.DownloadDir}/${this.props.item.voucherNo}.pdf`;
                RNFetchBlob.fs.writeFile(pdfLocation, base64Str, 'base64');
                this.props.downloadModal(false);
              })
              .then(() => {
                Share.shareSingle(shareOptions)
                  .then((res) => {
                    console.log('whatsapp res is', res);
                  })
                  .catch((err) => {
                    err && console.log('whatsapp error is', err);
                  });
              });
          } catch (e) {
            this.props.downloadModal(false);
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

  render () {
    return (
      <View style={styles.flatList}>
        <Text style={styles.listHeading}>
          {this.props.transactionType == 'partyTransaction'
            ? this.max.particular.name
            : this.props.item.particular.name}
        </Text>
        <View style={styles.receiptData}>
          <View style={styles.aboutSales}>
            <View style={styles.leftcontent}>
              <View style={this.bannerColorStyle(this.props.item.voucherName)}>
                <Text style={styles.bannerText}>{this.props.item.voucherName} </Text>
              </View>
              <Text style={styles.invoiceNumber}> #{this.props.item.voucherNo}</Text>
            </View>
            {/* right content */}
            <View>
              <Text style={styles.invoiceDate}> {this.props.item.entryDate} </Text>
            </View>
          </View>
        </View>
        {this.props.item.otherTransactions[0].inventory && <Text style={styles.inventoryData}>Inventory</Text>}
        <View style={styles.balData}>
          <View style={styles.balanceText}>
            <Text style={styles.balStyle}>Total: </Text>
            <Text style={styles.balStyle}>
              {getSymbolFromCurrency(this.props.item.otherTransactions[0].particular.currency.code)}
              {this.props.item.creditAmount
                ? this.numberWithCommas(this.props.item.creditAmount)
                : this.numberWithCommas(this.props.item.debitAmount)}
            </Text>
          </View>
          <View style={styles.iconPlacingStyle}>
            {this.props.item.voucherNo && (
              <TouchableOpacity
                delayPressIn={0}
                style={{ padding: 5 }}
                onPress={() => {
                  this.props.downloadModal(true);
                  this.downloadFile();
                }}>
                <GdSVGIcons.send style={styles.iconStyle} width={18} height={18} />
              </TouchableOpacity>
            )}

            <View style={{ width: 10 }} />
            {this.props.transactionType == 'partyTransaction' && this.props.item.voucherNo && this.props.phoneNo ? (
              <TouchableOpacity
                delayPressIn={0}
                // onPress={() => console.log(this.props.phoneNo ? this.props.phoneNo.replace(/\D/g, '') : 'no phono')}
                onPress={() => {
                  this.permissonWhatsapp();
                }}>
                <MaterialCommunityIcons name="whatsapp" size={22} color={'#075e54'} />
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

        <View style={styles.seperator} />
      </View>
    );
  }

  private bannerColorStyle (type: string) {
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
