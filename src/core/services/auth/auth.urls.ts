import {createEndpoint} from '@/utils/helper';

export const AccountUrls = {
  login: createEndpoint('account/login'),
  googleLogin: createEndpoint('v2/signup-with-google'),
  appleLogin: createEndpoint('v2/signup-with-apple'),
  verifyOTP: createEndpoint('v2/verify-number'),
  userLogin: createEndpoint('v2/signup')

};
