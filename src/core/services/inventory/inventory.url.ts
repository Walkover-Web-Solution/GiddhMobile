import { createEndpoint } from '@/utils/helper';

export const InventoryUrls = {
  getInventories: createEndpoint('company/:companyName/stock-summary?from=:startDate&to=:endDate&page=:page&nonZeroInward=true&nonZeroOutward=true'),
  fetchAllTaxes:createEndpoint('company/:companyUniqueName/tax?branchUniqueName=:branchUniqueName&lang=en'),
  fetchAllParentGroup:createEndpoint('company/:companyUniqueName/hierarchical-stock-groups?type=:fetchType&refresh=true&branchUniqueName=:branchUniqueName&lang=en'),
  createStockGroup:createEndpoint('company/:companyUniqueName/stock-group?branchUniqueName=:branchUniqueName&lang=en'),
  fetchStockUnitGroup:createEndpoint('company/:companyUniqueName/stock-unit-group?branchUniqueName=:branchUniqueName&lang=en'),
  fetchPurchaseAccounts: createEndpoint('company/:companyUniqueName/brief-accounts?group=operatingcost,%20indirectexpenses&count=0&branchUniqueName=:branchUniqueName&lang=en'),
  fetchSalesAccounts: createEndpoint('company/:companyUniqueName/brief-accounts?group=revenuefromoperations,%20otherincome&count=0&branchUniqueName=:branchUniqueName&lang=en'),
  fetchUnitGroupMapping: createEndpoint('company/:companyUniqueName/stock-unit/mappings?branchUniqueName=:branchUniqueName&lang=en'),
  fetchLinkedUnitMapping: createEndpoint('company/:companyUniqueName/stock-unit/:unitUniqueName/linked-stock-units?branchUniqueName=:branchUniqueName&lang=en'),
  createStockProduct: createEndpoint('v2/company/:companyUniqueName/stock-group/:SelectedGroup/stock?branchUniqueName=:branchUniqueName&lang=en'),
  fetchVariantCustomfields: createEndpoint('company/:companyUniqueName/customfield/module/variant?page=0&count=0&lang=en'),
  addStockGroup: createEndpoint('company/:companyUniqueName/stock-group?lang=en'),
  fetchAllVariants: createEndpoint('v2/company/:companyUniqueName/stock?page=:page&count=50&inventoryType=:type&branchUniqueName=:branchUniqueName&lang=en')
}
