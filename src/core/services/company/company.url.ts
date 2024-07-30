import { createEndpoint } from '@/utils/helper';

export const companyUrls = {
  companyDetails: createEndpoint('company/:companyUniqueName'),
  companyList: createEndpoint('users/:userEmail/v2/companies'),
  companyBranch: createEndpoint('company/:companyUniqueName/branch'),
  createCompany:createEndpoint('company'),
  getFinancialYear: createEndpoint('company/:companyUniqueName/financial-year?branchUniqueName=:branchUniqueName&lang=en'),
  getLastStateDetails: createEndpoint('state-details?fetchLastState=true&lang=en'),
  updateStateDetails: createEndpoint('state-details?lang=en'),
  updateBranchStateDetails: createEndpoint('state-details?branchUniqueName=:branchUniqueName&lang=en'),
};
