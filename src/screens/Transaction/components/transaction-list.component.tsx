import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, StyleProp, Text, View, ViewStyle} from 'react-native';
import styles from '@/screens/Transaction/components/styles';
import colors from '@/utils/colors';
import {GdSVGIcons} from '@/utils/icons-pack';

type TransactionListProp = WithTranslation & WithTranslationProps & {};

type TransactionListState = {};

class TransactionList extends React.Component<TransactionListProp, TransactionListState> {
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

  constructor(props: TransactionListProp) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <FlatList
            data={this.listData}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <View style={styles.flatList}>
                <Text style={styles.listHeading}>{item.title}</Text>
                <View style={styles.receiptData}>
                  {/* wrap left right content */}
                  <View style={styles.aboutSales}>
                    {/* Left content */}
                    <View style={styles.leftcontent}>
                      <View style={this.bannerColorStyle(item.type) as StyleProp<ViewStyle>}>
                        <Text style={styles.bannerText}> {item.type} </Text>
                      </View>
                      <Text style={styles.invoiceNumber}> #{item.invoice} </Text>
                    </View>
                    {/* right content */}
                    <View>
                      <Text style={styles.invoiceDate}> {item.date} </Text>
                    </View>
                  </View>
                </View>
                {item.total && (
                  <View style={styles.totalData}>
                    <Text style={styles.totalStyle}> {item.total ? 'Total : ₹' : ''}</Text>
                    <Text style={styles.totalStyle}>{this.currencyFormat(item.total)} </Text>
                  </View>
                )}
                <View style={styles.balData}>
                  <View style={styles.balanceText}>
                    <Text style={styles.balStyle}> {item.bal ? this.totalType(item.type) : ''}</Text>
                    <Text style={styles.balStyle}>{this.currencyFormat(item.bal)} </Text>
                  </View>
                  <View style={styles.iconPlacingStyle}>
                    <GdSVGIcons.send style={styles.iconStyle} width={18} height={18} />
                    <View style={{width: 15}} />
                    <GdSVGIcons.more style={styles.iconStyle} width={18} height={18} />
                  </View>
                </View>

                <View style={styles.seperator} />
              </View>
            )}
            keyExtractor={(item) => item.email}
          />
        </View>
      </SafeAreaView>
    );
  }

  private currencyFormat(currency: string) {
    return currency.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
  }

  private bannerColorStyle(type: string) {
    let bgColor = colors.TRANSACTION_PURCHASE;
    if (type === 'Sales') {
      bgColor = colors.TRANSACTION_RECEIPT;
    } else if (type === 'Payment') {
      bgColor = colors.TRANSACTION_PAYMENT;
    } else if (type === 'Contra') {
      bgColor = colors.TRANSACTION_CONTRA;
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
export default withTranslation()(TransactionList);
