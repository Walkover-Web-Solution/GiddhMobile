import React, { Component } from 'react';
import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import AppNavigator from '@/navigation/app.navigator';
import NetInfo from '@react-native-community/netinfo';
import queueFactory from 'react-native-queue';

import { connect } from 'react-redux';
import { getCompanyAndBranches, renewAccessToken, InternetStatus } from '../redux/CommonAction';
import SplashScreen from 'react-native-splash-screen';
import AppMainNav from '@/navigation/app.main.navigator';
import Invoice from '@/screens/Invoices/Invoice';
import { API_CALLS, API_TYPE, STORAGE_KEYS } from '@/utils/constants';
import { InvoiceService } from '@/core/services/invoice/invoice.service';
import { CustomerVendorService } from '@/core/services/customer-vendor/customer-vendor.service';
import { fi } from 'date-fns/locale';
import Realm from 'realm';
import { RootDBOptions } from '@/Database';
import { ROOT_DB_SCHEMA } from '@/Database/AllSchemas/company-branch-schema';
import AsyncStorage from '@react-native-community/async-storage';
import { put } from 'redux-saga/effects';
import * as CommonActions from '../redux/CommonAction';

class BaseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queue: null,
    };
    this.init();
  }
  async init() {
    const queue = await queueFactory();
    queue.addWorker(API_CALLS, async (id, payload) => {
      if (payload.type == API_TYPE.SALES) {
        await InvoiceService.createInvoice(
          payload.postbody,
          payload.uniqueName,
          payload.invoiceType);
      }
      else if (payload.type == API_TYPE.PURCHASE) {
        await InvoiceService.createPurchaseBill(
          payload.postbody,
          payload.uniqueName);
      } else if (payload.type == API_TYPE.DEBIT_NOTE) {
        await InvoiceService.createDebitNote(
          payload.postbody,
          payload.uniqueName,
          payload.invoiceType);
      } else if (payload.type == API_TYPE.CREDIT_NOTE) {
        await InvoiceService.createCreditNote(
          payload.payload,
          payload.uniqueName,
          payload.invoiceType
        );
      } else if (payload.type == API_TYPE.CUSTOMER) {
        await CustomerVendorService.createCustomer(payload.postbody);
      } else if (payload.type == API_TYPE.VENDOR) {
        await CustomerVendorService.createVendor(payload.postbody);
      }
    });
    NetInfo.addEventListener((info) => {
      this.props.dispatchInternetStatus(info.isInternetReachable);
      if (info.isInternetReachable == true) {
        // alert('queue started');
        queue.start();
      }
      if (info.isInternetReachable == false) {
        // alert('queue paused');
        queue.stop();
      }
    });
    this.setState({
      queue,
    });
  }

  getCompanyBranchList = async () => {
    try {
      const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.googleEmail);
      const realm = await Realm.open(RootDBOptions);
      const currentCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      const data = realm.objectForPrimaryKey(ROOT_DB_SCHEMA, userEmail);
      const companyData = {
        success: true,
        companyList: [],
        branchList: []
      };
      for (let i = 0; i < data.companies.length; i++) {
        companyData.companyList.push({
          uniqueName: data.companies[i].uniqueName,
          name: data.companies[i].name,
          subscription: data.companies[i].subscription
        });
        if (data.companies[i].uniqueName == currentCompany) {
          for (let j = 0; j < data.companies[i].branches.length; j++) {
            const elem = data.companies[i].branches[j];
            companyData.branchList.push({
              uniqueName: elem.uniqueName,
              alias: elem.alias,
              name: elem.name
            });
          }
        }
      }
      console.log('data', JSON.stringify(companyData));
      put(CommonActions.getCompanyAndBranchesSuccess(companyData));
    } catch (error) {
      put(CommonActions.getCompanyAndBranchesFailure());
    }

  }

  componentDidMount() {
    SplashScreen.hide();
    if (this.props.isUserAuthenticated) {
      if (this.props.isInternetReachable) {
        this.props.getCompanyAndBranches();
      } else {
        this.getCompanyBranchList();
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isUserAuthenticated && !prevProps.isUserAuthenticated) {
      this.props.getCompanyAndBranches();
    }
  }
  componentWillUnmount() {
    const unsubscribe = NetInfo.addEventListener((info) => console.log(info));
    unsubscribe();
    if (this.listener) {
      this.listener.remove();
    }
  }
  render() {
    return <AppNavigator />;
    // return <Invoice />;
  }
}
function mapStateToProps(state) {
  const { commonReducer, LoginReducer } = state;
  return {
    ...commonReducer,
    ...LoginReducer,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    getCompanyAndBranches: () => {
      dispatch(getCompanyAndBranches());
    },
    renewAccessToken: () => {
      dispatch(renewAccessToken());
    },
    dispatchInternetStatus: (status) => {
      dispatch(InternetStatus(status));
    },
  };
}

const MyComponent = connect(mapStateToProps, mapDispatchToProps)(BaseContainer);
export default MyComponent;
