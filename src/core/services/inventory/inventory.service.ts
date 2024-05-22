import httpInstance from '@/core/services/http/http.service';
import { Alert } from 'react-native';
import { InventoryUrls } from './inventory.url';
import store from '@/redux/store';

export class InventoryService {
  static getInventories (companyName, startDate, endDate, page) {
    return httpInstance.get(
      InventoryUrls.getInventories
        .replace(':companyName', companyName)
        .replace(':startDate', startDate)
        .replace(':endDate', endDate)
        .replace(':page', page),
      {}
    ).then((resp) => {
      if(resp && resp?.data){
        return resp?.data;
      }else{
        return null;
      }
    }).catch((_err) => {
      console.log("Error in Inventory service"+_err)
      //Alert.alert('Inventory service', _err, [{ style: 'destructive', text: 'okay' }])
    })
  }

  static fetchAllTaxes () {
    return httpInstance.get(InventoryUrls.fetchAllTaxes
    ).then((res)=>{
      if(res && res?.data){
        return res;
      }else{
        return null;
      }
    }).catch((err)=>{
      console.log("err while fetch taxes",err);
    })
  }

  static fetchAllParentGroup () {
    return httpInstance.get(InventoryUrls.fetchAllParentGroup)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }else{
        return null;
      }
    }).catch((err)=>{
      console.log("error in parent grp",err);
      
    })
  }
}
