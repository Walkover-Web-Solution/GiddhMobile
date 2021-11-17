import { call, put, takeLatest, select, takeEvery } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as CommonActions from './CommonAction';
import * as CommonService from './CommonService';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import { APP_EVENTS, STORAGE_KEYS } from '@/utils/constants';
import { DeviceEventEmitter } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';

export default function* watcherFCMTokenSaga() {
  yield takeLatest(ActionConstants.GET_COMPANY_BRANCH_LIST, getCompanyAndBranches);
  yield takeLatest(ActionConstants.LOGOUT, logoutUser);
}

export function* getCompanyAndBranches() {
  try {
    const listResponse = yield call(CommonService.getCompanyList);
    // const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    console.log('list response is' + listResponse.body);
    console.log('list response is' + JSON.stringify(listResponse));
    const companyData = {};
    companyData.success = false;
    const activeCompany = yield AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
    if (listResponse && listResponse.status == 'success') {
      companyData.success = true;
      companyData.companyList = listResponse.body;
      // const activeCompany = yield AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      if (!activeCompany) {
        console.log('this always runs for company');
        if (listResponse.body && listResponse.body.length > 0) {
          yield put(CommonActions.isAuth());
          const defaultComp = listResponse.body[0];
          if (
            defaultComp.subscription &&
            defaultComp.subscription.country &&
            defaultComp.subscription.country.countryCode
          ) {
            console.log('country code is ' + defaultComp.subscription.country.countryCode);
            yield AsyncStorage.setItem(
              STORAGE_KEYS.activeCompanyCountryCode,
              defaultComp.subscription.country.countryCode
            );
          }
          if (defaultComp.uniqueName) {
            yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, defaultComp.uniqueName);
          }
          if(defaultComp.name){
            yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyName, defaultComp.name);
          }
        } else {
          yield put(CommonActions.isUnauth());
        }
      } else {
        console.log('active company', activeCompany);
        const companyResults = _.find(listResponse.body, function (item) {
          return item.uniqueName == activeCompany;
        });
        yield put(CommonActions.isAuth());
        if (!companyResults) {
          console.log('different id login worked');
          if (listResponse.body && listResponse.body.length > 0) {
            const defaultComp = listResponse.body[0]; //unregistered email would give 0 length listResponse.body
            yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, defaultComp.uniqueName);
            yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyName, defaultComp.name);
            if (
              defaultComp.subscription &&
              defaultComp.subscription.country &&
              defaultComp.subscription.country.countryCode
            ) {
              console.log('country code is ' + defaultComp.subscription.country.countryCode);
              yield AsyncStorage.setItem(
                STORAGE_KEYS.activeCompanyCountryCode,
                defaultComp.subscription.country.countryCode
              );
            }
          } else {
            yield put(CommonActions.isUnauth());
          }
        }
      }
    }
    const branchesResponse = yield call(CommonService.getCompanyBranches);
    console.log('branches are', branchesResponse);
    if (branchesResponse && branchesResponse.status == 'success') {
      companyData.branchList = branchesResponse.body;
      const activeBranch = yield AsyncStorage.getItem(STORAGE_KEYS.activeBranchUniqueName);
      if (!activeBranch) {
        console.log('this always runs for branch');
        if (branchesResponse.body && branchesResponse.body.length > 0) {
          const defaultBranch = branchesResponse.body[0];
          if (defaultBranch.alias) {
            yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, defaultBranch.uniqueName);
          }
        }
        // set active comapny if not found

        // if (response.status == false) {
        //     yield put(CommonActions.loginUserFailure(response.message));
        // }
        // else if (response.status == true){
        //     yield put(CommonActions.loginUserSuccess(action.payload.username, action.payload.password, response));
        // }
      } else {
        const branchResults = _.find(branchesResponse.body, function (item) {
          return item.uniqueName == activeBranch;
        });
        if (!branchResults) {
          console.log('different id login worked branch');
          const defaultBranch = branchesResponse.body[0];
          if (defaultBranch.alias) {
            yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, defaultBranch.uniqueName);
          }
        }
      }
    }
    if (companyData.success == true) {
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
  console.log('here');
  try {
    appleAuth.Operation.LOGOUT;
    yield AsyncStorage.removeItem(STORAGE_KEYS.token);
    yield AsyncStorage.removeItem(STORAGE_KEYS.googleEmail);
    yield AsyncStorage.removeItem(STORAGE_KEYS.sessionStart);
    yield AsyncStorage.removeItem(STORAGE_KEYS.sessionEnd);
    // yield AsyncStorage.removeItem(STORAGE_KEYS.activeCompanyUniqueName);
    console.log('logout worked');
  } catch (e) {
    console.log(e);
  }

  yield put(CommonActions.reset());
}
