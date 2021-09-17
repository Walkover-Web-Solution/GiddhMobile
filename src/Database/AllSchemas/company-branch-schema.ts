import { ObjectSchema } from 'realm';
import { CUSTOMER_VENDOR_SCHEMA } from './display-data-schemas/customer-vendor-schema';
import { INVENTORY_SCHEMA } from './display-data-schemas/inventory-schema';
import { PARTIES_SCHEMA } from './display-data-schemas/parties-schema';
import { INVOICE_BILLS_SCHEMA } from './invoice_bills_schema';
import { TRANSACTION_SCHEMA } from './display-data-schemas/transaction-schema';
import { COMPANY_COUNTRY_DETAILS } from './companyCountryDetails';
import Parties from './display-data-schemas/parties-schema';
import Transaction from './display-data-schemas/transaction-schema';
import Inventory from './display-data-schemas/inventory-schema';
import CustomerVendor from './display-data-schemas/customer-vendor-schema';
import InvoiceBills from './invoice_bills_schema';
import companyCountryDetails from './companyCountryDetails';

export const COMPANY_BRANCH_LIST = 'COMPANY_LIST';
export const BRANCH = 'BRANCH';
export const COMPANY = 'COMPANY';

export const CompanyBranchSchema: ObjectSchema = {
    name: COMPANY_BRANCH_LIST,
    properties: {
        sales: { type: 'list', objectType: COMPANY }
    }
}

export const Company: ObjectSchema = {
    name: COMPANY,
    embedded: true,
    properties: {
        uniqueName: 'string',
        name: 'string',
        branchList: { type: 'list', objectType: BRANCH }
    }
}

export const Branch: ObjectSchema = {
    name: BRANCH,
    embedded: true,
    properties: {
        uniqueName: 'string?',
        alias: 'string?',
        parties: PARTIES_SCHEMA,
        transaction: TRANSACTION_SCHEMA,
        inventory: INVENTORY_SCHEMA,
        customerVendor: CUSTOMER_VENDOR_SCHEMA,
        purchaseBillData: INVOICE_BILLS_SCHEMA,
        salesCreditDebitData: INVOICE_BILLS_SCHEMA,
        companyCountryDetails: COMPANY_COUNTRY_DETAILS,
    }
}

export default [
    CompanyBranchSchema,
    Company,
    Branch,
    ...Parties,
    ...Transaction,
    ...CustomerVendor,
    ...Inventory,
    ...InvoiceBills,
    ...companyCountryDetails
];