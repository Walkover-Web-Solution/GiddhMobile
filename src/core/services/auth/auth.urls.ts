import { createEndpoint } from '@/utils/helper';

export const AccountUrls = {
  login: createEndpoint('account/login'),
  googleLogin: createEndpoint('v2/signup-with-google'),
  appleLogin: createEndpoint('v2/signup-with-apple'),
  loginWithOTP: createEndpoint('v2/auth-login'),
  verifyOTP: createEndpoint('v2/verify-number'),
  userLogin: createEndpoint('v2/login-with-password'),
  userSignUpOTP: createEndpoint('v2/signup'),
  verifySignupOTP: createEndpoint('v2/verify-email'),
  register: createEndpoint('v2/register'),
  resetPassword: createEndpoint('users/:userEmail/forgot-password'),
  //resetPassword: createEndpoint('signup-with-email'),
  verifyEmail: createEndpoint('v2/verify-email'),
  setNewPassword: createEndpoint('reset-password'),
  sendOTP: createEndpoint('generate-otp')
};
