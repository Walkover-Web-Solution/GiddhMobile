
import {AuthService} from '@/core/services/auth/auth.service';

/**
   * set google login action
   * @returns {Promise<void>}
   */

  export async function googleLogin(token) {
    try {
      const response = await AuthService.submitGoogleAuthToken(token);
      debugger
      return response
    } catch (error) {
        console.log(error);
        return error
    }
  }



/**
   * set verify OTP action
   * @returns {Promise<void>}
   */

  export async function verifyOTP(otp, mobileNumber, countryCode ) {
    try {
      const response = await AuthService.verifyOTP(otp, mobileNumber, countryCode );
      debugger
      return response
    } catch (error) {
        console.log(error);
        return error
    }
  }