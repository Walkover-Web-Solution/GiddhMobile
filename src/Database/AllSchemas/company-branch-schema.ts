import { ObjectSchema } from 'realm';
import { CUSTOMER_VENDOR_SCHEMA } from './display-data-schemas/customer-vendor-schema';
import { INVENTORY_SCHEMA } from './display-data-schemas/inventory-schema';
import { PARTIES_SCHEMA } from './display-data-schemas/parties-schema';
import { INVOICE_BILLS_SCHEMA } from './invoice_bills_schema';
import { TRANSACTION_SCHEMA } from './display-data-schemas/transaction-schema';
import { COMPANY_COUNTRY_DETAILS, CURRENCY } from './companyCountryDetails';
import Parties from './display-data-schemas/parties-schema';
import Transaction from './display-data-schemas/transaction-schema';
import Inventory from './display-data-schemas/inventory-schema';
import CustomerVendor from './display-data-schemas/customer-vendor-schema';
import InvoiceBills from './invoice_bills_schema';
import companyCountryDetails from './companyCountryDetails';

export const ROOT_DB_SCHEMA = 'ROOT_DB_SCHEMA';
export const BRANCH = 'BRANCH';
export const COMPANY = 'COMPANY';
const TAX = 'TAX';
const DISCOUNT = 'DISCOUNT_ARRAY';
const WAREHOUSE = 'WAREHOUSE';
const MODE = 'MODE';
const ACCOUNT = 'ACCOUNT';
const CURRENCY_SCD = 'CURRENCY_SCD';
const TAX_DETAIL = 'TAX_DETAIL';
const LINK_ACCOUNT = 'LINK_ACCOUNT';
const PARENT_GROUP = 'PARENT_GROUP';
const APPLICABLE_TAXES = 'APPLICABLE_TAXES';
const ADDRESS = 'ADDRESS';
const COMPANY_SUBS = 'COMPANY_SUBS';
const COUNTRY_CODE = 'COUNTRY_CODE';
export const rootPrimaryKey = 'userUniqueIdentifier';

export const CompanyBranchSchema: ObjectSchema = {
    name: ROOT_DB_SCHEMA,
    primaryKey: rootPrimaryKey,
    properties: {
        timeStamp: 'string',
        active: 'bool',
        userUniqueIdentifier: 'string',
        companies: { type: 'list', objectType: COMPANY }
    }
}

export const countryCode: ObjectSchema = {
    name: COUNTRY_CODE,
    embedded: true,
    properties: {
        countryCode: 'string?'
    }
}

export const companySubs: ObjectSchema = {
    name: COMPANY_SUBS,
    embedded: true,
    properties: {
        country: COUNTRY_CODE
    }
}

export const Company: ObjectSchema = {
    name: COMPANY,
    embedded: true,
    properties: {
        uniqueName: 'string',
        name: 'string',
        subscription: COMPANY_SUBS,
        companyCountryDetails: COMPANY_COUNTRY_DETAILS,
        branches: { type: 'list', objectType: BRANCH }
    }
}

export const mode: ObjectSchema = {
    name: MODE,
    embedded: true,
    properties: {
        name: 'string?',
        uniqueName: 'string?',
        currency: CURRENCY
    }
}

export const address: ObjectSchema = {
    name: ADDRESS,
    embedded: true,
    properties: {

    }
}

export const warehouse: ObjectSchema = {
    name: WAREHOUSE,
    embedded: true,
    properties: {
        countryCode: 'string?',
        currencyCode: 'string?',
        stateCode: 'string?',
        isDefault: 'bool?',
        callingCode: 'string?',
        addresses: { type: 'list', objectType: ADDRESS },
        linkAddresses: 'mixed?',
        address: 'string?',
        uniqueName: 'string?',
        mobileNumber: 'string?',
        name: 'string?'
    }
}

export const CurrencySCD: ObjectSchema = {
    name: CURRENCY_SCD,
    embedded: true,
    properties: {
        name: 'string?',
        code: 'string?'
    }
}

export const account: ObjectSchema = {
    name: ACCOUNT,
    embedded: true,
    properties: {
        currency: CURRENCY_SCD,
        email: 'string?',
        accountType: 'mixed?',
        uniqueName: 'string?',
        name: 'string?'
    }
}

export const taxDetails: ObjectSchema = {
    name: TAX_DETAIL,
    embedded: true,
    properties: {
        date: 'string?',
        taxValue: 'float?'
    }
}

export const tax: ObjectSchema = {
    name: TAX,
    embedded: true,
    properties: {
        duration: 'string?',
        uniqueName: 'string?',
        accounts: { type: 'list', objectType: ACCOUNT },
        taxNumber: 'string?',
        taxType: 'string?',
        taxDetail: { type: 'list', objectType: TAX_DETAIL },
        taxFileDate: 'int?',
        name: 'string?'
    }
}

export const parentGroup: ObjectSchema = {
    name: PARENT_GROUP,
    embedded: true,
    properties: {

    }
}

export const applicableTaxes: ObjectSchema = {
    name: APPLICABLE_TAXES,
    embedded: true,
    properties: {

    }
}

export const linkAccount: ObjectSchema = {
    name: LINK_ACCOUNT,
    embedded: true,
    properties: {
        currency: 'string?',
        currencySymbol: 'string?',
        description: 'string?',
        email: 'string?',
        uniqueName: 'string?',
        openingBalanceDate: 'string?',
        stocks: 'mixed?',
        parentGroups: { type: 'list', objectType: PARENT_GROUP },
        mergedAccounts: 'string?',
        isFixed: 'bool?',
        openingBalance: 'float?',
        openingBalanceType: 'string?',
        mobileNo: 'mixed?',
        attentionTo: 'mixed?',
        applicableTaxes: { type: 'list', objectType: APPLICABLE_TAXES },
        name: 'string?',
        address: 'string?'
    }
}

export const discount: ObjectSchema = {
    name: DISCOUNT,
    embedded: true,
    properties: {
        uniqueName: 'string',
        linkAccount: LINK_ACCOUNT,
        discountValue: 'float?',
        discountType: 'string?',
        name: 'string?'
    }
}


export const Branch: ObjectSchema = {
    name: BRANCH,
    embedded: true,
    properties: {
        timeStamp: 'string',
        uniqueName: 'string?',
        alias: 'string?',
        name: 'string?',
        parties: PARTIES_SCHEMA,
        transaction: TRANSACTION_SCHEMA,
        inventory: INVENTORY_SCHEMA,
        customerVendor: CUSTOMER_VENDOR_SCHEMA,
        tax: { type: 'list', objectType: TAX },
        discount: { type: 'list', objectType: DISCOUNT },
        warehouse: { type: 'list', objectType: WAREHOUSE },
        modes: { type: 'list', objectType: MODE },
        purchaseBillData: INVOICE_BILLS_SCHEMA,
        salesCreditDebitData: INVOICE_BILLS_SCHEMA,
    }
}

export default [
    ...Parties,
    ...Transaction,
    ...CustomerVendor,
    ...Inventory,
    ...InvoiceBills,
    ...companyCountryDetails,
    mode,
    address,
    warehouse,
    parentGroup,
    applicableTaxes,
    linkAccount,
    discount,
    CurrencySCD,
    account,
    taxDetails,
    tax,
    Branch,
    countryCode,
    companySubs,
    Company,
    CompanyBranchSchema,
];