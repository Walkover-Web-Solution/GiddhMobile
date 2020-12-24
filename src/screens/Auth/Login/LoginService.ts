
import {AuthService} from '@/core/services/auth/auth.service';

/**
   * set google login action
   * @returns {Promise<void>}
   */

  export async function googleLogin(token) {
    try {
      const response = await AuthService.submitGoogleAuthToken(token);
      return response
    } catch (error) {
        console.log(error);
        return error
    }
  }