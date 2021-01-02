import * as Actions from './ActionConstants';


export function googleLogin(token, email) {
  return {
    type: Actions.GOOGLE_USER_LOGIN,
    payload: {
      token: token,
      email: email
    }
  }
}


export function googleLoginUserSuccess(payload) {
  return {
    type: Actions.GOOGLE_USER_LOGIN_SUCCESS,
    payload: payload
  }
}

export function googleLoginUserFailure(error) {
  return {
    type: Actions.GOOGLE_USER_LOGIN_FAILURE, 
    payload: error
  }
}

export function twoFactorAuthenticationStarted(payload) {
  return {
    type: Actions.TFA_STARTED, 
    payload: payload
  }
}

export function verifyOTP(otp, countryCode, mobileNumber) {
  return {
    type: Actions.VERIFY_OTP, 
    payload: {
      otp: otp, countryCode: countryCode, mobileNumber: mobileNumber
    }
  }
}

export function verifyOTPFailed(error) {
  return {
    type: Actions.VERIFY_OTP_FAILURE, 
    payload: error
  }
}


export function clearOTPError() {
  return {
    type: Actions.CLEAR_OTP_ERROR, 
    payload: ''
  }
}