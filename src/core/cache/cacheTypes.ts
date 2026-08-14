export type ScreenCacheId =
  | 'profit_loss'
  | 'bank_accounts'
  | 'balance_sheet'
  | 'all_vouchers'
  | 'accounts'
  | 'parties';

export type CacheKeyParts = {
  companyUniqueName: string;
  branchUniqueName: string;
  screenId: ScreenCacheId;
  startDate?: string;
  endDate?: string;
  extra?: string;
};

export type CachedEntry<T> = {
  data: T;
  savedAt: number;
};

export type ProfitLossCacheData = {
  totalExpenses: Record<string, any>;
  revenue: Record<string, any>;
  incomeBeforeTaxes: Record<string, any>;
};

export type BankAccountsCacheData = {
  results: any[];
  fromDate: string;
  toDate: string;
  hasMore: boolean;
};

export type BalanceSheetCacheData = {
  groupDetails: any[];
};

export type AllVouchersCacheData = {
  items: any[];
  totalItem: number;
  hasMore: boolean;
};

export type AccountsCacheData = {
  accounts: any[];
  totalPages: number;
};

export type PartiesCacheData = {
  results: any[];
  totalPages: number;
};
