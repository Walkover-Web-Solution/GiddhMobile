import httpInstance from '@/core/services/http/http.service';
import { invoiceUrls, invoiceUrlsForV1 } from '@/core/services/invoice/invoice.url';
import { Alert } from 'react-native';

let store;

export const injectStoreToInvoiceUrls = _store => {
  store = _store;
}

export class InvoiceService {
  /**
   * get company details
   * @returns {Promise<BaseResponse<Company>>}
   */
  static search(query: string, page: number, group: string, withStocks: boolean) {
    return httpInstance
      .get(
        (store?.getState()?.commonReducer?.companyVoucherVersion == 2 ? invoiceUrls.search : invoiceUrlsForV1.search)
          .replace('q=', `q=${query}`)
          .replace('page=', `page=${page}`)
          .replace('group=', `group=${group}`)
          .replace('withStocks=', `withStocks=${withStocks}`),
        {}
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        //alert(err);
        return err;
      });
  }

  static Pbsearch(query: string, page: number, group: string) {
    return httpInstance
      .get(
        invoiceUrls.purchaseBillsearch
          .replace('q=', `q=${query}`)
          .replace('page=', `page=${page}`)
          .replace('group=', `group=${group}`),
        // .replace('withStocks=', `withStocks=${withStocks}`),
        {}
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        //alert(err);
        return err;
      });
  }

  static getAccountDetails(query: any) {
    return httpInstance
      .get(invoiceUrls.getAccountDetails.replace(':q', `${query}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        //alert(err);
        return err;
      });
  }

  /**
   * get company Address
   */
  static getCompanyBranchesDetails() {
    return httpInstance.get(invoiceUrls.companyBranchDeatils, {}).then((res) => {
      return res.data;
    }).catch((err) => {
      console.log(JSON.stringify(err))
      return null;
    });
  }

  static getCompanyBranchAdresses() {
    return httpInstance
      .get(invoiceUrls.getCompanyBranchAddresses, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        return null;
      });
  }

  static getWareHouse() {
    return httpInstance
      .get(invoiceUrls.getWareHouse, {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        return null;
      });
  }

  //  stockDetailService: createEndpoint('v2/company/:companyUniqueName/particular/sales?stockUniqueName=&branchUniqueName=:branchUniqueName'),
  // serviceType - servicesales|sales
  static getStockDetails(uniqueName: any, stockUniqueName: any, variantUniqueName: string) {
    return httpInstance
      .get(
        (store?.getState()?.commonReducer?.companyVoucherVersion == 2 ? invoiceUrls.stockDetailService : invoiceUrlsForV1.stockDetailService)
          .replace(':sales_type', `${uniqueName}`)
          .replace('stockUniqueName=', `stockUniqueName=${stockUniqueName}`)
          .replace('variantUniqueName=',  variantUniqueName ? `variantUniqueName=${variantUniqueName}` : ''),
        {}
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        return null;
      });
  }

  static getStockVariants(stockUniqueName: string) {
    return httpInstance
      .get(
        invoiceUrls.getStockVariants
          .replace(':stockUniqueName', `${stockUniqueName}`),
        {}
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err))
        return null;
      });
  }

  static getSalesDetails(serviceType: any) {
    return httpInstance
      .get(
        (store?.getState()?.commonReducer?.companyVoucherVersion == 2 ? invoiceUrls.salesDetailService : invoiceUrlsForV1.salesDetailService)
        .replace(':sales_type', `${serviceType}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return null;
      });
  }

  static getDiscounts() {
    return httpInstance
      .get(invoiceUrls.getDiscounts, {})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // alert(JSON.stringify(err));
        console.log('error getting discounts ', JSON.stringify(_err));
        return null;
      });
  }

  static getTaxes() {
    return httpInstance
      .get(invoiceUrls.getTaxes, {})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // alert(JSON.stringify(err));
        console.log('error getting taxes ', _err);
        return null;
      });
  }

  static getInvoiceTemplate() {
    return httpInstance
      .get(invoiceUrls.getCompanyInvoiceTemplate, {})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        console.log('error getting Invoice template ', _err);
        return null;
      });
  }

  static getVoucherTemplate() {
    return httpInstance
      .get(invoiceUrls.getCompanyVoucherTemplate, {})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        console.log('error getting Voucher template ', _err);
        return null;
      });
  }
  
  // Becuase of version 2, Not using this function. Using common function for version 1 and 2 i.e; createVoucher.
  static createInvoice(payload: { account: { attentionTo: string; billingDetails: { address: string[]; countryName: string; gstNumber: string; panNumber: string; state: { code: string; name: string; }; stateCode: string; stateName: string; pincode: string; }; contactNumber: string; country: { countryName: string; countryCode: string; }; currency: { code: string; }; currencySymbol: string; email: string; mobileNumber: string; name: any; shippingDetails: { address: string[]; countryName: string; gstNumber: string; panNumber: string; state: { code: string; name: string; }; stateCode: string; stateName: string; pincode: string; }; uniqueName: any; customerName: any; }; date: string; dueDate: string; deposit: { type: string; accountUniqueName: string; amountForAccount: number; }; entries: { date: string; discounts: ({ calculationMethod: string; amount: { type: string; amountForAccount: any; }; discountValue: any; name: string; particular: string; } | { calculationMethod: string; amount: { type: string; amountForAccount: any; }; name: any; uniqueName: any; particular: any; })[] | { calculationMethod: string; amount: { type: string; amountForAccount: number; }; name: string; particular: string; }[]; hsnNumber: any; purchaseOrderItemMapping: { uniqueName: string; entryUniqueName: string; }; sacNumber: any; taxes: { uniqueName: any; calculationMethod: string; }[]; transactions: { account: { uniqueName: any; name: any; }; amount: { type: string; amountForAccount: number; }; stock: { quantity: any; sku: any; name: any; uniqueName: any; rate: { amountForAccount: number; }; stockUnit: { code: any; }; } | undefined; }[]; voucherNumber: string; voucherType: string; }[]; exchangeRate: number; passportNumber: string; templateDetails: { other: { shippingDate: string; shippedVia: null; trackingNumber: null; customField1: null; customField2: null; customField3: null; }; }; touristSchemeApplicable: boolean; type: string; updateAccountDetails: boolean; voucherAdjustments: { adjustments: never[]; }; }, accountUniqueName: any, invoiceType: string) {
    console.log(invoiceUrls.genrateInvoice.replace(':accountUniqueName', `${accountUniqueName}`));
    console.log('invoice type', invoiceType);
    if (invoiceType == 'sales') {
      return httpInstance
        .post(invoiceUrls.genrateInvoice.replace(':accountUniqueName', `${accountUniqueName}`), payload)
        .then((res) => {
          // console.log('yayyy!', res.data);
          return res.data;
        })
        .catch((err) => {
          Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
          // alert(JSON.stringify(err));
          return null;
        });
    } else {
      return httpInstance
        .post(invoiceUrls.genrateInvoice.replace(':accountUniqueName', 'cash'), payload)
        .then((res) => {
          // console.log('yayyyyyyyyyyyyyyyy!', res.data);
          return res.data;
        })
        .catch((err) => {
          Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
          return null;
        });
    }
  }

  /**
   * Becuase of version 2, Not using this function. Using common function for version 1 and 2 i.e; createVoucher.
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
        Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });
  }
  static createReceipt(payload: any, accountUniqueName: any, voucherVersion: any, lang: any) {
console.log('services inside-=-',invoiceUrls.generateReceipt.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`))
    // console.log('invoice type', invoiceType);
    return httpInstance
      .post(invoiceUrls.generateReceipt.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        // Alert.alert('Success','Receipt is created successfully.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return res.data;
      })
      .catch((err) => {
        // console.log('In Catch createReceipt', invoiceUrls.generateReceipt.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`), JSON.stringify(payload));

        console.log('--- createReceipt --- Error ---',JSON.stringify(err.data));
        Alert.alert('Error', err?.data?.message ?? err?.data?.error ?? 'Something Went Wrong', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });
  }


  static createPayment(payload: any, accountUniqueName: any, voucherVersion: any, lang: any) {
console.log('services inside-=-',invoiceUrls.generatePayment.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`))
    // console.log('invoice type', invoiceType);
    return httpInstance
      .post(invoiceUrls.generatePayment.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        // Alert.alert('Success','Receipt is created successfully.', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return res.data;
      })
      .catch((err) => {
        // console.log('In Catch createReceipt', invoiceUrls.generateReceipt.replace(':accountUniqueName', `${accountUniqueName}`).replace(':voucherVersion', `${voucherVersion}`).replace(':lang', `${lang}`), JSON.stringify(payload));

        console.log('--- createPayment --- Error ---',JSON.stringify(err.data));
        Alert.alert('Error', err?.data?.message ?? err?.data?.error ?? 'Something Went Wrong', [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });
  }

  // Becuase of version 2, Using this function for version 1 only and for version 2 using function createVoucher.
  static createPurchaseBill(payload: { account: { attentionTo: string; billingDetails: { address: any[]; countryName: string; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; contactNumber: string; country: { countryName: string; countryCode: string; }; currency: { code: string; }; currencySymbol: string; email: string; mobileNumber: string; name: any; shippingDetails: { address: any[]; countryName: string; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; uniqueName: any; }; date: string; dueDate: string; entries: { date: string; discounts: ({ calculationMethod: string; amount: { type: string; amountForAccount: any; }; discountValue: any; name: string; particular: string; } | { calculationMethod: string; amount: { type: string; amountForAccount: any; }; name: any; uniqueName: any; particular: any; })[] | { calculationMethod: string; amount: { type: string; amountForAccount: number; }; name: string; particular: string; }[]; hsnNumber: any; purchaseOrderItemMapping: { uniqueName: string; entryUniqueName: string; }; sacNumber: any; taxes: { uniqueName: any; calculationMethod: string; }[]; transactions: { account: { uniqueName: any; name: any; }; amount: { type: string; amountForAccount: number; }; stock: { quantity: any; sku: any; name: any; uniqueName: any; rate: { amountForAccount: number; }; stockUnit: { code: any; }; } | undefined; }[]; voucherNumber: string; voucherType: string; }[]; exchangeRate: number; templateDetails: { other: { shippingDate: string; shippedVia: null; trackingNumber: null; customField1: null; customField2: null; customField3: null; }; }; type: string; attachedFiles: never[]; subVoucher: string; purchaseOrders: never[]; company: { billingDetails: { address: any[]; countryName: any; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; shippingDetails: { address: any[]; countryName: any; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; }; }, accountUniqueName: any) {
    console.log(invoiceUrls.genratePurchaseBill.replace(':accountUniqueName', `${accountUniqueName}`));
    return httpInstance
      .post(invoiceUrls.genratePurchaseBill.replace(':accountUniqueName', `${accountUniqueName}`), payload)
      .then((res) => {
        console.log('PurchaseBill!', res.data);
        return res.data;
      })
      .catch((err) => {
        Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });
  }

  static getBriefAccount() {
    return httpInstance
      .get(
        (store?.getState()?.commonReducer?.companyVoucherVersion == 2 ? invoiceUrls.getBriefAccount : invoiceUrlsForV1.getBriefAccount)
        , {})
      .then((res) => {
        return res.data;
      })
      .catch((_err) => {
        // alert(JSON.stringify(err));
        console.log('error getting briefAccount ', _err);
        return null;
      });
  }

  static getCountryDetails(code: any) {
    console.log(invoiceUrls.getCountryDetails.replace(':countryCode', `${code}`))
    return httpInstance
      .get(invoiceUrls.getCountryDetails.replace(':countryCode', `${code}`), {})
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        return null;
      });
  }

  static getExchangeRate = async (date: any, to: any, currency: any) => {
    console.log(invoiceUrls.getExchangeRateToINR.replace(':date', `${date}`).replace(':from', `${currency}`).replace(':to', `${to}`));
    return httpInstance
      .get(invoiceUrls.getExchangeRateToINR.replace(':date', `${date}`).replace(':from', `${currency}`).replace(':to', `${to}`), {})
      .then((res) => {
        return res.data;
      })
  }

  static getVoucherInvoice(date: any, payload: any, voucherVersion: any) {
    return httpInstance
      .post(invoiceUrls.getVoucherInvoice.replace(':voucherDate', `${date}`).replace(':voucherVersion', `${voucherVersion}`), payload)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        JSON.stringify('ERROR' + JSON.stringify(err));
        return null;
      });
  }
  static getInvoicesForReceipt(date: any, payload: any, voucherVersion: any, page: any, count: any) {
    return httpInstance
      .post(invoiceUrls.getInvoicesForReceipt.replace(':voucherDate', `${date}`).replace(':voucherVersion', `${voucherVersion}`).replace(':page', `${page}`).replace(':count', `${count}`), payload)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        JSON.stringify('ERROR' + JSON.stringify(err));
        return null;
      });
  }

  static createVoucher(payload: { account: { attentionTo: string; billingDetails: { address: any[]; countryName: string; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; contactNumber: string; country: { countryName: string; countryCode: string; }; currency: { code: string; }; currencySymbol: string; email: string | null; mobileNumber: string; name: any; shippingDetails: { address: any[]; countryName: string; gstNumber: any; panNumber: string; state: { code: any; name: any; }; stateCode: any; stateName: any; pincode: any; }; uniqueName: any; }; date: string; dueDate: string; deposit: { type: string; accountUniqueName: string; amountForAccount: number; }; entries: { date: string; discounts: ({ calculationMethod: string; amount: { type: string; amountForAccount: any; }; discountValue: any; name: string; particular: string; } | { calculationMethod: string; amount: { type: string; amountForAccount: any; }; name: any; uniqueName: any; particular: any; })[] | { calculationMethod: string; amount: { type: string; amountForAccount: number; }; name: string; particular: string; }[]; hsnNumber: any; purchaseOrderItemMapping: { uniqueName: string; entryUniqueName: string; }; sacNumber: any; taxes: { uniqueName: any; calculationMethod: string; }[]; transactions: { account: { uniqueName: any; name: any; }; amount: { type: string; amountForAccount: number; }; stock: { quantity: any; sku: any; name: any; uniqueName: any; rate: { amountForAccount: number; }; stockUnit: { code: any; }; } | undefined; }[]; voucherNumber: string; voucherType: string; }[]; exchangeRate: number; templateDetails: { other: { shippingDate: string; shippedVia: null; trackingNumber: null; customField1: null; customField2: null; customField3: null; }; }; type: string; updateAccountDetails: boolean; }, accountUniqueName: any, voucherVersion: any) {
    console.log(
      invoiceUrls.generateVoucher.replace(':voucherVersion', `${voucherVersion}`).replace(':accountUniqueName', `${accountUniqueName}`));
    return httpInstance
      .post(invoiceUrls.generateVoucher.replace(':voucherVersion', `${voucherVersion}`).replace(':accountUniqueName', `${accountUniqueName}`), payload)
      .then((res) => {
        console.log('yayyy!', res.data);
        return res.data;
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        Alert.alert('Error', err.data.message, [{ style: 'destructive', onPress: () => console.log('alert destroyed') }]);
        return null;
      });
  }

  static fetchReceiverDetail(){
    return httpInstance.get(invoiceUrls.eWayBillUser)
      .then((res) => {
        return res.data;
      }).catch((err) => {
        console.log(JSON.stringify(err));
        return err?.data;
      });
  }

  static fetchTransporterDetails() {
    return httpInstance.get(invoiceUrls.fetchTransporterDetails)
      .then((res) => {
        return res.data;
      }).catch((err) => {
        console.log(JSON.stringify(err));
        return null;
      });
  }

  static addTransporter(payload) {
    return httpInstance
    .post(invoiceUrls.fetchTransporterDetails, payload)
      .then((res) => {
        return res.data;
      }).catch((err) => {
        console.log(JSON.stringify(err));
        return err;
      });
  }

  static async loginEwayBill(payload: any) {
    return httpInstance.post(invoiceUrls.eWayBillUser, payload)
  }
}
