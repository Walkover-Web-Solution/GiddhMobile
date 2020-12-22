import * as Actions from './ActionConstants';
import { Action } from '../util/types';


export function loginUser(username, password): Action {
  return {
    type: Actions.USER_LOGIN,
    payload: {
      username: username,
      password: password
    }
  }
}
