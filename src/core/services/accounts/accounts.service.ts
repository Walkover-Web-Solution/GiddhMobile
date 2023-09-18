import httpInstance from '@/core/services/http/http.service';
import { Alert } from 'react-native';
import { AccountsUrls } from './accounts.url';
export class AccountsService {
  static getGroupAccounts (selectedGroup : string, page:any) {
        return httpInstance.post(AccountsUrls.getGroupAccounts.replace(':selectedGroup',selectedGroup).replace(':page',page), 
            {}).then((res) => {
            return res.data;
          })
          .catch((error) => {
            console.log('---- ERROR in group accounts ----', error);
          });;
  }
  static getGroupNames (groupName : string, page : any) {
        return httpInstance.get(AccountsUrls.getGroupNames.replace(':groupName',groupName).replace(':page',page)).then((res) => {
            return res.data;
          })
          .catch((error) => {
            console.log('---- ERROR in group names ----', error);
          });;
  }
  static getAccountNames (accountName : string, page : any) {
        return httpInstance.get(AccountsUrls.getAccountNames.replace(':accountName',accountName).replace(':page',page)).then((res) => {
            return res.data;
          })
          .catch((error) => {
            console.log('---- ERROR in account names ----', error);
          });;
  }
  static getIndividualAccountData (accountName : string) {
        return httpInstance.get(AccountsUrls.getIndividualAccount.replace(':accountName',accountName)).then((res) => {
            return res.data;
          })
          .catch((error) => {
            console.log('---- ERROR in account details ----', error);
          });;
  }
}
