import {
  GET_BOT_USERS,
  GET_BOT_USERS_SUCCESS,
  GET_BOT_USERS_ERROR,
  CREATE_BOT_USER,
  CREATE_BOT_USER_SUCCESS,
  CREATE_BOT_USER_ERROR,
  GET_BOT_USER,
  REMOVE_BOT_USER,
  REMOVE_BOT_USER_SUCCESS,
  REMOVE_BOT_USER_ERROR,
  UPDATE_BOT_USER,
  UPDATE_BOT_USER_SUCCESS,
  UPDATE_BOT_USER_ERROR,
} from "../actions";

const initialState = {
  users: [],
  user: undefined,
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BOT_USERS:
      return {
        ...state,
        loading: true,
      };
    case GET_BOT_USERS_SUCCESS:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case GET_BOT_USERS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_BOT_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case CREATE_BOT_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case CREATE_BOT_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_BOT_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        users: [...state.users, action.payload.user],
        loading: false,
      };
    case UPDATE_BOT_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case UPDATE_BOT_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_BOT_USER_SUCCESS:
      const idx = state.users.findIndex((u) => state.user.user.code === u.code);
      state.users.splice(idx, 1, action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        users: state.users,
        loading: false,
      };
    case REMOVE_BOT_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case REMOVE_BOT_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_BOT_USER_SUCCESS:
      const remaining = state.users.filter((u) => {
        return u.id !== state.user.user.id;
      });
      return {
        ...state,
        users: remaining,
        user: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
