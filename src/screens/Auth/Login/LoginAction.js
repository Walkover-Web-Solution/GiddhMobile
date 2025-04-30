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

export function resetPassword(data) {
  return {
    type: Actions.RESET_PASSWORD,
    payload: data
  }
}

export function setNewPassword(data) {
  return {
    type: Actions.SET_NEW_PASSWORD,
    payload: data
  }
}

export function resetPasswordSuccess(error) {
  return {
    type: Actions.RESET_PASSWORD_SUCCESS,
    payload: error
  }
}
export function resetPasswordFailure(error) {
  return {
    type: Actions.RESET_PASSWORD_FAILURE,
    payload: error
  }
}

export function clearOTPError() {
  return {
    type: Actions.CLEAR_OTP_ERROR,
    payload: ''
  }
}

export function appleLogin(payload) {
  return {
    type: Actions.APPLE_USER_LOGIN,
    payload: payload
  }
}

export function appleLoginUserSuccess(payload) {
  return {
    type: Actions.APPLE_USER_LOGIN_SUCCESS,
    payload: payload
  }
}

export function appleLoginUserFailure(error) {
  return {
    type: Actions.APPLE_USER_LOGIN_FAILURE,
    payload: error
  }
}

export function userEmailLogin(payload) {
  return {
    type: Actions.USER_EMAIL_LOGIN,
    payload: payload
  }
}

export function userEmailSignup(payload) {
  return {
    type: Actions.USER_EMAIL_SIGNUP,
    payload: payload
  }
}

export function verifySignupOTP(payload) {
  return {
    type: Actions.USER_EMAIL_SIGNUP_VERIFY_OTP,
    payload: payload
  }
}
export function loginUserSuccess(payload) {
  return {
    type: Actions.USER_EMAIL_LOGIN_SUCCESS,
    payload: payload
  }
}

export function loginUserFailure(error) {
  return {
    type: Actions.USER_EMAIL_LOGIN_FAILURE,
    payload: error
  }
}

export function signupOTPSuccess(payload) {
  return {
    type: Actions.USER_EMAIL_SIGN_UP_OTP_SUCCESS,
    payload: payload
  }
}

export function signupOTPFailure(error) {
  return {
    type: Actions.USER_EMAIL_SIGN_UP_OTP_FAILURE,
    payload: error
  }
}

export function OTPScreenUnmounting() {
  return {
    type: Actions.OTP_SCREEN_UNMOUNTING
  }
}

export function loginWithOTP(accessToken) {
  return {
    type: Actions.LOGIN_WITH_OTP,
    accessToken: accessToken
  }
}

export function loginWithOtpSuccess(payload) {
  return {
    type: Actions.LOGIN_WITH_OTP_SUCCESS,
    payload: payload
  }
}

export function loginWithOtpFailure(error) {
  return {
    type: Actions.LOGIN_WITH_OTP_FAILURE,
    payload: error
  }
}

export function toggleBiometricAuthentication() {
  return {
    type: Actions.TOGGLE_BIOMETRIC_AUTHENTICATION
  }
}

export function resetBiometricAuthentication() {
  return {
    type: Actions.RESET_BIOMETRIC_AUTHENTICATION
  }
}

export function setBiometricTourEnabled(enabled) {
  console.log("enabled--------------", enabled);
  return {
    type: Actions.SET_BIOMETRIC_TOUR_ENABLED,
    payload: enabled
  }
}
