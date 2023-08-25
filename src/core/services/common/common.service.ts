import httpInstance from '@/core/services/http/http.service';
import { commonUrls } from './common.url';
import { BaseResponse } from '@/models/classes/base-response';
import { Country } from '@/models/interfaces/country';
import { PartiesPaginatedResponse } from '@/models/interfaces/parties';
import { UserStateDetails } from '@/models/interfaces/user';
import { Alert } from 'react-native';

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
  static async getTransactions(startDate: string, endDate: string, page: any,vouchers = []): Promise<BaseResponse<PartiesPaginatedResponse>> {
    // const branchName = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
    return httpInstance
      .post(
        commonUrls.customer_transactions
          .replace(':startDate', startDate)
          .replace(':endDate', endDate)
          .replace('page=1', `page=${page}`),
        // .replace(':branchUniqueName', `${branchName}`),
        {
          vouchers: vouchers
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log('---- getTransactions ----', error);
        return {}
      });
  }

  static getPartyTransactions(
    startDate: string,
    endDate: string,
    page: any,
    party: any,
    vouchers = []
  ): Promise<BaseResponse<PartiesPaginatedResponse>> {
    if (startDate == null || endDate == null) {
      console.log("Get transcation api call without date- " + JSON.stringify(commonUrls.customer_transactions).replace('&from=:startDate&to=:endDate', "").replace('page=1', `page=${page}`))
      return httpInstance
        .post(
          commonUrls.customer_transactions
            .replace('&from=:startDate&to=:endDate', "")
            .replace('page=1', `page=${page}`)
          , {
            includeParticulars: true,
            particulars: [party],
            includeVouchers: true,
            vouchers: vouchers
          }
        )
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.log('---- getPartyTransactions ----', error);
          return {}
        });;
    } else {
      console.log("Get transcation api call with date - " + JSON.stringify(commonUrls.customer_transactions).replace(':startDate', startDate).replace(':endDate', endDate).replace('page=1', `page=${page}`))
      return httpInstance
        .post(
          commonUrls.customer_transactions
            .replace(':startDate', startDate)
            .replace(':endDate', endDate)
            .replace('page=1', `page=${page}`),
          {
            includeParticulars: true,
            particulars: [party],
            includeVouchers: true,
            vouchers: vouchers
          }
        )
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.log('---- getPartyTransactions ----', error);
          return {}
        });;
    }
  }

  static getPartiesSundryCreditors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_creditors, {}).then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log('---- getPartiesSundryCreditors ----', error);
      return {}
    });;
  }

  /**
   * get sundry creditors
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static getPartiesSundryDebtors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_debtors, {}).then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log('---- getPartiesSundryDebtors ----', error);
    });;
  }

  static getPartiesMainSundryDebtors(
    query: any,
    sortBy: any,
    order: any,
    count: any,
    page: any
  ): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance
      .post(
        commonUrls.customer_vendor_report_sundry_debtors
          .replace('q=', `q=${query}`)
          .replace('sort=desc', `sort=${order}`)
          .replace('count=10', `count=${count}`)
          .replace('page=1', `page=${page}`)
          .replace('sortBy=closingBalance', `sortBy=${sortBy}`),
        {}
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log('---- getPartiesMainSundryDebtors ----', error);
      });
  }

  static getPartiesMainSundryCreditors(
    query: any,
    sortBy: any,
    order: any,
    count: any,
    page: any
  ): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance
      .post(
        commonUrls.customer_vendor_report_sundry_creditors
          .replace('q=', `q=${query}`)
          .replace('sort=desc', `sort=${order}`)
          .replace('count=10', `count=${count}`)
          .replace('page=1', `page=${page}`)
          .replace('sortBy=closingBalance', `sortBy=${sortBy}`),
        {}
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
