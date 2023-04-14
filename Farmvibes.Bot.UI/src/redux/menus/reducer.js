import {
  GET_MENUS,
  GET_MENUS_SUCCESS,
  GET_MENUS_ERROR,
  CREATE_MENU,
  CREATE_MENU_SUCCESS,
  CREATE_MENU_ERROR,
  GET_MENU,
  CREATE_MENU_NODE,
  CREATE_MENU_NODE_SUCCESS,
  CREATE_MENU_NODE_ERROR,
  REMOVE_MENU_NODE_SUCCESS,
  REMOVE_MENU_NODE_ERROR,
  REMOVE_MENU_NODE,
  UPDATE_MENU_NODE_SUCCESS,
  UPDATE_MENU_NODE_ERROR,
  UPDATE_MENU_NODE,
} from "../actions";

const initialState = {
  menus: [],
  menu: {},
  node: {},
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MENUS:
      return {
        ...state,
        loading: true,
      };
    case GET_MENUS_SUCCESS:
      return {
        ...state,
        menus: action.payload,
        loading: false,
      };
    case GET_MENUS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_MENU:
      return {
        ...state,
        menu: action.payload,
        loading: true,
      };
    case CREATE_MENU_NODE:
      return {
        ...state,
        node: action.payload,
        loading: true,
      };
    case CREATE_MENU_NODE_SUCCESS:
      return {
        ...state,
        node: action.payload.node,
        loading: false,
      };
    case CREATE_MENU_NODE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_MENU:
      return {
        ...state,
        menu: action.payload,
        loading: true,
      };
    case CREATE_MENU_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_MENU_SUCCESS:
      return {
        ...state,
        menu: action.payload.menu,
        history: action.payload.history,
        loading: false,
      };
    case UPDATE_MENU_NODE:
      return {
        ...state,
        node: action.payload,
        loading: true,
      };
    case UPDATE_MENU_NODE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_MENU_NODE_SUCCESS:
      return {
        ...state,
        node: action.payload.menu,
        loading: false,
      };
    case REMOVE_MENU_NODE:
      return {
        ...state,
        menu: action.payload,
        loading: true,
      };
    case REMOVE_MENU_NODE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_MENU_NODE_SUCCESS:
      return {
        ...state,
        menu: {},
        menus: state.menus.filter((itm) => itm.id !== state.menu.node.id),
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
