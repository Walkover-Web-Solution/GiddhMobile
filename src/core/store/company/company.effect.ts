import {Dispatch} from '@/core/store';
import {CompanyService} from '@/core/services/company/company.service';
import {Company} from '@/models/interfaces/company';

export const companyEffects = (dispatch: Dispatch) => ({
  /**
   * get company details action
   * @returns {Promise<void>}
   */
  async getCompanyDetailsAction() {
    dispatch.company.getCompanyDetailsRequest();
    try {
      const response = await CompanyService.getCompanyDetails();
      dispatch.company.setCompanyDetailsResponse(response.body as Company);
    } catch (error) {
      console.log(error);
      dispatch.company.setCompanyDetailsResponse(null);
      // show error toaster
    }
  },

  async getCompanyListAndBranchAction() {
    // dispatch.company.getCompanyList();
    try {
      const companyList = await CompanyService.getCompanyList();
      const companyBranches = await CompanyService.getCompanyBranches();

     // dispatch.company.setCompanyDetailsResponse(response.body as Company);
    } catch (error) {
      
      console.log(error);
      dispatch.company.setCompanyDetailsResponse(null);
      // show error toaster
    }
  }

});
