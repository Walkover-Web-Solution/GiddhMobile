import { Configuration } from 'realm';
import rootSchema from './AllSchemas/company-branch-schema';

export const schemaVersion = 4;

export const RootDBOptions: Configuration = {
    path: 'maindb',
    schemaVersion: schemaVersion,
    schema: [...rootSchema]
}