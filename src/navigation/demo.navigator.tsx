import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import Routes from './routes';
import { DemoScreen } from '@/screens/Demo/Demo';

const { Navigator, Screen } = createBottomTabNavigator();

const HomeIcon = (props: any) => <Icon {...props} name="home-outline" />;
const PersonIcon = (props: any) => <Icon {...props} name="person-outline" />;
const MoreIcon = (props: any) => <Icon {...props} name="more-vertical-outline" />;

const BottomTabBar = ({ navigation, state }: {navigation: any; state: any}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={(index) => navigation.navigate(state.routeNames[index])}
    appearance={'noIndicator'}>
    <BottomNavigationTab title="Dashboard" icon={HomeIcon} />
    <BottomNavigationTab title="Inventory" icon={PersonIcon} />
    <BottomNavigationTab title="More" icon={MoreIcon} />
  </BottomNavigation>
);

export const DemoNavigator = () => (
  <Navigator tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{headerShown:false}}>
    <Screen name={Routes.Dashboard} component={DemoScreen} />
    <Screen name={Routes.Inventory} component={DemoScreen} />
    <Screen name={Routes.Add} component={DemoScreen} />
  </Navigator>
);
