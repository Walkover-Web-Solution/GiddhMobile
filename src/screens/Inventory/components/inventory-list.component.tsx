import React from 'react';
import { WithTranslation, withTranslation, WithTranslationProps } from 'react-i18next';
import { Text, View } from 'react-native';
import styles from '@/screens/Inventory/components/styles';

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
      email: 'proxqima@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebofny@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'proxafaima@appdividend.com'
    },
    {
      product_name: 'Product Name',
      opening_stock: '30 nos.',
      inward: '140 nos.',
      closing_stock: '130 nos.',
      outward: '40 nos.',
      email: 'ebsonyfa@appdividend.com'
    }
  ];

  constructor (props: InventoryListProp) {
    super(props);
  }

  render () {
    return (
      <View style={styles.flatList}>
        <View style={styles.balData}>
          <Text numberOfLines={1} style={styles.listHeading}>{this.props.item.stockName}</Text>
          {/* <View style={styles.iconPlacingStyle}>
            <GdSVGIcons.more style={styles.iconStyle} width={18} height={18} />
          </View> */}
        </View>

        <View style={styles.stockWrap}>
          <View style={styles.stockRow1}>
            <View style={styles.stockDataWrap}>
              <Text style={styles.stockTitle}>Inward</Text>
              <View style={{ height: 5 }} />
              <Text style={styles.stockSubTitle}>
                {this.props.item.inwards.quantity == 0
                  ? '-'
                  : this.props.item.inwards.quantity + ' ' + this.props.item.inwards.stockUnit}
              </Text>
            </View>
          </View>
          <View style={styles.stockRow2}>
            <View style={styles.stockDataWrap}>
              <Text style={styles.stockTitle}>Outward</Text>
              <View style={{ marginTop: 5 }} />
              <Text style={styles.stockSubTitle}>
                {this.props.item.outwards.quantity == 0
                  ? '-'
                  : this.props.item.outwards.quantity + ' ' + this.props.item.outwards.stockUnit}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.seperator} />
        {/* <TouchableOpacity
            style={{height: 50, width: 150, backgroundColor: 'pink'}}
            onPress={() => console.log(this.props.item.outwards.stockUnit)}></TouchableOpacity> */}
      </View>
    );
  }
}

export default withTranslation()(InventoryList);
