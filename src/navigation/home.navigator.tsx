import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import {BottomNavigation, BottomNavigationTab, Icon} from '@ui-kitten/components';
import HomeScreen from '@/screens/Home/Home';
import Routes from './routes';
import { InventoryMainScreen } from '@/screens/Inventory/Inventory-Main';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MoreStack from './more.navigator';
import { PartiesStack } from './parties.navigator';
import AddButton from './components/AddButton';
import DashboardStack from './dashboard.navigator';

import { View, TouchableOpacity, Text, Dimensions, DeviceEventEmitter } from 'react-native';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { useSelector } from 'react-redux';
import { InventoryNavigator } from './inventory.navigator';

const { Navigator, Screen } = createBottomTabNavigator();

const { height } = Dimensions.get('window');

export const HomeNavigator = () => {
  const [branchSelected, setBranchSelected] = useState(true);
  const disableTabs = useSelector((state) => state.commonReducer.isUnauth);
  useEffect(() => {
    // getPartiesSundryCreditors();
    isBranchSelected();
    DeviceEventEmitter.addListener(APP_EVENTS.comapnyBranchChange, () => {
      isBranchSelected();
    });
  }, []);

  // const getPartiesSundryCreditors = async () => {
  //   try {
  //     const creditors = await CommonService.getPartiesSundryCreditors();
  //     console.log(creditors.body.results);
  //     setTabs(false);
  //   } catch (e) {
  //     console.log(e);
  //     if (e.data.code == "UNAUTHORISED") {
  //       setTabs(true);
  //     }
  //   }
  // }

  function MyTabBar ({ state, descriptors, navigation }) {
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: disableTabs ? 'rgba(00,00,00,0.1)' : 'white',
          height: height * 0.08,
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: disableTabs ? 0 : 3
        }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name == 'add') {
              console.log('nothing');
            } else {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key
            });
          };

          const renderIcon = (label) => {
            if (label == 'Dashboard') {
              return (
                <MaterialCommunityIcons name="view-dashboard" size={23} color={disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080'} />
              );
            } else if (label == 'Parties') {
              return <MaterialIcons name="person" size={23} color={isFocused ? '#5773FF' : '#808080'} />;
            } else if (label == 'More') {
              return (
                <MaterialCommunityIcons name="dots-vertical" size={23} color={isFocused ? '#5773FF' : '#808080'} />
              );
            } else if (label == 'Inventory') {
              return <Icon name="Path-13016" size={22} color={isFocused ? '#5773FF' : '#808080'} />;
            }
          };

          return route.name == 'add' ? (
            branchSelected && <AddButton isDisabled={disableTabs} navigation={navigation} />
          )
            : (
              <TouchableOpacity
              disabled={disableTabs}
                // accessibilityRole="button"
                // accessibilityStates={isFocused ? ['selected'] : []}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                // testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ alignItems: 'center', width: Dimensions.get('window').width * 0.2 }}>
                {/* {renderIcon({route, focused: true, activeTintColor})} */}
                {renderIcon(label)}
                <Text style={{ color: disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080', fontSize: 13, fontFamily: 'AvenirLTStd-Book' }}>
                  {label}
                </Text>
              </TouchableOpacity>
              );
        })}
      </View>
    );
  }
  const isBranchSelected = async () => {
    const branch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    // console.log('selected branch is ', branch);
    if (branch) {
      setBranchSelected(true);
      // return true;
    } else {
      // return false;
      setBranchSelected(false);
    }
  };
  const getTabBarVisibility = (route) => {
    console.log(route);
    const routeName = route.state ? route.state.routes[route.state.index].name : '';

    if (routeName === 'SalesInvoiceScreen') {
      return false;
    } else if (routeName === 'AddInvoiceItemScreen') {
      return false;
    }
    return true;
  };

  return (
    <Navigator tabBar={(props) => <MyTabBar {...props} />} tabBarOptions={{
      keyboardHidesTabBar: true 
    }}>
      <Screen
        name={Routes.Transaction}
        component={HomeScreen}
        options={({ route }) => ({
          tabBarLabel: 'Dashboard',
          tabBarVisible: getTabBarVisibility(route),
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="view-dashboard" size={26} color={focused ? '#5773FF' : '#808080'} />
          )
        })
        }
      />

      {/* <Screen
      name={Routes.Home}
      component={HomeScreen}
      options={({route}) => ({
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({focused}) => (
          <MaterialCommunityIcons name="view-dashboard" size={26} color={focused ? '#5773FF' : '#808080'} />
        ),
      })}
    /> */}
      <Screen
        name={Routes.Inventory}
        component={InventoryNavigator}
        options={({ }) => ({
          tabBarLabel: 'Inventory',

          tabBarIcon: ({ focused }) => <Icon name="inventory" size={22} color={focused ? '#5773FF' : '#808080'} />
        })}
      />

      <Screen
        name={Routes.Add}
        component={DashboardStack}
        options={({ route }) => ({
          tabBarVisible: getTabBarVisibility(route),
          tabBarLabel: ''
          // tabBarIcon: ({focused}) => (getTabBarVisibility(route) ? <AddButton navigation={navigation} /> : null),
          // tabBarIcon: ({focused}) => route=='SalesInvoiceScreen'? null:<AddButton navigation={navigation} />),
        })}
      />
      <Screen
        name={Routes.Parties}
        component={PartiesStack}
        options={({ route }) => ({
          tabBarLabel: 'Parties',
          tabBarVisible: getTabBarVisibility(route),
          tabBarIcon: ({ focused }) => <MaterialIcons name="person" size={26} color={focused ? '#5773FF' : '#808080'} />
        })}
      />
      <Screen
        name={Routes.More}
        component={MoreStack}
        options={({ route }) => ({
          tabBarLabel: 'More',
          tabBarVisible: getTabBarVisibility(route),
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="dots-vertical" size={26} color={focused ? '#5773FF' : '#808080'} />
          )
        })}
      />
    </Navigator>
  );
};
