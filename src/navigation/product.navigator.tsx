import React from 'react';
import routes from '@/navigation/routes';
import { createStackNavigator } from '@react-navigation/stack';
import ProductScreen from '@/screens/Product/ProductScreen';
import VariantTableScreen from '@/screens/Product/VariantTableScreen';
const { Navigator, Screen } = createStackNavigator();

export const ProductStack = () => {
  return (
    <Navigator
      initialRouteName={routes.ProductScreen}
      screenOptions={{
        headerShown: false
      }}>
      <Screen name={routes.ProductScreen} component={ProductScreen} />
      <Screen name={routes.VariantTableScreen} component={VariantTableScreen} />
    </Navigator>
  );
};
