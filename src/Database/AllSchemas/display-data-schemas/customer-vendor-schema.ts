import { ObjectSchema } from "realm";

export const CUSTOMER_VENDOR_SCHEMA = 'CUSTOMER_VENDOR_SCHEMA';
export const CUSTOMER_VENDOR_OBJECT = 'CUSTOMER_VENDOR_OBJECT';
export const CLOSING_BALANCE_OBJECT = 'CLOSING_BALANCE_OBJECT';
export const COUNTRY_DETAILS = 'COUNTRY_DETAILS';

export const ClosingBalanceObject: ObjectSchema = {
    name: CLOSING_BALANCE_OBJECT,
    embedded: true,
    properties: {
        amount: 'int',
        type: 'string'
    }
};

export const CountryDetails: ObjectSchema = {
    name: COUNTRY_DETAILS,
    embedded: true,
    properties: {
        code: 'string'
    }
}

export const CustomerVendorObject: ObjectSchema = {
    name: CUSTOMER_VENDOR_OBJECT,
    embedded: true,
    properties: {
        uniqueName: 'string',
        name: 'string',
        closingBalance: CLOSING_BALANCE_OBJECT,
        category: 'string',
        country: COUNTRY_DETAILS
    }
};

export const CustomerVendorSchema: ObjectSchema = {
    name: CUSTOMER_VENDOR_SCHEMA,
    embedded: true,
    properties: {
        timeStamp: 'string',
        customerObjects: { type: 'list', objectType: CUSTOMER_VENDOR_OBJECT },
        vendorObjects: { type: 'list', objectType: CUSTOMER_VENDOR_OBJECT }
    }
}

export default [CustomerVendorObject, CustomerVendorSchema, ClosingBalanceObject, CountryDetails];