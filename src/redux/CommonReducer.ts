import {Action} from '../util/types';
import * as ActionConstants from './ActionConstants';
import {REHYDRATE} from 'redux-persist';

const initialState = {
  isInternetReachable: true,
  isConnected: true,
  comapnyList: undefined,
  branchList: undefined,
  isFetchingCompanyList: false,
};

export default (state = initialState, action: Action) => {
  switch (action.type) {
    case REHYDRATE:
      if (action.payload && action.payload.commonReducer) {
        const commonReducer = action.payload.commonReducer;
        return {
          ...state,
          ...commonReducer,
          isFetchingCompanyList: false,
          // Ensure isConnecting is reset to false on app restart
        };
      } else {
        return state;
      }
    case ActionConstants.GET_COMPANY_BRANCH_LIST:
      return {
        ...state,
        isFetchingCompanyList: true,
        error: '',
      };
    case ActionConstants.GET_COMPANY_BRANCH_LIST_SUCCESS:
      return {
        ...state,
        isFetchingCompanyList: false,
        comapnyList: action.payload.companyList,
        branchList: action.payload.branchList,
        error: '',
      };
    case ActionConstants.GET_COMPANY_BRANCH_LIST_FAILURE:
      return {
        ...state,
        isFetchingCompanyList: false,
        error: action.payload,
      };
    default:
      return state;
  }
};