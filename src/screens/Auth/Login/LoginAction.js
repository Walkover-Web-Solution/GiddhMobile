import * as Actions from './ActionConstants';


export function googleLogin(token, email) {
  return {
    type: Actions.GOOGLE_USER_LOGIN,
    payload: {
      token: token,
      email: email
    }
  }
}


export function googleLoginUserSuccess(payload) {
  return {
    type: Actions.GOOGLE_USER_LOGIN_SUCCESS,
    payload: payload
  }
}

export function googleLoginUserFailure(error) {
  return {
    type: Actions.GOOGLE_USER_LOGIN_FAILURE, 
    payload: error
  }
}