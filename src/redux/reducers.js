import { combineReducers } from 'redux'

import commonReducer from './CommonReducer';
import LoginReducer from '../screens/Auth/Login/LoginReducer';

import {auth} from '@/core/store/auth';

import {common} from '@/core/store/common';
import persistPlugin from '@rematch/persist';
import AsyncStorage from '@react-native-community/async-storage';


export default combineReducers ({
    commonReducer,
    LoginReducer
});
