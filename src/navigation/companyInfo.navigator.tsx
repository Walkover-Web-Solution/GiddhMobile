import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import routes from '@/navigation/routes';

import CompanyInfoOne from '@/screens/Company-Information/CompanyInfo-One';
import CompanyInfoTwo from '@/screens/Company-Information/CompanyInfo-Two';

const { Navigator, Screen } = createStackNavigator();

export const CompanyInfoStack = () => {
  return (
    <Navigator initialRouteName={routes.CompanyInfoOne} headerMode="none" screenOptions={{headerShown:false}}>
      <Screen
        name={routes.CompanyInfoOne}
        component={CompanyInfoOne}
        options={{
          animationTypeForReplace: 'pop'
        }}
      />
      <Screen
        name={routes.CompanyInfoTwo}
        component={CompanyInfoTwo}
        options={{
          animationTypeForReplace: 'pop'
        }}
      />
    </Navigator>
  );
};
