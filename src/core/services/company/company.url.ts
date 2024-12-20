import { createEndpoint } from '@/utils/helper';

export const companyUrls = {
  countryList: createEndpoint('country/country-list?lang=:lang'),
  subscriptionPlans: createEndpoint('v2/subscription/plans/all?regionCode=:regionCode&lang=:lang'),
  allCountries: createEndpoint('country?formName=onboarding&refresh=false&lang=:lang'),
  allCountryStates: createEndpoint('country/:countryCode?lang=:lang'),
  promocode: createEndpoint('v2/subscription/promocode?lang=:lang'),
  getAmount: createEndpoint('v2/subscription/get-amount?lang=:lang'),
  planSubscribe: createEndpoint('v2/subscription?lang=:lang'),
  createCompanyCountryList: createEndpoint('v2/subscription/:subscriptionId/country-list?lang=:lang'),
  companyDetails: createEndpoint('company/:companyUniqueName'),
  companyList: createEndpoint('users/:userEmail/v2/companies'),
  companyBranch: createEndpoint('company/:companyUniqueName/branch'),
  createCompany:createEndpoint('company'),
  getFinancialYear: createEndpoint('company/:companyUniqueName/financial-year?branchUniqueName=:branchUniqueName&lang=en'),
  getLastStateDetails: createEndpoint('state-details?fetchLastState=true&lang=en'),
  updateStateDetails: createEndpoint('state-details?lang=en'),
  updateBranchStateDetails: createEndpoint('state-details?branchUniqueName=:branchUniqueName&lang=en'),
  destroyUserSession: (userEmail:string) => createEndpoint(`users/${userEmail}/destroy-session?lang=en`)
};
