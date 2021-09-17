import { ObjectSchema } from "realm";

export const INVENTORY_SCHEMA = 'INVENTORY_SCHEMA';
export const INVENTORY_OBJECT = 'INVENTORY_OBJECT';
export const STOCK_DETAILS = 'STOCK_DETAILS';

export const StockDetails: ObjectSchema = {
    name: STOCK_DETAILS,
    embedded: true,
    properties: {
        quantity: 'int',
        stockUnit: 'string'
    }
}

export const InventoryObject: ObjectSchema = {
    name: INVENTORY_OBJECT,
    embedded: true,
    properties: {
        stockName: 'string',
        inwards: STOCK_DETAILS,
        outwards: STOCK_DETAILS
    }
};

export const InventorySchema: ObjectSchema = {
    name: INVENTORY_SCHEMA,
    embedded: true,
    properties: {
        timeStamp: 'string',
        objects: { type: 'list', objectType: INVENTORY_OBJECT }
    }
}

export default [InventorySchema, InventoryObject, StockDetails];