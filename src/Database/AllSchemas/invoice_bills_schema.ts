import { ObjectSchema } from 'realm';

export const INVOICE_BILLS_SCHEMA = 'INVOICE_BILLS_SCHEMA';
const PARTY_SCHEMA = 'PARTY_SCHEMA_IB';
const PARENT_GROUP = 'PARENT_GROUP_IB';
const STOCK = 'STOCK';

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
        timeStamp: 'string',
        searchedParty: { type: 'list', objectType: PARTY_SCHEMA },
        items: { type: 'list', objectType: PARTY_SCHEMA }
    }
};

export default [
    InvoiceBillsSchema,
    PartySchema,
    stock,
    parentGroup
];