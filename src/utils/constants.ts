// Common date format for app
export const GD_DATE_FORMAT = 'DD-MM-YYYY';
export const GD_DATE_RANGE_FORMAT = 'DD MMM YY';

// Font size to be used in across the app
export const GD_FONT_WEIGHT = {
  normal: 400,
  bold: '700'
};
// Font size to be used in across the app
export const GD_FONT_SIZE = {
  xsmall: 10,
  small: 12,
  small_m: 13,

  // specially 4 size used in app
  normal: 14,
  medium: 16,
  large: 18,
  xlarge: 20,

  xxlarge: 22,
  font_25: 25,
  font_36: 36,
  font_40: 40
};

// Button size to be used in across the app
export const GD_BUTTON_SIZE = {
  h_small: 38,
  h_medium: 42,
  h_large: 50,

  font_small: 14,
  font_medium: 18,
  font_large: 20
};

// Button size to be used in across the app
export const GD_CIRCLE_BUTTON = {
  height: 48,
  width: 48,
  radius: 24,
  fontSize: 36
};

// Radius size to be used in across the app
export const GD_RADIUS = {
  r_small: 19, //
  r_medium: 21, //
  r_large: 25 // for normally large controls like  button, inputs
};

// Radius size to be used in across the app
export const GD_ICON_SIZE = {
  input_icon: 16 //
};

// Per page items count
export const GD_PER_PAGE_ITEMS_COUNT = 20;

// Http request timeout
export const HTTP_REQUEST_TIME_OUT = 6000;

// Fallback language for app
export const FALL_BACK_LANGUAGE = 'en';

// STORAGE KEYS
export const STORAGE_KEYS = {
  token: 'AUTH_TOKEN',
  activeCompanyName:'ACTIVE_COMPANY_NAME',
  companyVersionNumber:'COMPANY_VERSION_NUMBER',
  activeCompanyUniqueName: 'ACTIVE_COMPANY_UNIQUE_NAME',
  activeBranchUniqueName: 'ACTIVE_BRANCH_UNIQUE_NAME',
  googleEmail: 'GOOGLE_USER_EMAIL',
  userName: 'USER_NAME',
  sessionStart: 'SESSION_START',
  sessionEnd: 'SESSION_END',
  sortBy: 'SORT_BY',
  order: 'ORDER',
  activeCompanyCountryCode: 'ACTIVE_COMPANY_COUNTRY_CODE',
  APPLELOGINRESPONSE:"APPLELOGINRESPONSE",
  NOTIFICATION_SET_ARR:"NOTIFICATION_SET_ARR"
};

// APP events constants
export const APP_EVENTS = {
  invalidAuthToken: 'AUTH_TOKEN_INVALIDATED',
  comapnyBranchChange: 'COMPANY_BRANCH_CHANGE',
  updatedItemInInvoice: 'UPDATED_ITEM_IN_INVOICE',
  updatedItemInPurchaseBill: 'UPDATED_ITEM_IN_PURCHASE_BILL',
  updateItemInCreditNote: 'UPDATE_ITEM_IN_CREDIT_NOTE',
  InvoiceCreated: 'INVOICECREATED',
  PurchaseBillCreated: 'PURCHASEBILLCREATED',
  CreditNoteCreated: 'CREDITNOTECREATED',
  DebitNoteCreated: 'DEBITNOTECREATED',
  ReceiptCreated: 'RECEIPTCREATED',
  PaymentCreated: 'PAYMENTCREATED',
  CustomerCreated: 'CUSTOMERCREATED',
  REFRESHPAGE: 'REFRESHPAGE',
  RefreshAddEntryPage: 'REFRESHADDENTRYPAGE',
  NewEntryCreated: 'NEWENTRYCREATED',
  DownloadAlert: 'DOWNLOAD_ALERT',
  ProductScreenRefresh: 'PRODUCT_SCREEN_REFRESH',
  ServiceScreenRefresh: 'SERVICE_SCREEN_REFRESH',
  ProductGroupRefresh: 'PRODUCT_GROUP_REFRESH',
  ServiceGroupRefresh: 'SERVICE_GROUP_REFRESH'
};

export const FONT_FAMILY = {
  regular: 'AvenirLTStd-Book',
  bold: 'AvenirLTStd-Black',
  semibold: 'AvenirLTStd-Roman'
};
