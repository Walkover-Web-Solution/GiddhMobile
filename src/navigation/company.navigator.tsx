import React from 'react';
import routes from '@/navigation/routes';
import CreateCompany from '@/screens/Auth/Signup/CreateCompany/newCompany1';
import CreateCompanyDetails from '@/screens/Auth/Signup/CreateCompany/newCompany2';
import { createStackNavigator } from '@react-navigation/stack';
const { Navigator, Screen } = createStackNavigator();

export const CompanyStack = () => {
  return (
    <Navigator
      initialRouteName={routes.createCompany}
      screenOptions={{
        headerShown: false
      }}>
      <Screen name={routes.createCompany} component={CreateCompany} />
      <Screen name={routes.createCompanyDetails} component={CreateCompanyDetails} />
    </Navigator>
  );
};
