import { Configuration } from 'realm';
import rootSchema from './AllSchemas/invoice_bills_schema';

export const schemaVersion = 0;

export const RootDBOptions: Configuration = {
    path: 'rootDB',
    schemaVersion: schemaVersion,
    schema: rootSchema
}