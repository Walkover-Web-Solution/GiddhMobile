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
        console.log(err)
        //Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
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
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
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
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
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
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  static getAllCityName(pinCode: any) {
    return httpInstance
      .get(CustomerVendorUrls.getAllCity.replace(':pinCode', `${pinCode}`))
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
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
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

    /**
   * Get all currency
   * @returns
   */
     static getCustomerGroupName() {
      return httpInstance
        .get(CustomerVendorUrls.getCustomerGroupName, {})
        .then((res) => {
          return res.data;
        })
        .catch((_err) => {
          return null;
        });
    }

    /**
   * Get all currency
   * @returns
   */
     static getVendorGroupName() {
      return httpInstance
        .get(CustomerVendorUrls.getVendorGroupName, {})
        .then((res) => {
          return res.data;
        })
        .catch((_err) => {
          return null;
        });
    }

  /**
   * Create Customer
   * @param payload
   * @param accountUniqueName
   * @returns
   */
  static createCustomer(groupUniqueName:any,payload: any) {
    console.log(CustomerVendorUrls.generateCreateCustomer);
    return httpInstance
      .post(CustomerVendorUrls.generateCreateCustomer.replace(':groupUniqueName', `${groupUniqueName}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  /**
   * Get Vendor entry
   * @returns
   */
  static getVendorEntry(uniqueName: any) {
    return httpInstance
      .get(CustomerVendorUrls.getVendorEntry.replace(':uniqueName', `${uniqueName}`))
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }


  /**
   * Create Vendor
   * @param payload
   * @param accountUniqueName
   * @returns
   */
  static createVendor(groupUniqueName:any,payload: any) {
    console.log(CustomerVendorUrls.generateCreateVendor);
    return httpInstance
      .post(CustomerVendorUrls.generateCreateVendor.replace(':groupUniqueName', `${groupUniqueName}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return err.data;
      });
  }

  /**
   * Update Vendor
   * @param payload
   * @param accountUniqueName
   * @returns
   */
   static async updateVendor(payload: any, uniqueName: any,groupUniqueName:any) {
    console.log(CustomerVendorUrls.generateUpdateVendor.replace(':uniqueName', `${uniqueName}`).replace(':groupUniqueName',`${groupUniqueName}`));  
    return httpInstance
      .put(CustomerVendorUrls.generateUpdateVendor.replace(':uniqueName', `${uniqueName}`).replace(':groupUniqueName',`${groupUniqueName}`),payload)
      .then((res) => {
        console.log('UPDATE VENDOR RESPONSE!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return err.data;
      });
  }
}
