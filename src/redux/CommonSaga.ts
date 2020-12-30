import {call, put, takeLatest, select} from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as CommonActions from './CommonAction';
import * as CommonService from './CommonService';
import {STORAGE_KEYS} from '@/utils/constants';

import AsyncStorage from '@react-native-community/async-storage';

export default function* watcherFCMTokenSaga() {
  yield takeLatest(ActionConstants.GET_COMPANY_BRANCH_LIST, getCompanyAndBranches);
}

export function* getCompanyAndBranches() {
  try {
    const listResponse = yield call(CommonService.getCompanyList);
    // const activeCompany = await AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);

    let companyData = {};
    if (listResponse && listResponse.status == 'success') {
      companyData.success = true;
      companyData.companyList = listResponse.body;
      const activeCompany = yield AsyncStorage.getItem(STORAGE_KEYS.activeCompanyUniqueName);
      if (!activeCompany) {
        if (listResponse.body && listResponse.body.length > 0) {
          let defaultComp = listResponse.body[0];
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
            console.log('yes its true');
            yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, defaultBranch.alias);
          }
        }
        //set active comapny if not found
        if ((companyData.success = true)) {
          yield put(CommonActions.getCompanyAndBranchesSuccess(companyData));
        }
        // if (response.status == false) {
        //     yield put(CommonActions.loginUserFailure(response.message));
        // }
        // else if (response.status == true){
        //     yield put(CommonActions.loginUserSuccess(action.payload.username, action.payload.password, response));
        // }
      }
    }
  } catch (e) {
    yield put(CommonActions.getCompanyAndBranchesFailure());
  }
}

export function* logoutUser(action) {
  const state = yield select();
  const {commonReducer} = state;
  let id = commonReducer.userData.data.data[0].id;

  try {
    const response = yield call(LoginService.logout, id);
    console.log(response);
  } catch (e) {
    yield put(CommonActions.loginUserFailure(e));
  }
}
