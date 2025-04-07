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
   * Get All Vouchers
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
  static getAllVouchers(voucherType: string, startDate: string, endDate: string, page: number, count: number, companyVoucherVersion: number, payload: object) {
    return httpInstance.post(
      commonUrls.getAllVouchers
        .replace(':startDate', startDate)
        .replace(':endDate', endDate)
        .replace(':voucherType', voucherType)
        .replace(':page', String(page))
        .replace(':count', String(count))
        .replace(':voucherVersion', String(companyVoucherVersion)),
        payload
    )
    .then((res) => {
      return res.data;
    })
  }

  /**
   * Delete Voucher Voucher
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
  static async deleteVoucher(accountUniqueName: string, companyVoucherVersion: number, payload: { uniqueName: string, voucherType: string }) {
    return httpInstance.delete(
      commonUrls.deleteVoucher
        .replace(':accountName', accountUniqueName)
        .replace(':voucherVersion', String(companyVoucherVersion)),
        {
          data: payload
        }
    )
    .then((res) => {
      return res.data;
    })
  }

  /**
   * Get Voucher Voucher
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
  static async getVoucher(accountUniqueName: string, companyVoucherVersion: number, payload: { number: string, uniqueName: string, type: string }) {
    return httpInstance.post(
      commonUrls.getVoucher
        .replace(':accountName', accountUniqueName)
        .replace(':voucherVersion', String(companyVoucherVersion)),
        payload
    )
    .then((res) => {
      return res.data;
    })
  }
  
  /**
   * Update Voucher Voucher
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
  static async updateVoucher(accountUniqueName: string, companyVoucherVersion: number, payload: any) {
    return httpInstance.put(
      commonUrls.getVoucher
        .replace(':accountName', accountUniqueName)
        .replace(':voucherVersion', String(companyVoucherVersion)),
        payload
    )
    .then((res) => {
      return res.data;
    })
  }

    /**
   * Get All Vouchers
   * @returns {Promise<BaseResponse<UserStateDetails[]>>}
   */
    static async deleteEntry(accountUniqueName: string, entryUniqueName: string, companyVoucherVersion: number) {
      return httpInstance.delete(
        commonUrls.deleteEntry
          .replace(':accountName', accountUniqueName)
          .replace(':entryUniqueName', entryUniqueName)
          .replace(':voucherVersion', String(companyVoucherVersion))
      )
      .then((res) => {
        return res.data;
      })
    }

  /**
   * get sundry debtors
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static async getTransactions(startDate: string, endDate: string, page: any, vouchers = []): Promise<BaseResponse<PartiesPaginatedResponse>> {
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
        console.log('---- Error in getTransactions ----', error?.data);
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
  static getPartyBalance(
    startDate: string,
    endDate: string,
    accountName: any,
  ) {
    if (startDate == null || endDate == null) {
      return httpInstance
        .get(
          commonUrls.parties_balance
            .replace('&from=:startDate&to=:endDate', "")
        )
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.log('---- getPartyBalance ----', error);
          return {}
        });;
    } else {
      return httpInstance
        .get(
          commonUrls.parties_balance
            .replace(':startDate', startDate)
            .replace(':endDate', endDate)
            .replace(':accountName', accountName)
        )
        .then((res) => {
          return res.data;
        })
        .catch((error) => {
          console.log('---- getPartyBalance ----', error);
          return {}
        });;
    }
  }

  static getPartiesSundryCreditors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_creditors, {}).then((res) => {
      return res.data;
    })
  }

  /**
   * get sundry creditors
   * @returns {Promise<BaseResponse<Country[]>>}
   */
  static getPartiesSundryDebtors(): Promise<BaseResponse<PartiesPaginatedResponse>> {
    return httpInstance.post(commonUrls.customer_vendor_report_sundry_debtors, {}).then((res) => {
      return res.data;
    })
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

  static getCompanyTags() {
    return httpInstance.get(commonUrls.getCompanyTags).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in company tags ----', error);
      });;
  }
  static getCompanyDiscounts() {
    return httpInstance.get(commonUrls.getCompanyDiscounts).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in company disounts ----', error);
      });;
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

  static uploadAttachment(data: any) {
    return httpInstance
      .post(
        commonUrls.uploadAttachment,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log('---- catch block of upload attachment ----', error);
      });
  }

  static getCurrencyConversion(fromCurrency: string,toCurrency:string,date:any) {
    return httpInstance.get(commonUrls.getCurrencyConversion.replace(':fromCurrency',fromCurrency).replace(':toCurrency',toCurrency).replace(':date',date)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in currency conversion ----', error);
      });;
  }

  static fetchProfitLossDetails(startDate: string, endDate: string, branchUniqueName:string) {
    return httpInstance.get(commonUrls.fetchProfitLossDetails(startDate,endDate,branchUniqueName))
    .then((res) => {
      return res?.data;
    }).catch((err) => {
      console.log("Error while fetching profit and loss details", err);
      return err;
    })
  }

  static fetchBankAccounts(startDate: string, endDate: string, page:number) {
    return httpInstance.get(commonUrls.fetchBankAccounts(startDate, endDate, page))
    .then((res)=>{
      return res?.data;
    }).catch((err)=>{
      console.log("Error fetching bank accounts",err);
    })
  }

  static fetchDetailedBalanceSheet(startDate: string, endDate: string, branchUniqueName: string) {
    return httpInstance.get(commonUrls.fetchDetailedBalanceSheet(startDate, endDate, branchUniqueName))
    .then((res) => {
      return res?.data;
    }).catch((err) => {
      console.log("Error while fetching balance sheet");
      // return err;
    })
  }

}