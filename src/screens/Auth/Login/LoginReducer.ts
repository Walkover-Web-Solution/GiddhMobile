import { Action } from '../util/types';
import * as ActionConstants from './ActionConstants';
import { REHYDRATE } from 'redux-persist';
import { verify } from 'crypto';
import { act } from 'react-test-renderer';

const initialState = {
    isAuthenticatingUser: false,
    error: undefined, 
    token: undefined,
    isUserAuthenticated: false, 
    createdAt: undefined,
    expiresAt: undefined,
    startTFA: undefined,
    isVerifyingOTP: false,
    otpVerificationError: ''
}

export default (state = initialState, action: Action) => {

    switch (action.type) {
        case REHYDRATE:
            if (action.payload && action.payload.LoginReducer) {
                const LoginReducer = action.payload.LoginReducer;

                return {
                    ...state,
                    ...LoginReducer,
                    isAuthenticatingUser: false,
                    startTFA: false,
                    isVerifyingOTP: false,
                    otpVerificationError: ''
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
                token: action.payload.token,
                isUserAuthenticated: true
            };
        case ActionConstants.GOOGLE_USER_LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticatingUser: false,
                error: action.payload,
                isUserAuthenticated: false
            };
        case ActionConstants.TFA_STARTED:
            return {
                ...state,
                startTFA: true,
                tfaDetails: action.payload,
                isAuthenticatingUser: true,

            };

        case ActionConstants.VERIFY_OTP_FAILURE:
            return{
                ...state,
                 otpVerificationError: action.payload,
                 isVerifyingOTP: false

            };
         case ActionConstants.VERIFY_OTP:
            return{
                ...state,
                isVerifyingOTP: true,
                isAuthenticatingUser: true,


            };
        case ActionConstants.VERIFY_OTP_SUCCESS:
            return{
                ...state,
                token: action.payload.token,
                isUserAuthenticated: true,
                isVerifyingOTP: false
            };
            case ActionConstants.CLEAR_OTP_ERROR:
            return{
                ...state,
                otpVerificationError: ''
            };
        default: return state;
    }
}