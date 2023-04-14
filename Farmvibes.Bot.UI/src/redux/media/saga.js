import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_MEDIA,
  UPDATE_MEDIUM,
  REMOVE_MEDIUM,
  CREATE_MEDIUM,
  GET_MEDIUM,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getMediaSuccess,
  getMediaError,
  getMediumSuccess,
  getMediumError,
  createMediumSuccess,
  createMediumError,
  updateMediumError,
  removeMediumError,
  updateMediumSuccess,
  removeMediumSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchMedia({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "media",
      options: payload,
    });
    yield put(getMediaSuccess(result));
  } catch (error) {
    yield put(getMediaError(error));
  }
}

function* createMediumItem({ payload }) {
  try {
    const { medium } = payload;
    const newItem = yield call(
      async () => await post("media/upload_media_file", medium, true, false)
    );
    yield put(createMediumSuccess(newItem));
  } catch (error) {
    yield put(createMediumError(error));
  }
}

function* updateMedium({ payload }) {
  try {
    const { medium } = payload;
    const result = yield call(
      async () =>
        await patch(`media/${medium.id}`, medium)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateMediumSuccess(result));
  } catch (error) {
    yield put(updateMediumError(error));
  }
}

function* removeMedium({ payload }) {
  try {
    const { medium } = payload;
    const result = yield call(
      async () =>
        await remove(`media/${medium.id}`, medium)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeMediumSuccess(result));
  } catch (error) {
    yield put(removeMediumError(error));
  }
}

function* fetchMedium({ payload }) {
  try {
    const { medium } = payload;
    const result = yield call(get, { url: `media/${medium.id}` });
    yield put(getMediumSuccess(result));
  } catch (error) {
    yield put(getMediumError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_MEDIA, fetchMedia);
}

export function* watchCreateMedium() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_MEDIUM, createMediumItem);
}

export function* watchGetMedium() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_MEDIUM, fetchMedium);
}

export function* watchUpdateMedium() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_MEDIUM, updateMedium);
}

export function* watchRemoveMedium() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_MEDIUM, removeMedium);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetMedium)]);
  yield all([fork(watchUpdateMedium)]);
  yield all([fork(watchRemoveMedium)]);
  yield all([fork(watchCreateMedium)]);
}
