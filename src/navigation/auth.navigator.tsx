import React from 'react';
// import {createStackNavigator} from '@react-navigation/stack';
import routes from '@/navigation/routes';
import Login from '@/screens/Auth/Login/Login';
import Welcome from '@/screens/Auth/Welcome/Welcome';
import Otp from '@/screens/Auth/Otp/Otp';
import Password from '@/screens/Auth/Password/ForgotPassword';
import ResetPassword from '@/screens/Auth/ResetPassword/ResetPassword';
import Signup from '@/screens/Auth/Signup/Signup';
import { createStackNavigator } from '@react-navigation/stack';
const { Navigator, Screen } = createStackNavigator();

export const AuthStack = () => {
  return (
    <Navigator
      initialRouteName={routes.Welcome}
      screenOptions={{
        headerShown: false
      }}>
      <Screen name={routes.Welcome} component={Welcome} />
      <Screen name={routes.Login} component={Login} />
      <Screen name={routes.Password} component={Password} />
      <Screen name={routes.ResetPassword} component={ResetPassword} />
      <Screen name={routes.Otp} component={Otp} />
      <Screen name={routes.Signup} component={Signup} />
    </Navigator>
  );
};
