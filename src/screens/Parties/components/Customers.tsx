import React from 'react';
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import styles from '@/screens/Parties/components/PMstyle';
import { GdSVGIcons } from '@/utils/icons-pack';
import { SwipeListView } from 'react-native-swipe-list-view';
import colors from '@/utils/colors';
import * as constants from '@/utils/constants';
// @ts-ignore
import getSymbolFromCurrency from 'currency-symbol-map';
import LoaderKit  from 'react-native-loader-kit';
import LastDataLoadedTime from '@/core/components/data-loaded-time/LastDataLoadedTime';
import ListEmptyComponent from './ListEmptyComponent';
import { formatAmount } from '@/utils/helper';

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
    fontSize: constants.GD_FONT_SIZE.medium
  };
};

export const Customers = (props) => {
  const { partiesData, activeCompany, handleRefresh, loadMore, navigation, dataLoadedTime } = props;

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
          alignItems: 'center'
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
    <View style={{ flex: 1 }}>
      {/* {dataLoadedTime.length > 0 ?
        <LastDataLoadedTime
          paddingHorizontal={10}
          text={dataLoadedTime} /> : null} */}
      <SwipeListView
        contentContainerStyle={{ flexGrow: 1 }}
        data={partiesData}
        onEndReachedThreshold={0.2}
        onEndReached={handleRefresh}
        ListFooterComponent={_renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rowFront}
            onPress={() => navigation.navigate('PartiesTransactions', { item: item, type: 'Creditors',activeCompany:activeCompany })}>
            <View style={styles.viewWrap}>
              <Text style={styles.partiesName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.closingBalance?.amount !== 0 && (
                <View style={styles.customerAmountWrap}>
                  {item.country.code === 'IN' && (
                    <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>} numberOfLines={1}>
                      {getSymbolFromCurrency('INR')}
                      {formatAmount(item.closingBalance.amount)}
                    </Text>
                  )}
                  {item.country.code !== 'IN' && (
                    <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>} numberOfLines={1}>
                      {getSymbolFromCurrency(item.country.code)}
                      {formatAmount(item.closingBalance.amount)}
                    </Text>
                  )}
                  <View style={{ width: 2 }} />
                  {item.closingBalance.type == 'CREDIT' && (
                    <GdSVGIcons.outgoing style={styles.customerIconStyle} width={10} height={10} />
                  )}
                  {item.closingBalance.type == 'DEBIT' && (
                    <GdSVGIcons.incoming style={styles.customerIconStyle} width={10} height={10} />
                  )}
                </View>
              )}
              {item.closingBalance.amount === 0 && (
                <View style={styles.customerAmountWrap}>
                  <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>-</Text>
                </View>
              )}
            </View>
            {item.category === 'liabilities' && <Text style={styles.subheading}></Text>}
            {item.category === 'assets' && <Text style={styles.subheading}></Text>}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<ListEmptyComponent message={'No Customer Exist'} buttonLable={'Add Customer'} partiesScreenIndex={0} />}
      />
    </View>
  );
};
