import {createEndpoint} from '@/utils/helper';

export const AccountUrls = {
  login: createEndpoint('account/login'),
  googleLogin: createEndpoint('v2/signup-with-google'),
  verifyOTP: createEndpoint('v2/verify-number')
};
