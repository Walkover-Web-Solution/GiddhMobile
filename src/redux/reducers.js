import { combineReducers } from 'redux'

import commonReducer from './CommonReducer';
import LoginReducer from '../screens/Auth/Login/LoginReducer';




export default combineReducers ({
    commonReducer,
    LoginReducer
});
