import {combineReducers} from 'redux';

import commonReducer from './CommonReducer';
import LoginReducer from '../screens/Auth/Login/LoginReducer';
// import MoreReducer from '../screens/More/Redux/MoreReducer';

export default combineReducers({
  commonReducer,
  LoginReducer,
  // MoreReducer,
});
