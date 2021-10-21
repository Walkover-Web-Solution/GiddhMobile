import { AuthService } from '@/core/services/auth/auth.service';

/**
 * set google login action
 * @returns {Promise<void>}
 */

export async function googleLogin (token) {
  try {
    const response = await AuthService.submitGoogleAuthToken(token);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * set reset password action
 * @returns {Promise<void>}
 */

export async function resetPassword (payload) {
  try {
    const response = await AuthService.resetPassword(payload);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * set login action
 * @returns {Promise<void>}
 */

 export async function userLogin (payload) {
  try {
    const response = await AuthService.userLogin(payload);
    console.log('the login response is ', response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * set sent OTP signup action
 * @returns {Promise<void>}
 */

export async function sentOTPSignup (payload:any) {
  try {
    const response = await AuthService.sentOTPSignup(payload);
    console.log('the signup OTP response is ', response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * set sent OTO signup action
 * @returns {Promise<void>}
 */

 export async function verifySignupOTP (payload:any) {
  try {
    const response = await AuthService.verifySignupOTP(payload);
    console.log('the signup OTP response is ', response);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * set apple login action
 * @returns {Promise<void>}
 */

export async function appleLogin (payload) {
  try {
    const response = await AuthService.submitAppleAuthToken(payload);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}
/**
 * set verify OTP action
 * @returns {Promise<void>}
 */

export async function verifyOTP (otp, mobileNumber, countryCode) {
  try {
    const response = await AuthService.verifyOTP(otp, mobileNumber, countryCode);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * send OTP
 * @returns {Promise<void>}
 */

 export async function sendOTP (payload:any) {
  try {
    const response = await AuthService.sendOTP(payload);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
}
