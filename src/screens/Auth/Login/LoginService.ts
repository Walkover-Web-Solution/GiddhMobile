// import * as api from '../util/api';
// import { ApiRequestObject } from '../util/types';
// import { Platform } from 'react-native';
  
// const TAG_COMMON_SERVICE = 'TAG_COMMON_SERVICE';
// import {  ENDPOINT } from '../util/constant';
// import AsyncStorage from '../util/AsyncStorageUtil';

import {AuthService} from '@/core/services/auth/auth.service';

/**
   * set google login action
   * @returns {Promise<void>}
   */
//   export async function loginWith(username, password): Promise<ServiceResponse> {

  export async function googleLogin(token) {
    try {
      const response = await AuthService.submitGoogleAuthToken(token);
    //   await AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    //   await AsyncStorage.setItem(STORAGE_KEYS.googleEmail, payload.email ? payload.email : '');

    //   // get state details
    //   await dispatch.common.getStateDetailsAction();

    //   // get company details
    //   await dispatch.company.getCompanyDetailsAction();

    //   dispatch.auth.setGoogleLoginResponse(response.body as LoginResponse);
    return response
    } catch (error) {
      debugger
      console.log(error);
     // dispatch.auth.setGoogleLoginResponse(null);
    }
  }