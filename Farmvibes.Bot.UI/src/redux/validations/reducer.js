import { setToStorage } from "helpers/utils";
import {
  GET_VALIDATIONS,
  GET_VALIDATIONS_SUCCESS,
  GET_VALIDATIONS_ERROR,
  CREATE_VALIDATION,
  CREATE_VALIDATION_SUCCESS,
  CREATE_VALIDATION_ERROR,
  GET_VALIDATION,
  REMOVE_VALIDATION,
  REMOVE_VALIDATION_SUCCESS,
  REMOVE_VALIDATION_ERROR,
  UPDATE_VALIDATION,
  UPDATE_VALIDATION_SUCCESS,
  UPDATE_VALIDATION_ERROR,
  REMOVE_VALIDATION_ATTRIBUTE_ERROR,
  REMOVE_VALIDATION_ATTRIBUTE_SUCCESS,
  REMOVE_VALIDATION_ATTRIBUTE,
  UPDATE_VALIDATION_ATTRIBUTE_ERROR,
  UPDATE_VALIDATION_ATTRIBUTE_SUCCESS,
  UPDATE_VALIDATION_ATTRIBUTE,
  GET_VALIDATION_ATTRIBUTE,
  CREATE_VALIDATION_ATTRIBUTE_ERROR,
  CREATE_VALIDATION_ATTRIBUTE_SUCCESS,
  CREATE_VALIDATION_ATTRIBUTE,
  GET_VALIDATION_ATTRIBUTES_ERROR,
  GET_VALIDATION_ATTRIBUTES_SUCCESS,
  GET_VALIDATION_ATTRIBUTES,
} from "../actions";

const initialState = {
  validations: [],
  validation: undefined,
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_VALIDATIONS:
      return {
        ...state,
        loading: true,
      };
    case GET_VALIDATIONS_SUCCESS:
      setToStorage("validations", action.payload);
      return {
        ...state,
        validations: action.payload,
        loading: false,
      };
    case GET_VALIDATIONS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_VALIDATION:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case CREATE_VALIDATION:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case CREATE_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_VALIDATION_SUCCESS:
      let validationist = [...state.validations, action.payload.validation];
      setToStorage("validations", validationist);
      return {
        ...state,
        validation: action.payload.validation,
        validations: validationist,
        loading: false,
      };
    case UPDATE_VALIDATION:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case UPDATE_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_VALIDATION_SUCCESS:
      const idx = state.validations.findIndex(
        (lingo) => state.validation.validation.code === lingo.code
      );
      state.validations.splice(idx, 1, action.payload.validation);
      setToStorage("validations", state.validations);
      return {
        ...state,
        validation: action.payload.validation,
        validations: state.validations,
        loading: false,
      };
    case REMOVE_VALIDATION:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case REMOVE_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_VALIDATION_SUCCESS:
      const remaining = state.validations.filter((lingo) => {
        return lingo.code !== state.validation.validation.code;
      });
      setToStorage("validations", remaining);
      return {
        ...state,
        validations: remaining,
        validation: {},
        loading: false,
      };
    case GET_VALIDATION_ATTRIBUTES:
      return {
        ...state,
        loading: true,
      };
    case GET_VALIDATION_ATTRIBUTES_SUCCESS:
      return {
        ...state,
        validations: action.payload,
        loading: false,
      };
    case GET_VALIDATION_ATTRIBUTES_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_VALIDATION_ATTRIBUTE:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case CREATE_VALIDATION_ATTRIBUTE:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case CREATE_VALIDATION_ATTRIBUTE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_VALIDATION_ATTRIBUTE_SUCCESS:
      return {
        ...state,
        validation: action.payload.validation,
        validations: [...state.validations, action.payload.validation],
        loading: false,
      };
    case UPDATE_VALIDATION_ATTRIBUTE:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case UPDATE_VALIDATION_ATTRIBUTE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_VALIDATION_ATTRIBUTE_SUCCESS:
      return {
        ...state,
        validation: action.payload.validation,
        validations: state.validations,
        loading: false,
      };
    case REMOVE_VALIDATION_ATTRIBUTE:
      return {
        ...state,
        validation: action.payload,
        loading: true,
      };
    case REMOVE_VALIDATION_ATTRIBUTE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_VALIDATION_ATTRIBUTE_SUCCESS:
      return {
        ...state,
        validations: state.validations.filter((lingo) => {
          return lingo.code !== state.validation.validation.code;
        }),
        validation: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
