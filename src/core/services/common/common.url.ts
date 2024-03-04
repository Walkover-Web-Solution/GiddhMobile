import { createEndpoint } from '@/utils/helper';

export const commonUrls = {
  currency: createEndpoint('currency'),
  refreshAccessToken: createEndpoint('users/:userEmail/increment-session'),
  stateDetails: createEndpoint('state-details'),
  customer_vendor_report_sundry_debtors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrydebtors/account-balances?page=1&count=20&sort=desc&sortBy=closingBalance&refresh=true&q=&branchUniqueName=:branchUniqueName'
  ),
  customer_vendor_report_sundry_creditors: createEndpoint(
    'v2/company/:companyUniqueName/groups/sundrycreditors/account-balances?page=1&count=20&sort=desc&sortBy=closingBalance&refresh=true&q=&branchUniqueName=:branchUniqueName'
  ),
  customer_transactions: createEndpoint(
    'company/:companyUniqueName/daybook?page=1&count=25&from=:startDate&to=:endDate&branchUniqueName=:branchUniqueName'
  ),
  parties_balance : createEndpoint('v2/company/:companyUniqueName/accounts/:accountName/balance?from=:startDate&to=:endDate&accountCurrency=true&branchUniqueName=:branchUniqueName&lang=en'),
  getCompanyTags : createEndpoint('company/:companyUniqueName/tags?branchUniqueName=:branchUniqueName&lang=en'),
  getCompanyDiscounts : createEndpoint('company/:companyUniqueName/discount?branchUniqueName=:branchUniqueName&lang=en'),
  uploadAttachment : createEndpoint('company/:companyUniqueName/ledger/upload?branchUniqueName=:branchUniqueName&lang=en'),
  getCurrencyConversion : createEndpoint('currency/rate?from=:fromCurrency&to=:toCurrency&date=:date&lang=en'),
  getAllVouchers : createEndpoint('company/:companyUniqueName/vouchers/get-all?from=:startDate&to=:endDate&page=:page&count=:count&type=:voucherType&voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  deleteVoucher : createEndpoint('company/:companyUniqueName/accounts/:accountName/vouchers?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  deleteEntry : createEndpoint('company/:companyUniqueName/accounts/:accountName/entries/:entryUniqueName?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en')
};
