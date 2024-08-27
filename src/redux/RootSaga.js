import { all } from 'redux-saga/effects'

import CommonSaga from '@/redux/CommonSaga';
import SubscriptionSaga from '@/redux/subscription/subscription.saga';
import LoginSaga from '@/screens/Auth/Login/LoginSaga';

function * rootSaga () {
  yield all([
    CommonSaga(),
    SubscriptionSaga(),
    LoginSaga()
  ]);
}

export default rootSaga;
