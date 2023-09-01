import { createEndpoint } from '@/utils/helper';

export const invoiceUrls = {
  search: createEndpoint(
    'company/:companyUniqueName/v2/account-search?q=&page=&group=&branchUniqueName=:branchUniqueName&withStocks='
  ),
  purchaseBillsearch: createEndpoint(
    'company/:companyUniqueName/account-search?q=&page=&group=%2C%20bankaccounts%2C%20cash&branchUniqueName=:branchUniqueName'
  ),
  getAccountDetails: createEndpoint('v2/company/:companyUniqueName/accounts/:q?branchUniqueName=:branchUniqueName'),
  stockDetailService: createEndpoint(
    'v3/company/:companyUniqueName/particular/:sales_type?stockUniqueName=&variantUniqueName=&lang=:lang'
  ),
  // salesDetailService: createEndpoint('v2/company/:companyUniqueName/particular/:sales_type?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  salesDetailService: createEndpoint(
    'v3/company/:companyUniqueName/particular/:sales_type?lang=:lang'
  ),
  getStockVariants: createEndpoint(
    'company/:companyUniqueName/stock/:stockUniqueName/variants?lang=en'
  ),
  getDiscounts: createEndpoint('company/:companyUniqueName/discount?branchUniqueName=:branchUniqueName'),
  getTaxes: createEndpoint('company/:companyUniqueName/tax?branchUniqueName=:branchUniqueName'),
  genrateInvoice: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName'
  ),
  genratePurchaseBill: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/purchase-record/generate?branchUniqueName=:branchUniqueName'
  ),
  generateVoucher: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName&voucherVersion=:voucherVersion'
    ),
  generateDebitNote: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName'
  ),
  generateReceipt: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/ledgers-v2?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=:lang'
  ),
  generatePayment: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/ledgers-v2?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=:lang'
  ),
  getWarehouse: createEndpoint(
    'company/:companyUniqueName/warehouse?page=1&refresh=true&count=100&branchUniqueName=:branchUniqueName'
  ),
  getBriefAccount: createEndpoint(
    'company/:companyUniqueName/brief-accounts?group=cash,%20bankaccounts,%20loanandoverdraft&count=0&currency=IN,%20INR&lang=:lang'
  ),
  getBriefAccountForReceipt: createEndpoint(
    'company/:companyUniqueName/brief-accounts?group=cash,%20bankaccounts,%20loanandoverdraft&count=0&currency=IN,%20INR&lang=:lang'
  ),
  getVoucherInvoice: createEndpoint(
    'company/:companyUniqueName/vouchers/invoice-list?voucherDate=:voucherDate&branchUniqueName=:branchUniqueName&voucherVersion=:voucherVersion'
  ),
  getInvoicesForReceipt: createEndpoint(
    'company/:companyUniqueName/vouchers/invoice-list?voucherDate=:voucherDate&adjustmentRequest=true&count=:count&page=:page&number=&voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'
    ),
  getExchangeRateToINR: createEndpoint(
    'currency/rate?from=:from&to=:to&date=:date&branchUniqueName=:branchUniqueName'
  ),
  getCountryDetails: createEndpoint(
    'country/:countryCode'
  ),
  getCompanyBranchAddresses: createEndpoint(
    'company/:companyUniqueName/branch?branchUniqueName=:branchUniqueName'
  ),
  getWareHouse: createEndpoint(
    'company/:companyUniqueName/warehouse?page=1&refresh=true&count=0&branchUniqueName=:branchUniqueName'
  ),
  companyBranchDeatils: createEndpoint(
    'company/:companyUniqueName?branchUniqueName=:branchUniqueName'
  ),
  getCompanyInvoiceTemplate: createEndpoint(
    'v2/company/:companyUniqueName/templates?type=invoice&branchUniqueName=:branchUniqueName'
  ),
  getCompanyVoucherTemplate: createEndpoint(
    'v2/company/:companyUniqueName/templates?type=voucher&branchUniqueName=:branchUniqueName'
  ),
};


