import { call, put, takeLatest, select } from 'redux-saga/effects';

import * as ActionConstants from './ActionConstants';
import * as LoginAction from './LoginAction';
import * as LoginService from './LoginService';
import * as CommonActions from '../../../redux/CommonAction';
import { getCompanyAndBranches } from '../../../redux/CommonAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import LogRocket from '@logrocket/react-native';
import { STORAGE_KEYS } from '@/utils/constants';
import { ToastAndroid, Platform } from 'react-native';
import TOAST from 'react-native-root-toast';
import * as CommonService from '../../../redux/CommonService';
import zipy from 'zipyai-react-native';

export default function* watcherSaga() {
  yield takeLatest(ActionConstants.USER_EMAIL_LOGIN, verifyUserEmailPasswordLogin);
  yield takeLatest(ActionConstants.GOOGLE_USER_LOGIN, googleLogin);
  yield takeLatest(ActionConstants.VERIFY_OTP, verifyOTP);
  yield takeLatest(ActionConstants.APPLE_USER_LOGIN, appleLogin);
  yield takeLatest(ActionConstants.LOGIN_WITH_OTP, loginWithOTP);
  yield takeLatest(ActionConstants.RESET_PASSWORD, resetPassword);
  yield takeLatest(ActionConstants.USER_EMAIL_SIGNUP, signupUsingEmailPassword);
  yield takeLatest(ActionConstants.USER_EMAIL_SIGNUP_VERIFY_OTP, verifySignupOTP);
  yield takeLatest(ActionConstants.SET_NEW_PASSWORD, setNewPassword);
}

/**
 * Add user deatils to log Rocket
 * @param userUniqueName 
 * @param userName 
 * @param userEmail 
 */
const addUserDeatilsToLogRocket = (userUniqueName: string, userName: string, userEmail: string,) => {
  // console.log("LogRocket Details " + userUniqueName + "  " + userName + " " + userEmail);
  // LogRocket.identify(userUniqueName, {
  //   name: userName,
  //   email: userEmail,
  //   newUser: true
  // });
  zipy.identify(userEmail,{
    email: userEmail
  });
}

export function* resetPassword(action: any) {
  console.log("+++++", action)
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (reg.test(action.payload.email) === false || action.payload.email.length == 0) {
    alert('Please enter valid email & password');
    yield put(LoginAction.resetPasswordFailure('Please enter valid email'));
  } else {
    const response = yield call(LoginService.resetPassword, action.payload.email);
    if (response && response.body && response.status == 'success') {
      yield put(LoginAction.resetPasswordSuccess(response.body));
      action.payload?.navigation?.navigate("ResetPassword", { email: action.payload.email })
      if (Platform.OS == "ios") {
        TOAST.show(response.body, {
          duration: TOAST.durations.LONG,
          position: -150,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        })
      } else {
        ToastAndroid.show(response.body, ToastAndroid.LONG)
      }
    } else {
      //alert(response.data.message);
      yield put(LoginAction.loginUserFailure(response.data.message));
      Platform.OS == "ios" ? TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -150,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      }) :
        ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    }
  }
}

export function* setNewPassword(action: any) {
  console.log("New passord", action)
  const response = yield call(LoginService.setNewPassword, action.payload.data);
  if (response && response.body && response.status == 'success') {
    console.log(response.body)
    yield put(LoginAction.resetPasswordSuccess(response.body));
    Platform.OS == "ios" ? TOAST.show(response.body, {
      duration: TOAST.durations.LONG,
      position: -150,
      hideOnPress: true,
      backgroundColor: "#1E90FF",
      textColor: "white",
      opacity: 1,
      shadow: false,
      animation: true,
      containerStyle: { borderRadius: 10 }
    }) :
      ToastAndroid.show(response.body, ToastAndroid.LONG)
    action.payload?.navigation?.pop(2)
  } else {
    //alert(response.data.message);
    yield put(LoginAction.loginUserFailure(response.data.message));
    Platform.OS == "ios" ? TOAST.show(response.data.message, {
      duration: TOAST.durations.LONG,
      position: -150,
      hideOnPress: true,
      backgroundColor: "#1E90FF",
      textColor: "white",
      opacity: 1,
      shadow: false,
      animation: true,
      containerStyle: { borderRadius: 10 }
    }) :
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
  }
}

