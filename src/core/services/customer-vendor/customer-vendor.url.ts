import { createEndpoint } from '@/utils/helper';

export const CustomerVendorUrls = {
  getAllCountry: createEndpoint(
    'country?formName=&refresh=false&branchUniqueName=:branchUniqueName'
  ),
  getAllState: createEndpoint(
    'country/:countryCode?branchUniqueName=:branchUniqueName'
  ),
  getAllCity: createEndpoint(
    'country/cities?pinCode=:pinCode&branchUniqueName=:branchUniqueName&lang=en'
  ),
  getAllPartyType: createEndpoint(
    'ui/party-types?branchUniqueName=:branchUniqueName'
  ),
  getCustomerGroupName: createEndpoint(
    'company/:companyUniqueName/group-search?&group=sundrydebtors&includeSearchedGroup=true'
  ),
  getVendorGroupName: createEndpoint(
    'company/:companyUniqueName/group-search?&group=sundrycreditors&includeSearchedGroup=true'
  ),
  getAllCurrency: createEndpoint(
    'currency?branchUniqueName=:branchUniqueName'
  ),
  getCallingCode: createEndpoint(
    'ui/calling-code?branchUniqueName=:branchUniqueName'
  ),
  generateCreateCustomer: createEndpoint(
    'v2/company/:companyUniqueName/groups/:groupUniqueName/accounts?branchUniqueName=:branchUniqueName'
  ),
  generateCreateVendor: createEndpoint(
    'v2/company/:companyUniqueName/groups/:groupUniqueName/accounts?branchUniqueName=:branchUniqueName'
  ),
  generateUpdateVendor: createEndpoint(
    'v2/company/:companyUniqueName/groups/:groupUniqueName/accounts/:uniqueName?branchUniqueName=:branchUniqueName'
  ),
  getVendorEntry: createEndpoint(
    'v2/company/:companyUniqueName/accounts/:uniqueName?branchUniqueName=:branchUniqueName'
  ),
};