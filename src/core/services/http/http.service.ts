import axios from 'axios';
import {APP_EVENTS, HTTP_REQUEST_TIME_OUT, STORAGE_KEYS} from '@/utils/constants';
import {isNetworkConnected} from '@/utils/helper';
import Messages from '@/utils/messages';
import AsyncStorage from '@react-native-community/async-storage';
import {DeviceEventEmitter} from 'react-native';

const httpInstance = axios.create({
  timeout: HTTP_REQUEST_TIME_OUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// intercept request
httpInstance.interceptors.request.use(async (reqConfig) => {
  // check if internet is connected
  if (!isNetworkConnected) {
    return Promise.reject(new Error(Messages.internetNotAvailable));
  }

  let headers = reqConfig.headers;
  // add token related info here..
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    headers = {
      ...headers,
      'session-id': token,
    };

    // get active company from storage
    const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    if (activeCompany) {
      // replace company uniqueName in url with active company from storage
      reqConfig.url = reqConfig.url?.replace(':companyUniqueName', activeCompany);
    }
    if (reqConfig.url.includes(':companyEmail')) {
      const activeEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
      reqConfig.url = reqConfig.url?.replace(':companyEmail', activeEmail);
    }
  }
  return {...reqConfig, headers};
});

// intercept response
httpInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // emit invalid auth token event and do logout
      DeviceEventEmitter.emit(APP_EVENTS.invalidAuthToken, {});
    }
    return Promise.reject(error.response);
  },
);

export default httpInstance;
