import { createEndpoint } from '@/utils/helper';

export const AccountsUrls = {
  getGroupAccounts: createEndpoint('v2/company/:companyUniqueName/groups/:selectedGroup/account-balances?page=:page&count=20&sort=desc&sortBy=closingBalance&refresh=true&q=&branchUniqueName=:branchUniqueName'),
  getGroupNames: createEndpoint('company/:companyUniqueName/group-search?q=:groupName&page=:page&count=20&branchUniqueName=:branchUniqueName&lang=en'),
  getAccountNames: createEndpoint('company/:companyUniqueName/v2/account-search?q=:accountName&page=:page&count=20&lang=en'),
  getIndividualAccount: createEndpoint('v2/company/:companyUniqueName/accounts/:accountName?source=MASTER&branchUniqueName=:branchUniqueName&lang=en')
}
