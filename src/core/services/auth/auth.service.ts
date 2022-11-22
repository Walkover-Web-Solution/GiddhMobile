import httpInstance from '@/core/services/http/http.service';
import { AccountUrls } from './auth.urls';
import { BaseResponse } from '@/models/classes/base-response';
import { LoginResponse } from '@/models/interfaces/login';

export class AuthService {
  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static submitGoogleAuthToken(token: string): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .get(AccountUrls.googleLogin, {
        headers: { 'access-token': token }
      })
      .then((res) => {
        return res.data;
      });
  }

  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static resetPassword(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .put(AccountUrls.resetPassword.replace(":userEmail", payload), {})
      .then((res) => {
        return res.data;
      });
  }

  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static setNewPassword(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .put(AccountUrls.setNewPassword, payload)
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
        uniqueKey: payload.username,
        password: payload.password
      })
      .then((res) => {
        return res.data;
      });
  }


  /**
  * get response from server
  * @returns {Promise<BaseResponse<LoginResponse>>}
  */
  static sentOTPSignup(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.userSignUpOTP, {
        email: payload.email,
        password: payload.password
      })
      .then((res) => {
        return res.data;
      });
  }

  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static verifySignupOTP(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.verifySignupOTP, {
        email: payload.email,
        verificationCode: payload.verificationCode
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
        authorizationCode: payload.authorizationCode,
        email: payload.email,
        fullName: payload.fullName,
        identityToken: payload.identityToken,
        state: payload.state,
        user: payload.user
      })
      .then((res) => {
        return res.data;
      });
  }

  /**
   * get response from server
   * @returns {Promise<BaseResponse<LoginResponse>>}
   */
  static submitLoginWithOtpAuthToken(accessToken: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.loginWithOTP, {
        accessToken: accessToken
      })
      .then((res) => {
        return res.data;
      });
  }

  static verifyOTP(otp: string, mobileNumber: string, countryCode: string): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.verifyOTP, {
        oneTimePassword: otp,
        countryCode: countryCode,
        mobileNumber: mobileNumber
      })
      .then((res) => {
        return res.data;
      });
  }

  static sendOTP(payload: any): Promise<BaseResponse<LoginResponse>> {
    return httpInstance
      .post(AccountUrls.sendOTP, payload)
      .then((res) => {
        return res.data;
      });
  }
}
