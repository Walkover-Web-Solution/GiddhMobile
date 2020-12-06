import {GD_PER_PAGE_ITEMS_COUNT} from '@/utils/constants';

export class PartiesPaginatedResponse {
  public count: number = GD_PER_PAGE_ITEMS_COUNT;
  public page: number = 1;
  public results: Parties[] = [];
  public size?: number;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public fromDate: string = '';
  public toDate: string = '';
  public openingBalance: PartiesOpeningBalance = new PartiesOpeningBalance();
  public closingBalance: PartiesClosingBalance = new PartiesClosingBalance();
  public debitTotal: number = 0;
  public creditTotal: number = 0;
}

export interface Parties {
  serialNumber: number;
  name: string;
  uniqueName: string;
  gstIn: string;
  mobileNo?: any;
  email?: any;
  openingBalance: PartiesOpeningBalance;
  debitTotal: number;
  creditTotal: number;
  closingBalance: PartiesClosingBalance;
  hasBankDetails: boolean;
  comment?: any;
  groupName: string;
  category: string;
  groupUniqueName: string;
  latestInvoiceDate?: any;
  latestBillAmount?: any;
  accountBankDetails?: any;
  countryCode: string;
  countryName: string;
  bankPaymentDetails: boolean;
  customFields?: any;
  country: PartiesCountry;
  state: PartiesCountry;
}

interface PartiesCountry {
  name: string;
  code: string;
}

export class PartiesOpeningBalance {
  public amount: number = 0;
  public type: string = '';
}

export class PartiesClosingBalance {
  public amount: number = 0;
  public type: string = '';
}
