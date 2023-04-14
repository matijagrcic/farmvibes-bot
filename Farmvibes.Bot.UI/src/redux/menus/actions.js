import {
  GET_MENUS,
  GET_MENUS_SUCCESS,
  GET_MENUS_ERROR,
  CREATE_MENU,
  CREATE_MENU_SUCCESS,
  CREATE_MENU_ERROR,
  GET_MENU,
  GET_MENU_SUCCESS,
  GET_MENU_ERROR,
  CREATE_MENU_NODE,
  CREATE_MENU_NODE_SUCCESS,
  CREATE_MENU_NODE_ERROR,
  REMOVE_MENU_NODE_SUCCESS,
  REMOVE_MENU_NODE_ERROR,
  REMOVE_MENU_NODE,
  UPDATE_MENU_NODE_SUCCESS,
  UPDATE_MENU_NODE_ERROR,
  UPDATE_MENU_NODE,
  UPDATE_MENU_SUCCESS,
  UPDATE_MENU_ERROR,
  UPDATE_MENU,
  PUBLISH_MENU_ERROR,
  PUBLISH_MENU_SUCCESS,
  PUBLISH_MENU,
} from "../actions";

export const getMenus = (params) => ({
  type: GET_MENUS,
  payload: params,
});

export const getMenusSuccess = (menus) => ({
  type: GET_MENUS_SUCCESS,
  payload: menus,
});

export const getMenusError = (error) => ({
  type: GET_MENUS_ERROR,
  payload: error,
});

export const createMenu = (menu, navigate) => ({
  type: CREATE_MENU,
  payload: { menu, navigate },
});

export const createMenuSuccess = (menu, navigate) => ({
  type: CREATE_MENU_SUCCESS,
  payload: { menu, navigate },
});

export const createMenuError = (error) => ({
  type: CREATE_MENU_ERROR,
  payload: error,
});

export const createMenuNode = (node) => ({
  type: CREATE_MENU_NODE,
  payload: { node },
});

export const createMenuNodeSuccess = (node) => ({
  type: CREATE_MENU_NODE_SUCCESS,
  payload: { node },
});

export const createMenuNodeError = (error) => ({
  type: CREATE_MENU_NODE_ERROR,
  payload: error,
});

export const getMenu = (menu) => ({
  type: GET_MENU,
  payload: { menu },
});

export const getMenuSuccess = (menu) => ({
  type: GET_MENU_SUCCESS,
  payload: menu,
});

export const getMenuError = (error) => ({
  type: GET_MENU_ERROR,
  payload: error,
});

export const updateMenuNode = (node) => ({
  type: UPDATE_MENU_NODE,
  payload: { node },
});

export const updateMenuNodeSuccess = (node) => ({
  type: UPDATE_MENU_NODE_SUCCESS,
  payload: { node },
});

export const updateMenuNodeError = (error) => ({
  type: UPDATE_MENU_NODE_ERROR,
  payload: error,
});

export const updateMenu = (node) => ({
  type: UPDATE_MENU,
  payload: { node },
});

export const updateMenuSuccess = (node) => ({
  type: UPDATE_MENU_SUCCESS,
  payload: { node },
});

export const updateMenuError = (error) => ({
  type: UPDATE_MENU_ERROR,
  payload: error,
});

export const publishMenu = (node) => ({
  type: PUBLISH_MENU,
  payload: { node },
});

export const publishMenuSuccess = (node) => ({
  type: PUBLISH_MENU_SUCCESS,
  payload: { node },
});

export const publishMenuError = (error) => ({
  type: PUBLISH_MENU_ERROR,
  payload: error,
});

export const removeMenuNode = (node) => ({
  type: REMOVE_MENU_NODE,
  payload: { node },
});

export const removeMenuNodeSuccess = (node) => ({
  type: REMOVE_MENU_NODE_SUCCESS,
  payload: { node },
});

export const removeMenuNodeError = (error) => ({
  type: REMOVE_MENU_NODE_ERROR,
  payload: error,
});
