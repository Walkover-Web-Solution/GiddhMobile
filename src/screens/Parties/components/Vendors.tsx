import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleProp, Text, TouchableOpacity, View, ViewStyle, DeviceEventEmitter, Alert, } from 'react-native';
import styles from '@/screens/Parties/components/PMstyle';
import { GdSVGIcons } from '@/utils/icons-pack';
import { SwipeListView } from 'react-native-swipe-list-view';
import colors, { baseColor } from '@/utils/colors';
import * as constants from '@/utils/constants';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
// @ts-ignore
import getSymbolFromCurrency from 'currency-symbol-map';
import { Company } from '@/models/interfaces/company';
import { Bars } from 'react-native-loader';
import LastDataLoadedTime from '@/core/components/data-loaded-time/LastDataLoadedTime';
import { APP_EVENTS } from '@/utils/constants';

type PartiesListProp = {
  partiesData: PartiesPaginatedResponse;
  activeCompany: Company | null;
};

const renderHiddenItem = () => (
  <View style={styles.rowBack}>
    <TouchableOpacity style={styles.swipeRight}>
      <GdSVGIcons.compose style={styles.iconStyle} width={14} height={14} />
      <View style={{ width: 10 }} />
      <Text style={styles.swipeText}>Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.swipeLeft}>
      <Text style={styles.swipeText}>Send</Text>
      <View style={{ width: 10 }} />
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
    fontSize: constants.GD_FONT_SIZE.medium
  };
};

export const Vendors = (props) => {
  const { partiesData, activeCompany, handleRefresh, loadMore, navigation, dataLoadedTime } = props;
  const [selectedItem, setSelectedItem] = useState([])
  const [selectedItemDeatils, setselectedItemDeatils] = useState([])
  const [refreshData, setRefreshData] = useState(false)


  const addItem = async (item: any) => {
    let index = await selectedItem.indexOf(item.uniqueName)
    if (index == -1) {
      await setSelectedItem([...selectedItem, item.uniqueName]);
      await setRefreshData(!refreshData)
      await setselectedItemDeatils([...selectedItemDeatils, item]);
    } else {
      await selectedItem.splice(index, 1)
      await setRefreshData(!refreshData)
      await selectedItemDeatils.splice(index, 1)
    }
  };

  function getback(success: any) {
    setSelectedItem([])
    setselectedItemDeatils([])
    setRefreshData(false)
  }

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

  const navigateToBulkPaymentScreen = async () => {
    let count = 0
    let finalSelectedItems :any = []
    await selectedItemDeatils.forEach((item) => {
      if (item.bankPaymentDetails) {
        finalSelectedItems.push(item)
      } else {
        count = count + 1
      }
    });
    if (count > 0) {
      Alert.alert("Missing Bank Details", `${count} out of ${selectedItemDeatils.length} transactions could not be processed as bank details of those accounts are not updated.`,
        [{ text: "OK", onPress: async () => { if (finalSelectedItems.length > 0) { await navigation.navigate('BulkPayment', { selectedItem: finalSelectedItems, activeCompany: activeCompany }) } } }])
    } else {
      await navigation.navigate('BulkPayment', { selectedItem: finalSelectedItems, activeCompany: activeCompany, getback: getback })
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {dataLoadedTime.length > 0 ?
        <LastDataLoadedTime
          paddingHorizontal={10}
          text={dataLoadedTime} /> : null}
      <SwipeListView
        extraData={refreshData}
        data={partiesData}
        onEndReachedThreshold={0.2}
        onEndReached={handleRefresh}
        ListFooterComponent={_renderFooter}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.rowFront, { backgroundColor: selectedItem.indexOf(item.uniqueName) != -1 ? "#ebebfa" : '#F5F5F5' }]}
            onLongPress={async () => {
              await addItem(item)
            }}
            onPress={() => navigation.navigate('PartiesTransactions', { item: item, type: 'Vendors' })}>
            <View style={styles.viewWrap}>
              {/* {item.category === 'liabilities' && console.log("Item vendorrrrrr " + JSON.stringify(item))} */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.partiesName, { width: "100%" }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.category === 'liabilities' && <Text style={styles.subheading}>Vendor</Text>}
                {item.category === 'assets' && <Text style={styles.subheading}>Customer</Text>}
              </View>
              {item.closingBalance.amount !== 0 && (
                <View style={{ width: '35%' }}>
                  <View style={styles.amountWrap}>
                    <View style={{ flexDirection: "row", justifyContent: 'flex-end', }}>
                      {item.country.code === 'IN' && (
                        <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>} numberOfLines={1}>
                          {getSymbolFromCurrency('INR')}
                          {currencyFormat(item.closingBalance.amount, activeCompany?.balanceDisplayFormat)}
                        </Text>
                      )}
                      {item.country.code !== 'IN' && (
                        <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>} numberOfLines={1}>
                          {getSymbolFromCurrency(item.country.code)}
                          {currencyFormat(item.closingBalance.amount, activeCompany?.balanceDisplayFormat)}
                        </Text>
                      )}
                      <View style={{ width: 2 }} />
                      {item.closingBalance.type == 'CREDIT' && (
                        <GdSVGIcons.outgoing style={styles.iconStyle} width={10} height={10} />
                      )}
                      {item.closingBalance.type == 'DEBIT' && (
                        <GdSVGIcons.incoming style={styles.iconStyle} width={10} height={10} />
                      )}
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: "flex-end" }}>
                      {item.bankPaymentDetails === false && <TouchableOpacity onPress={async () => {
                        await navigation.navigate("CustomerVendorScreens", { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: item.uniqueName } }),
                          await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                      }} ><Text style={{ color: "orange", fontSize: 13, }}>Add Bank Details</Text></TouchableOpacity>}
                    </View>
                  </View>
                </View>
              )}
              {item.closingBalance.amount === 0 && (
                <View style={[styles.amountWrap, { alignItems: "flex-end" }]}>
                  <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>-</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      { selectedItem.length>0 ?
        <View style={{ justifyContent: "flex-end", alignItems: "center", position: "absolute", width: 100 + "%", height: 95 + "%" }}>
          <TouchableOpacity onPress={() => { navigateToBulkPaymentScreen() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
            <Text style={{ fontSize: 20, color: "white" }}>Bulk Payment</Text>
          </TouchableOpacity>
        </View> : null}
    </View>
  );
};
