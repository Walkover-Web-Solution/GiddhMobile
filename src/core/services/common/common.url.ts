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
  getVoucher : createEndpoint('v4/company/:companyUniqueName/accounts/:accountName/vouchers?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  deleteVoucher : createEndpoint('company/:companyUniqueName/accounts/:accountName/vouchers?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  deleteEntry : createEndpoint('company/:companyUniqueName/accounts/:accountName/entries/:entryUniqueName?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  fetchProfitLossDetails : (startDate, endDate, branchUniqueName) => createEndpoint(`v2/company/:companyUniqueName/multibranch/profit-loss?tax=30&from=${startDate}&to=${endDate}&refresh=true&branchUniqueName=${branchUniqueName}&lang=en`),
  fetchBankAccounts : (startData, endDate, page) => createEndpoint(`v2/company/:companyUniqueName/groups/bankaccounts/account-balances?page=${page}&count=50&refresh=true&q=&sortBy=closingBalance&sort=desc&from=${startData}&to=${endDate}&branchUniqueName=:branchUniqueName&lang=en`),
  fetchDetailedBalanceSheet: (startDate, endDate, branchUniqueName) => createEndpoint(`v2/company/:companyUniqueName/multibranch/balance-sheet?from=${startDate}&to=${endDate}&fy=&selectedDateOption=1&branchUniqueName=${branchUniqueName}&selectedFinancialYearOption=&refresh=false&tagName=&lang=en`),
  downloadBalanceSheet: (startDate, endDate, viewType, branchUniqueName) => createEndpoint(`company/:companyUniqueName/v2/balance-sheet-collapsed-download?from=${startDate}&to=${endDate}&branchUniqueName=${branchUniqueName}&filename=balancesheet.xlsx&view=${viewType}&lang=en`),
  generateEWayBill: createEndpoint('company/:companyUniqueName/ewb?lang=en'),
  downloadEWB: (billNo) => createEndpoint(`company/:companyUniqueName/ewb/${billNo}/download?`),
  fetchTaxNumbers: createEndpoint('company/:companyUniqueName/tax-numbers'),
  fetchEWayBills: (startDate, endDate, gstno, page: number) => createEndpoint(`company/:companyUniqueName/ewb?fromDate=${startDate}&toDate=${endDate}&gstin=${gstno}&page=${page}&count=20&branchUniqueName=:branchUniqueName&`),
  downloadDetailedEWB: (billNo) => createEndpoint(`company/:companyUniqueName/ewb/${billNo}/download-detailed?branchUniqueName=:branchUniqueName&lang=en`),
  cancelEWayBill: createEndpoint(`company/:companyUniqueName/ewb/cancel?branchUniqueName=:branchUniqueName&lang=en`),
  addVehicleEWayBill: createEndpoint(`company/:companyUniqueName/ewb/vehicle?branchUniqueName=:branchUniqueName&lang=en`)
};
