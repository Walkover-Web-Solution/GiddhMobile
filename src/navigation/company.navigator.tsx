import React from 'react';
import routes from '@/navigation/routes';
import CreateCompany from '@/screens/Auth/Signup/CreateCompany/newCompany1';
import CreateCompanyDetails from '@/screens/Auth/Signup/CreateCompany/newCompany2';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import SubscriptionStack from './subscription.navigator';
const { Navigator, Screen } = createStackNavigator();

export const CompanyStack = () => {
  const subscriptionData = useSelector((state) => state.subscriptionReducer?.subscriptionData);

  if (!!!subscriptionData?.subscriptionId) {
    return <SubscriptionStack/>
  }

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
