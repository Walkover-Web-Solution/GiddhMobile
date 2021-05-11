import {call, put, takeLatest, select, takeEvery} from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as CommonActions from './CommonAction';
import * as CommonService from './CommonService';
import AsyncStorage from '@react-native-community/async-storage';
import {APP_EVENTS, STORAGE_KEYS} from '@/utils/constants';
import {DeviceEventEmitter} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';

export default function* watcherFCMTokenSaga() {
  yield takeLatest(ActionConstants.GET_COMPANY_BRANCH_LIST, getCompanyAndBranches);
  yield takeLatest(ActionConstants.LOGOUT, logoutUser);
}

export function* getCompanyAndBranches() {
  try {
    const listResponse = yield call(CommonService.getCompanyList);
    // const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    // console.log('list response is' + listResponse.body);
    // console.log('list response is' + JSON.stringify(listResponse));
    let companyData = {};
    companyData.success = false;
    if (listResponse && listResponse.status == 'success') {
      companyData.success = true;
      companyData.companyList = listResponse.body;
      const activeCompany = yield AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      if (!activeCompany) {
        if (listResponse.body && listResponse.body.length > 0) {
          let defaultComp = listResponse.body[0];
          // console.log("rabbit"+defaultComp.userDetails.country);
          
          // if(defaultComp.userDetails.country){
          //   console.log("rabbit"+defaultComp.userDetails.country.countryCode);
          //   yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyCountryCode, defaultComp.userDetails.country.countryCode);
          // }
          if (defaultComp.uniqueName) {
            yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, defaultComp.uniqueName);
          }
        }
      }
    }
    const branchesResponse = yield call(CommonService.getCompanyBranches);
    if (branchesResponse && branchesResponse.status == 'success') {
      companyData.branchList = branchesResponse.body;
      const activeBranch = yield AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      if (!activeBranch) {
        if (branchesResponse.body && branchesResponse.body.length > 0) {
          let defaultBranch = branchesResponse.body[0];
          if (defaultBranch.alias) {
            yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, defaultBranch.uniqueName);
          }
        }
        //set active comapny if not found

        // if (response.status == false) {
        //     yield put(CommonActions.loginUserFailure(response.message));
        // }
        // else if (response.status == true){
        //     yield put(CommonActions.loginUserSuccess(action.payload.username, action.payload.password, response));
        // }
      }
    }
    if ((companyData.success = true)) {
      yield put(CommonActions.getCompanyAndBranchesSuccess(companyData));
      DeviceEventEmitter.emit(APP_EVENTS.comapnyBranchChange, {});
    } else {
      yield put(CommonActions.getCompanyAndBranchesFailure());
    }
  } catch (e) {
    yield put(CommonActions.getCompanyAndBranchesFailure());
  }
}

export function* logoutUser() {
  try {
    appleAuth.Operation.LOGOUT;
    yield AsyncStorage.clear();
    console.log('login worked');
  } catch (e) {
    console.log(e);
  }

  yield put(CommonActions.reset());
}
