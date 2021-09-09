import { SALES_SCHEMA } from './AllSchemas/sales-schema';
import { ObjectSchema } from 'realm';

export const PENDING_CALLS = 'PENDING_CALLS';

export const PendingCalls: ObjectSchema = {
    name: PENDING_CALLS,
    properties: {
        sales: { type: 'list', objectType: SALES_SCHEMA }
    }
}