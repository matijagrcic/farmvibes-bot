import {
    GET_ADMIN_USERS,
    GET_ADMIN_USERS_SUCCESS,
    GET_ADMIN_USERS_ERROR,
    CREATE_ADMIN_USER,
    CREATE_ADMIN_USER_SUCCESS,
    CREATE_ADMIN_USER_ERROR,
    GET_ADMIN_USER,
    GET_ADMIN_USER_SUCCESS,
    GET_ADMIN_USER_ERROR,
    REMOVE_ADMIN_USER,
    REMOVE_ADMIN_USER_SUCCESS,
    REMOVE_ADMIN_USER_ERROR,
    UPDATE_ADMIN_USER,
    UPDATE_ADMIN_USER_SUCCESS,
    UPDATE_ADMIN_USER_ERROR,
  } from "../actions";
  
  export const getAdminUsers = (params) => ({
    type: GET_ADMIN_USERS,
    payload: params,
  });
  
  export const getAdminUsersSuccess = (users) => ({
    type: GET_ADMIN_USERS_SUCCESS,
    payload: users,
  });
  
  export const getAdminUsersError = (error) => ({
    type: GET_ADMIN_USERS_ERROR,
    payload: error,
  });
  
  export const createAdminUser = (user) => ({
    type: CREATE_ADMIN_USER,
    payload: { user },
  });
  
  export const createAdminUserSuccess = (user) => ({
    type: CREATE_ADMIN_USER_SUCCESS,
    payload: { user },
  });
  
  export const createAdminUserError = (error) => ({
    type: CREATE_ADMIN_USER_ERROR,
    payload: error,
  });
  
  export const getAdminUser = (user) => ({
    type: GET_ADMIN_USER,
    payload: { user },
  });
  
  export const getAdminUserSuccess = (user) => ({
    type: GET_ADMIN_USER_SUCCESS,
    payload: { user },
  });
  
  export const getAdminUserError = (error) => ({
    type: GET_ADMIN_USER_ERROR,
    payload: error,
  });
  
  export const updateAdminUser = (user) => ({
    type: UPDATE_ADMIN_USER,
    payload: { user },
  });
  
  export const updateAdminUserSuccess = (user) => ({
    type: UPDATE_ADMIN_USER_SUCCESS,
    payload: { user },
  });
  
  export const updateAdminUserError = (error) => ({
    type: UPDATE_ADMIN_USER_ERROR,
    payload: error,
  });
  
  export const removeAdminUser = (user) => ({
    type: REMOVE_ADMIN_USER,
    payload: { user },
  });
  
  export const removeAdminUserSuccess = (user) => ({
    type: REMOVE_ADMIN_USER_SUCCESS,
    payload: { user },
  });
  
  export const removeAdminUserError = (error) => ({
    type: REMOVE_ADMIN_USER_ERROR,
    payload: error,
  });
  