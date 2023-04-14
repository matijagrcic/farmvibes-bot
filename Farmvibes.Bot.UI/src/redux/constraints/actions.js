import {
    GET_CONSTRAINTS,
    GET_CONSTRAINTS_SUCCESS,
    GET_CONSTRAINTS_ERROR,
    GET_CONSTRAINT,
    GET_CONSTRAINT_SUCCESS,
    GET_CONSTRAINT_ERROR,
    CREATE_CONSTRAINTS,
    CREATE_CONSTRAINTS_SUCCESS,
    CREATE_CONSTRAINTS_ERROR,
    REMOVE_CONSTRAINTS,
    REMOVE_CONSTRAINTS_ERROR,
    REMOVE_CONSTRAINTS_SUCCESS,
    UPDATE_CONSTRAINTS_ERROR,
    UPDATE_CONSTRAINTS_SUCCESS,
    UPDATE_CONSTRAINTS,
  } from "../actions";
  
  export const createConstraint = (payload) => ({
    type: CREATE_CONSTRAINTS,
    payload,
  });
  
  export const createConstraintSuccess = (payload) => ({
    type: CREATE_CONSTRAINTS_SUCCESS,
    payload,
  });
  
  export const createConstraintError = (error) => ({
    type: CREATE_CONSTRAINTS_ERROR,
    payload: error,
  });
  
  export const removeConstraint = (payload) => ({
    type: REMOVE_CONSTRAINTS,
    payload,
  });
  
  export const removeConstraintSuccess = () => ({
    type: REMOVE_CONSTRAINTS_SUCCESS,
    payload: {},
  });
  
  export const removeConstraintError = (error) => ({
    type: REMOVE_CONSTRAINTS_ERROR,
    payload: error,
  });
  
  export const updateConstraint = (payload) => ({
    type: UPDATE_CONSTRAINTS,
    payload,
  });
  
  export const updateConstraintSuccess = (constraint) => ({
    type: UPDATE_CONSTRAINTS_SUCCESS,
    payload: constraint,
  });
  
  export const updateConstraintError = (error) => ({
    type: UPDATE_CONSTRAINTS_ERROR,
    payload: error,
  });

  export const getConstraints = (payload) => ({
    type: GET_CONSTRAINTS,
    payload,
  });
  
  export const getConstraintsSuccess = (constraints) => ({
    type: GET_CONSTRAINTS_SUCCESS,
    payload: constraints,
  });
  
  export const getConstraintsError = (error) => ({
    type: GET_CONSTRAINTS_ERROR,
    payload: error,
  });

  export const getConstraint = (payload) => ({
    type: GET_CONSTRAINT,
    payload,
  });
  
  export const getConstraintSuccess = (constraint) => ({
    type: GET_CONSTRAINT_SUCCESS,
    payload: constraint,
  });
  
  export const getConstraintError = (error) => ({
    type: GET_CONSTRAINT_ERROR,
    payload: error,
  });