import {
  GET_ADMIN_USERS,
  GET_ADMIN_USERS_SUCCESS,
  GET_ADMIN_USERS_ERROR,
  CREATE_ADMIN_USER,
  CREATE_ADMIN_USER_SUCCESS,
  CREATE_ADMIN_USER_ERROR,
  GET_ADMIN_USER,
  REMOVE_ADMIN_USER,
  REMOVE_ADMIN_USER_SUCCESS,
  REMOVE_ADMIN_USER_ERROR,
  UPDATE_ADMIN_USER,
  UPDATE_ADMIN_USER_SUCCESS,
  UPDATE_ADMIN_USER_ERROR,
} from "../actions";

const initialState = {
  users: [],
  user: undefined,
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ADMIN_USERS:
      return {
        ...state,
        loading: true,
      };
    case GET_ADMIN_USERS_SUCCESS:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case GET_ADMIN_USERS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_ADMIN_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case CREATE_ADMIN_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case CREATE_ADMIN_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_ADMIN_USER_SUCCESS:
      let userlist = [...state.users, action.payload.user];
      return {
        ...state,
        user: action.payload.user,
        users: userlist,
        loading: false,
      };
    case UPDATE_ADMIN_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case UPDATE_ADMIN_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_ADMIN_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        users: state.users,
        loading: false,
      };
    case REMOVE_ADMIN_USER:
      return {
        ...state,
        user: action.payload,
        loading: true,
      };
    case REMOVE_ADMIN_USER_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_ADMIN_USER_SUCCESS:
      const remaining = state.users.filter((user) => {
        return user.id !== state.user.user.id;
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
