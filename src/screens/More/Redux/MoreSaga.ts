import {call, put, takeLatest, select} from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as MoreActions from './MoreAction';
import {getCompanyAndBranches} from '../../../redux/CommonAction';
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import {CompanyService} from '@/core/services/company/company.service';
import httpCustomInstance from '@/core/services/http/httpCustomInstance';
import {commonUrls} from '@/core/services/common/common.url';

export default function* watcherSaga() {
  yield takeLatest(ActionConstants.TURN_ON_OFFLINE_MODE, turnOnOfflineMode);
}

export function* turnOnOfflineMode(action) {
  console.log('turnOnOfflineMode ran');
  const state = yield select();
  const companyList = state.commonReducer.comapnyList;

  for (let i = 0; i < companyList.length; i++) {
    const response = yield call(CompanyService.getCompanyBranches, companyList[i].uniqueName);
    for (let j = 0; j < response.body.length; j++) {
      console.log(response.body[j].uniqueName);
      // Make Api calls here
    }
  }
}
