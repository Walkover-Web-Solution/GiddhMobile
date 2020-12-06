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
}
