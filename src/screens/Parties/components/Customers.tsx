import React from 'react';
import {SafeAreaView, StyleProp, Text, TouchableOpacity, View, ViewStyle, FlatList} from 'react-native';
import styles from '@/screens/Parties/components/PMstyle';
import {GdSVGIcons} from '@/utils/icons-pack';
import {SwipeListView} from 'react-native-swipe-list-view';
import colors, {baseColor} from '@/utils/colors';
import * as constants from '@/utils/constants';
import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
// @ts-ignore
import getSymbolFromCurrency from 'currency-symbol-map';
import {Company} from '@/models/interfaces/company';
import {Bars} from 'react-native-loader';

type PartiesListProp = {
  partiesData: PartiesPaginatedResponse;
  activeCompany: Company | null;
};

const renderHiddenItem = () => (
  <View style={styles.rowBack}>
    <TouchableOpacity style={styles.swipeRight}>
      <GdSVGIcons.compose style={styles.iconStyle} width={14} height={14} />
      <View style={{width: 10}} />
      <Text style={styles.swipeText}>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.swipeLeft}>
      <Text style={styles.swipeText}>Send</Text>
      <View style={{width: 10}} />
      <GdSVGIcons.send_white style={styles.iconStyle} width={14} height={14} />
    </TouchableOpacity>
  </View>
);

const amountColorStyle = (type: string) => {
  let bgColor = colors.TEXT_NORMAL;
  if (type === 'liabilities') {
    bgColor = bgColor;
  } else if (type === 'assets') {
    bgColor = bgColor;
  } else if (type === 'neutral') {
    bgColor = bgColor;
  }
  return {
    color: bgColor,
    fontFamily: 'AvenirLTStd-Black',
    fontSize: constants.GD_FONT_SIZE.medium,
  };
};

export const Customers = (props) => {
  const {partiesData, activeCompany, handleRefresh, loadMore, navigation} = props;

  function _renderFooter() {
    if (!loadMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: 100,
          bottom: 10,
          // backgroundColor: 'pink',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Bars size={15} color={colors.PRIMARY_NORMAL} />
      </View>
    );
  }
  function currencyFormat(amount: number, currencyType: string | undefined) {
    switch (currencyType) {
      case 'IND_COMMA_SEPARATED':
        // eslint-disable-next-line no-lone-blocks
        {
          if (amount.toString().length > 4) {
            return amount
              .toFixed(1)
              .toString()
              .replace(/\B(?=(\d{2})+(?!\d))/g, ',');
          } else if (amount.toString().length === 3) {
            return amount.toFixed(1).toString();
          } else if (amount.toString().length === 4) {
            return amount
              .toFixed(1)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
        }
        break;
      case 'INT_SPACE_SEPARATED': {
        return amount
          .toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      }
      case 'INT_APOSTROPHE_SEPARATED': {
        return amount
          .toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
      }
      default: {
        return amount
          .toFixed(1)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }
  }

  return (
    // <View style={{flex: 1, backgroundColor: 'pink', justifyContent: 'center', alignItems: 'center'}}>
    //   <Text>Hello Customers</Text>
    // </View>

    <SwipeListView
      data={partiesData}
      // showsVerticalScrollIndicator={false}
      // leftOpenValue={100}
      // rightOpenValue={-100}
      // renderHiddenItem={renderHiddenItem}

      onEndReachedThreshold={0.2}
      onEndReached={handleRefresh}
      ListFooterComponent={_renderFooter}
      renderItem={({item}) => (
        <TouchableOpacity
          style={styles.rowFront}
          onPress={() => navigation.navigate('PartiesTransactions', {item: item})}>
          <View style={styles.viewWrap}>
            <Text style={styles.partiesName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.closingBalance.amount !== 0 && (
              <View style={styles.amountWrap}>
                {item.country.code === 'IN' && (
                  <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>
                    {getSymbolFromCurrency('INR')}
                    {currencyFormat(item.closingBalance.amount, activeCompany?.balanceDisplayFormat)}
                  </Text>
                )}
                {item.country.code !== 'IN' && (
                  <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>
                    {getSymbolFromCurrency(item.country.code)}
                    {currencyFormat(item.closingBalance.amount, activeCompany?.balanceDisplayFormat)}
                  </Text>
                )}
                <View style={{width: 2}} />
                {item.category === 'liabilities' && (
                  <GdSVGIcons.outgoing style={styles.iconStyle} width={10} height={10} />
                )}
                {item.category === 'assets' && <GdSVGIcons.incoming style={styles.iconStyle} width={10} height={10} />}
              </View>
            )}
            {item.closingBalance.amount === 0 && (
              <View style={styles.amountWrap}>
                <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>-</Text>
              </View>
            )}
          </View>
          {item.category === 'liabilities' && <Text style={styles.subheading}>Vendor</Text>}
          {item.category === 'assets' && <Text style={styles.subheading}>Customer</Text>}
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.uniqueName}
    />
  );
};
