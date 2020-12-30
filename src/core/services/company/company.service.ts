import httpInstance from '@/core/services/http/http.service';
import {BaseResponse} from '@/models/classes/base-response';
import {companyUrls} from '@/core/services/company/company.url';
import {Company} from '@/models/interfaces/company';

export class CompanyService {
  /**
   * get company details
   * @returns {Promise<BaseResponse<Company>>}
   */
  static getCompanyDetails(): Promise<BaseResponse<Company>> {
    return httpInstance.get(companyUrls.companyDetails).then((res) => {
      return res.data;
    });
  }

/**
   * get company List
   */
  static getCompanyList() {
    return httpInstance.get(companyUrls.companyList).then((res) => {
      return res.data;
    });
  }

  
  /**
   * get company Branch
   * will work on basis of comapny if unique name supplied
   */
  static getCompanyBranches(uniqueName) {
    let companyURL = companyUrls.companyBranch;
    if(uniqueName){
      companyURL = companyURL.replace(':companyUniqueName', uniqueName);
    }
    return httpInstance.get(companyURL).then((res) => {
      return res.data;
    });
  }
}
