import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import {BottomNavigation, BottomNavigationTab, Icon} from '@ui-kitten/components';
import HomeScreen from '@/screens/Home/Home';
import Routes from './routes';
import { InventoryMainScreen } from '@/screens/Inventory/Inventory-Main';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MoreStack from './more.navigator';
import { PartiesStack } from './parties.navigator';
import { DashPartyStack } from './dashboard.parties.navigator';
import AddButton from './components/AddButton';
import DashboardStack from './dashboard.navigator';

import { View, TouchableOpacity, Text, Dimensions, DeviceEventEmitter, Alert } from 'react-native';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { useSelector } from 'react-redux';
import { InventoryNavigator } from './inventory.navigator';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { AccountNavigator } from './account.navigator';


const { Navigator, Screen } = createBottomTabNavigator();

const { height } = Dimensions.get('window');

export function setupPushNotification(handleNotification: any) {

  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
      handleNotification(notification)
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
      console.log("ACTION:", notification.action);
      console.log("NOTIFICATION:", notification);

      // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (err) {
      console.error(err.message, err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
  });
}

export const HomeNavigator = () => {
  const [branchSelected, setBranchSelected] = useState(true);
  const disableTabs = useSelector((state) => state.commonReducer.isUnauth);
  const navigationRef = useNavigation();

  const _handleNotificationOpen = async (notification: any) => {
    console.log("NOTIFICATION RECEIVED-------------" + JSON.stringify(notification))
    const activeCompanyUniqueName = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName)
    var item = JSON.parse(notification.data.item)
    if (activeCompanyUniqueName == notification.data.activeCompanyUniqueName) {
      navigationRef.navigate("parties",
        {
          screen: 'PartiesTransactions',
          initial: false,
          params: {
            item: item,
            type: (item.category === 'liabilities' ? 'Vendors' : 'Creditors'),
            activeCompany: notification.data.activeCompany ? notification.data.activeCompany : null
          },
        })
    } else {
      alert(`For doing payment to ${item.name}, You need to select company "${notification.data.activeCompanyName}"`)
    }
  }
  setupPushNotification(_handleNotificationOpen)

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

  function MyTabBar({ state, descriptors, navigation }) {
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: disableTabs ? "red" : 'white',
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
                <View style={{ backgroundColor: disableTabs ? '#eeeeee' : isFocused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
                  <MaterialCommunityIcons name="view-dashboard" size={23} color={disableTabs ? '#808080' : isFocused ? '#5773FF' : '#808080'} />
                </View>
              );
            } else if (label == 'Parties') {
              return (
                <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
                  <MaterialIcons name="person" size={23} color={isFocused ? '#5773FF' : '#808080'} />
                </View>
              )
            } else if (label == 'More') {
              return (
                <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
                  <MaterialCommunityIcons name="dots-vertical" size={23} color={isFocused ? '#5773FF' : '#808080'} />
                </View>
              );
            } else if (label == 'Inventory') {
              return (
                <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 8.5, borderRadius: 20 }}>
                  <Icon name="Path-13016" size={19} color={isFocused ? '#5773FF' : '#808080'} />
                </View>)
            }
             else if (label == 'Accounts') {
              return (
                <View style={{ backgroundColor: isFocused ? '#e3e8ff' : '#eeeeee', padding: 8.0, borderRadius: 20 }}>
                  <Text style={{ color: isFocused ? '#5773FF' : '#808080', fontSize: 12, fontFamily: 'AvenirLTStd-Black', lineHeight:20 }}>
                    A/c</Text>
                </View>)
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
    const routeName = getFocusedRouteNameFromRoute(route);
    if (routeName === 'SalesInvoiceScreen') {
      return false;
    } else if (routeName === 'AddInvoiceItemScreen') {
      return false;
    }
    return true;
  };

  return (
    <Navigator tabBar={(props) => <MyTabBar {...props} />}>
      <Screen
        name={Routes.Transaction}
        component={DashPartyStack}
        options={({ route }) => ({
          tabBarLabel: 'Dashboard',
          tabBarVisible: getTabBarVisibility(route),
          tabBarIcon: ({ focused }) => (
            <View style={{ backgroundColor: focused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
              <MaterialCommunityIcons name="view-dashboard" size={23} color={focused ? '#5773FF' : '#808080'} />
            </View>
            // <MaterialCommunityIcons name="view-dashboard" size={26} color={focused ? '#5773FF' : '#808080'} />
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
        name={Routes.Accounts}
        component={AccountNavigator}
        options={({ }) => ({
          tabBarLabel: 'Accounts',
          tabBarIcon: ({ focused }) => (
            <View style={{ backgroundColor: focused ? '#e3e8ff' : '#eeeeee', padding: 8.5, borderRadius: 20 }}>
              <Icon name="inventory" size={19} color={focused ? '#5773FF' : '#808080'} />
            </View>)
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
          tabBarIcon: ({ focused }) => (
            <View style={{ backgroundColor: focused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
              <MaterialIcons name="person" size={26} color={focused ? '#5773FF' : '#808080'} />
            </View>
          )
        })}
      />
      <Screen
        name={Routes.More}
        component={MoreStack}
        options={({ route }) => ({
          tabBarLabel: 'More',
          tabBarVisible: getTabBarVisibility(route),
          tabBarIcon: ({ focused }) => (
            <View style={{ backgroundColor: focused ? '#e3e8ff' : '#eeeeee', padding: 6, borderRadius: 20 }}>
              <MaterialCommunityIcons name="dots-vertical" size={26} color={focused ? '#5773FF' : '#808080'} />
            </View>
          )
        })}
      />
    </Navigator>
  );
};
