import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import routes from '@/navigation/routes';
import Login from '@/screens/Auth/Login/Login';

const {Navigator, Screen} = createStackNavigator();

export const AuthStack = () => {
  return (
    <Navigator initialRouteName={routes.Login} headerMode="none">
      <Screen
        name={routes.Login}
        component={Login}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
    </Navigator>
  );
};
