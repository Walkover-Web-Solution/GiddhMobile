import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import routes from '@/navigation/routes';
import Login from '@/screens/Auth/Login/Login';
import Welcome from '@/screens/Auth/Welcome/Welcome';
import Otp from '@/screens/Auth/Otp/Otp';
import Password from '@/screens/Auth/Password/Password';
import {Platform  } from "react-native";
const {Navigator, Screen} = createStackNavigator();
     
export const AuthStack = () => {
  return (
    <Navigator initialRouteName={routes.Welcome} headerMode="none">
    
      <Screen
        name={routes.Login}
        component={Login}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Screen
        name={routes.Password}
        component={Password}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Screen
        name={routes.Otp}
        component={Otp}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
       <Screen
        name={routes.Welcome}
        component={Welcome}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
    </Navigator>
    
  );
};
