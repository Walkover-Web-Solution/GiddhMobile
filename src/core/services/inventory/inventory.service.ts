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

  static createStockGroup (payload:any) {
    return httpInstance.post(InventoryUrls.createStockGroup,payload)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }
      else{
        return null;
      }
    }).catch((err)=>{
      console.log("error while creating group",err);

    })
  }

  static fetchStockUnitGroup() {
    return httpInstance.get(InventoryUrls.fetchStockUnitGroup)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }else{
        return null;
      }
    }).catch((err)=>{
      console.log("error while fetching unit grp",err);
    })
  }

  static fetchPurchaseAccounts() {
    return httpInstance.get(InventoryUrls.fetchPurchaseAccounts)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }else{
        return null;
      }
    }).catch((err)=>{
      console.log("error while fetching purchase grp",err);
    })
  }

  static fetchSalesAccounts() {
    return httpInstance.get(InventoryUrls.fetchSalesAccounts)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }else{
        return null;
      }
    }).catch((err)=>{
      console.log("error while fetching purchase grp",err);
    })
  }

  static fetchUnitGroupMapping(payload:string[]) {
    return httpInstance.post(InventoryUrls.fetchUnitGroupMapping,payload)
    .then((res)=>{
      if(res && res?.data){
        return res;
      }
      else{
        return null;
      }
    }).catch((err)=>{
      console.log("err while fetching mapping",err);
      
    })
  }

  static fetchLinkedUnitMapping(unitUniqueName:string){
    return httpInstance.get(InventoryUrls.fetchLinkedUnitMapping
      .replace(':unitUniqueName',unitUniqueName))
      .then((res)=>{
        if(res && res?.data){
          return res;
        }
        else{
          return null;
        }
      }).catch((err)=>{
        console.log("error while fetching linked unit mapping",err);
        
      })
  }
}
