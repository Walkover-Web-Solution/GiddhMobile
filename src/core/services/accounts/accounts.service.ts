import httpInstance from '@/core/services/http/http.service';
import { Alert } from 'react-native';
import { AccountsUrls } from './accounts.url';
export class AccountsService {
  static getGroupAccounts(selectedGroup: string, page: any) {
    return httpInstance.post(AccountsUrls.getGroupAccounts.replace(':selectedGroup', selectedGroup).replace(':page', page),
      {}).then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log('---- ERROR in group accounts ----', error);
      });;
  }
  static getGroupNames(groupName: string, page: any) {
    return httpInstance.get(AccountsUrls.getGroupNames.replace(':groupName', groupName).replace(':page', page)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in group names ----', error);
      });;
  }
  static getAccountNames(accountName: string, stockAccountUniqueName: string, page: any, withStocks: any) {
    return httpInstance.get(AccountsUrls.getAccountNames.replace(':accountName', accountName).replace(':withStocks', withStocks).replace(':page', page).replace(':stockAccountUniqueName', stockAccountUniqueName)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in account names ----', error);
      });;
  }
  static getIndividualAccountData(accountName: string) {
    return httpInstance.get(AccountsUrls.getIndividualAccount.replace(':accountName', accountName)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in account details ----', error);
      });;
  }
  static getParticularToAccountData(accountName: string) {
    return httpInstance.get(AccountsUrls.getParticularToAccountData.replace(':accountName', accountName)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in account to details ----', error);
      });;
  }
  static getStockData(stockUniqueName: string) {
    return httpInstance.get(AccountsUrls.getStockData.replace(':stockUniqueName', stockUniqueName)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in stock  details ----', error);
      });;
  }
  static getParticularStockData(ledgerType: string, stockUniqueName: string, oppositeAccountUniqueName: string, variantUniqueName: string) {
    return httpInstance.get(AccountsUrls.getParticularStockData.replace(':ledgerType', ledgerType).replace(':stockUniqueName', stockUniqueName).replace(':oppositeAccountUniqueName', oppositeAccountUniqueName).replace(':variantUniqueName', variantUniqueName)).then((res) => {
      return res.data;
    })
      .catch((error) => {
        console.log('---- ERROR in stock  particular data ----', error);
      });;
  }
  static createAccountsEntry(accountType: string, voucherVersion: any, data: any) {
    return httpInstance.post(AccountsUrls.createEntry.replace(':accountType', accountType).replace(':voucherVersion', voucherVersion),
      data).then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log('---- ERROR in creating account entry ----', err);
        Alert.alert('Error', err?.data?.message ?? err?.data?.error ?? 'Something Went Wrong', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });;
  }
  static getAdjustmentInvoices(voucherDate: any, voucherVersion: any, pageNumber: any,data: any) {
    return httpInstance.post(AccountsUrls.getAdjustmentInvoices.replace(':voucherDate', voucherDate).replace(':voucherVersion', voucherVersion).replace(':pageNumber',pageNumber),
      data).then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log('---- ERROR in getting Adjustment invoices ----', err);
        Alert.alert('Error', err?.data?.message ?? err?.data?.error ?? 'Something Went Wrong', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });;
  }
}
