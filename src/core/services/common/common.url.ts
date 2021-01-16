import {createEndpoint} from '@/utils/helper';

export const commonUrls = {
  currency: createEndpoint('currency'),
  refreshAccessToken: createEndpoint('users/:userEmail/increment-session'),
  stateDetails: createEndpoint('state-details'),
  customer_vendor_report_sundry_debtors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrydebtors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=true&q=',
  ),
  customer_vendor_report_sundry_creditors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=true&q=',
  ),
  customer_transactions: createEndpoint(
    'company/mobilein1601731188063045bms/daybook?page=0&count=20&from=01-04-2020&to=05-10-2020&branchUniqueName=undefined',
  ),
  // customer_: createEndpoint(
  //   'v2/companies/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=10&sort=desc&sortBy=closingBalance&refresh=false',
  // ),
  //https://apitest.giddh.com/users/%7BuserUniqueName%7D/v2/companies
};
