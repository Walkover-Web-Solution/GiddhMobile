import { call, put, takeLatest, select } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as LoginAction from './LoginAction';
import * as LoginService from './LoginService';
import { AuthService } from '../../../core/services/auth/auth.service';
import {getCompanyAndBranches} from '../../../redux/CommonAction'
import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import { func } from 'prop-types';




export default function* watcherSaga() {
    yield takeLatest(ActionConstants.USER_EMAIL_LOGIN, verifyUserEmailPasswordLogin);
    yield takeLatest(ActionConstants.GOOGLE_USER_LOGIN, googleLogin);     
    yield takeLatest(ActionConstants.VERIFY_OTP, verifyOTP);      
    yield takeLatest(ActionConstants.APPLE_USER_LOGIN, appleLogin);     
}

export function* verifyUserEmailPasswordLogin(action){

    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(action.payload.username) === false || action.payload.password.length == 0) {
        alert('Please enter valid email & Password')
        yield put(LoginAction.loginUserFailure('Please enter valid email & Password'));
    }
    else{
    const response = yield call(LoginService.userLogin, action.payload);
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
        yield put(getCompanyAndBranches())
        yield put(LoginAction.googleLoginUserSuccess({token: response.body.session.id, createdAt:response.body.session.createdAt, expiresAt: response.body.session.expiresAt }));
    }
    else if (response && response.status == 'success' && response.body && response.body.statusCode == 'AUTHENTICATE_TWO_WAY'){
        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
        yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
    }
    else{
        alert(response.data.message)
        yield put(LoginAction.loginUserFailure(response.data.message));
    }
}
}


export function* googleLogin(action){
    console.log('googleLogin  -----')
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
        yield put(getCompanyAndBranches())
        yield put(LoginAction.googleLoginUserSuccess({token: response.body.session.id, createdAt:response.body.session.createdAt, expiresAt: response.body.session.expiresAt }));
    }
    else if (response && response.status == 'success' && response.body && response.body.statusCode == 'AUTHENTICATE_TWO_WAY'){
        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
        yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
    }
    else{
        yield put(LoginAction.googleLoginUserFailure('Failed to do google login'));
    }
}
export function* verifyOTP(action){
        const response = yield call(LoginService.verifyOTP, action.payload.otp, action.payload.mobileNumber, action.payload.countryCode );
        if (response && response.body && response.body.session ){
            yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
            yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
            yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');
    
            // const response = await AuthService.submitGoogleAuthToken(payload.token);
            // yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
             // get state details
             //TODO: await dispatch.common.getStateDetailsAction();
    
            // get company details
            //TODO:  await dispatch.company.getCompanyDetailsAction();
            yield put(LoginAction.googleLoginUserSuccess({token: response.body.session.id, createdAt:response.body.session.createdAt, expiresAt: response.body.session.expiresAt }));
        }
        else{
            yield put(LoginAction.verifyOTPFailed(response.data.message));
        }
   
}

export function* appleLogin(action){
    console.log('apple Login  -----')
    const response = yield call(LoginService.appleLogin, action.payload);
   
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
        yield put(getCompanyAndBranches())
        yield put(LoginAction.googleLoginUserSuccess({token: response.body.session.id, createdAt:response.body.session.createdAt, expiresAt: response.body.session.expiresAt }));
    }
    else if (response && response.status == 'success' && response.body && response.body.statusCode == 'AUTHENTICATE_TWO_WAY'){
        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
        yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
    }
    else{
        alert(response.data.message)
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