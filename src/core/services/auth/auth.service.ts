import httpInstance from '@/core/services/http/http.service';
import {AccountUrls} from './auth.urls';
import {BaseResponse} from '@/models/classes/base-response';
import {LoginResponse} from '@/models/interfaces/login';

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

  static verifyOTP(otp: string, mobileNumber: string, countryCode: string): Promise<BaseResponse<LoginResponse>> {
    debugger
    return httpInstance
    .post(AccountUrls.verifyOTP, {
      countryCode: countryCode,
      mobileNumber: mobileNumber,
      oneTimePassword: otp
    })
      .then((res) => {
        debugger
        return res.data;
      });
  }
}
