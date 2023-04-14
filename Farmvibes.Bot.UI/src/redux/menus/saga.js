import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_MENUS,
  CREATE_MENU_SUCCESS,
  CREATE_MENU,
  GET_MENU,
  CREATE_MENU_NODE,
  UPDATE_MENU_NODE,
  REMOVE_MENU_NODE,
  PUBLISH_MENU,
} from "../actions";
import { post, get, patch, remove } from "../../helpers/requests";

import {
  getMenus,
  getMenusSuccess,
  getMenusError,
  createMenuError,
  createMenuSuccess,
  createMenuNodeSuccess,
  createMenuNodeError,
  updateMenuNodeError,
  updateMenuNodeSuccess,
  removeMenuNodeError,
  removeMenuNodeSuccess,
  publishMenuSuccess,
  publishMenuError,
} from "./actions";

function* getMenusItems({ payload }) {
  try {
    const result = yield call(get, {
      url: "menu_nodes/full/nodes",
      params: {
        ...payload,
        ...{ "groups[]": "translations" },
      },
    });
    yield put(getMenusSuccess(result));
  } catch (error) {
    yield put(getMenusError(error));
  }
}

function* createMenuItem({ payload }) {
  try {
    const { menu, history } = payload;
    const newItem = yield call(async () => await createNewNode(menu));
    yield put(createMenuSuccess(newItem, history));
  } catch (error) {
    yield put(createMenuError(error));
  }
}

function* createMenuNode({ payload }) {
  try {
    const { node } = payload;
    const newNode = yield call(async () => await createNewNode(node));
    yield put(createMenuNodeSuccess(newNode));
  } catch (error) {
    yield put(createMenuNodeError(error));
  }
}

async function createNewNode(node) {
  let url = "menu_nodes";
  if (node.hasOwnProperty("content")) {
    if (typeof node.content === "object") {
      node["contentObj"] = node.content;
      delete node["content"];
      url = `${url}/persist`;
    }
  }
  return post(url, node)
    .then((result) => result)
    .catch((error) => error);
}

function* newMenuSuccess({ payload }) {
  const { menu, history } = payload;
  yield call(history.push, `details/${menu.id}`);
}

function* updateMenuNode({ payload }) {
  try {
    const { node } = payload;
    const result = yield call(
      async () =>
        await patch(`menu_nodes/${node.node}`, node)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateMenuNodeSuccess(result));
  } catch (error) {
    yield put(updateMenuNodeError(error));
  }
}

function* getMenuNodes({ payload }) {
  const { menu, history } = payload;
  yield call(history.push, `details/${menu.id}`);
}

function* removeMenuNode({ payload }) {
  try {
    const { node } = payload;
    const newNode = yield call(
      async () =>
        await remove(`menu_nodes/${node.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeMenuNodeSuccess(newNode));
  } catch (error) {
    yield put(removeMenuNodeError(error));
  }
}

function* publishMenu({ payload }) {
  try {
    const { node } = payload;
    const result = yield call(
      async () =>
        await post(`menu_nodes/publish_menu`, node)
          .then((result) => result)
          .catch((error) => error)
    );
    if (result.updatedNodes > 0) {
      yield put(publishMenuSuccess(result));
      yield put(getMenus());
    } else yield put(publishMenuError(result));
  } catch (error) {
    yield put(publishMenuError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_MENUS, getMenusItems);
}

export function* watchCreateMenu() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_MENU, createMenuItem);
}

export function* watchCreateMenuNode() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_MENU_NODE, createMenuNode);
}

export function* watchGetMenuNodes() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_MENU, getMenuNodes);
}

export function* watchCreateMenuSuccess() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_MENU_SUCCESS, newMenuSuccess);
}

export function* watchUpdateMenuNode() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_MENU_NODE, updateMenuNode);
}

export function* watchRemoveMenuNode() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_MENU_NODE, removeMenuNode);
}

export function* watchTogglePublishMenuNode() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(PUBLISH_MENU, publishMenu);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchCreateMenuSuccess)]);
  yield all([fork(watchCreateMenu)]);
  yield all([fork(watchGetMenuNodes)]);
  yield all([fork(watchCreateMenuNode)]);
  yield all([fork(watchUpdateMenuNode)]);
  yield all([fork(watchRemoveMenuNode)]);
  yield all([fork(watchTogglePublishMenuNode)]);
}
