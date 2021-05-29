import { createEndpoint } from '@/utils/helper';

export const AccountUrls = {
  login: createEndpoint('account/login'),
  googleLogin: createEndpoint('v2/signup-with-google'),
  appleLogin: createEndpoint('v2/signup-with-apple'),
  verifyOTP: createEndpoint('v2/verify-number'),
  userLogin: createEndpoint('v2/login-with-password'),
  // resetPassword: createEndpoint('users/:userEmail/forgot-password'),
  resetPassword: createEndpoint('signup-with-email'),
  verifyEmail: createEndpoint('v2/verify-email')
};
