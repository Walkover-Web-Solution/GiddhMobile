import React from 'react';
import routes from '@/navigation/routes';
import { createStackNavigator } from '@react-navigation/stack';
import VariantTableScreen from '@/screens/Product/VariantTableScreen';
import ServiceScreen from '@/screens/Service/ServiceScreen';
const { Navigator, Screen } = createStackNavigator();

export const ServiceStack = () => {
  return (
    <Navigator
      initialRouteName={routes.ServiceScreen}
      screenOptions={{
        headerShown: false
      }}>
      <Screen name={routes.ServiceScreen} component={ServiceScreen} />
      <Screen name={routes.VariantTableScreen} component={VariantTableScreen} />
      {/* <Screen name={routes.createCompanyDetails} component={CreateCompanyDetails} /> */}
    </Navigator>
  );
};
