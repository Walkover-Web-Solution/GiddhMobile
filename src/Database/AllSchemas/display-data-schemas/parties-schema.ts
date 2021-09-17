import { ObjectSchema } from "realm";

export const PARTIES_SCHEMA = 'PARTIES_SCHEMA';
export const PARTIES_OBJECT = 'PARTIES_OBJECT';
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

export const PartiesObject: ObjectSchema = {
    name: PARTIES_OBJECT,
    embedded: true,
    properties: {
        uniqueName: 'string',
        name: 'string',
        closingBalance: CLOSING_BALANCE_OBJECT,
        category: 'string',
        country: COUNTRY_DETAILS
    }
};

export const PartiesSchema: ObjectSchema = {
    name: PARTIES_SCHEMA,
    embedded: true,
    properties: {
        timeStamp: 'string',
        objects: { type: 'list', objectType: PARTIES_OBJECT }
    }
}

export default [PartiesObject, PartiesSchema, ClosingBalanceObject, CountryDetails];