export function* verifyUserEmailPasswordLogin(action) {
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (reg.test(action.payload.username) === false || action.payload.password.length == 0) {
    alert('Please enter valid email & password');
    yield put(LoginAction.loginUserFailure('Please enter valid email & Password'));
  } else {
    const response = yield call(LoginService.userLogin, action.payload);

    if (response && response.body && response.body.session && response.body.session.id) {
      yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
      yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
      yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
      yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

      // const response = await AuthService.submitGoogleAuthToken(payload.token);
      yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body ? response.body.user.email : '');
      yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
      // get state details
      // TODO: await dispatch.common.getStateDetailsAction();
      // TODO:  await dispatch.company.getCompanyDetailsAction();
      const activeCompany = yield call(CommonService.getLastStateDetails);
      const { companyUniqueName,branchUniqueName } = activeCompany
      yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
      yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
      yield put(getCompanyAndBranches());
      yield put(
        LoginAction.loginUserSuccess({
          token: response.body.session.id,
          createdAt: response.body.session.createdAt,
          expiresAt: response.body.session.expiresAt,
        }),
      );
    } else if (
      response &&
      response.status == 'success' &&
      response.body &&
      response.body.statusCode == 'AUTHENTICATE_TWO_WAY'
    ) {
      yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
      yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body ? response.body.user.email : '');
      yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
      yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
    } else {
      //alert(response.data.message);
      if (Platform.OS == "android") {
        ToastAndroid.show(response.data.message, ToastAndroid.LONG)
      } else {
        TOAST.show(response.data.message, {
          duration: TOAST.durations.LONG,
          position: -70,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      }
      yield put(LoginAction.loginUserFailure(response.data.message));
    }
  }
}

export function* signupUsingEmailPassword(action) {
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (reg.test(action.payload.email) === false || action.payload.password.length == 0) {
    alert('Please enter valid email & password');
    yield put(LoginAction.signupOTPFailure('Please enter valid email & password'));
  } else {
    const response = yield call(LoginService.sentOTPSignup, action.payload);
    if (response.status == 'success' && response.body.isNewUser && !response.body.user.isVerified) {
      if (Platform.OS == "android") {
        ToastAndroid.show("Verification code sent successfully", ToastAndroid.LONG)
      } else {
        TOAST.show("Verification code sent successfully", {
          duration: TOAST.durations.LONG,
          position: -70,
          hideOnPress: true,
          backgroundColor: "#1E90FF",
          textColor: "white",
          opacity: 1,
          shadow: false,
          animation: true,
          containerStyle: { borderRadius: 10 }
        });
      }
      yield put(LoginAction.signupOTPSuccess('success'));
    } else {
      if (response && response.body && response.body.session && response.body.session.id) {
        yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
        yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body ? response.body.user.email : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
        const activeCompany = yield call(CommonService.getLastStateDetails);
        const { companyUniqueName,branchUniqueName } = activeCompany
        yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
        yield put(getCompanyAndBranches());
        yield put(
          LoginAction.loginUserSuccess({
            token: response.body.session.id,
            createdAt: response.body.session.createdAt,
            expiresAt: response.body.session.expiresAt,
          }),
        );
      } else if (
        response &&
        response.status == 'success' &&
        response.body &&
        response.body.statusCode == 'AUTHENTICATE_TWO_WAY'
      ) {
        yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
        yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body ? response.body.user.email : '');
        yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
        yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
      } else {
        yield put(LoginAction.signupOTPFailure(response.data.message));
        if (Platform.OS == "android") {
          ToastAndroid.show(response.data.message, ToastAndroid.LONG)
        } else {
          TOAST.show(response.data.message, {
            duration: TOAST.durations.LONG,
            position: -70,
            hideOnPress: true,
            backgroundColor: "#1E90FF",
            textColor: "white",
            opacity: 1,
            shadow: false,
            animation: true,
            containerStyle: { borderRadius: 10 }
          });
        }
        //yield alert(response.data.message);
      }
    }
  }
}

export function* verifySignupOTP(action) {
  const response = yield call(LoginService.verifySignupOTP, action.payload);
  if (response && response.body && response.body.session && response.body.session.id) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body ? response.body.user.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    const activeCompany = yield call(CommonService.getLastStateDetails);
    const { companyUniqueName,branchUniqueName } = activeCompany
    yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
    yield put(getCompanyAndBranches());
    yield put(
      LoginAction.loginUserSuccess({
        token: response.body.session.id,
        createdAt: response.body.session.createdAt,
        expiresAt: response.body.session.expiresAt,
      }),
    );
  } else {
    if (Platform.OS == "android") {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    } else {
      TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -70,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      });
    }
    yield put(LoginAction.loginUserFailure(response.data.message));
  }
}



