import { ObjectSchema } from 'realm';

export const SALES_SCHEMA = 'SALES_SCHEMA';
export const ACCOUNT = 'ACCOUNT';
export const DEPOSITE = 'DEPOSITE';
export const ENTRY = 'ENTRY';
export const TEMPLATE_DETAILS = 'TEMPLATE_DETAILS';
export const BILLING_DETAILS = 'BILLING_DETAILS';
export const STATE = 'STATE';
export const CURRENCY = 'CURRENCY';
export const DISCOUNT = 'DISCOUNT';
export const AMOUNT = 'AMOUNT';
export const PURCHASE_ORDER_ITEM_MAPPING = 'PURCHASE_ORDER_ITEM_MAPPING';
export const TRANSACTION = 'TRANSACTION';
export const TRANSACTION_ACCOUNT = 'TRANSACTION_ACCOUNT';
export const OTHER = 'OTHER';

export const State: ObjectSchema = {
    name: STATE,
    embedded: true,
    properties: {
        code: 'string',
        name: 'string'
    }
}

export const BillingDetails: ObjectSchema = {
    name: BILLING_DETAILS,
    embedded: true,
    properties: {
        address: { type: 'string?[]' },
        countryName: 'string',
        gstNumber: 'string',
        panNumber: 'string',
        state: STATE,
        stateCode: 'string',
        stateName: 'string',
        pincode: 'string'
    }
}

export const Other: ObjectSchema = {
    name: OTHER,
    embedded: true,
    properties: {
        shippingDate: 'string',
        shippedVia: 'string',
        trackingNumber: 'string',
        customField1: 'mixed',
        customField2: 'mixed',
        customField3: 'mixed'
    }
}

export const TemplateDetails: ObjectSchema = {
    name: TEMPLATE_DETAILS,
    embedded: true,
    properties: {
        other: OTHER
    }
}
export const Amount: ObjectSchema = {
    name: AMOUNT,
    embedded: true,
    properties: {
        type: 'string',
        amountForAccount: 'int'
    }
}
export const Discount: ObjectSchema = {
    name: DISCOUNT,
    embedded: true,
    properties: {
        calculationMethod: 'string',
        amount: AMOUNT,
        discountValue: 'int',
        name: 'string',
        particular: 'string'
    }
}

export const PuchaseOrderItemMapping: ObjectSchema = {
    name: PURCHASE_ORDER_ITEM_MAPPING,
    embedded: true,
    properties: {
        uniqueName: 'string',
        entryUniqueName: 'string'
    }
}

export const TransactionAccount: ObjectSchema = {
    name: TRANSACTION_ACCOUNT,
    embedded: true,
    properties: {
        uniqueName: 'string',
        name: 'string'
    }
}

export const Transaction: ObjectSchema = {
    name: TRANSACTION,
    embedded: true,
    properties: {
        account: TRANSACTION_ACCOUNT,
        amount: AMOUNT
    }
}

export const Entry: ObjectSchema = {
    name: ENTRY,
    embedded: true,
    properties: {
        date: 'string',
        discounts: { type: 'list', objectType: DISCOUNT },
        hsnNumber: 'string',
        purchaseOrderItemMapping: PURCHASE_ORDER_ITEM_MAPPING,
        sacNumber: 'string',
        taxes: { type: 'mixed?[]' },
        transactions: { type: 'list', objectType: TRANSACTION },
        voucherNumber: 'string',
        voucherType: 'string'
    }
}

export const Deposit: ObjectSchema = {
    name: DEPOSITE,
    embedded: true,
    properties: {
        type: 'string',
        accountUniqueName: 'string',
        amountForAccount: 'int'
    }
}

export const Currency: ObjectSchema = {
    name: CURRENCY,
    embedded: true,
    properties: {
        code: 'string'
    }
}

export const Account: ObjectSchema = {
    name: ACCOUNT,
    embedded: true,
    properties: {
        attentionTo: 'string',
        billingDetails: BILLING_DETAILS,
        currency: CURRENCY,
        currencySymbol: 'string',
        email: 'string',
        mobileNumber: 'string',
        name: 'string',
        shippingDetails: BILLING_DETAILS,
        uniqueName: 'string',
        customerName: 'string'
    }
}

export const SalesSchema: ObjectSchema = {
    name: SALES_SCHEMA,
    embedded:true,
    properties: {
        account: ACCOUNT,
        date: 'string',
        dueDate: 'string',
        deposit: DEPOSITE,
        entries: { type: 'list', objectType: ENTRY },
        exchangeRate: 'int',
        passportNumber: 'string',
        templateDetails: TEMPLATE_DETAILS,
        touristSchemeApplicable: 'bool',
        type: 'string',
        updateAccountDetails: 'bool',
        voucherAdjustments: 'mixed'
    }
};

