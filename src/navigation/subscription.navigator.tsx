import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlansScreen from '@/screens/Subscription/PlansScreen';
import BillingAccountScreen from '@/screens/Subscription/BillingAccountScreen';
import ReviewAndPayScreen from '@/screens/Subscription/ReviewAndPayScreen';

const { Navigator, Screen } = createStackNavigator();

const SubscriptionStack = () => {
    return (
        <Navigator initialRouteName={'PlansScreen'} screenOptions={{ headerShown: false }}>
            <Screen component={PlansScreen} name={'PlansScreen'} />
            <Screen component={BillingAccountScreen} name={'BillingAccountScreen'} />
            <Screen component={ReviewAndPayScreen} name={'ReviewAndPayScreen'} />
        </Navigator>
    );
}

export default SubscriptionStack;