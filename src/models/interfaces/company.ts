import {User, UserDetails, UserEntityRole} from '@/models/interfaces/user';

export interface Country {
  countryName: string;
  countryCode: string;
}

export interface PlanDetails {
  countries: string[];
  duration: number;
  currency?: any;
  amount: number;
  uniqueName: string;
  durationUnit: string;
  createdAt: string;
  transactionLimit: number;
  companiesLimit: number;
  ratePerExtraTransaction: number;
  isCommonPlan: boolean;
  name: string;
}

export interface Subscription {
  companiesWithTransactions?: any;
  companies?: any;
  totalTransactions: number;
  userDetails: UserDetails;
  addOnTransactions: number;
  totalCompanies: number;
  overdraftTransactions: number;
  transactionsRemaining: number;
  country: Country;
  status: string;
  remainingTransactions: number;
  additionalCharges: number;
  subscriptionId: string;
  balance: number;
  createdAt: string;
  expiry: string;
  companyCount: number;
  companyTotalTransactions?: any;
  startedAt: string;
  planDetails: PlanDetails;
}

export interface UpdatedBy {
  name: string;
  email: string;
  uniqueName: string;
  mobileNo?: any;
  isVerified: boolean;
}

export interface Branch {
  isDefault: boolean;
  isHeadQuarter: boolean;
  uniqueName: string;
  alias: string;
  name: string;
}

export interface Address {
  branches: Branch[];
  warehouses?: any;
  linkEntity?: any;
  address: string;
  taxType: string;
  stateCode: string;
  uniqueName: string;
  taxNumber: string;
  stateName: string;
  name: string;
}

export interface EcommerceType {
  name: string;
}

export interface EcommerceDetail {
  uniqueName: string;
  ecommerceType: EcommerceType;
}

export interface FinancialYear {
  uniqueName: string;
  isLocked: boolean;
  financialYearStarts: string;
  financialYearEnds: string;
}

export interface ActiveFinancialYear {
  uniqueName: string;
  isLocked: boolean;
  financialYearStarts: string;
  financialYearEnds: string;
}

export interface Entity {
  uniqueName: string;
  name: string;
  entity: string;
}

export interface Permission {
  code: string;
}

export interface Scope {
  permissions: Permission[];
  name: string;
}

export interface Role {
  uniqueName: string;
  scopes: Scope[];
  isFixed: boolean;
  name: string;
}

export interface SharedWith {
  name: string;
  email: string;
  uniqueName: string;
  mobileNo?: any;
  isVerified: boolean;
}

export interface SharedBy {
  name: string;
  email: string;
  uniqueName: string;
  mobileNo: string;
  isVerified: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
}

export interface CountryV2 {
  alpha3CountryCode: string;
  alpha2CountryCode: string;
  countryName: string;
  callingCode: string;
  currency: Currency;
  countryIndia: boolean;
}

export interface Company {
  companyTotals?: any;
  headQuarterAlias: string;
  state: string;
  country: string;
  address: string;
  subscription: Subscription;
  baseCurrency: string;
  uniqueName: string;
  email: string;
  updatedAt: string;
  updatedBy: User;
  addresses: Address[];
  balanceDisplayFormat: string;
  createdBy: User;
  pincode: string;
  city?: any;
  contactNo: string;
  businessNature: string;
  businessType: string;
  ecommerceDetails: EcommerceDetail[];
  createdAt: string;
  alias?: any;
  financialYears: FinancialYear[];
  activeFinancialYear: ActiveFinancialYear;
  licenceKey?: any;
  panNumber?: any;
  isMultipleCurrency: boolean;
  nameAlias: string;
  companyIdentity: any[];
  userEntityRoles: UserEntityRole[];
  balanceDecimalPlaces: number;
  branchCount: number;
  baseCurrencySymbol: string;
  lastAccessDetails?: any;
  countryV2: CountryV2;
  name: string;
}
