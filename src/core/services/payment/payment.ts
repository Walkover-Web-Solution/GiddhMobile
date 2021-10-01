import httpInstance from '@/core/services/http/http.service';
import { PaymentUrls } from '../payment/payment.url'

export class PaymentServices {
  
  /**
   * Get all bank account
   * @returns
   */
   static getAccounts() {
    return httpInstance
      .get(PaymentUrls.getAccounts,{})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
  
  /**
   * Get all payor
   * @returns
   */
  static getAllPayor(uniqueName:any,amount:any) {
    return httpInstance
      .get(PaymentUrls.getAccounts.replace(':uniqueName', `${uniqueName}`).replace(':amount',`${amount}`),{})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  /**
   * Send OTP
   * @param payload
   * @returns
   */
   static sendOTP(payload: any) {
    return httpInstance
      .post(PaymentUrls.sendOTP, payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        // Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return err;
      });
  }
  
  /**
   * Confirm payment
   * @param payload
   * @param uniqueName
   * @param urn
   * @returns
   */
  static confirmPayment(payload: any,urn:any,uniqueName:any) {
    return httpInstance
      .post(PaymentUrls.generatePayment.replace(':uniqueName', `${uniqueName}`).replace(':urn',`${urn}`), payload)
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
  
}
