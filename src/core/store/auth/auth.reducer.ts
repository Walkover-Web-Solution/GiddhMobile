import {AuthState} from '@/core/store/auth/index';
import {LoginResponse} from '@/models/interfaces/login';

export const authReducer = {
  login(state: AuthState, payload: boolean): AuthState {
    return {
      ...state,
      isLoginInProcess: payload,
    };
  },

  /**
   * set google login Request
   * @param {CommonState} state
   * @returns {CommonState}
   */
  setGoogleLoginRequest(state: AuthState): AuthState {
    return {
      ...state,
      isLoginInProcess: true,
      token: '',
      user: null,
    };
  },

  /**
   * set google login Response
   * sets countries property in common store
   * @param {AuthState} state
   * @param {Country[]} payload
   * @returns {AuthState}
   */
  setGoogleLoginResponse(state: AuthState, payload: LoginResponse | null): AuthState {
    return {
      ...state,
      isLoginInProcess: true,
      token: payload ? payload.session?.id : '',
      user: payload ? payload.user : null,
    };
  },

  /**
   * logout
   * logs out user by clearing token
   * @param {AuthState} state
   * @returns {AuthState}
   */
  logout(state: AuthState): AuthState {
    return {
      ...state,
      token: '',
      user: null,
    };
  },
};
