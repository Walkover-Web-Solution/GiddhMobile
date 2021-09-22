import * as CommonServiceRedux from '../redux/CommonService';
import { InvoiceService } from "@/core/services/invoice/invoice.service";
import AsyncStorage from "@react-native-community/async-storage"
import { STORAGE_KEYS } from "./constants"
import { calculateDataLoadedTime } from "./helper";
import { RootDBOptions } from '@/Database';
import moment from 'moment';
import { ROOT_DB_SCHEMA } from '@/Database/AllSchemas/company-branch-schema';
import Realm from 'realm';
import { CommonService } from '@/core/services/common/common.service';
import { InventoryService } from '@/core/services/inventory/inventory.service';

let companyUniqueName = '';
let branchUniqueName = '';

const getCompanyCountryDetails = async (code: any) => {
    try {
        console.log('getting company country details');
        const results = await InvoiceService.getCountryDetails(code);
        if (results.body && results.status == 'success') {
            console.log("got company country details");
            return results.body.country;
        }
    } catch (e) {
        return {};
    }
}

const getPurchaseBillData = async () => {
    console.log('getting purchase bill data');
    let data: any = {
        timeStamp: calculateDataLoadedTime(new Date()),
        searchedParty: [],
        items: []
    };
    const partiesList = await InvoiceService.PbsearchSpecified(companyUniqueName, branchUniqueName, "", 1, 'sundrycreditors');
    if (partiesList?.body && partiesList.body?.results) {
        data.searchedParty = partiesList.body.results;
    }
    const results = await InvoiceService.searchSpecified(
        companyUniqueName,
        branchUniqueName,
        "",
        1,
        'operatingcost%2C%20indirectexpenses',
        true
    );
    if (results?.body && results.body?.results) {
        data.items = results.body.results;
    }
    console.log('got purchase bill data');
    return data;
}


const getSalesCreditDebitData = async () => {
    console.log('getting sales credit data');
    let data: any = {
        timeStamp: calculateDataLoadedTime(new Date()),
        searchedParty: [],
        items: []
    };
    const partiesList = await InvoiceService.searchSpecified(companyUniqueName, branchUniqueName, "", 1, 'sundrydebtors', false);
    if (partiesList?.body && partiesList.body?.results) {
        data.searchedParty = partiesList.body.results;
    }
    const results = await InvoiceService.searchSpecified(
        companyUniqueName,
        branchUniqueName,
        "",
        1,
        'otherincome%2C%20revenuefromoperations',
        true
    );
    if (results?.body && results.body?.results) {
        data.items = results.body.results;
    }
    console.log('got sales credit data');
    return data;
}

const getAllTaxes = async () => {
    try {
        console.log("getting taxes");
        const results = await InvoiceService.getTaxesSpecified(companyUniqueName, branchUniqueName);
        if (results.body && results.status == 'success') {
            console.log('got taxes');
            return results.body;
        }
    } catch (e) {
        return [];
    }
}

const getAllDiscounts = async () => {
    try {
        console.log("getting discounts");
        const results = await InvoiceService.getDiscountsSpecified(companyUniqueName, branchUniqueName);
        if (results.body && results.status == 'success') {
            console.log('got discounts');
            return results.body;
        }
    } catch (e) {
        return [];
    }
}

const getAllWarehouse = async () => {
    try {
        console.log('getting warehouse');
        const results = await InvoiceService.getWareHouseSpecified(companyUniqueName, branchUniqueName);
        if (results.body && results.status == 'success') {
            console.log('got warehouse');
            return results.body.results;
        }
    } catch (e) {
        return [];
    }
}

const getAllAccountsModes = async () => {
    try {
        console.log("getting modes");
        const results = await InvoiceService.getBriefAccountSpecified(companyUniqueName, branchUniqueName);
        if (results.body && results.status == 'success') {
            console.log('got modes');
            return results.body.results;
        }
    } catch (e) {
        return [];
    }
}

const getParties = async () => {
    console.log('getting parties');
    const debtors: any = await CommonService.getPartiesSundryDebtorsSpecified(companyUniqueName, branchUniqueName);
    const creditors: any = await CommonService.getPartiesSundryCreditorsSpecified(companyUniqueName, branchUniqueName);
    if (debtors?.body?.results && creditors?.body?.results) {
        const data = [...debtors.body.results, ...creditors.body.results];
        data.sort((a, b) =>
            a.name.toUpperCase().split(' ')[0].localeCompare(b.name.toUpperCase().split(' ')[0])
        );
        console.log('got parties');
        return {
            timeStamp: calculateDataLoadedTime(new Date()),
            objects: data
        }
    }
}

const getCustomerVendor = async () => {
    console.log('getting customer vendors');
    const debtors = await CommonService.getPartiesMainSundryDebtorsSpecified(companyUniqueName, branchUniqueName, '', 'closingBalance', 'desc', 50, 1);
    const creditors = await CommonService.getPartiesMainSundryCreditorsSpecified(companyUniqueName, branchUniqueName, '', 'closingBalance', 'desc', 50, 1);
    if (debtors?.body?.results && creditors?.body?.results) {
        console.log('got customer vendors');
        return {
            timeStamp: calculateDataLoadedTime(new Date()),
            customerObjects: debtors.body.results,
            vendorObjects: creditors.body.results
        };
    }
}

