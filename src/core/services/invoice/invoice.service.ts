import httpInstance from '@/core/services/http/http.service';
import {BaseResponse} from '@/models/classes/base-response';
import {invoiceUrls} from '@/core/services/invoice/invoice.url';
import {Company} from '@/models/interfaces/company';
import {Alert} from 'react-native';

export class InvoiceService {
  /**
   * get company details
   * @returns {Promise<BaseResponse<Company>>}
   */
  static search(query, page, group, withStocks) {
    return httpInstance
      .get(
        invoiceUrls.search
          .replace('q=', `q=${query}`)
          .replace('page=', `page=${page}`)
          .replace('group=', `group=${group}`)
          .replace('withStocks=', `withStocks=${withStocks}`),
        {},
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(err);
        return err;
      });
  }
  static Pbsearch(query, page, group) {
    return httpInstance
      .get(
        invoiceUrls.purchaseBillsearch
          .replace('q=', `q=${query}`)
          .replace('page=', `page=${page}`)
          .replace('group=', `group=${group}`),
        // .replace('withStocks=', `withStocks=${withStocks}`),
        {},
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(err);
        return err;
      });
  }

  static getAccountDetails(query) {
    return httpInstance
      .get(invoiceUrls.getAccountDetails.replace(':q', `${query}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(err);
        return err;
      });
  }
  //  stockDetailService: createEndpoint('v2/company/:companyUniqueName/particular/sales?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  //serviceType - servicesales|sales
  static getStockDetails(uniqueName, stockUniqueName) {
    return httpInstance
      .get(
        invoiceUrls.stockDetailService
          .replace(':sales_type', `${uniqueName}`)
          .replace('stockUniqueName=', `stockUniqueName=${stockUniqueName}`),
        {},
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(JSON.stringify(err));
        return null;
      });
  }
  static getSalesDetails(serviceType) {
    return httpInstance
      .get(invoiceUrls.salesDetailService.replace(':sales_type', `${serviceType}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(JSON.stringify(err));
        return null;
      });
  }

  static getDiscounts() {
    return httpInstance
      .get(invoiceUrls.getDiscounts, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(JSON.stringify(err));
        return null;
      });
  }

  static getTaxes() {
    return httpInstance
      .get(invoiceUrls.getTaxes, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(JSON.stringify(err));
        return null;
      });
  }

  static createInvoice(payload, accountUniqueName, invoiceType) {
    console.log(invoiceUrls.genrateInvoice.replace(':accountUniqueName', `${accountUniqueName}`));
    console.log('invoice type', invoiceType);
    if (invoiceType == 'sales') {
      return httpInstance
        .post(invoiceUrls.genrateInvoice.replace(':accountUniqueName', `${accountUniqueName}`), payload)
        .then((res) => {
          console.log('yayyy!', res.data);
          return res.data;
        })
        .catch((err) => {
          Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
          // alert(JSON.stringify(err));
          return null;
        });
    } else {
      return httpInstance
        .post(invoiceUrls.genrateInvoice.replace(':accountUniqueName', 'cash'), payload)
        .then((res) => {
          console.log('yayyyyyyyyyyyyyyyy!', res.data);
          return res.data;
        })
        .catch((err) => {
          Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
          return null;
        });
    }
  }

  /**
   * Api call to create debit note.
   * @param payload
   * @param accountUniqueName
   * @param invoiceType
   * @returns
   */
  static createDebitNote(payload: any, accountUniqueName: any, invoiceType: any) {
    console.log(invoiceUrls.generateDebitNote.replace(':accountUniqueName', `${accountUniqueName}`));
    console.log('invoice type', invoiceType);
    return httpInstance
      .post(invoiceUrls.generateDebitNote.replace(':accountUniqueName', `${accountUniqueName}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  static createPurchaseBill(payload, accountUniqueName) {
    console.log(invoiceUrls.genratePurchaseBill.replace(':accountUniqueName', `${accountUniqueName}`));
    return httpInstance
      .post(invoiceUrls.genratePurchaseBill.replace(':accountUniqueName', `${accountUniqueName}`), payload)
      .then((res) => {
        console.log('PurchaseBill!', res.data);
        return res.data;
      })
      .catch((err) => {
        Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }

  static getBriefAccount() {
    return httpInstance
      .get(invoiceUrls.getBriefAccount, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        alert(JSON.stringify(err));
        return null;
      });
  }

  static getCountryDetails(code: any) {
    console.log(invoiceUrls.getCountryDetails.replace(`:countryCode`, `${code}`))
    return httpInstance
      .get(invoiceUrls.getCountryDetails.replace(`:countryCode`, `${code}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return null;
      });
  }

  static getExchangeRate = async (date: any, to: any, currency: any) => {
    console.log(invoiceUrls.getExchangeRateToINR.replace(`:date`, `${date}`).replace(`:from`, `${currency}`).replace(`:to`, `${to}`));
    return httpInstance
      .get(invoiceUrls.getExchangeRateToINR.replace(`:date`, `${date}`).replace(`:from`, `${currency}`).replace(`:to`, `${to}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return null;
      });
  }

  static getVoucherInvoice(date: any, payload: any) {
    console.log(invoiceUrls.getVoucherInvoice.replace(`:voucherDate`, `${date}`), payload)
    return httpInstance
      .post(invoiceUrls.getVoucherInvoice.replace(`:voucherDate`, `${date}`), payload)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        JSON.stringify("ERROR" + JSON.stringify(err));
        return null;
      });
  }

  static createCreditNote(payload, accountUniqueName, invoiceType) {
    console.log(invoiceUrls.generateCreditNote.replace(':accountUniqueName', `${accountUniqueName}`));
    console.log('invoice type', invoiceType);
    return httpInstance
      .post(invoiceUrls.generateCreditNote.replace(':accountUniqueName', `${accountUniqueName}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        Alert.alert("Error", err.data.message, [{ style: "destructive", onPress: () => console.log("alert destroyed") }]);
        return null;
      });
  }
}
