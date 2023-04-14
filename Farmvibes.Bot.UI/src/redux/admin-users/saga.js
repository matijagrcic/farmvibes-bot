import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_ADMIN_USERS,
  UPDATE_ADMIN_USER,
  REMOVE_ADMIN_USER,
  CREATE_ADMIN_USER,
  GET_ADMIN_USER,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getAdminUsersSuccess,
  getAdminUsersError,
  getAdminUserSuccess,
  getAdminUserError,
  createAdminUserSuccess,
  createAdminUserError,
  updateAdminUserError,
  removeAdminUserError,
  updateAdminUserSuccess,
  removeAdminUserSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchAdminUsers({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "admin_users",
      options: {
        ...payload,
        ...{ "groups[]": "user:read" },
      },
    });
    yield put(getAdminUsersSuccess(result));
  } catch (error) {
    yield put(getAdminUsersError(error));
  }
}

function* createAdminUserItem({ payload }) {
  try {
    const { user } = payload;
    const newItem = yield call(async () => await post("admin_users", user));
    yield put(createAdminUserSuccess(newItem));
  } catch (error) {
    yield put(createAdminUserError(error));
  }
}

function* updateAdminUser({ payload }) {
  try {
    const { user } = payload;
    const result = yield call(
      async () =>
        await patch(`admin_users/${user.id}`, user)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateAdminUserSuccess(result));
  } catch (error) {
    yield put(updateAdminUserError(error));
  }
}

function* removeAdminUser({ payload }) {
  try {
    const { user } = payload;
    const result = yield call(
      async () =>
        await remove(`admin_users/${user.id}`, user)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeAdminUserSuccess(result));
  } catch (error) {
    yield put(removeAdminUserError(error));
  }
}

function* fetchAdminUser({ payload }) {
  try {
    const { user } = payload;
    const result = yield call(get, { url: `admin_users/${user.id}` });
    yield put(getAdminUserSuccess(result));
  } catch (error) {
    yield put(getAdminUserError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_ADMIN_USERS, fetchAdminUsers);
}

export function* watchCreateAdminUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_ADMIN_USER, createAdminUserItem);
}

export function* watchGetAdminUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_ADMIN_USER, fetchAdminUser);
}

export function* watchUpdateAdminUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_ADMIN_USER, updateAdminUser);
}

export function* watchRemoveAdminUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_ADMIN_USER, removeAdminUser);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetAdminUser)]);
  yield all([fork(watchUpdateAdminUser)]);
  yield all([fork(watchRemoveAdminUser)]);
  yield all([fork(watchCreateAdminUser)]);
}