const getTransactions = async () => {
    console.log('getting transactions');
    const transactions = await CommonService.getTransactionsSpecified(
        companyUniqueName,
        branchUniqueName,
        moment().subtract(30, 'd').format('DD-MM-YYYY'),
        moment().format('DD-MM-YYYY'),
        1
    );
    if (transactions?.body?.entries) {
        console.log('got transactions');
        return {
            timeStamp: calculateDataLoadedTime(new Date()),
            objects: transactions.body.entries
        }
    }
}

const getInventory = async () => {
    console.log('getting inventory');
    try {
        let totalPages = 0;
        let result: any = [];
        const Inventory = await InventoryService.getInventoriesSpecified(
            companyUniqueName,
            branchUniqueName,
            companyUniqueName,
            moment().subtract(30, 'd').format('DD-MM-YYYY'),
            moment().format('DD-MM-YYYY'),
            1);
        if (Inventory?.body) {
            totalPages = Inventory.body.totalPages;
            console.log("Pages to load " + totalPages);
            for (let i = 1; i <= totalPages; i++) {
                try {
                    let InventoryPageData = null;
                    console.log(i);
                    try {
                        InventoryPageData = await InventoryService?.getInventoriesSpecified(
                            companyUniqueName,
                            branchUniqueName,
                            companyUniqueName,
                            moment().subtract(30, 'd').format('DD-MM-YYYY'),
                            moment().format('DD-MM-YYYY'),
                            i
                        );
                    } catch (e) {
                        continue;
                    }
                    if (InventoryPageData && InventoryPageData?.status == 'success') {
                        result = [...result, ...InventoryPageData?.body?.stockReport];
                    }
                } catch (_err) {
                    console.log('catched', _err);
                }
            }
            console.log('got inventory');
            return {
                timeStamp: calculateDataLoadedTime(new Date()),
                objects: result
            };
        }
    } catch (e) {
        console.log('Something went wrong while fetching inventories');
    }
}

const getBranches = async (uniqueName: any) => {
    try {
        let branchList: any[] = [];
        const branchesResponse = await CommonServiceRedux.getCompanyBranches(uniqueName);
        if (branchesResponse && branchesResponse.status == 'success') {
            for (let j = 0; j < branchesResponse.body.length; j++) {
                //changing branch of company so that api's don't return same response of a particular company
                console.log('chaning branch to ', branchesResponse.body[j].uniqueName);
                branchUniqueName = branchesResponse.body[j].uniqueName;
                branchList.push({
                    timeStamp: calculateDataLoadedTime(new Date()),
                    uniqueName: branchesResponse.body[j].uniqueName,
                    alias: branchesResponse.body[j].alias,
                    name: branchesResponse.body[j].name,
                    parties: await getParties(),
                    transaction: await getTransactions(),
                    inventory: await getInventory(),
                    customerVendor: await getCustomerVendor(),
                    tax: await getAllTaxes(),
                    discount: await getAllDiscounts(),
                    warehouse: await getAllWarehouse(),
                    modes: await getAllAccountsModes(),
                    salesCreditDebitData: await getSalesCreditDebitData(),
                    purchaseBillData: await getPurchaseBillData()
                });
            }
        }
        return branchList;
    } catch (error) {
        console.log('something went wrong ', error);
    }
}

export const EnableOfflineMode = async (companies: any) => {
    const userEmail: any = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    let data: any = {
        timeStamp: calculateDataLoadedTime(new Date()),
        active: true,
        userUniqueIdentifier: userEmail,
        companies: []
    };

    for (let i = 0; i < companies.length; i++) {
        //changing current company so that api's don't return same response of a particular company
        console.log('changing company to ', companies[i].uniqueName);
        companyUniqueName = companies[i].uniqueName;
        data.companies.push({
            uniqueName: companies[i].uniqueName,
            name: companies[i].name,
            companyCountryDetails: await getCompanyCountryDetails(
                companies[i].subscription.country.countryCode
            ),
            branches: await getBranches(companies[i].uniqueName),
        });
    }

    console.log(JSON.stringify(data));

    console.log('opening db');

    const realm = await Realm.open(RootDBOptions);
    if (realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail)) {
        console.log('found, updating..');
        realm.write(() => {
            try {
                const result = realm.create(ROOT_DB_SCHEMA, data, Realm.UpdateMode.Modified);
                console.log(result);
            } catch (e) {
                console.log('error', e);
            }
        });
    } else {
        console.log("not found, creating..");
        realm.write(() => {
            try {
                const result = realm.create(ROOT_DB_SCHEMA, data, Realm.UpdateMode.All);
                console.log(result);
            } catch (e) {
                console.log('error', e);
            }
        });
    }

}

export const DisableOfflineMode = async () => {
    const userEmail: any = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    const realm = await Realm.open(RootDBOptions);
    const object = realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail);
    if (object) {
        realm.write(() => {
            realm.delete(object);
        })
    }
}