import { call, put, takeLatest, select } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as LoginAction from './LoginAction';
import * as LoginService from './LoginService';
import { AuthService } from '../../../core/services/auth/auth.service';

import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';




export default function* watcherSaga() {
    yield takeLatest(ActionConstants.GOOGLE_USER_LOGIN, googleLogin);      
}


export function* googleLogin(action){
    const response = yield call(LoginService.googleLogin, action.payload.token);
    if (response && response.body && response.body.session && response.body.session.id){
        yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

        // const response = await AuthService.submitGoogleAuthToken(payload.token);
        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
         // get state details
         //TODO: await dispatch.common.getStateDetailsAction();

        // get company details
        //TODO:  await dispatch.company.getCompanyDetailsAction();
        yield put(LoginAction.googleLoginUserSuccess({token: response.body.session.id, createdAt:response.body.session.createdAt, expiresAt: response.body.session.expiresAt }));
    }
    else{
        yield put(LoginAction.googleLoginUserFailure('Failed to do google login'));
    }
}

export function* logoutUser(action) {
    const state = yield select();
    const { commonReducer } = state;
    let id = commonReducer.userData.data.data[0].id;
   
        try {
            const response = yield call(LoginService.logout, id);
            console.log(response)
        } catch (e) {
            yield put(CommonActions.loginUserFailure(e));
        }
    
   
}