import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_CHANNELS,
  UPDATE_CHANNEL,
  REMOVE_CHANNEL,
  CREATE_CHANNEL,
  GET_CHANNEL,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";

import {
  getChannelsSuccess,
  getChannelsError,
  getChannelSuccess,
  getChannelError,
  createChannelSuccess,
  createChannelError,
  updateChannelError,
  removeChannelError,
  updateChannelSuccess,
  removeChannelSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchChannels({ payload }) {
  try {
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: "channels",
      options: {
        ...payload,
        ...{ "groups[]": "translations" },
      },
    });
    yield put(getChannelsSuccess(result));
  } catch (error) {
    yield put(getChannelsError(error));
  }
}

function* createChannelItem({ payload }) {
  try {
    const { channel } = payload;
    const newItem = yield call(async () => await post("channels", channel));
    yield put(createChannelSuccess(newItem));
  } catch (error) {
    yield put(createChannelError(error));
  }
}

function* updateChannel({ payload }) {
  try {
    const { channel } = payload;
    const result = yield call(
      async () =>
        await patch(`channels/${channel.id}`, channel)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateChannelSuccess(result));
  } catch (error) {
    yield put(updateChannelError(error));
  }
}

function* removeChannel({ payload }) {
  try {
    const { channel } = payload;
    const result = yield call(
      async () =>
        await remove(`channels/${channel.id}`, channel)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeChannelSuccess(result));
  } catch (error) {
    yield put(removeChannelError(error));
  }
}

function* fetchChannel({ payload }) {
  try {
    const { channel } = payload;
    const result = yield call(get, { url: `channels/${channel.id}` });
    yield put(getChannelSuccess(result));
  } catch (error) {
    yield put(getChannelError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_CHANNELS, fetchChannels);
}

export function* watchCreateChannel() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_CHANNEL, createChannelItem);
}

export function* watchGetChannel() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_CHANNEL, fetchChannel);
}

export function* watchUpdateChannel() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_CHANNEL, updateChannel);
}

export function* watchRemoveChannel() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_CHANNEL, removeChannel);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetChannel)]);
  yield all([fork(watchUpdateChannel)]);
  yield all([fork(watchRemoveChannel)]);
  yield all([fork(watchCreateChannel)]);
}
