import {Action} from '../util/types';
import * as ActionConstants from './ActionConstants';
import {REHYDRATE} from 'redux-persist';
import * as CommonConstants from '@/redux/ActionConstants';

const initialState = {
  offlineModeOn: false,
};

export default (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionConstants.TURN_ON_OFFLINE_MODE:
      return {
        ...state,
        offlineModeOn: true,
      };
    case ActionConstants.TURN_OFF_OFFLINE_MODE:
      return {
        ...state,
        offlineModeOn: false,
      };
    default:
      return state;
  }
};