export function* googleLogin(action) {
  console.log('googleLogin  -----');
  const response = yield call(LoginService.googleLogin, action.payload.token);
  console.log('response is ', response);
  if (response && response.body && response.body.session && response.body.session.id) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

    // const response = await AuthService.submitGoogleAuthToken(payload.token);
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    // get state details
    // TODO: await dispatch.common.getStateDetailsAction();
    // get company details
    // TODO:  await dispatch.company.getCompanyDetailsAction();

    const activeCompany = yield call(CommonService.getLastStateDetails);
    const { companyUniqueName,branchUniqueName } = activeCompany
    yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
    yield put(getCompanyAndBranches());
    yield put(
      LoginAction.googleLoginUserSuccess({
        token: response.body.session.id,
        createdAt: response.body.session.createdAt,
        expiresAt: response.body.session.expiresAt,
      }),
    );
  } else if (
    response &&
    response.status == 'success' &&
    response.body &&
    response.body.statusCode == 'AUTHENTICATE_TWO_WAY'
  ) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
  } else {
    if (Platform.OS == "android") {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    } else {
      TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -70,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      });
    }
    yield put(LoginAction.googleLoginUserFailure('Failed to do google login'));
  }
}
export function* verifyOTP(action) {
  const response = yield call(
    LoginService.verifyOTP,
    action.payload.otp,
    action.payload.mobileNumber,
    action.payload.countryCode,
  );
  console.log('otp response is', response);
  if (response && response.body && response.body.session) {
    yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');
    const activeCompany = yield call(CommonService.getLastStateDetails);
    const { companyUniqueName,branchUniqueName } = activeCompany
    yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
    yield put(
      LoginAction.googleLoginUserSuccess({
        token: response.body.session.id,
        createdAt: response.body.session.createdAt,
        expiresAt: response.body.session.expiresAt,
      }),
    );
  } else {
    yield put(LoginAction.verifyOTPFailed(response.data.message));
    if (Platform.OS == "android") {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    } else {
      TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -70,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      });
    }
  }
}

export function* appleLogin(action) {
  console.log('apple Login  -----');
  const response = yield call(LoginService.appleLogin, action.payload);

  if (response && response.body && response.body.session && response.body.session.id) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');

    // const response = await AuthService.submitGoogleAuthToken(payload.token);
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : response.body.user.email);
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    // get state details
    // TODO: await dispatch.common.getStateDetailsAction();
    // get company details
    // TODO:  await dispatch.company.getCompanyDetailsAction();
    const activeCompany = yield call(CommonService.getLastStateDetails);
    const { companyUniqueName,branchUniqueName } = activeCompany
    yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
    yield put(getCompanyAndBranches());
    yield put(
      LoginAction.googleLoginUserSuccess({
        token: response.body.session.id,
        createdAt: response.body.session.createdAt,
        expiresAt: response.body.session.expiresAt,
      }),
    );
  } else if (
    response &&
    response.status == 'success' &&
    response.body &&
    response.body.statusCode == 'AUTHENTICATE_TWO_WAY'
  ) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, action.payload.email ? action.payload.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
  } else {
    //alert(response.data.message);
    if (Platform.OS == "android") {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    } else {
      TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -70,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      });
    }
    yield put(LoginAction.googleLoginUserFailure('Failed to do google login'));
  }
}

export function* loginWithOTP(action) {
  const response = yield call(LoginService.loginWithOTP, action.accessToken);
  if (response && response.body && response.body.session && response.body.session.id) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.token, response.body ? response.body.session.id : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionStart, response.body ? response.body.session.createdAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.sessionEnd, response.body ? response.body.session.expiresAt : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body.user.email ? response.body.user.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    const activeCompany = yield call(CommonService.getLastStateDetails);
    const { companyUniqueName,branchUniqueName } = activeCompany
    yield AsyncStorage.setItem(STORAGE_KEYS.activeCompanyUniqueName, companyUniqueName ? companyUniqueName : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.activeBranchUniqueName, branchUniqueName ? branchUniqueName : '');
    yield put(getCompanyAndBranches());
    yield put(
      LoginAction.loginWithOtpSuccess({
        token: response.body.session.id,
        createdAt: response.body.session.createdAt,
        expiresAt: response.body.session.expiresAt,
      }),
    );
  } else if (
    response &&
    response.status == 'success' &&
    response.body &&
    response.body.statusCode == 'AUTHENTICATE_TWO_WAY'
  ) {
    yield addUserDeatilsToLogRocket(response.body.user.uniqueName, response.body.user.name, response.body.user.email)
    yield AsyncStorage.setItem(STORAGE_KEYS.googleEmail, response.body.user.email ? response.body.user.email : '');
    yield AsyncStorage.setItem(STORAGE_KEYS.userName, response.body ? response.body.user.name : '');
    yield put(LoginAction.twoFactorAuthenticationStarted(response.body));
  } else {
    if (Platform.OS == "android") {
      ToastAndroid.show(response.data.message, ToastAndroid.LONG)
    } else {
      TOAST.show(response.data.message, {
        duration: TOAST.durations.LONG,
        position: -70,
        hideOnPress: true,
        backgroundColor: "#1E90FF",
        textColor: "white",
        opacity: 1,
        shadow: false,
        animation: true,
        containerStyle: { borderRadius: 10 }
      });
    }
    yield put(LoginAction.loginWithOtpFailure('Failed to do login with OTP'));
  }
}

export function* logoutUser() {
  const state = yield select();
  const { commonReducer } = state;
  const id = commonReducer.userData.data.data[0].id;

  try {
    const response = yield call(LoginService.logout, id);
    console.log(response);
  } catch (e) {
    yield put(CommonActions.loginUserFailure(e));
  }
}
