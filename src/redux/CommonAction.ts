import * as Actions from './ActionConstants';
import * as LoginActions from '../screens/Auth/Login/ActionConstants';

export function getCompanyAndBranches() {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST,
    payload: {}
  };
}

export function getCompanyDetails() {
  return {
    type: Actions.GET_COMPANY_DETAILS,
  };
}

export function setCompanyDetails(payload: any) {
  return {
    type: Actions.SET_COMPANY_DETAILS,
    payload: payload
  };
}

export function setCompanyVoucherVersion(payload: number) {
  return {
    type: Actions.SET_COMPANY_VOUCHER_VERSION,
    payload: payload
  };
}

export function getCompanyAndBranchesFailure() {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST_FAILURE
  };
}
export function getCompanyAndBranchesSuccess(payload) {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST_SUCCESS,
    payload: payload
  };
}
export function renewAccessToken(payload) {
  return {
    type: Actions.RENEW_ACCESS_TOKEN,
    payload: payload
  };
}
export function logout() {
  return {
    type: Actions.LOGOUT
  };
}
export function reset() {
  return {
    type: Actions.RESET
  };
}

export function isUnauth() {
  return {
    type: Actions.IS_UNAUTHORSIED
  };
}

export function isAuth() {
  return {
    type: Actions.IS_AUTHORSIED
  };
}
