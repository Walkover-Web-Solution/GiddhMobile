import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import {BottomNavigation, BottomNavigationTab, Icon} from '@ui-kitten/components';
import HomeScreen from '@/screens/Home/Home';
import Routes from './routes';
import {BigButton} from '@/core/components/big-button/big-button.component';
import {InventoryMainScreen} from '@/screens/Inventory/Inventory-Main';
import Transactions from '@/screens/Transaction/Transaction';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {PartiesMainScreen} from '@/screens/Parties/PartiesMain';
import {MoreScreen} from '@/screens/More/More';
import MoreStack from './more.navigator';
import {PartiesStack} from './parties.navigator';

const {Navigator, Screen} = createBottomTabNavigator();

export const HomeNavigator = () => (
  <Navigator
    tabBarOptions={{
      activeTintColor: '#5773FF',
      labelStyle: {fontSize: 14},
      style: {paddingVertical: 3},
      keyboardHidesTabBar: true,
    }}>
    <Screen
      name={Routes.Transaction}
      component={HomeScreen}
      options={({route}) => ({
        tabBarLabel: 'Home',
        tabBarIcon: ({focused}) => (
          <MaterialCommunityIcons name="home" size={26} color={focused ? '#5773FF' : '#808080'} />
        ),
      })}
    />
    {/* <Screen
      name={Routes.Inventory}
      component={InventoryMainScreen}
      options={({route}) => ({
        tabBarLabel: 'Inventory',

        tabBarIcon: ({focused}) => <Icon name="inventory" size={22} color={focused ? '#5773FF' : '#808080'} />,
      })}
    /> */}

    <Screen
      name={Routes.Parties}
      component={PartiesStack}
      options={({route}) => ({
        tabBarLabel: 'Parties',

        tabBarIcon: ({focused}) => <MaterialIcons name="person" size={26} color={focused ? '#5773FF' : '#808080'} />,
      })}
    />

    <Screen
      name={Routes.More}
      component={MoreStack}
      options={({route}) => ({
        tabBarLabel: 'More',

        tabBarIcon: ({focused}) => (
          <MaterialCommunityIcons name="dots-vertical" size={26} color={focused ? '#5773FF' : '#808080'} />
        ),
      })}
    />
  </Navigator>
);
