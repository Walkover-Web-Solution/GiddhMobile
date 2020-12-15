import {CompanyState} from '@/core/store/company/index';
import {Company} from '@/models/interfaces/company';
import { company } from './index';

export const companyReducer = {
  /**
   * get company details Request
   * @param {CompanyState} state
   * @returns {CompanyState}
   */
  getCompanyDetailsRequest(state: CompanyState): CompanyState {
    return {
      ...state,
      activeCompany: null,
    };
  },
  getCompanyListRequest(state: CompanyState): CompanyState {
    return {
      ...state,
      companyList: null,
    };
  },
  /**
   * set company details response
   * sets activeCompany property in company store
   * @param {CompanyState} state
   * @param {Company} payload
   * @returns {CompanyState}
   */
  setCompanyDetailsResponse(state: CompanyState, payload: Company | null): CompanyState {
    return {
      ...state,
      activeCompany: payload,
    };
  },
};
