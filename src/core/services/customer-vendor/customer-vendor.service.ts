import httpInstance from '@/core/services/http/http.service';
import { CustomerVendorUrls } from '@/core/services/customer-vendor/customer-vendor.url';
import { Alert } from 'react-native';

export class CustomerVendorService {
  /**
   * Get all currency
   * @returns 
   */
  static getAllCurrency() {
    return httpInstance
      .get(CustomerVendorUrls.getAllCurrency, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
  /**
   * Get all calling code
   * @returns 
   */
  static getAllCallingCode() {
    return httpInstance
      .get(CustomerVendorUrls.getCallingCode, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
  /**
   * Get all currency
   * @returns 
   */
  static getAllCountryName() {
    return httpInstance
      .get(CustomerVendorUrls.getAllCountry, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
  /**
   * Get all currency
   * @returns 
   */
  static getAllStateName(countryCode: any) {
    return httpInstance
      .get(CustomerVendorUrls.getAllState.replace(':countryCode', `${countryCode}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
  /**
   * Get all currency
   * @returns 
   */
  static getAllPartyType() {
    return httpInstance
      .get(CustomerVendorUrls.getAllPartyType, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  /**
   * Create Customer
   * @param payload 
   * @param accountUniqueName 
   * @returns 
   */
  static createCustomer(payload: any) {
    console.log(CustomerVendorUrls.generateCreateCustomer);
    return httpInstance
      .post(CustomerVendorUrls.generateCreateCustomer, payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  /**
   * Create Vendor
   * @param payload 
   * @param accountUniqueName 
   * @returns 
   */
  static createVendor(payload: any) {
    console.log(CustomerVendorUrls.generateCreateVendor);
    return httpInstance
      .post(CustomerVendorUrls.generateCreateVendor, payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        //Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

}
