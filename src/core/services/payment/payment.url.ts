import { createEndpoint } from '../../../utils/helper';

export const PaymentUrls = {
  getAccounts: createEndpoint(
    'company/:companyUniqueName/payment/banks/accounts?branchUniqueName=:branchUniqueName'
  ),
  getAllPayor: createEndpoint(
    'v2/company/:companyUniqueName/bank/:uniqueName/payor?amount=:amount&branchUniqueName=:branchUniqueName'
  ),
  sendOTP: createEndpoint(
    'company/:companyUniqueName/bank/payments?branchUniqueName=:branchUniqueName'
  ),
  generatePayment: createEndpoint(
    'company/:companyUniqueName/bank/payments/confirm?urn=:urn&uniqueName=:uniqueName&branchUniqueName=:branchUniqueName'
  ),
};
