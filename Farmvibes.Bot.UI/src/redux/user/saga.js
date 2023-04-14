import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { GET_BOT_USERS, GET_BOT_USER, REMOVE_BOT_USER } from "../actions";
import { get, remove } from "../../helpers/requests";

import {
  getBotUsersSuccess,
  getBotUsersError,
  getBotUserSuccess,
  getBotUserError,
  removeBotUserSuccess,
  removeBotUserError,
} from "./actions";

function* fetchBotUsersList({ payload }) {
  try {
    const result = yield call(get, {
      url: "bot_users",
      params: { ...payload },
    });
    yield put(getBotUsersSuccess(result));
  } catch (error) {
    yield put(getBotUsersError(error));
  }
}

function* fetchBotUser({ payload }) {
  try {
    const { user } = payload;
    const result = yield call(get, { url: `bot_users/${user.id}` });
    yield put(getBotUserSuccess(result));
  } catch (error) {
    yield put(getBotUserError(error));
  }
}

function* deleteBotUser({ payload }) {
  try {
    const { user } = payload;
    const resp = yield call(
      async () =>
        await remove(`bot_users/${user.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeBotUserSuccess(resp));
  } catch (error) {
    yield put(removeBotUserError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_BOT_USERS, fetchBotUsersList);
}

export function* watchGetUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_BOT_USER, fetchBotUser);
}

export function* watchRemoveUser() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_BOT_USER, deleteBotUser);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetUser)]);
  yield all([fork(watchRemoveUser)]);
}
