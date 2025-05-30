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

export function setVoucherForBottomTabs(payload: Array<string>) {
  return {
    type: Actions.SET_VOUCHER_FOR_BOTTOM_TABS,
    payload: payload
  };
}

export function updateStateDetails(payload: any){
  return {
    type: Actions.UPDATE_STATE_DETAILS,
    payload: payload
  }
}

export function updateBranchStateDetails(payload: any){
  return {
    type: Actions.UPDATE_BRANCH_STATE_DETAILS,
    payload: payload
  }
}

export function resetAccountSearch() {
  return {
    type: Actions.RESET_ACCOUNT_SEARCH
  };
}

export function updateAccountSearch(payload: string[]) {
  return {
    type: Actions.UPDATE_ACCOUNT_SEARCH,
    payload: payload
  };
}