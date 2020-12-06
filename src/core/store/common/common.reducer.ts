import {CommonState} from '@/core/store/common/index';
import {Country} from '@/models/interfaces/country';

export const commonReducer = {
  /**
   * set countries Request
   * @param {CommonState} state
   * @returns {CommonState}
   */
  setCountriesRequest(state: CommonState): CommonState {
    return {
      ...state,
      countries: [],
      isCountriesLoading: true,
    };
  },

  /**
   * set countries Response
   * sets countries property in common store
   * @param {CommonState} state
   * @param {Country[]} payload
   * @returns {CommonState}
   */
  setCountriesResponse(state: CommonState, payload: Country[]): CommonState {
    return {
      ...state,
      countries: payload,
      isCountriesLoading: false,
    };
  },
};
