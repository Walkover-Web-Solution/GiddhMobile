import { createEndpoint } from '@/utils/helper';

export const InventoryUrls = {
  getInventories: createEndpoint('company/:companyName/stock-summary?from=:startDate&to=:endDate&page=:page&nonZeroInward=true&nonZeroOutward=true'),
  fetchAllTaxes:createEndpoint('company/:companyUniqueName/tax?branchUniqueName=:branchUniqueName&lang=en'),
  fetchAllParentGroup:createEndpoint('company/:companyUniqueName/hierarchical-stock-groups?type=PRODUCT&refresh=true&branchUniqueName=:branchUniqueName&lang=en'),
  createStockGroup:createEndpoint('company/:companyUniqueName/stock-group?branchUniqueName=:branchUniqueName&lang=en')
}
