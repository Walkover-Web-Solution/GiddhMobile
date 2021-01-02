import { call, put, takeLatest, select } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as LoginAction from './LoginAction';
import * as LoginService from './LoginService';
import { AuthService } from '../../../core/services/auth/auth.service';

import AsyncStorage from '@react-native-community/async-storage';
import {STORAGE_KEYS} from '@/utils/constants';
import { statusCodes } from '@react-native-community/google-signin';




export default function* watcherSaga() {
    yield takeLatest(ActionConstants.GOOGLE_USER_LOGIN, googleLogin);     
    yield takeLatest(ActionConstants.VERIFY_OTP, verifyOTP);      
 
}


export function* googleLogin(action){
    const response = yield call(LoginService.googleLogin, action.payload.token);
    debugger
    // response.status='success';
    
    // let otpResponse = {
    //     contactNumber: '9407165787',
    //     countryCode: '91',
    //     intercomHash: '28abec4bafd33591e83e821173f9a747a3055eec4bb0d88b8529dfabbf056ea2',
    //     statusCode:'AUTHENTICATE_TWO_WAY',
    //     text:'Verification code successfully sent to 91 9407165787',
    //     user: {
    //         email: 'hussain4786@gmail.com',
    //         isVerified: true,
    //         mobileNo: '919407165787',
    //         name: "hussain chhatriwala",
    //         uniqueName:'hussain4786@gmail.com'
    //     }

    // }
    //response.body = otpResponse;

  
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
    
    // response.status='success';
    
    // let otpResponse = {
    //     contactNumber: '9407165787',
    //     countryCode: '91',
    //     intercomHash: '28abec4bafd33591e83e821173f9a747a3055eec4bb0d88b8529dfabbf056ea2',
    //     statusCode:'AUTHENTICATE_TWO_WAY',
    //     text:'Verification code successfully sent to 91 9407165787',
    //     user: {
    //         email: 'hussain4786@gmail.com',
    //         isVerified: true,
    //         mobileNo: '919407165787',
    //         name: "hussain chhatriwala",
    //         uniqueName:'hussain4786@gmail.com'
    //     }

    // }
    // response.body = otpResponse;

    if (response && response.body && response.body.session ){
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
        yield put(LoginAction.verifyOTPFailed(response.data.message));
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