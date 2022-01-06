import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleProp, Text, TouchableOpacity, View, ViewStyle, DeviceEventEmitter, Alert, Platform, ToastAndroid } from 'react-native';
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
import { APP_EVENTS,STORAGE_KEYS } from '@/utils/constants';
import TOAST from 'react-native-root-toast';
import AsyncStorage from '@react-native-community/async-storage';

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

let selectedItemTemp :any=[]
let selectedItemDeatilsTemp:any=[]
export const Vendors = (props) => {
  const { partiesData, activeCompany, handleRefresh, loadMore, navigation, dataLoadedTime } = props;
  const [selectedItem, setSelectedItem] = useState(selectedItemTemp)
  const [selectedItemDeatils, setselectedItemDeatils] = useState(selectedItemDeatilsTemp)
  const [refreshData, setRefreshData] = useState(false)
  const [bulkPaymentprocessing, setBulkPaymentprocessing] = useState(false)
  DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
    selectedItemTemp= []
    selectedItemDeatilsTemp=[]
    setSelectedItem([])
    setselectedItemDeatils([])
  });

  const getActiveCompany=async()=> {
    let activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyName);
    if (activeCompany == null || activeCompany == undefined) {
        activeCompany = " "
    }
    return (activeCompany)
}

  const addItem = async (item: any) => {
    if (item.country.code != "IN") {
      if (Platform.OS == "ios") {
        await setTimeout(() => {
          TOAST.show(`Country should be INDIA for ${item.name} account`, {
            duration: TOAST.durations.SHORT,
            position: -150,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          }), 100
        });
      } else {
        ToastAndroid.show(`Country should be INDIA for ${item.name} account`, ToastAndroid.SHORT)
      }
      return
    }
    let index = await selectedItem.indexOf(item.uniqueName)
    if (index == -1) {
      await setSelectedItem([...selectedItem, item.uniqueName]);
      await setRefreshData(!refreshData)
      await setselectedItemDeatils([...selectedItemDeatils, item]);
      selectedItemTemp=  [...selectedItem, item.uniqueName]
      selectedItemDeatilsTemp= [...selectedItemDeatils, item]  
    } else {
      await selectedItem.splice(index, 1)
      await setRefreshData(!refreshData)
      await selectedItemDeatils.splice(index, 1)
      selectedItemTemp=  selectedItem
      selectedItemDeatilsTemp= selectedItemDeatils  
    }
  };

  function getback(success: any) {
    selectedItemTemp= []
    selectedItemDeatilsTemp=[]
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
    await setBulkPaymentprocessing(true)
    let activeCompanyName = await getActiveCompany()
    let count = 0
    let finalSelectedItems: any = []
    await selectedItemDeatils.forEach((item) => {
      if (item.bankPaymentDetails && item.country.code == "IN") {
        finalSelectedItems.push(item)
      } else {
        count = count + 1
      }
    });
    if (count > 0) {
      Alert.alert("Missing Bank Details", `${count} out of ${selectedItemDeatils.length} transactions could not be processed as bank details of those accounts are not updated`,
        [{
          text: "OK", onPress: async () => {
            if (finalSelectedItems.length > 0) {
              await navigation.navigate('BulkPayment', { selectedItem: finalSelectedItems, activeCompany: activeCompany,activeCompanyName:(activeCompanyName) ,getback: getback})
            }
            await setBulkPaymentprocessing(false)
          }
        }])
    } else {
      await navigation.navigate('BulkPayment', { selectedItem: finalSelectedItems, activeCompany: activeCompany,activeCompanyName:(activeCompanyName),getback: getback })
      await setBulkPaymentprocessing(false)
    }
  }

  return (
    <View style={{ flex: 1 }}>
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
            onPress={() => navigation.navigate('PartiesTransactions', { item: item, type: 'Vendors', activeCompany: activeCompany })}>
            <View style={styles.viewWrap}>
              {/* {item.category === 'liabilities' && console.log("Item vendorrrrrr " + JSON.stringify(item))} */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.partiesName, { width: "100%" }]} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.category === 'liabilities' && <Text style={styles.subheading}></Text>}
                {item.category === 'assets' && <Text style={styles.subheading}></Text>}
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
                      }} ><Text style={{ color: "orange", fontSize: 13,fontFamily: 'AvenirLTStd-Book',marginTop:5 }}>Add Bank Details</Text></TouchableOpacity>}
                    </View>
                  </View>
                </View>
              )}
              {item.closingBalance.amount === 0 && (
                <View style={[styles.amountWrap, { alignItems: "flex-end" }]}>
                  <Text style={amountColorStyle(item.category) as StyleProp<ViewStyle>}>-</Text>
                  {item.bankPaymentDetails === false && <TouchableOpacity onPress={async () => {
                    await navigation.navigate("CustomerVendorScreens", { screen: 'CustomerVendorScreens', params: { index: 1, uniqueName: item.uniqueName } }),
                      await DeviceEventEmitter.emit(APP_EVENTS.REFRESHPAGE, {});
                  }} ><Text style={{ color: "orange", fontSize: 13,fontFamily: 'AvenirLTStd-Book' }}>Add Bank Details</Text></TouchableOpacity>}
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      {selectedItem.length > 0 ?
        <View style={{ justifyContent: "flex-end", alignItems: "center", marginBottom: 10 }}>
          <TouchableOpacity onPress={() => { navigateToBulkPaymentScreen() }} style={{ justifyContent: "center", alignItems: "center", backgroundColor: '#5773FF', height: 50, borderRadius: 25, marginBottom: 10, width: "90%", }}>
            <Text style={{ fontSize: 20, color: "white",fontFamily: 'AvenirLTStd-Book'  }}>Bulk Payment</Text>
          </TouchableOpacity>
        </View> : null}
      {bulkPaymentprocessing && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.1)',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }}>
          <Bars size={15} color={'#5773FF'} />
        </View>
      )}
    </View>
  );
};
