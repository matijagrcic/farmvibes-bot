import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_VALIDATIONS,
  UPDATE_VALIDATION,
  REMOVE_VALIDATION,
  CREATE_VALIDATION,
  GET_VALIDATION,
  CREATE_VALIDATION_ATTRIBUTE,
  REMOVE_VALIDATION_ATTRIBUTE,
  UPDATE_VALIDATION_ATTRIBUTE,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getValidationsSuccess,
  getValidationsError,
  getValidationSuccess,
  getValidationError,
  createValidationSuccess,
  createValidationError,
  updateValidationError,
  removeValidationError,
  updateValidationSuccess,
  removeValidationSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchValidations({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "validations",
      options: {
        ...payload,
        ...{ "groups[]": "translations" },
      },
    });
    yield put(getValidationsSuccess(result));
  } catch (error) {
    yield put(getValidationsError(error));
  }
}

function* createValidationItem({ payload }) {
  try {
    const { validation } = payload;
    const newItem = yield call(
      async () => await post("validations", validation)
    );
    yield put(createValidationSuccess(newItem));
  } catch (error) {
    yield put(createValidationError(error));
  }
}

function* updateValidation({ payload }) {
  try {
    const { validation } = payload;
    const result = yield call(
      async () =>
        await patch(`validations/${validation.id}`, validation)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateValidationSuccess(result));
  } catch (error) {
    yield put(updateValidationError(error));
  }
}

function* removeValidation({ payload }) {
  try {
    const { validation } = payload;
    const result = yield call(
      async () =>
        await remove(`validations/${validation.id}`, validation)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeValidationSuccess(result));
  } catch (error) {
    yield put(removeValidationError(error));
  }
}

function* createValidationAttribute({ payload }) {
  try {
    const { validation } = payload;
    const newItem = yield call(
      async () => await post("validation_attributes", validation)
    );
    yield put(createValidationSuccess(newItem));
  } catch (error) {
    yield put(createValidationError(error));
  }
}

function* updateValidationAttribute({ payload }) {
  try {
    const { validation } = payload;
    const result = yield call(
      async () =>
        await patch(`validation_attributes/${validation.id}`, validation)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateValidationSuccess(result));
  } catch (error) {
    yield put(updateValidationError(error));
  }
}

function* removeValidationAttribute({ payload }) {
  try {
    const { validation } = payload;
    const result = yield call(
      async () =>
        await remove(`validation_attributes/${validation.id}`, validation)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeValidationSuccess(result));
  } catch (error) {
    yield put(removeValidationError(error));
  }
}

function* fetchValidation({ payload }) {
  try {
    const { validation } = payload;
    const result = yield call(get, { url: `validations/${validation.id}` });
    yield put(getValidationSuccess(result));
  } catch (error) {
    yield put(getValidationError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_VALIDATIONS, fetchValidations);
}

export function* watchCreateValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_VALIDATION, createValidationItem);
}

export function* watchGetValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_VALIDATION, fetchValidation);
}

export function* watchUpdateValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_VALIDATION, updateValidation);
}

export function* watchRemoveValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_VALIDATION, removeValidation);
}

export function* watchCreateValidationAttribute() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_VALIDATION_ATTRIBUTE, createValidationAttribute);
}

export function* watchUpdateValidationAttribute() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_VALIDATION_ATTRIBUTE, updateValidationAttribute);
}

export function* watchRemoveValidationAttribute() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_VALIDATION_ATTRIBUTE, removeValidationAttribute);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetValidation)]);
  yield all([fork(watchUpdateValidation)]);
  yield all([fork(watchRemoveValidation)]);
  yield all([fork(watchCreateValidation)]);
  yield all([fork(watchUpdateValidationAttribute)]);
  yield all([fork(watchRemoveValidationAttribute)]);
  yield all([fork(watchCreateValidationAttribute)]);
}
