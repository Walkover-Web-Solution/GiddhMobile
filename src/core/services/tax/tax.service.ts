import httpInstance from "../http/http.service";
import { TaxUrls } from "./tax.url";

export class TaxServices {
    static fetchTaxNumbers(){
        return httpInstance.get(TaxUrls.fetchTaxNumbers)
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while fetching taxNumbers",err);
          return err;
        })
    }

    static fetchVatObligations(taxNumber:string, body:any, startDate:string, endDate:string, branchUniqueName:string, status:string) {
        return httpInstance.post(TaxUrls.fetchVatObligations(startDate,endDate,branchUniqueName,status)
            .replace(':taxNumber',taxNumber), body)
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while fetching vat obligations",err);
          return err;
        })
    }

    static fetchOpenVatReport(start:string, end:string, taxNumber:string) {
        return httpInstance.get(TaxUrls.fetchOpenVatReport(start, end)
            .replace(':taxNumber',taxNumber))
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while fetching open vat report",err);
          return err;
        })
    }
    static fetchFulfilledVatReport(start:string, end:string, taxNumber:string, periodKey:string, body:any, ) {
        return httpInstance.post(TaxUrls.fetchFulfilledVatReport(start, end, periodKey)
            .replace(':taxNumber',taxNumber), body)
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while fetching fulfilled vat reoprt",err);
          return err;
        })
    }
    static submitFileReturn(start:string, end:string, taxNumber:string, periodKey:string, branchUniqueName:string, body:any) {
        return httpInstance.post(TaxUrls.submitFileReturn(start, end, periodKey, branchUniqueName)
            .replace(':taxNumber',taxNumber), body)
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while fetching fulfilled vat reoprt",err);
          return err;
        })
    }
    static authorize() {
      return httpInstance.get(TaxUrls.authorize)
        .then((res)=>{
          if(res && res?.data){
            return res;
          }else{
            return res;
          }
        }).catch((err)=>{
          console.log("error while authorizing",err);
          return err;
        })
    }
}