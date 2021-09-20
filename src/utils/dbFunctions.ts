import * as CommonService from '../redux/CommonService';
import { InvoiceService } from "@/core/services/invoice/invoice.service";
import AsyncStorage from "@react-native-community/async-storage"
import { STORAGE_KEYS } from "./constants"
import { calculateDataLoadedTime } from "./helper";

const getCompanyCountryDetails = async (code: any) => {
    try {
        console.log('trying to get company country details');
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
    const partiesList = await InvoiceService.Pbsearch("", 1, 'sundrycreditors');
    if (partiesList?.body && partiesList.body?.results) {
        data.searchedParty = partiesList.body.results;
    }
    const results = await InvoiceService.search(
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
    const partiesList = await InvoiceService.search("", 1, 'sundrydebtors', false);
    if (partiesList?.body && partiesList.body?.results) {
        data.searchedParty = partiesList.body.results;
    }
    const results = await InvoiceService.search(
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
        const results = await InvoiceService.getTaxes();
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
        const results = await InvoiceService.getDiscounts();
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
        const results = await InvoiceService.getWareHouse();
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
        const results = await InvoiceService.getBriefAccount();
        if (results.body && results.status == 'success') {
            console.log('got modes');
            return results.body.results;
        }
    } catch (e) {
        return [];
    }
}

const getBranches = async (uniqueName: any) => {
    let branchList: any[] = [];
    const branchesResponse = await CommonService.getCompanyBranches(uniqueName);
    if (branchesResponse && branchesResponse.status == 'success') {
        for (let j = 0; j < branchesResponse.body.length; j++) {
            //changing branch of company so that api's don't return same response of a particular company
            console.log('chaning branch to ', branchesResponse.body[j].uniqueName);
            await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchesResponse.body[j].uniqueName);
            branchList.push({
                timeStamp: calculateDataLoadedTime(new Date()),
                uniqueName: branchesResponse.body[j].uniqueName,
                alias: branchesResponse.body[j].alias,
                name: branchesResponse.body[j].name,
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
}

export const EnableOfflineMode = async (companies: any) => {
    const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
    let data: any = {
        timeStamp: calculateDataLoadedTime(new Date()),
        userUniqueIdentifier: userEmail,
        companies: []
    };
    //user selected company and branch 
    const currentCompany: any = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    const currentBranch: any = await AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);

    for (let i = 0; i < companies.length; i++) {
        //changing current company so that api's don't return same response of a particular company
        console.log('changing company to ', companies[i].uniqueName);
        await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companies[i].uniqueName);
        data.companies.push({
            uniqueName: companies[i].uniqueName,
            name: companies[i].name,
            companyCountryDetails: await getCompanyCountryDetails(
                companies[i].subscription.country.countryCode
            ),
            branches: await getBranches(companies[i].uniqueName),
        });
    }

    //again storing the user selected company and branch
    await AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, currentCompany);
    await AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, currentBranch);

    console.log(JSON.stringify(data));
}