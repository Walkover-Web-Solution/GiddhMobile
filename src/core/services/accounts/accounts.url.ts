import { createEndpoint } from '@/utils/helper';

export const AccountsUrls = {
  getGroupAccounts: createEndpoint('v2/company/:companyUniqueName/groups/:selectedGroup/account-balances?page=:page&count=20&sort=desc&sortBy=closingBalance&refresh=true&q=&branchUniqueName=:branchUniqueName'),
  getGroupNames: createEndpoint('company/:companyUniqueName/group-search?q=:groupName&page=:page&count=20&branchUniqueName=:branchUniqueName&lang=en'),
  getAccountNames: createEndpoint('company/:companyUniqueName/v2/account-search?q=:accountName&page=:page&withStocks=:withStocks&stockAccountUniqueName=:stockAccountUniqueName&lang=en'),
  getIndividualAccount: createEndpoint('v2/company/:companyUniqueName/accounts/:accountName?source=MASTER&branchUniqueName=:branchUniqueName&lang=en'),
  getParticularToAccountData: createEndpoint('v3/company/:companyUniqueName/particular/:accountName?branchUniqueName=:branchUniqueName&lang=en'),
  getParticularStockData: createEndpoint('v3/company/:companyUniqueName/particular/:ledgerType?stockUniqueName=:stockUniqueName&oppositeAccountUniqueName=:oppositeAccountUniqueName&variantUniqueName=:variantUniqueName&branchUniqueName=:branchUniqueName&lang=en'),
  getStockData: createEndpoint('company/:companyUniqueName/stock/:stockUniqueName/variants?branchUniqueName=:branchUniqueName&lang=en'),
  createEntry: createEndpoint('company/:companyUniqueName/accounts/:accountType/ledgers-v2?voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'),
  getAdjustmentInvoices: createEndpoint(
    'company/:companyUniqueName/vouchers/invoice-list?voucherDate=:voucherDate&adjustmentRequest=true&count=100&page=:pageNumber&number=&voucherVersion=:voucherVersion&branchUniqueName=:branchUniqueName&lang=en'
    ),
}