export const invoiceUrlsForV1 = {
  search: createEndpoint(
    'company/:companyUniqueName/account-search?q=&page=&group=&branchUniqueName=:branchUniqueName&withStocks='
  ),
  purchaseBillsearch: createEndpoint(
    'company/:companyUniqueName/account-search?q=&page=&group=%2C%20bankaccounts%2C%20cash&branchUniqueName=:branchUniqueName'
  ),
  getAccountDetails: createEndpoint('v2/company/:companyUniqueName/accounts/:q?branchUniqueName=:branchUniqueName'),
  stockDetailService: createEndpoint(
    'v2/company/:companyUniqueName/particular/:sales_type?stockUniqueName=&branchUniqueName=:branchUniqueName'
  ),
  // salesDetailService: createEndpoint('v2/company/:companyUniqueName/particular/:sales_type?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  salesDetailService: createEndpoint(
    'v2/company/:companyUniqueName/particular/:sales_type?&branchUniqueName=:branchUniqueName'
  ),
  getDiscounts: createEndpoint('company/:companyUniqueName/discount?branchUniqueName=:branchUniqueName'),
  getTaxes: createEndpoint('company/:companyUniqueName/tax?branchUniqueName=:branchUniqueName'),
  genrateInvoice: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName'
  ),
  genratePurchaseBill: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/purchase-record/generate?branchUniqueName=:branchUniqueName'
  ),
  generateVoucher: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName&voucherVersion=:voucherVersion'
    ),
  generateDebitNote: createEndpoint(
    'v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName'
  ),
  generateReceipt: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/ledgers-v2?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=:lang'
  ),
  generatePayment: createEndpoint(
    'company/:companyUniqueName/accounts/:accountUniqueName/ledgers-v2?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=:lang'
  ),
  getWarehouse: createEndpoint(
    'company/:companyUniqueName/warehouse?page=1&refresh=true&count=100&branchUniqueName=:branchUniqueName'
  ),
  getBriefAccount: createEndpoint(
    'company/:companyUniqueName/brief-accounts?group=cash,%20bankaccounts&count=0&currency=INR,%20INR&branchUniqueName=:branchUniqueName'
  ),
  getBriefAccountForReceipt: createEndpoint(
    'company/:companyUniqueName/brief-accounts?group=cash,%20bankaccounts,%20loanandoverdraft&count=0&currency=IN,%20INR&lang=en'
  ),
  getVoucherInvoice: createEndpoint(
    'company/:companyUniqueName/vouchers/invoice-list?voucherDate=:voucherDate&branchUniqueName=:branchUniqueName&voucherVersion=:voucherVersion'
  ),
  getInvoicesForReceipt: createEndpoint(
    'company/:companyUniqueName/vouchers/invoice-list?voucherDate=:voucherDate&adjustmentRequest=true&count=:count&page=:page&number=&voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'
    ),
  getExchangeRateToINR: createEndpoint(
    'currency/rate?from=:from&to=:to&date=:date&branchUniqueName=:branchUniqueName'
  ),
  getCountryDetails: createEndpoint(
    'country/:countryCode'
  ),
  getCompanyBranchAddresses: createEndpoint(
    'company/:companyUniqueName/branch?branchUniqueName=:branchUniqueName'
  ),
  getWareHouse: createEndpoint(
    'company/:companyUniqueName/warehouse?page=1&refresh=true&count=0&branchUniqueName=:branchUniqueName'
  ),
  companyBranchDeatils: createEndpoint(
    'company/:companyUniqueName?branchUniqueName=:branchUniqueName'
  ),
  getCompanyInvoiceTemplate: createEndpoint(
    'v2/company/:companyUniqueName/templates?type=invoice&branchUniqueName=:branchUniqueName'
  ),
  getCompanyVoucherTemplate: createEndpoint(
    'v2/company/:companyUniqueName/templates?type=voucher&branchUniqueName=:branchUniqueName'
  )
};
/*
https://api.giddh.com/company/mobileindore15161037983790ggm19/brief-accounts?group=cash,%20bankaccounts&count=0&currency=INR,%20INR&branchUniqueName=allmobileshop
 https://api.giddh.com/v4/company/mobileindore15161037983790ggm19/accounts/amityglobalvarsitypvtltd/vouchers/generate?branchUniqueName=allmobileshop

*/
