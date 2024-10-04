import React, { useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Routes from './routes';
import Icon from '@/core/components/custom-icon/custom-icon';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { PartiesStack } from './parties.navigator';
import { View, DeviceEventEmitter } from 'react-native';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { AccountNavigator } from './account.navigator';
import AllVoucherScreen from '@/screens/AllVoucherScreen/AllVoucherScreen';
import TabBar from './components/TabBar';

const { Navigator, Screen } = createBottomTabNavigator();

export function setupPushNotification(handleNotification: any) {

  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
      // console.log("TOKEN:", token);
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
    <Navigator tabBar={(props) => <TabBar {...props} branchSelected={branchSelected} />} screenOptions={{headerShown:false}}>
      <Screen
        name={Routes.BottomTabScreen1}
        component={AllVoucherScreen}
        options={{headerShown:false}}
      />
      <Screen
        name={Routes.BottomTabScreen2}
        component={AllVoucherScreen}
        options={{headerShown:false}}
      />
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
        component={EmptyScreen}
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

const EmptyScreen = () => {
  return null
}
