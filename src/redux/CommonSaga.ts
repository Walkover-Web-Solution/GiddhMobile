import { call, put, takeLatest, select } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as CommonActions from './CommonAction';
import * as CommonService from './CommonService';


import {  } from './CommonAction';




export default function* watcherFCMTokenSaga() {
    yield takeLatest(ActionConstants.USER_LOGIN, loginUser);      
}

export function* loginUser(action) {
    
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (action.payload.password.length == 0) {
        yield put(CommonActions.loginUserFailure('Please enter valid Member Id & Password'));
    }
    else{
        try {
            const response = yield call(LoginService.loginWith, action.payload.username, action.payload.password);
            debugger
            if (response.status == false) {
                yield put(CommonActions.loginUserFailure(response.message));
            }
            else if (response.status == true){
                yield put(CommonActions.loginUserSuccess(action.payload.username, action.payload.password, response));
            }
        } catch (e) {
            yield put(CommonActions.loginUserFailure(e));
        }
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