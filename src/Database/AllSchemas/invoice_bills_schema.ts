import { ObjectSchema } from 'realm';
import { CURRENCY } from './companyCountryDetails';

export const INVOICE_BILLS_SCHEMA = 'INVOICE_BILLS_SCHEMA';
const TAX = 'TAX';
const DISCOUNT = 'DISCOUNT';
const WAREHOUSE = 'WAREHOUSE';
const MODE = 'MODE';
const ACCOUNT = 'ACCOUNT';
const CURRENCY_SCD = 'CURRENCY_SCD';
const TAX_DETAIL = 'TAX_DETAIL';
const LINK_ACCOUNT = 'LINK_ACCOUNT';
const PARTY_SCHEMA = 'PARTY_SCHEMA';
const PARENT_GROUP = 'PARENT_GROUP';
const STOCK = 'STOCK';

export const mode: ObjectSchema = {
    name: MODE,
    embedded: true,
    properties: {
        name: 'string?',
        uniqueName: 'string?',
        currency: CURRENCY
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
        addresses: { type: 'list', objectType: 'mixed?' },
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
        parentGroups: { type: 'list', objectType: 'mixed?' },
        mergedAccounts: 'string?',
        isFixed: 'bool?',
        openingBalance: 'float?',
        openingBalanceType: 'string?',
        mobileNo: 'mixed?',
        attentionTo: 'mixed?',
        applicableTaxes: { type: 'list', objectType: 'mixed?' },
        name: 'string?',
        address: 'string?'
    }
}

export const discount: ObjectSchema = {
    name: DISCOUNT,
    embedded: true,
    properties: {
        uniqueName: 'string?',
        linkAccount: LINK_ACCOUNT,
        discountValue: 'float?',
        discountType: 'string?',
        name: 'string?'
    }
}

export const parentGroup: ObjectSchema = {
    name: PARENT_GROUP,
    embedded: true,
    properties: {
        name: 'string?',
        uniqueName: 'string?',
        category: 'string?'
    }
}

export const stock: ObjectSchema = {
    name: STOCK,
    embedded: true,
    properties: {
        name: 'string?',
        uniqueName: 'string?'
    }
}

export const PartySchema: ObjectSchema = {
    name: PARTY_SCHEMA,
    embedded: true,
    properties: {
        type: 'string?',
        name: 'string?',
        uniqueName: 'string?',
        parentGroups: { type: 'list', objectType: PARENT_GROUP },
        route: 'string?',
        stock: STOCK + '?'
    }
}

export const InvoiceBillsSchema: ObjectSchema = {
    name: INVOICE_BILLS_SCHEMA,
    embedded: true,
    properties: {
        tax: { type: 'list', objectType: TAX },
        discount: { type: 'list', objectType: DISCOUNT },
        warehouse: { type: 'list', objectType: WAREHOUSE + '?' },
        modes: { type: 'list', objectType: MODE },
        searchedParty: { type: 'list', objectType: PARTY_SCHEMA },
        items: { type: 'list', objectType: PARTY_SCHEMA }
    }
};