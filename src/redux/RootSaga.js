import {  all } from 'redux-saga/effects'

import CommonSaga from './CommonSaga';
import LoginSaga from '../screens/Auth/Login/LoginSaga';

function* rootSaga () {
    yield all([
        CommonSaga(),
        LoginSaga()
    ]);
}

export default rootSaga;