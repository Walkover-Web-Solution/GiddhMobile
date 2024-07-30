
// import * as api from '../util/api';
// import { ApiRequestObject } from '../util/types';
// import { Platform } from 'react-native';

// const TAG_COMMON_SERVICE = 'TAG_COMMON_SERVICE';
// import {  ENDPOINT } from '../util/constant';
// import AsyncStorage from '../util/AsyncStorageUtil';
import { CompanyService } from '../core/services/company/company.service';

export async function getCompanyList () {
  try {
    const response = await CompanyService.getCompanyList();
    return response
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getCompanyDetails () {
  try {
    const response = await CompanyService.getCompanyDetails();
    return response
  } catch (error) {
    console.log('--- getCompanyDetails ---', error);
    return error;
  }
}

export async function getCompanyBranches (uniqueName) {
  try {
    const response = await CompanyService.getCompanyBranches(uniqueName);
    return response
  } catch (error) {
    return error;
  }
}

export async function getLastStateDetails () {
  try {
    const response = await CompanyService.getLastStateDetails();
    return response?.body
  } catch (error) {
    console.warn(error);
    return error;
  }
}

export async function updateStateDetails (payload:any) {
  try {
    const response = await CompanyService.updateStateDetails(payload);
    return response
  } catch (error) {
    console.warn(error)
  }
}

export async function updateBranchStateDetails (payload:any) {
  try {
    const response = await CompanyService.updateBranchStateDetails(payload);
    return response
  } catch (error) {
    console.warn(error);
  }
}