import React from 'react';
import ChangeCompany from '../screens/Change-Company/ChangeCompany';
import BranchChange from '../screens/Change-Branch/ChangeBranch';
import { createStackNavigator } from '@react-navigation/stack';
import routes from '@/navigation/routes';
import CreateCompany from '@/screens/Auth/Signup/CreateCompany/newCompany1';
import CreateCompanyDetails from '@/screens/Auth/Signup/CreateCompany/newCompany2';
const { Navigator, Screen } = createStackNavigator();

export const ChangeCompanyStack = () => {
  return (
    <Navigator
      initialRouteName={"ChangeCompany"}
      screenOptions={{
        headerShown: false
      }}>
      <Screen component={ChangeCompany} name={'ChangeCompany'} />
      <Screen component={BranchChange} name={'BranchChange'} />
      <Screen name={routes.createCompany} component={CreateCompany} />
      <Screen name={routes.createCompanyDetails} component={CreateCompanyDetails} />
    </Navigator>
  );
};
