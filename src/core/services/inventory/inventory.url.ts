import { createEndpoint } from '@/utils/helper';

export const InventoryUrls = {
  getInventories: createEndpoint('company/:companyName/stock-summary?from=:startDate&to=:endDate&page=:page&nonZeroInward=true&nonZeroOutward=true')
}
