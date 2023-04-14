import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  LOGIN_USER,
  REGISTER_USER,
  LOGOUT_USER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN_USER_SUCCESS,
  getLanguages,
  getAdministrativeUnits,
  getChannels,
} from "../actions";

import {
  loginUserSuccess,
  loginUserError,
  registerUserSuccess,
  registerUserError,
  forgotPasswordSuccess,
  forgotPasswordError,
  resetPasswordSuccess,
  resetPasswordError,
} from "./actions";

import { backendPath } from "../../global/defaultValues";
import { makeListRequest, setToStorage } from "../../helpers/utils";

import { post, get } from "../../helpers/requests";

export function* watchLoginUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGIN_USER, loginWithEmailPassword);
}

const loginWithEmailPasswordAsync = async (email, password) =>
  // eslint-disable-next-line no-return-await
  await post("login_check", { username: email, password: password })
    .then((response) => {
      return response;
    })
    .catch((error) => error);

function* loginWithEmailPassword({ payload }) {
  const { username, password } = payload.user;
  try {
    const loginUser = yield call(
      loginWithEmailPasswordAsync,
      username,
      password
    );
    // If we have a user, let's save token and then fetch basic information like credit, senderids
    if (loginUser.token) {
      //We will need token and email to get user details
      yield put(loginUserSuccess({ token: loginUser.token, email: username }));

      //Get list of all available languages
      yield put(getLanguages());

      //Get list of all administrative units
      yield put(getAdministrativeUnits());

      //Get list of all channels
      yield put(getChannels());

      //Get list of all possible constraints
      makeListRequest({
        url: "constraints",
        options: { "groups[]": "translations" },
      }).then((result) => setToStorage("constraints", result));

      //Fetch registration fields to be used in constraints
      makeListRequest({
        url: "questions",
        options: {
          service: process.env.REACT_APP_REGISTRATION_ID,
        },
      }).then((result) => setToStorage("reg", result));

      //Fetch list of all question types. This is experimental and can be moved elsewhere for the purposes of making loading faster.
      makeListRequest({
        url: "question_types",
        options: { "groups[]": "translations" },
      }).then((result) => setToStorage("questionTypes", result));
    } else {
      yield put(loginUserError(loginUser.message));
    }
  } catch (error) {
    yield put(loginUserError(error));
  }
}

export function* watchRegisterUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REGISTER_USER, registerWithEmailPassword);
}

export const registerWithEmailPasswordAsync = async (
  email,
  password,
  name,
  organisation,
  op
) =>
  // eslint-disable-next-line no-return-await
  await post("", {
    password: password,
    username: email,
    name: name,
    email: email,
  })
    .then((user) => user)
    .catch((error) => error);

function* registerWithEmailPassword({ payload }) {
  // const { email, password, name, organisation, mobile } = payload.user;
  const { email, password, name, mobile } = payload.user;
  try {
    const registerationStatus = yield call(
      registerWithEmailPasswordAsync,
      email,
      password,
      name,
      // organisation,
      mobile,
      "self_register"
    );
    if (registerationStatus.status !== "ERR") {
      // const item = { uid: registerUser.user.uid };
      // setCurrentUser(item);
      yield put(registerUserSuccess(registerationStatus));
    } else {
      yield put(registerUserError(registerationStatus.info));
    }
  } catch (error) {
    yield put(registerUserError(error));
  }
}

export function* watchLogoutUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(LOGOUT_USER, logoutUser);
}

const logoutAsync = async (history) => {
  history.push(backendPath);
};

function* logoutUser({ payload }) {
  const { history } = payload;
  setToStorage("user", {});
  yield call(logoutAsync, history);
}

export function* watchForgotPassword() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(FORGOT_PASSWORD, forgotPassword);
}

const forgotPasswordAsync = async (email) => {
  // eslint-disable-next-line no-return-await
  return [];
  // return await auth
  //   .sendPasswordResetEmail(email)
  //   .then((user) => user)
  //   .catch((error) => error);
};

function* forgotPassword({ payload }) {
  const { email } = payload.forgotUserMail;
  try {
    const forgotPasswordStatus = yield call(forgotPasswordAsync, email);
    if (!forgotPasswordStatus) {
      yield put(forgotPasswordSuccess("success"));
    } else {
      yield put(forgotPasswordError(forgotPasswordStatus.message));
    }
  } catch (error) {
    yield put(forgotPasswordError(error));
  }
}

export function* watchResetPassword() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(RESET_PASSWORD, resetPassword);
}

const resetPasswordAsync = async (resetPasswordCode, newPassword) => {
  // eslint-disable-next-line no-return-await
  console.log(resetPasswordCode);
  console.log(newPassword);
};

function* resetPassword({ payload }) {
  const { newPassword, resetPasswordCode } = payload;
  try {
    const resetPasswordStatus = yield call(
      resetPasswordAsync,
      resetPasswordCode,
      newPassword
    );
    if (!resetPasswordStatus) {
      yield put(resetPasswordSuccess("success"));
    } else {
      yield put(resetPasswordError(resetPasswordStatus.message));
    }
  } catch (error) {
    yield put(resetPasswordError(error));
  }
}

export function* watchLoginSuccess() {
  yield takeEvery(LOGIN_USER_SUCCESS, loginSuccessful);
}

function* loginSuccessful({ payload }) {
  //Let's save token to storage so that it can be used for authentication
  let userObj = { token: payload.token };
  setToStorage("user", userObj);

  let userDetails = yield get({ url: `admin_users?email=${payload.email}` })
    .then((details) => details)
    .catch((error) => error);

  setToStorage("user", { ...userDetails[0], ...userObj });
  setToStorage("locale", userDetails[0].language);
}

export default function* rootSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgotPassword),
    fork(watchResetPassword),
    fork(watchLoginSuccess),
  ]);
}
