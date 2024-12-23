import { createEndpoint } from '@/utils/helper';

export const AccountUrls = {
  login: createEndpoint('account/login'),
  googleLogin: createEndpoint('v2/signup-with-google'),
  appleLogin: createEndpoint('v2/signup-with-apple'),
  loginWithOTP: createEndpoint('v2/login'),
  verifyOTP: createEndpoint('v2/verify-number'),
  userLogin: createEndpoint('v2/login-with-password'),
  userSignUpOTP: createEndpoint('v2/signup'),
  verifySignupOTP: createEndpoint('v2/verify-email'),
  resetPassword: createEndpoint('users/:userEmail/forgot-password'),
  //resetPassword: createEndpoint('signup-with-email'),
  verifyEmail: createEndpoint('v2/verify-email'),
  setNewPassword: createEndpoint('reset-password'),
  sendOTP: createEndpoint('generate-otp')
};
