import {all, spawn} from 'redux-saga/effects';

import CommonSaga from '@/redux/CommonSaga';
import LoginSaga from '@/screens/Auth/Login/LoginSaga';
// import MoreSaga from '@/screens/More/Redux/MoreSaga';

function* rootSaga() {
  yield all([CommonSaga(), LoginSaga()]);
}

export default rootSaga;
