import * as Actions from './ActionConstants';

export function getCompanyAndBranches() {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST,
    payload: {},
  };
}

export function getCompanyAndBranchesFailure() {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST_FAILURE,
  };
}
export function getCompanyAndBranchesSuccess(payload) {
  return {
    type: Actions.GET_COMPANY_BRANCH_LIST_SUCCESS,
    payload: payload,
  };
}
export function renewAccessToken(payload) {
  return {
    type: Actions.RENEW_ACCESS_TOKEN,
    payload: payload,
  };
}
export function logout() {
  return {
    type: Actions.LOGOUT,
  };
}
export function reset() {
  return {
    type: Actions.RESET,
  };
}