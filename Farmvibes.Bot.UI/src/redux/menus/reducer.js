import {
  GET_MENUS,
  GET_MENUS_SUCCESS,
  GET_MENUS_ERROR,
  CREATE_MENU,
  CREATE_MENU_SUCCESS,
  CREATE_MENU_ERROR,
  GET_MENU,
  GET_MENU_ERROR,
  GET_MENU_SUCCESS,
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
} from "../actions";

const initialState = {
  menus: [],
  menu: {},
  node: {},
  menuTree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MENUS:
      return {
        ...state,
        loading: true,
        menuTree: {},
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
        menuTree: {},
      };
    case GET_MENU_SUCCESS:
      return {
        ...state,
        menuTree: action.payload,
        loading: false,
      };
    case GET_MENU_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_MENU_NODE:
      return {
        ...state,
        node: action.payload,
        loading: true,
      };
    case CREATE_MENU_NODE_SUCCESS:
      let updatedM = [...state.menuTree, action.payload.node];
      return {
        ...state,
        node: action.payload.node,
        menuTree: updatedM,
        menus: updatedM,
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
      let nodeUpdate = state.menuTree.map((m) => {
        return m.id === action.payload.node.id ? action.payload.node : m;
      });
      return {
        ...state,
        node: action.payload.node,
        menuTree: nodeUpdate,
        loading: false,
      };
    case UPDATE_MENU:
      return {
        ...state,
        node: action.payload,
        loading: true,
      };
    case UPDATE_MENU_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_MENU_SUCCESS:
      let updmenu =
        state.menus.length > 0
          ? state.menus.map((itm) => {
              if (
                action.payload.node.isDefault &&
                itm.id !== action.payload.node.id
              ) {
                itm["isDefault"] = false;
              }
              return itm.id === action.payload.node.id
                ? action.payload.node
                : itm;
            })
          : state.menuTree.map((itm) => {
              return itm.id === action.payload.node.id
                ? action.payload.node
                : itm;
            });
      return {
        ...state,
        node: action.payload.node,
        menus: updmenu,
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
      let afterUpdate = state.menus.filter((itm) => itm.id !== state.menu.node);
      return {
        ...state,
        node: {},
        menuTree: afterUpdate,
        menus: afterUpdate,
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
