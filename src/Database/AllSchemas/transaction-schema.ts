import { ObjectSchema } from "realm";

export const TRANSACTION_SCHEMA = 'TRANSACTION_SCHEMA';
export const TRANSACTION_OBJECT = 'TRANSACTION_OBJECT';
export const OTHER_TRANSACTIONS = 'OTHER_TRANSACTIONS';
export const PARTICULAR = 'PARTICULAR';
export const INVENTORY_TRANSACTION_OBJECT = 'INVENTORY_TRANSACTION_OBJECT';
export const OT_PARTICULAR = 'OT_PARTICULAR';
export const OT_CURRENCY_DETAILS = 'OT_CURRENCY_DETAILS'; //OT = Other Transaction

export const Particular: ObjectSchema = {
    name: PARTICULAR,
    embedded: true,
    properties: {
        name: 'string'
    }
}
export const OtherTransactions: ObjectSchema = {
    name: OTHER_TRANSACTIONS,
    embedded: true,
    properties: {
        inventory: INVENTORY_TRANSACTION_OBJECT + '?',
        particular: OT_PARTICULAR + '?',
        amount: 'int?',
    }
};

export const OTCurrencyDetails: ObjectSchema = {
    name: OT_CURRENCY_DETAILS,
    embedded: true,
    properties: {
        code: 'string?'
    }
}

export const OTParticular: ObjectSchema = {
    name: OT_PARTICULAR,
    embedded: true,
    properties: {
        currency: OT_CURRENCY_DETAILS + '?'
    }
};
export const InventoryTransactionObject: ObjectSchema = {
    name: INVENTORY_TRANSACTION_OBJECT,
    embedded: true,
    properties: {
        quantity: 'int?'
    }
}

export const TransactionObject: ObjectSchema = {
    name: TRANSACTION_OBJECT,
    embedded: true,
    properties: {
        particular: PARTICULAR,
        voucherName: 'string?',
        entryDate: 'string?',
        voucherNo: 'string?',
        otherTransactions: { type: 'list', objectType: OTHER_TRANSACTIONS },
        creditAmount: 'float?',
        debitAmount: 'float?'
    }
};

export const TransactionSchema: ObjectSchema = {
    name: TRANSACTION_SCHEMA,
    properties: {
        timeStamp: 'string',
        objects: { type: 'list', objectType: TRANSACTION_OBJECT }
    }
}

export default [Particular, OtherTransactions, OTCurrencyDetails,
    OTParticular, InventoryTransactionObject, TransactionObject, TransactionSchema];