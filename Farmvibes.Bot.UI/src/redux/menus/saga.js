import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_MENUS,
  CREATE_MENU_SUCCESS,
  CREATE_MENU,
  GET_MENU,
  CREATE_MENU_NODE,
  UPDATE_MENU_NODE,
  UPDATE_MENU,
  REMOVE_MENU_NODE,
  PUBLISH_MENU,
} from "../actions";
import { post, patch, remove } from "../../helpers/requests";

import {
  getMenus,
  getMenusSuccess,
  getMenusError,
  getMenuSuccess,
  getMenuError,
  createMenuError,
  createMenuSuccess,
  createMenuNodeSuccess,
  createMenuNodeError,
  updateMenuNodeError,
  updateMenuNodeSuccess,
  updateMenuError,
  updateMenuSuccess,
  removeMenuNodeError,
  removeMenuNodeSuccess,
  publishMenuSuccess,
  publishMenuError,
} from "./actions";

import { makeListRequest, encodeGroupURI } from "helpers/utils";

function* getMenusItems({ payload }) {
  try {
    let groups = encodeGroupURI("groups", ["uxMenus:read", "translations"]);
    const result = yield call(makeListRequest, {
      url: `menu_nodes?${groups}`,
      options: {
        ...payload,
      },
    });
    yield put(getMenusSuccess(result));
  } catch (error) {
    yield put(getMenusError(error));
  }
}

function* createMenuItem({ payload }) {
  try {
    const { menu, navigate } = payload;
    const newItem = yield call(async () => await createNewNode(menu));
    yield put(createMenuSuccess(newItem, navigate));
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
  return post(url, node)
    .then((result) => result)
    .catch((error) => error);
}

function* newMenuSuccess({ payload }) {
  const { menu, navigate } = payload;
  yield call(navigate, `${menu.id}`, { state: { title: menu.label } });
}

async function patchNode(payload) {
  const { node } = payload;
  return patch(`menu_nodes/${node.node}`, node)
    .then((result) => result)
    .catch((error) => error);
}

function* updateMenuNode({ payload }) {
  try {
    const result = yield call(async () => await patchNode(payload));
    yield put(updateMenuNodeSuccess(result));
  } catch (error) {
    yield put(updateMenuNodeError(error));
  }
}

function* updateMenu({ payload }) {
  try {
    let result = yield call(async () => await patchNode(payload));
    yield put(updateMenuSuccess(result));
  } catch (error) {
    yield put(updateMenuError(error));
  }
}

function* getMenuNodes({ payload }) {
  const { menu } = payload;
  let groups = encodeGroupURI("groups", [
    "uxMenus:read",
    "translations",
    "uxMenus:tree",
  ]);
  try {
    let menuNodes = yield call(
      async () =>
        await makeListRequest({
          url: `menu_nodes?page=1${groups}&${new URLSearchParams(
            payload
          ).toString()}&pagination=false&root=${menu}`,
        }).then((result) => result)
    );

    yield put(getMenuSuccess(menuNodes));
  } catch (error) {
    yield put(getMenuError(error));
  }
}

function* removeMenuNode({ payload }) {
  try {
    const { node } = payload;
    const newNode = yield call(
      async () =>
        await remove(`menu_nodes/${node}`)
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
        await post(`menu_nodes/${node.node}/publish_menu`, node)
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

export function* watchUpdateMenu() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_MENU, updateMenu);
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
  yield all([fork(watchUpdateMenu)]);
  yield all([fork(watchRemoveMenuNode)]);
  yield all([fork(watchTogglePublishMenuNode)]);
}
