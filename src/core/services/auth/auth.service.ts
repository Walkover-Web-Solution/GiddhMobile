import httpInstance from '@/core/services/http/http.service';
import {AccountUrls} from './auth.urls';
import {BaseResponse} from '@/models/classes/base-response';
import {LoginResponse} from '@/models/interfaces/login';
import { Any } from 'typescript-compare';

export class AuthService {
  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static submitGoogleAuthToken(token: string): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .get(AccountUrls.googleLogin, {
        headers: {'access-token': token},
      })
      .then((res) => {
        return res.data;
      });
  }
/**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static userLogin(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.userLogin, {
        'email': payload.username,
        'password': payload.password,
      })
      .then((res) => {
        return res.data;
      });
  }
   /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static submitAppleAuthToken(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.appleLogin, {
          'authorizationCode': payload.authorizationCode,
          'email': payload.email,
          'fullName': payload.fullName,
          'identityToken': payload.identityToken,
          'state': payload.state,
          'user': payload.user
      })
      .then((res) => {
        return res.data;
      });
  }

  static verifyOTP(otp: string, mobileNumber: string, countryCode: string): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
    .post(AccountUrls.verifyOTP, {
      countryCode: countryCode,
      mobileNumber: mobileNumber,
      oneTimePassword: otp
    })
      .then((res) => {
        return res.data;
      });
  }
}