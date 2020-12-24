import { Action } from '../util/types';
import * as ActionConstants from './ActionConstants';
import {  registerUser } from './CommonAction';
import { REHYDRATE } from 'redux-persist';

const initialState = {
    isInternetReachable: true,
    isConnected: true,
    isAuthenticatingUser: false,
    error: undefined
}

export default (state = initialState, action: Action) => {

    switch (action.type) {
        case REHYDRATE:
            if (action.payload && action.payload.commonReducer) {
                const commonReducer = action.payload.commonReducer;

                return {
                    ...state,
                    ...commonReducer,
                    isAuthenticatingUser: false,
                    // Ensure isConnecting is reset to false on app restart
                };
            }
            else {
                return state;
            }     
        case ActionConstants.USER_LOGIN:
            return {
                ...state,
                isAuthenticatingUser: true,
                error: '',
            };
        case ActionConstants.USER_LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticatingUser: false,
                error: '',
            };
        case ActionConstants.USER_LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticatingUser: false,
                error: action.payload
            };
        default: return state;
    }
}