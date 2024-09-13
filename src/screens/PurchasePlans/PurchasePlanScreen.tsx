import React, {useEffect, useState,ReactNode} from 'react';
import {Button, Platform, ScrollView, StyleSheet, Text, View,ViewStyle} from 'react-native';
import {
    getAvailablePurchases,
  getPurchaseHistory,
  isIosStorekit2,
  PurchaseError,
  requestPurchase,
  Sku,
  useIAP,
} from 'react-native-iap';
import {withIAPContext} from 'react-native-iap';
import { getSubscriptions, Subscription, getProducts, Product } from 'react-native-iap'

// import {Box, Button, Heading, Row, State} from '../components';
// import {
//   colors,
//   constants,
//   contentContainerStyle,
//   errorLog,
//   theme,
// } from '../utils';

interface RowField {
    label: string;
    value: string;
  }
  
  interface RowProps {
    children?: ReactNode;
    fields: RowField[];
    flexDirection?: ViewStyle['flexDirection'];
    isLast?: boolean;
  }
  
const Row = ({
    children,
    fields,
    flexDirection = 'row',
    isLast,
  }: RowProps) => (
    <View style={{flexDirection}}>
      <View>
        {fields.map((field, index) => (
          <View
            key={(field.label)}>
            <Text>{field.label}</Text>
            <Text>{field.value}</Text>
          </View>
        ))}
      </View>
  
      {children}
    </View>
  );


  const productSkus = Platform.select({
    ios: ['giddh_oak_mobile', 'giddh_vine_mobile'],
  
    android: [
      'android.test.purchased',
      'android.test.canceled',
      'android.test.refunded',
      'android.test.item_unavailable',
    ],
  
    default: [],
  }) as string[];
  
  const subscriptionSkus = Platform.select({
    ios: ['com.cooni.sub1000', 'com.cooni.sub5000'],
    android:['test.sub1'],
    default: [],
  }) as string[];
  const amazonBaseSku = 'com.amazon.sample.iap.subscription.mymagazine';
  export const constants = {
    productSkus,
    subscriptionSkus,
    amazonBaseSku,
  };


export const PurchasePlanScreen = (props) => {
  const [success, setSuccess] = useState(false);
  const subscriptionIds = ['giddh_min_plan','giddh_test_mobile','giddh_oak_mobile','giddh_vine_mobile'];// for subscriptions
  const productIds= ['giddh_oak_mobile', 'giddh_vine_mobile'];// for in-app purchases

  const [subscription, setSubscription] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const {
    connected,
    // products,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
  } = useIAP();

  const handleGetProducts = async () => {
    try {
        console.log("skus",constants.productSkus);
        
      const result = await getProducts({skus: constants.productSkus});
      console.log("hwloow",result);
      
    } catch (error) {
      console.error({message: 'handleGetProducts', error});
    }
  };

  const handleBuyProduct = async (sku: Sku) => {
    try {
      await requestPurchase({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        console.error({message: `[${error.code}]: ${error.message}`, error});
      } else {
        console.error({message: 'handleBuyProduct', error});
      }
    }
  };

//   useEffect(() => {
//     const checkCurrentPurchase = async () => {
//       try {
//         if (
//           (isIosStorekit2() && currentPurchase?.transactionId) ||
//           currentPurchase?.transactionReceipt
//         ) {
//           await finishTransaction({
//             purchase: currentPurchase,
//             isConsumable: true,
//           });

//           setSuccess(true);
//         }
//       } catch (error) {
//         if (error instanceof PurchaseError) {
//           console.error({message: `[${error.code}]: ${error.message}`, error});
//         } else {
//           console.error({message: 'handleBuyProduct', error});
//         }
//       }
//     };

//     checkCurrentPurchase();
//   }, [currentPurchase, finishTransaction]);

  useEffect(() => {
      getSubscriptionInfo();
    //   getPurchaseInfo();
  }, []);
  
  console.log("mounted",props);
  
    // To get Subscription information
    const getSubscriptionInfo = async () => {
      try {
        const subscriptions = await getSubscriptions({
          skus: subscriptionIds,
        });
        console.log("supscriptions",subscriptions);
        
        setSubscription(subscriptions); // set subscription information
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };

    const getCurrentSubscriptions = async () => {
        try {
          const purchases = await getAvailablePurchases();
          console.log(purchases);// get current available purchases
        } catch (error) {
          console.log('Error getting purchases:', error);
        }
      };

    const getPurchaseHistoryIap = async () => {
    try {
        const purchaseHistory = await getPurchaseHistory();
        console.log(purchaseHistory); //get previous all history
    } catch (error) {
        console.error('Error fetching purchase history: ', error);
    }
    };
  
    // To get in-app purchases information
    const getPurchaseInfo = async () => {
      try {
        const productsInfo = await getProducts({ skus: productIds });
        console.log("response",productsInfo);
        
        setProducts(productsInfo);
      } catch (error) {
        console.error('Error fetching products: ', error);
      }
    };


  return (
    <ScrollView>
      {initConnectionError && (
        <View>
          <Text>
            An error happened while initiating the connection.
          </Text>
        </View>
      )}

      {currentPurchaseError && (
        <View>
          <Text>
            code: {currentPurchaseError.code}, message:{' '}
            {currentPurchaseError.message}
          </Text>
        </View>
      )}

      {success && (
        <View>
          <Text>
            A product purchase has been processed successfully.
          </Text>
        </View>
      )}

      <View>
        <View>
          {subscription.map((subscription, index) => (
            <Row
              key={subscription.productId}
              fields={[
                {
                  label: 'Product Id',
                  value: subscription.productId,
                },
                {
                  label: 'type',
                  value: subscription?.type,
                },
                {
                  label: 'price',
                  value: subscription?.price,
                },
              ]}
              isLast={products.length - 1 === index}>
              <Button
                title="Buy"
                onPress={() => handleBuyProduct(subscription.productId)}
              />
            </Row>
          ))}
        </View>

        <Button title="Get the products" onPress={getSubscriptionInfo} />
        <Button title="Get current subs" onPress={getCurrentSubscriptions} />
        <Button title="Get purchase history" onPress={getPurchaseHistoryIap} />
      </View>
    </ScrollView>
  );
};

export default PurchasePlanScreen;
// const styles = StyleSheet.create({
//   errorMessage: {
//     ...theme.P1,
//     color: colors.red,
//   },

//   successMessage: {
//     ...theme.P1,
//     colors: colors.green,
//   },

//   container: {
//     marginBottom: 20,
//   },
// });