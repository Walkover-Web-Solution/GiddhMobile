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


  static getCompanyList() {
    return httpInstance.get(companyUrls.companyList).then((res) => {
      return res.data;
    });
  }


  // static getCompanyList(): Promise<BaseResponse<Company>> {
  //   let url = companyUrls.companyList
  //   return httpInstance.get(url).then((res) => {
  //     return res.data;
  //   }).catch((err)=>{
  //       alert(err)
  //   });
  // }
}
