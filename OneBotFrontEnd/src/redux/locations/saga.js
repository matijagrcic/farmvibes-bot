import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_LOCATIONS,
  UPDATE_LOCATION,
  REMOVE_LOCATION,
  CREATE_LOCATION,
  GET_LOCATION,
  UPLOAD_LOCATIONS,
  DOWNLOAD_LOCATIONS_TEMPLATE,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getLocationsSuccess,
  getLocationsError,
  getLocationSuccess,
  getLocationError,
  createLocationSuccess,
  createLocationError,
  updateLocationError,
  removeLocationError,
  updateLocationSuccess,
  removeLocationSuccess,
  uploadLocationsSuccess,
  uploadLocationsError,
  downloadLocationsTemplateError,
  downloadLocationsTemplateSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchLocations({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: `locations/ux_list/null/${payload.page}`,
      options: payload,
    });
    yield put(getLocationsSuccess(result));
  } catch (error) {
    yield put(getLocationsError(error));
  }
}

function* downloadTemplates() {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "locations/download_file",
      blob: true,
    });
    const href = window.URL.createObjectURL(result);
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", "locations.xlsx"); //or any other extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    yield put(downloadLocationsTemplateSuccess(result));
  } catch (error) {
    yield put(downloadLocationsTemplateError(error));
  }
}

function* createLocationItem({ payload }) {
  try {
    const { location } = payload;
    const newItem = yield call(async () => await post("locations", location));
    yield put(createLocationSuccess(newItem));
  } catch (error) {
    yield put(createLocationError(error));
  }
}

function* uploadLocationFile({ payload }) {
  try {
    const { location } = payload;
    const newItem = yield call(
      async () => await post("locations/upload_file", location, true, false)
    );
    yield put(uploadLocationsSuccess(newItem));
  } catch (error) {
    yield put(uploadLocationsError(error));
  }
}

function* updateLocation({ payload }) {
  try {
    const { location } = payload;
    const result = yield call(
      async () =>
        await patch(`locations/${location.id}`, location)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateLocationSuccess(result));
  } catch (error) {
    yield put(updateLocationError(error));
  }
}

function* removeLocation({ payload }) {
  try {
    const { location } = payload;
    const result = yield call(
      async () =>
        await remove(`locations/${location.id}`, location)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeLocationSuccess(result));
  } catch (error) {
    yield put(removeLocationError(error));
  }
}

function* fetchLocation({ payload }) {
  try {
    const { location } = payload;
    const result = yield call(get, { url: `locations/${location.id}` });
    yield put(getLocationSuccess(result));
  } catch (error) {
    yield put(getLocationError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_LOCATIONS, fetchLocations);
}

export function* watchCreateLocation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_LOCATION, createLocationItem);
}

export function* watchUploadLocations() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPLOAD_LOCATIONS, uploadLocationFile);
}

export function* watchGetLocation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_LOCATION, fetchLocation);
}

export function* watchUpdateLocation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_LOCATION, updateLocation);
}

export function* watchDownloadTemplate() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(DOWNLOAD_LOCATIONS_TEMPLATE, downloadTemplates);
}

export function* watchRemoveLocation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_LOCATION, removeLocation);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetLocation)]);
  yield all([fork(watchUpdateLocation)]);
  yield all([fork(watchUploadLocations)]);
  yield all([fork(watchDownloadTemplate)]);
  yield all([fork(watchRemoveLocation)]);
  yield all([fork(watchCreateLocation)]);
}
