import {
  GET_BOT_USERS,
  GET_BOT_USERS_SUCCESS,
  GET_BOT_USERS_ERROR,
  CREATE_BOT_USER,
  CREATE_BOT_USER_SUCCESS,
  CREATE_BOT_USER_ERROR,
  GET_BOT_USER,
  GET_BOT_USER_SUCCESS,
  GET_BOT_USER_ERROR,
  REMOVE_BOT_USER,
  REMOVE_BOT_USER_SUCCESS,
  REMOVE_BOT_USER_ERROR,
  UPDATE_BOT_USER,
  UPDATE_BOT_USER_SUCCESS,
  UPDATE_BOT_USER_ERROR,
} from "../actions";

export const getBotUsers = (params) => ({
  type: GET_BOT_USERS,
  payload: params,
});

export const getBotUsersSuccess = (users) => ({
  type: GET_BOT_USERS_SUCCESS,
  payload: users,
});

export const getBotUsersError = (error) => ({
  type: GET_BOT_USERS_ERROR,
  payload: error,
});

export const createBotUser = (user, history) => ({
  type: CREATE_BOT_USER,
  payload: { user, history },
});

export const createBotUserSuccess = (user, history) => ({
  type: CREATE_BOT_USER_SUCCESS,
  payload: { user, history },
});

export const createBotUserError = (error) => ({
  type: CREATE_BOT_USER_ERROR,
  payload: error,
});

export const getBotUser = (user) => ({
  type: GET_BOT_USER,
  payload: { user },
});

export const getBotUserSuccess = (user, history) => ({
  type: GET_BOT_USER_SUCCESS,
  payload: { user },
});

export const getBotUserError = (error) => ({
  type: GET_BOT_USER_ERROR,
  payload: error,
});

export const updateBotUser = (user) => ({
  type: UPDATE_BOT_USER,
  payload: { user },
});

export const updateBotUserSuccess = (user) => ({
  type: UPDATE_BOT_USER_SUCCESS,
  payload: { user },
});

export const updateBotUserError = (error) => ({
  type: UPDATE_BOT_USER_ERROR,
  payload: error,
});

export const removeBotUser = (user) => ({
  type: REMOVE_BOT_USER,
  payload: { user },
});

export const removeBotUserSuccess = (user) => ({
  type: REMOVE_BOT_USER_SUCCESS,
  payload: { user },
});

export const removeBotUserError = (error) => ({
  type: REMOVE_BOT_USER_ERROR,
  payload: error,
});
