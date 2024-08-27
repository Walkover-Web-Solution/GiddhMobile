import { combineReducers } from 'redux'

import commonReducer from './CommonReducer';
import LoginReducer from '../screens/Auth/Login/LoginReducer';
import subscriptionReducer from './subscription/subscription.reducer';

export default combineReducers({
  commonReducer,
  subscriptionReducer,
  LoginReducer
});
