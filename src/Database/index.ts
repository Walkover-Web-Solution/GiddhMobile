import Inventory from './AllSchemas/inventory-schema';
import Parties from './AllSchemas/parties-schema';
import Transaction from './AllSchemas/transaction-schema';
import CustomerVendor from './AllSchemas/customer-vendor-schema';
import { Configuration } from 'realm';

export const schemaVersion = 0;

export const InventoryDBOptions: Configuration = {
    path: 'inventory',
    schema: [...Inventory],
    schemaVersion: schemaVersion
}

export const CustomerVendorDBOptions: Configuration = {
    path: 'customerVendor',
    schema: [...CustomerVendor],
    schemaVersion: schemaVersion
}

export const PartiesDBOptions: Configuration = {
    path: 'parties',
    schema: [...Parties],
    schemaVersion: schemaVersion
}

export const TransactionDBOptions: Configuration = {
    path: 'transaction',
    schema: [...Transaction],
    schemaVersion: schemaVersion
}