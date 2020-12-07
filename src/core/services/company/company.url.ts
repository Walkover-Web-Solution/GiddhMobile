import {createEndpoint} from '@/utils/helper';

export const companyUrls = {
  companyDetails: createEndpoint('company/:companyUniqueName'),
  companyList: createEndpoint('users/:companyEmail/v2/companies'),
  companyBranch: createEndpoint('v2/company/:companyEmail/groups/sundrydebtors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false')
};
