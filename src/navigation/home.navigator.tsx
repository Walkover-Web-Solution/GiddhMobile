import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomNavigation, BottomNavigationTab, Icon} from '@ui-kitten/components';
import HomeScreen from '@/screens/Home/Home';
import Routes from './routes';
import {BigButton} from '@/core/components/big-button/big-button.component';
import {InventoryScreen} from '@/screens/Inventory/Inventory';
import Transactions from '@/screens/Transaction/Transaction';

import {PartiesScreen} from '@/screens/Parties/Parties';
import {MoreScreen} from '@/screens/More/More';
import MoreStack from './more.navigator';

const {Navigator, Screen} = createBottomTabNavigator();

const HomeIcon = (props: any) => <Icon {...props} name="home-outline" />;
const PersonIcon = (props: any) => <Icon {...props} name="person-outline" />;
const MoreIcon = (props: any) => <Icon {...props} name="more-vertical-outline" />;

const BottomTabBar = ({navigation, state}: {navigation: any; state: any}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
    appearance={'noIndicator'}>
    <BottomNavigationTab title="Transactions" icon={HomeIcon} />
    <BottomNavigationTab title="Inventory" icon={HomeIcon} />
    <BottomNavigationTab title="Parties" icon={PersonIcon} />
    <BottomNavigationTab title="More" icon={MoreIcon} />
  </BottomNavigation>
);

export const HomeNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
    <Screen name={Routes.Transaction} component={Transactions} />
    <Screen name={Routes.Inventory} component={InventoryScreen} />
    {/* <Screen name={Routes.BigButton} component={HomeScreen} /> */}
    <Screen name={Routes.Parties} component={PartiesScreen} />
    {/* <Screen name={Routes.Parties} component={PartiesScreen} /> */}
    {/* <Screen name={Routes.Add} component={HomeScreen} /> */}
    <Screen name={Routes.More} component={MoreStack} />
  </Navigator>
);
