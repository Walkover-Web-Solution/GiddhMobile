import httpInstance from '@/core/services/http/http.service';
import {commonUrls} from './common.url';
import {BaseResponse} from '@/models/classes/base-response';
import {Country} from '@/models/interfaces/country';
import {PartiesPaginatedResponse} from '@/models/interfaces/parties';
import {UserStateDetails} from '@/models/interfaces/user';

export class CommonService {
  /**
   * get currencies
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static getCurrencies(): Promise<BaseResponse<Country[]>> {
    return httpInstance.get(commonUrls.currency).then((res) => {
      return res.data;
    });
  }

  /**
   * get state details
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
  static getStateDetails(): Promise<BaseResponse<UserStateDetails>> {
    return httpInstance.get(commonUrls.stateDetails).then((res) => {
      return res.data;
    });
  }

  /**
   * get sundry debtors
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static getPartiesSundryCreditors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_creditors, {}).then((res) => {
      return res.data;
    });
  }

  /**
   * get sundry creditors
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static getPartiesSundryDebtors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_debtors, {}).then((res) => {
      return res.data;
    });
  }
  static getPartiesMainSundryDebtors(
    query,
    sortBy,
    order,
    count,
    page,
  ): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance
      .post(
        commonUrls.customer_vendor_report_sundry_debtors
          .replace('q=', `q=${query}`)
          .replace('sort=desc', `sort=${order}`)
          .replace('count=10', `count=${count}`)
          .replace('page=1', `page=${page}`)
          .replace('sortBy=closingBalance', `sortBy=${sortBy}`),
        {},
      )
      .then((res) => {
        return res.data;
      });
  }

  static getPartiesMainSundryCreditors(
    query,
    sortBy,
    order,
    count,
    page,
  ): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance
      .post(
        commonUrls.customer_vendor_report_sundry_creditors
          .replace('q=', `q=${query}`)
          .replace('sort=desc', `sort=${order}`)
          .replace('count=10', `count=${count}`)
          .replace('page=1', `page=${page}`)
          .replace('sortBy=closingBalance', `sortBy=${sortBy}`),
        {},
      )
      .then((res) => {
        return res.data;
      });
  }

  /**
   * get currencies
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static renewAccessToken() {
    return httpInstance.put(commonUrls.refreshAccessToken).then((res) => {
      return res.data;
    });
  }
}