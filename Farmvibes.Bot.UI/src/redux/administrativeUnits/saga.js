import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_ADMINISTRATIVE_UNITS,
  UPDATE_ADMINISTRATIVE_UNIT,
  REMOVE_ADMINISTRATIVE_UNIT,
  CREATE_ADMINISTRATIVE_UNIT,
  GET_ADMINISTRATIVE_UNIT,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getAdministrativeUnitsSuccess,
  getAdministrativeUnitsError,
  getAdministrativeUnitSuccess,
  getAdministrativeUnitError,
  createAdministrativeUnitSuccess,
  createAdministrativeUnitError,
  updateAdministrativeUnitError,
  removeAdministrativeUnitError,
  updateAdministrativeUnitSuccess,
  removeAdministrativeUnitSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchAdministrativeUnits({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "administrative_units",
      options: {
        ...payload,
        ...{ "groups[]": "translations" },
      },
    });
    yield put(getAdministrativeUnitsSuccess(result));
  } catch (error) {
    yield put(getAdministrativeUnitsError(error));
  }
}

function* createAdministrativeUnitItem({ payload }) {
  try {
    const { administrativeUnit } = payload;
    const newItem = yield call(
      async () => await post("administrative_units", administrativeUnit)
    );
    yield put(createAdministrativeUnitSuccess(newItem));
  } catch (error) {
    yield put(createAdministrativeUnitError(error));
  }
}

function* updateAdministrativeUnit({ payload }) {
  try {
    const { administrativeUnit } = payload;
    const result = yield call(
      async () =>
        await patch(
          `administrative_units/${administrativeUnit.id}`,
          administrativeUnit
        )
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateAdministrativeUnitSuccess(result));
  } catch (error) {
    yield put(updateAdministrativeUnitError(error));
  }
}

function* removeAdministrativeUnit({ payload }) {
  try {
    const { administrativeUnit } = payload;
    const result = yield call(
      async () =>
        await remove(
          `administrative_units/${administrativeUnit.id}`,
          administrativeUnit
        )
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeAdministrativeUnitSuccess(result));
  } catch (error) {
    yield put(removeAdministrativeUnitError(error));
  }
}

function* fetchAdministrativeUnit({ payload }) {
  try {
    const { administrativeUnit } = payload;
    const result = yield call(get, {
      url: `administrative_units/${administrativeUnit.id}`,
    });
    yield put(getAdministrativeUnitSuccess(result));
  } catch (error) {
    yield put(getAdministrativeUnitError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_ADMINISTRATIVE_UNITS, fetchAdministrativeUnits);
}

export function* watchCreateAdministrativeUnit() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_ADMINISTRATIVE_UNIT, createAdministrativeUnitItem);
}

export function* watchGetAdministrativeUnit() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_ADMINISTRATIVE_UNIT, fetchAdministrativeUnit);
}

export function* watchUpdateAdministrativeUnit() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_ADMINISTRATIVE_UNIT, updateAdministrativeUnit);
}

export function* watchRemoveAdministrativeUnit() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_ADMINISTRATIVE_UNIT, removeAdministrativeUnit);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetAdministrativeUnit)]);
  yield all([fork(watchUpdateAdministrativeUnit)]);
  yield all([fork(watchRemoveAdministrativeUnit)]);
  yield all([fork(watchCreateAdministrativeUnit)]);
}
