import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import {BottomNavigation, BottomNavigationTab, Icon} from '@ui-kitten/components';
import HomeScreen from '@/screens/Home/Home';
import Routes from './routes';
import {BigButton} from '@/core/components/big-button/big-button.component';
import {InventoryScreen} from '@/screens/Inventory/Inventory';
import Transactions from '@/screens/Transaction/Transaction';
// import Icon from '@/core/components/custom-icon/custom-icon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {PartiesScreen} from '@/screens/Parties/PartiesMain';
import {MoreScreen} from '@/screens/More/More';
import MoreStack from './more.navigator';

const {Navigator, Screen} = createBottomTabNavigator();

const HomeIcon = (props: any) => <Icon {...props} name="home-outline" />;
const PersonIcon = (props: any) => <Icon {...props} name="person-outline" />;
const MoreIcon = (props: any) => <Icon {...props} name="more-vertical-outline" />;

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
        tabBarIcon: ({focused}) => <Icon name="home" size={26} color={focused ? '#5773FF' : '#808080'} />,
      })}
    />
    {/* <Screen name={Routes.Inventory} component={InventoryScreen} /> */}
    {/* <Screen name={Routes.BigButton} component={HomeScreen} /> */}
    <Screen
      name={Routes.Parties}
      component={PartiesScreen}
      options={({route}) => ({
        tabBarLabel: 'Parties',

        tabBarIcon: ({focused}) => <Icons name="person" size={26} color={focused ? '#5773FF' : '#808080'} />,
      })}
    />
    {/* <Screen name={Routes.Parties} component={PartiesScreen} /> */}
    {/* <Screen name={Routes.Add} component={HomeScreen} /> */}
    <Screen
      name={Routes.More}
      component={MoreStack}
      options={({route}) => ({
        tabBarLabel: 'More',

        tabBarIcon: ({focused}) => <Icon name="dots-vertical" size={26} color={focused ? '#5773FF' : '#808080'} />,
      })}
    />
  </Navigator>
);
