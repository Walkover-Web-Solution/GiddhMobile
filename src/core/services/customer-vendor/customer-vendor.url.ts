import { createEndpoint } from '@/utils/helper';

export const CustomerVendorUrls = {
  getAllCountry: createEndpoint(
    'country?formName=&refresh=false&branchUniqueName=:branchUniqueName'
  ),
  getAllState: createEndpoint(
    'country/:countryCode?branchUniqueName=:branchUniqueName'
  ),
  getAllPartyType: createEndpoint(
    'ui/party-types?branchUniqueName=:branchUniqueName'
  ),
  getAllCurrency: createEndpoint(
    'currency?branchUniqueName=:branchUniqueName'
  ),
  getCallingCode: createEndpoint(
    'ui/calling-code?branchUniqueName=:branchUniqueName'
  ),
  generateCreateCustomer: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrydebtors/accounts?branchUniqueName=:branchUniqueName'
  ),
  generateCreateVendor: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrycreditors/accounts?branchUniqueName=:branchUniqueName'
  ),
  generateUpdateVendor: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrycreditors/accounts/:uniqueName?branchUniqueName=:branchUniqueName'
  ),
  getVendorEntry: createEndpoint(
    'v2/company/:companyUniqueName/accounts/:uniqueName?branchUniqueName=:branchUniqueName'
  )
  
};