import axios from 'axios';
import { APP_EVENTS, HTTP_REQUEST_TIME_OUT, STORAGE_KEYS } from '@/utils/constants';
import Messages from '@/utils/messages';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter, Platform, ToastAndroid } from 'react-native';
import { commonUrls } from '@/core/services/common/common.url';
import moment from 'moment';
import NetInfo from '@react-native-community/netinfo';
import TOAST from 'react-native-root-toast';

let store;

export const injectStoreToHttpInstance = _store => {
  store = _store;
}

const httpInstance = axios.create({
  timeout: HTTP_REQUEST_TIME_OUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
export let count = 0
// intercept request
httpInstance.interceptors.request.use(async (reqConfig) => {
  // check if internet is connected
  const CheckInternet = NetInfo.addEventListener(state => {
    if (!state.isConnected && count == 0) {
      count = count + 1
      if (Platform.OS == "ios") {
        TOAST.show(Messages.internetNotAvailable, {
          duration: TOAST.durations.LONG,
          position: -140,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      } else {
        ToastAndroid.show(Messages.internetNotAvailable, ToastAndroid.LONG);
      }
    }
  });
  // Unsubscribe
  CheckInternet();

  if (reqConfig.url.includes(':userEmail')) {
    const activeEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    reqConfig.url = reqConfig.url?.replace(':userEmail', activeEmail?.toLowerCase());
  }
  // if (reqConfig.url.includes('userEmail')) {
  //   const activeEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
  //   reqConfig.url = reqConfig.url?.replace('userEmail', activeEmail);
  // }
  // validate session & renew if going to get expired
  const createdAt = await AsyncStorage.getItem(STORAGE_KEYS.sessionStart);
  const expiresAt = await AsyncStorage.getItem(STORAGE_KEYS.sessionEnd);
  if (createdAt && expiresAt && !reqConfig.url.includes('increment-session')) {
    const startDate = moment(createdAt, 'DD-MM-YYYY h:mm:ss').toDate();
    const endDate = moment(expiresAt, 'DD-MM-YYYY h:mm:ss').toDate();
    const totalSessionTime = (endDate.getTime() - startDate.getTime()) / 1000;
    const sessionTimeLeft = (endDate.getTime() - new Date().getTime()) / 1000;
    // if half session is left increment session now
    if (sessionTimeLeft <= totalSessionTime / 2) {
      const sessionResponse = await httpInstance.put(commonUrls.refreshAccessToken);
      if (sessionResponse && sessionResponse.data && sessionResponse.data.body && sessionResponse.data.body.session) {
        const session = sessionResponse.data.body.session;
        await AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, session.expiresAt ? session.expiresAt : '');
        await AsyncStorage.setItem(STORAGE_KEYS.token, session.id ? session.id : '');
        await AsyncStorage.setItem(STORAGE_KEYS.sessionStart, session.createdAt ? session.createdAt : '');
      }
    }
    // get active company from storage
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    if (activeCompany) {
      // replace company uniqueName in url with active company from storage
      reqConfig.url = reqConfig.url?.replace(':companyUniqueName', activeCompany);
    }
    const activeBranch = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    if (activeBranch) {
      // replace company uniqueName in url with active company from storage
      reqConfig.url = reqConfig.url?.replace(':branchUniqueName', activeBranch);
    }
  }
  if (reqConfig?.url?.includes(':currency')) {
    const currency = store?.getState()?.commonReducer?.companyDetails?.baseCurrency;
    reqConfig.url = reqConfig.url?.replace(/:currency/g, currency);
  }

  let headers = reqConfig.headers;
  // add token related info here..
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    headers = {
      ...headers,
      'session-id': token
      // 'User-Agent': Platform.OS,
    };
  }
  // if (!reqConfig.url.includes('verify-number')){
  headers['User-Agent'] = Platform.OS;
  // }
  // console.log('intercepted url ------------');
  // console.log(reqConfig.url);
  return { ...reqConfig, headers };
});

// intercept response
httpInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        DeviceEventEmitter.emit(APP_EVENTS.invalidAuthToken, {});
      }
    }
    return Promise.reject(error.response)
  }
);

export default httpInstance;
