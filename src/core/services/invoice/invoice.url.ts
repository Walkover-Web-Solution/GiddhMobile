import {createEndpoint} from '@/utils/helper';

export const invoiceUrls = {
  search: createEndpoint('company/:companyUniqueName/account-search?q=&page=&group=&branchUniqueName=:branchUniqueName&withStocks='),
  getAccountDetails: createEndpoint('v2/company/:companyUniqueName/accounts/:q?branchUniqueName=:branchUniqueName'),
  stockDetailService: createEndpoint('v2/company/:companyUniqueName/particular/sales?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  salesDetailService: createEndpoint('v2/company/:companyUniqueName/particular/:sales_type?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  getDiscounts: createEndpoint('company/:companyUniqueName/discount?branchUniqueName=:branchUniqueName'),
  getTaxes: createEndpoint('company/:companyUniqueName/tax?branchUniqueName=:branchUniqueName'),
  genrateInvoice: createEndpoint('v4/company/:companyUniqueName/accounts/:accountUniqueName/vouchers/generate?branchUniqueName=:branchUniqueName')

};
/*
 https://api.giddh.com/v4/company/mobileindore15161037983790ggm19/accounts/amityglobalvarsitypvtltd/vouchers/generate?branchUniqueName=allmobileshop

*/