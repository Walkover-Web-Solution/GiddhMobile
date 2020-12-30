import {Dispatch} from '@/core/store';
import {AuthService} from '@/core/services/auth/auth.service';
import {LoginResponse} from '@/models/interfaces/login';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';

export const authEffects = (dispatch: Dispatch) => ({
  async loginAction(payload: boolean) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    dispatch.auth.login(payload);
  },

  /**
   * set google login action
   * @returns {Promise<void>}
   */
  async googleLoginAction(payload) {
    dispatch.auth.setGoogleLoginRequest();
    try {
      const response = await AuthService.submitGoogleAuthToken(payload.token);
      await AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
      await AsyncStorage.setItem(STORAGE_KEYS.googleEmail, payload.email ? payload.email : '');

      // get state details
      await dispatch.common.getStateDetailsAction();

      // get company details
      await dispatch.company.getCompanyDetailsAction();

      dispatch.auth.setGoogleLoginResponse(response.body as LoginResponse);
    } catch (error) {
      console.log(error);
      dispatch.auth.setGoogleLoginResponse(null);
    }
  },

  /**
   * logouts user and clears token
   */
  async logoutAction() {
    await AsyncStorage.clear();
    dispatch.auth.logout();
  },
});
