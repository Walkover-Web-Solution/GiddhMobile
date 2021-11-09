import React from 'react';
import BranchChange from '../screens/Change-Branch/ChangeBranch';
import { createStackNavigator } from '@react-navigation/stack';
const { Navigator, Screen } = createStackNavigator();

export const ChangeCompanyBranchStack = () => {
  return (
    <Navigator
      initialRouteName={"ChangeCompanyBranch"}
      screenOptions={{
        headerShown: false
      }}>
      <Screen component={BranchChange} name={'BranchChange'} />
    </Navigator>
  );
};
