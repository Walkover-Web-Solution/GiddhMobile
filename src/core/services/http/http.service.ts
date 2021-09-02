import axios from 'axios';
import { APP_EVENTS, HTTP_REQUEST_TIME_OUT, STORAGE_KEYS } from '@/utils/constants';
import { isNetworkConnected } from '@/utils/helper';
import Messages from '@/utils/messages';
import AsyncStorage from '@react-native-community/async-storage';
import { DeviceEventEmitter, Platform } from 'react-native';
import { commonUrls } from '@/core/services/common/common.url';
import moment from 'moment';

const httpInstance = axios.create({
  timeout: HTTP_REQUEST_TIME_OUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// intercept request
httpInstance.interceptors.request.use(async (reqConfig) => {
  // check if internet is connected
  if (!isNetworkConnected) {
    return Promise.reject(new Error(Messages.internetNotAvailable));
  }

  if (reqConfig.url.includes(':userEmail')) {
    const activeEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    reqConfig.url = reqConfig.url?.replace(':userEmail', activeEmail);
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
  return { ...reqConfig, headers };
});

// intercept response
httpInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      DeviceEventEmitter.emit(APP_EVENTS.invalidAuthToken, {});
    }
    return Promise.reject(error.response);
  }
);

export default httpInstance;
