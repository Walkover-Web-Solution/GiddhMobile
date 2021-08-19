import Inventory from './AllSchemas/inventory-schema';
import Parties from './AllSchemas/parties-schema';
import { Configuration } from 'realm';

export const InventoryDBOptions: Configuration = {
    path: 'inventory',
    schema: [...Inventory],
    schemaVersion: 0
}

export const PartiesDBOptions: Configuration = {
    path: 'parties',
    schema: [...Parties],
    schemaVersion: 0
}