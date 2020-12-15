import {Dispatch} from '@/core/store';
import {CommonService} from '@/core/services/common/common.service';
import {Country} from '@/models/interfaces/country';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';

export const commonEffects = (dispatch: Dispatch) => ({
  /**
   * get countries action
   * @returns {Promise<void>}
   */
  async getCountriesAction() {
    dispatch.common.setCountriesRequest();
    try {
      const response = await CommonService.getCurrencies();
      dispatch.common.setCountriesResponse(response.body as Country[]);
    } catch (error) {
      console.log(error);
      dispatch.common.setCountriesResponse([]);
      // show error toaster
    }
  },

  /**
   * get state details
   */
  async getStateDetailsAction() {
    try {
      const response = await CommonService.getStateDetails();
      await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, response.body.companyUniqueName);
    } catch (e) {
      await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, '');
    }
  },
});
