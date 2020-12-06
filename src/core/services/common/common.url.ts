import {createEndpoint} from '@/utils/helper';

export const commonUrls = {
  currency: createEndpoint('currency'),
  stateDetails: createEndpoint('state-details'),
  customer_vendor_report_sundry_debtors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrydebtors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false',
  ),
  customer_vendor_report_sundry_creditors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false',
  )
  // customer_: createEndpoint(
  //   'v2/companies/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false',
  // ),
  //https://apitest.giddh.com/users/%7BuserUniqueName%7D/v2/companies
};
