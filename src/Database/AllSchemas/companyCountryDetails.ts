import { ObjectSchema } from 'realm';

export const COMPANY_COUNTRY_DETAILS = 'COMPANY_COUNTRY_DETAILS';
export const CURRENCY = 'CURRENCY';

export const Currency: ObjectSchema = {
    name: CURRENCY,
    embedded: true,
    properties: {
        code: 'string?',
        symbol: 'string?'
    }
}

export const companyCountryDetails: ObjectSchema = {
    name: COMPANY_COUNTRY_DETAILS,
    embedded: true,
    properties: {
        alpha2CountryCode: 'string?',
        alpha3CountryCode: 'string?',
        callingCode: 'string?',
        countryIndia: 'bool?',
        countryName: 'string?',
        currency: CURRENCY
    }
}

export default [Currency, companyCountryDetails];