import { Action } from '../util/types';
import * as ActionConstants from './ActionConstants';
import { REHYDRATE } from 'redux-persist';

const initialState = {
    isAuthenticatingUser: false,
    error: undefined, 
    token: undefined
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
        case ActionConstants.GOOGLE_USER_LOGIN:
            return {
                ...state,
                isAuthenticatingUser: true,
                error: '',
            };
        case ActionConstants.GOOGLE_USER_LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticatingUser: false,
                error: '',
                token: action.payload.token
            };
        case ActionConstants.GOOGLE_USER_LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticatingUser: false,
                error: action.payload
            };
        default: return state;
    }
}