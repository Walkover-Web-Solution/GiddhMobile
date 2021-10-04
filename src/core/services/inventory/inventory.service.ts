import httpInstance from '@/core/services/http/http.service';
import { Alert } from 'react-native';
import { InventoryUrls } from './inventory.url';

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
      Alert.alert('Inventory service', _err, [{ style: 'destructive', text: 'okay' }])
    })
  }
}
