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
  
  const initialState = {
    constraint: [],
    payload: {},
    constraints: [],
    loading: true,
  };
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_CONSTRAINTS:
        return {
          ...state,
          payload: action.payload,
          loading: true,
        };
      case GET_CONSTRAINTS_SUCCESS:
        return {
          ...state,
          constraints: action.payload,
          loading: false,
          payload: {}
        };
      case GET_CONSTRAINTS_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      case GET_CONSTRAINT:
        return {
          ...state,
          payload: action.payload,
          loading: true,
        };
      case GET_CONSTRAINT_SUCCESS:
        return {
          ...state,
          constraint: action.payload,
          loading: false,
          payload: {}
        };
      case GET_CONSTRAINT_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
          payload: {}
        };
      case CREATE_CONSTRAINTS:
        return {
          ...state,
          payload: action.payload,
          loading: true,
        };
      case CREATE_CONSTRAINTS_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
          payload: {}
        };
      case CREATE_CONSTRAINTS_SUCCESS:
        const updated = [...state.constraints, action.payload];
        return {
          ...state,
          constraint: action.payload.constraint,
          constraints: updated,
          loading: false,
        };
      case UPDATE_CONSTRAINTS:
        return {
          ...state,
          payload: action.payload,
          loading: true,
        };
      case UPDATE_CONSTRAINTS_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      case UPDATE_CONSTRAINTS_SUCCESS:
        let afterUpdate = state.constraints.map(itm => { return itm.id === action.payload.constraint.id ? action.payload.constraint : itm } )
        return {
          ...state,
          constraint: null,
          constraints: afterUpdate,
          loading: false,
        };
      case REMOVE_CONSTRAINTS:
        return {
          ...state,
          payload: action.payload,
          loading: true,
        };
      case REMOVE_CONSTRAINTS_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      case REMOVE_CONSTRAINTS_SUCCESS:
        const remaining = state.constraints.filter((item) => {
          return !state.payload.path.includes(item.id)
        });
        return {
          ...state,
          constraints: remaining,
          constraint: {},
          loading: false,
        };
      default:
        return state;
    }
  };
  
  export default reducer;
  