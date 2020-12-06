import {createEndpoint} from '@/utils/helper';

export const companyUrls = {
  companyDetails: createEndpoint('company/:companyUniqueName'),
  companyList: createEndpoint('users/:companyUniqueName/v2/companies'),
  companyBranch: createEndpoint('v2/company/:companyUniqueName/groups/sundrydebtors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false')
};
