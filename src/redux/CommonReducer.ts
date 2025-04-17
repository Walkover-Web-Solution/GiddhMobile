import { Action } from '../util/types';
import * as ActionConstants from './ActionConstants';
import { REHYDRATE } from 'redux-persist';

const initialState = {
  isInternetReachable: true,
  isConnected: true,
  comapnyList: undefined,
  branchList: undefined,
  isFetchingCompanyList: false,
  isUnauth: false,
  companyDetails: {},
  companyVoucherVersion: 2,
  selectedVouchersForBottomTabs: ['Sales', 'Purchase'],
  accountsSearchSuggestions: []
};

export default (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionConstants.IS_AUTHORSIED:
      return {
        ...state,
        isUnauth: false
      }
    case ActionConstants.IS_UNAUTHORSIED:
      return {
        ...state,
        isUnauth: true
      }
    case REHYDRATE:
      if (action.payload && action.payload.commonReducer) {
        const commonReducer = action.payload.commonReducer;
        return {
          ...state,
          ...commonReducer,
          isFetchingCompanyList: false
          // Ensure isConnecting is reset to false on app restart
        };
      } else {
        return state;
      }
    case ActionConstants.GET_COMPANY_BRANCH_LIST:
      return {
        ...state,
        isFetchingCompanyList: true,
        error: ''
      };
    case ActionConstants.GET_COMPANY_BRANCH_LIST_SUCCESS:
      return {
        ...state,
        isFetchingCompanyList: false,
        comapnyList: action.payload.companyList,
        branchList: action.payload.branchList,
        error: ''
      };
    case ActionConstants.GET_COMPANY_BRANCH_LIST_FAILURE:
      return {
        ...state,
        isFetchingCompanyList: false,
        error: action.payload
      };
    case ActionConstants.SET_COMPANY_DETAILS:
      return {
        ...state,
        companyDetails: action.payload,
      };
    case ActionConstants.SET_COMPANY_VOUCHER_VERSION:
      return {
        ...state,
        companyVoucherVersion: action.payload,
      };
    case ActionConstants.SET_VOUCHER_FOR_BOTTOM_TABS:
      return {
        ...state,
        selectedVouchersForBottomTabs: action.payload
      }
    case ActionConstants.RESET_ACCOUNT_SEARCH:
      return {
        ...state,
        accountsSearchSuggestions: []
      }
    case ActionConstants.UPDATE_ACCOUNT_SEARCH:
      return {
        ...state,
        accountsSearchSuggestions: action?.payload
      }
    default:
      return state;
  }
};
