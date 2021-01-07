import React from 'react';
import {WithTranslation, withTranslation, WithTranslationProps} from 'react-i18next';
import {FlatList, SafeAreaView, Text, View} from 'react-native';
import styles from '@/screens/Inventory/components/styles';
import {GdSVGIcons} from '@/utils/icons-pack';

type InventoryListProp = WithTranslation & WithTranslationProps & {};

type InventoryListState = {};

class InventoryList extends React.Component<InventoryListProp, InventoryListState> {
  listData = [
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxqima@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebofny@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxafaima@appdividend.com',
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebsonyfa@appdividend.com',
    },
  ];

  constructor(props: InventoryListProp) {
    super(props);
  }

  render() {
    return (
      <View style={styles.flatList}>
        <View style={styles.balData}>
          <Text style={styles.listHeading}>{this.props.item.stockName}</Text>
          {/* <View style={styles.iconPlacingStyle}>
            <GdSVGIcons.more style={styles.iconStyle} width={18} height={18} />
          </View> */}
        </View>

        <View style={styles.stockWrap}>
          <View style={styles.stockRow1}>
            <View style={styles.stockDataWrap}>
              <Text style={styles.stockTitle}>Inward</Text>
              <Text style={styles.stockSubTitle}>{this.props.item.inwards.quantity}</Text>
            </View>
          </View>
          <View style={styles.stockRow2}>
            <View style={styles.stockDataWrap}>
              <Text style={styles.stockTitle}>Outward</Text>
              <Text style={styles.stockSubTitle}>{this.props.item.outwards.quantity}</Text>
            </View>
          </View>
        </View>
        <View style={{height: 10}} />

        <View style={styles.seperator} />
      </View>
    );
  }
}

export default withTranslation()(InventoryList);
