import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_LANGUAGES,
  UPDATE_LANGUAGE,
  REMOVE_LANGUAGE,
  CREATE_LANGUAGE,
  GET_LANGUAGE,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getLanguagesSuccess,
  getLanguagesError,
  getLanguageSuccess,
  getLanguageError,
  createLanguageSuccess,
  createLanguageError,
  updateLanguageError,
  removeLanguageError,
  updateLanguageSuccess,
  removeLanguageSuccess,
} from "./actions";

import { makeListRequest, encodeGroupURI } from "helpers/utils";

function* fetchLanguages({ payload }) {
  try {
    let groups = encodeGroupURI("groups", ["languages:read", "translations"]);
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: `languages?${groups}`,
      options: payload,
    });
    if(!result)
      yield put(getLanguagesError(result));
    else
      yield put(getLanguagesSuccess(result));
    yield put(getLanguagesSuccess(result));
  } catch (error) {
    yield put(getLanguagesError(error));
  }
}

function* createLanguageItem({ payload }) {
  try {
    const { language } = payload;
    const result = yield call(async () => await post("languages", language));
    if(result.hasOwnProperty('title') && result.title.includes('error'))
      yield put(createLanguageError(result));
    else
      yield put(createLanguageSuccess(result));
  } catch (error) {
    yield put(createLanguageError(error));
  }
}

function* updateLanguage({ payload }) {
  try {
    const { language } = payload;
    const result = yield call(
      async () =>
        await patch(`languages/${language.id}`, language)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateLanguageSuccess(result));
  } catch (error) {
    yield put(updateLanguageError(error));
  }
}

function* removeLanguage({ payload }) {
  try {
    const { language } = payload;
    const result = yield call(
      async () =>
        await remove(`languages/${language.id}`, language)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeLanguageSuccess(result));
  } catch (error) {
    yield put(removeLanguageError(error));
  }
}

function* fetchLanguage({ payload }) {
  try {
    const { language } = payload;
    const result = yield call(get, { url: `languages/${language.id}` });
    yield put(getLanguageSuccess(result));
  } catch (error) {
    yield put(getLanguageError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_LANGUAGES, fetchLanguages);
}

export function* watchCreateLanguage() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_LANGUAGE, createLanguageItem);
}

export function* watchGetLanguage() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_LANGUAGE, fetchLanguage);
}

export function* watchUpdateLanguage() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_LANGUAGE, updateLanguage);
}

export function* watchRemoveLanguage() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_LANGUAGE, removeLanguage);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetLanguage)]);
  yield all([fork(watchUpdateLanguage)]);
  yield all([fork(watchRemoveLanguage)]);
  yield all([fork(watchCreateLanguage)]);
}
