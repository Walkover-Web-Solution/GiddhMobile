import {createEndpoint} from '@/utils/helper';

export const companyUrls = {
  companyDetails: createEndpoint('company/:companyUniqueName'),
  companyList: createEndpoint('users/:userEmail/v2/companies'),
  companyBranch: createEndpoint('company/:companyUniqueName/branch')
};
// https://apitest.giddh.com/company/%7BcompanyUniqueName%7D/branch