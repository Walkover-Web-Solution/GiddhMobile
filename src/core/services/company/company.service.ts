import httpInstance from '@/core/services/http/http.service';
import { BaseResponse } from '@/models/classes/base-response';
import { companyUrls } from '@/core/services/company/company.url';
import { Company } from '@/models/interfaces/company';

export class CompanyService {
  /**
   * get company details
   * @returns {Promise<BaseResponse<Company>>}
   */
  static getCompanyDetails (): Promise<BaseResponse<Company>> {
    return httpInstance.get(companyUrls.companyDetails).then((res) => {
      return res.data;
    });
  }

  /**
   * get company List
   */
  static getCompanyList () {
    return httpInstance.get(companyUrls.companyList).then((res) => {
      return res.data;
    });
  }

  /**
   * get company Branch
   * will work on basis of comapny if unique name supplied
   */
  static getCompanyBranches (uniqueName) {
    let companyURL = companyUrls.companyBranch;
    if (uniqueName) {
      companyURL = companyURL.replace(':companyUniqueName', uniqueName);
    }
    return httpInstance.get(companyURL).then((res) => {
      return res.data;
    });
  }

  /**
  * Create Company
  */
   static createCompany (payload: any){
    return httpInstance
      .post(companyUrls.createCompany,payload)
      .then((res) => {
        return res.data;
      }).catch((_err) => {
        console.log("Error "+_err.data)
        return _err.data;
      });;
  }

  /**
   * Get Array of Financial Years
   */
    static getFinancialYear () {
      return httpInstance.get(companyUrls.getFinancialYear).then((res) => {
        return res.data;
      });
    }


  // fetch last state details
    static getLastStateDetails () {
      return httpInstance.get(companyUrls.getLastStateDetails).then((res) => {
        return res.data;
      })
    }

  //update last state details
    static updateStateDetails (payload:any) {
      return httpInstance.post(companyUrls.updateStateDetails,payload).then((res) => {
        return res.data;
      }).catch((err) => {
        console.warn(err);
        return err;        
      })
    }
    
  //update last state of branch
    static updateBranchStateDetails (payload:any) {
      const {branchUniqueName, body} = payload;
      let endPoint = companyUrls.updateBranchStateDetails;
      endPoint.replace(':branchUniqueName',branchUniqueName);
      return httpInstance.post(endPoint,body).then((res) => {
        return res.data;
      }).catch((err) => {
        console.warn(err);
      })
    }

  static getCountryList () {
    return httpInstance.get(companyUrls.countryList);
  }

  static getSubscriptionPlans (regionCode: string) {
    return httpInstance.get(companyUrls.subscriptionPlans.replace(':regionCode', regionCode));
  }

  static getAllCountries () {
    return httpInstance.get(companyUrls.allCountries);
  }

  static getCountryStates (countryCode: string) {
    return httpInstance.get(companyUrls.allCountryStates.replace(':countryCode', countryCode));
  }

  static applyPromocode (payload: any) {
    return httpInstance.post(companyUrls.promocode, payload);
  }
  
  static getAmount (payload: any) {
    return httpInstance.post(companyUrls.getAmount, payload);
  }

  static planSubscribe (payload: any) {
    return httpInstance.post(companyUrls.planSubscribe, payload);
  }

  static createCompanyCountryList (subscriptionId: string) {
    return httpInstance.get(companyUrls.createCompanyCountryList.replace(':subscriptionId', subscriptionId));
  }

  static destroyUserSession (userEmail: string) {
    return httpInstance.delete(companyUrls.destroyUserSession(userEmail));
  }
}
