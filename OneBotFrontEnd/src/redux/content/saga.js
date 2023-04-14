import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_CONTENTS,
  UPDATE_CONTENT,
  CREATE_CONTENT,
  GET_CONTENT,
  REMOVE_CONTENT,
  CREATE_CONTENT_ITEM,
  UPDATE_CONTENT_TEXT_ITEM,
  REMOVE_CONTENT_TEXT_ITEM,
} from "../actions";
import { post, get, remove, patch } from "../../helpers/requests";

import {
  getContentsSuccess,
  getContentsError,
  createContentError,
  createContentSuccess,
  removeContentSuccess,
  removeContentError,
  updateContentSuccess,
  updateContentError,
  createContentItemSuccess,
  createContentItemError,
  removeContentTextItemError,
  removeContentTextItemSuccess,
  updateContentTextItemError,
  updateContentTextItemSuccess,
} from "./actions";

function* fetchContents({ payload }) {
  try {
    const result = yield call(get, {
      url: `contents`,
      params: {
        ...payload,
        ...{ "groups[]": "translations" },
      },
    });
    //group content

    yield put(getContentsSuccess(result));
  } catch (error) {
    yield put(getContentsError(error));
  }
}

function* createContentItem({ payload }) {
  try {
    const { content, history } = payload;
    const newItem = yield call(async () => {
      await post("contents", content)
        .then((result) => result)
        .catch((error) => error);
    });
    yield put(createContentSuccess(newItem, history));
  } catch (error) {
    yield put(createContentError(error));
  }
}

function* createContentTextItem({ payload }) {
  try {
    const { content } = payload;
    const newItem = yield call(
      async () =>
        await post(`contents/add_text`, content)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(createContentItemSuccess(newItem));
  } catch (error) {
    yield put(createContentItemError(error));
  }
}

function* fetchContent({ payload }) {
  const { content, history } = payload;
  yield call(history.push, `details/${content.id}`);
}

function* removeContent({ payload }) {
  try {
    const { content } = payload;
    const response = yield call(
      async () =>
        await remove(`contents/${content.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeContentSuccess(response));
  } catch (error) {
    yield put(removeContentError(error));
  }
}

function* updateContent({ payload }) {
  try {
    const { content } = payload;
    const response = yield call(
      async () =>
        await patch("contents", { id: content.id })
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateContentSuccess(response));
  } catch (error) {
    yield put(updateContentError(error));
  }
}

function* removeContentTextItem({ payload }) {
  try {
    const { content } = payload;
    const response = yield call(
      async () =>
        await remove(`content_texts/${content.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeContentTextItemSuccess(response));
  } catch (error) {
    yield put(removeContentTextItemError(error));
  }
}

function* updateContentTextItem({ payload }) {
  try {
    const { content } = payload;
    const response = yield call(
      async () =>
        await patch(`content_texts/${content.id}`, content)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateContentTextItemSuccess(response));
  } catch (error) {
    yield put(updateContentTextItemError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_CONTENTS, fetchContents);
}

export function* watchCreateContent() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_CONTENT, createContentItem);
}

export function* watchGetContent() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_CONTENT, fetchContent);
}

export function* watchRemoveContent() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_CONTENT, removeContent);
}

export function* watchUpdateContent() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_CONTENT, updateContent);
}

export function* watchCreateContentItem() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_CONTENT_ITEM, createContentTextItem);
}

export function* watchUpdateContentText() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_CONTENT_TEXT_ITEM, updateContentTextItem);
}

export function* watchRemoveContentText() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_CONTENT_TEXT_ITEM, removeContentTextItem);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchCreateContent)]);
  yield all([fork(watchGetContent)]);
  yield all([fork(watchRemoveContent)]);
  yield all([fork(watchUpdateContent)]);
  yield all([fork(watchCreateContentItem)]);
  yield all([fork(watchRemoveContentText)]);
  yield all([fork(watchUpdateContentText)]);
}
