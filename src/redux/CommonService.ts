
// import * as api from '../util/api';
// import { ApiRequestObject } from '../util/types';
// import { Platform } from 'react-native';
  
// const TAG_COMMON_SERVICE = 'TAG_COMMON_SERVICE';
// import {  ENDPOINT } from '../util/constant';
// import AsyncStorage from '../util/AsyncStorageUtil';
import { CompanyService } from '../core/services/company/company.service';
import { getCompanyAndBranches } from './CommonSaga';


export async function getCompanyList() {
    try {
      const response = await CompanyService.getCompanyList();
      return response
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  export async function getCompanyBranches() {
    try {
      const response = await CompanyService.getCompanyBranches();
      return response
    } catch (error) {
        return error;
    }
  }