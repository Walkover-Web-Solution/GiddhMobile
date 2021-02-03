import React from 'react';
import {FlatList, SafeAreaView, StyleProp, Text, View, ViewStyle, TouchableOpacity} from 'react-native';
import styles from '@/screens/Transaction/components/styles';
import colors from '@/utils/colors';
import {GdSVGIcons} from '@/utils/icons-pack';
import {PropsService} from '@ui-kitten/components/devsupport';

class TransactionList extends React.Component {
  listData = [
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Sales',
      invoice: '9879',
      date: '05 Jul 20',
      total: '500000',
      bal: '500000',
      email: 'proxqima@appdividend.com',
    },
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Purchase',
      invoice: '9879',
      date: '05 Jul 20',
      total: '500000',
      bal: '10000',
      email: 'ebofny@appdividend.com',
    },
    {
      title: 'Walkover Web Solutions Private Limited',
      type: 'Contra',
      invoice: '9879',
      date: '05 Jul 20',
      bal: '10000',
      email: 'proxafaima@appdividend.com',
    },
    {
      title: 'Shubhendra Agrawal',
      type: 'Payment',
      invoice: '9879',
      date: '05 Jul 20',
      bal: '10000',
      email: 'ebsonyfa@appdividend.com',
    },
  ];

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <View style={styles.flatList}>
        <Text style={styles.listHeading}>{this.props.item.particular.name}</Text>
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
              ₹{this.props.item.creditAmount ? this.props.item.creditAmount : this.props.item.debitAmount}
            </Text>
          </View>
          <View style={styles.iconPlacingStyle}>
            <GdSVGIcons.send style={styles.iconStyle} width={18} height={18} />
            <View style={{width: 15}} />
            <GdSVGIcons.more style={styles.iconStyle} width={18} height={18} />
          </View>
        </View>

        <View style={styles.seperator} />
      </View>
    );
  }

  private currencyFormat(currency: string) {
    return currency.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
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
      bgColor = '#f6554c';
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
      alignItems: 'center',
    };
  }

  private totalType(type: string) {
    let totalType = 'Bal : ₹';
    if (type === 'Sales') {
      totalType = 'Due : ₹';
    } else if (type === 'Payment' || type === 'Contra') {
      totalType = 'Total : ₹';
    }
    return totalType;
  }
}
export default TransactionList;
