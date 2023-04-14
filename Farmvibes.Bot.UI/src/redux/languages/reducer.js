import { setToStorage } from "helpers/utils";
import {
  GET_LANGUAGES,
  GET_LANGUAGES_SUCCESS,
  GET_LANGUAGES_ERROR,
  CREATE_LANGUAGE,
  CREATE_LANGUAGE_SUCCESS,
  CREATE_LANGUAGE_ERROR,
  GET_LANGUAGE,
  REMOVE_LANGUAGE,
  REMOVE_LANGUAGE_SUCCESS,
  REMOVE_LANGUAGE_ERROR,
  UPDATE_LANGUAGE,
  UPDATE_LANGUAGE_SUCCESS,
  UPDATE_LANGUAGE_ERROR,
} from "../actions";

const initialState = {
  languages: [],
  language: undefined,
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LANGUAGES:
      return {
        ...state,
        loading: true,
      };
    case GET_LANGUAGES_SUCCESS:
      setToStorage("languages", action.payload);
      return {
        ...state,
        languages: action.payload,
        loading: false,
      };
    case GET_LANGUAGES_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        loading: true,
      };
    case CREATE_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        loading: true,
      };
    case CREATE_LANGUAGE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_LANGUAGE_SUCCESS:
      const updated = [...state.languages, action.payload.language];
      setToStorage("languages", updated);
      return {
        ...state,
        language: action.payload.language,
        languages: updated,
        loading: false,
      };
    case UPDATE_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        loading: true,
      };
    case UPDATE_LANGUAGE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_LANGUAGE_SUCCESS:
      const idx = state.languages.findIndex(
        (lingo) => state.language.language.code === lingo.code
      );
      state.languages.splice(idx, 1, action.payload.language);
      setToStorage("languages", state.languages);
      return {
        ...state,
        language: action.payload.language,
        languages: state.languages,
        loading: false,
      };
    case REMOVE_LANGUAGE:
      return {
        ...state,
        language: action.payload,
        loading: true,
      };
    case REMOVE_LANGUAGE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_LANGUAGE_SUCCESS:
      const remaining = state.languages.filter((lingo) => {
        return lingo.code !== state.language.language.code;
      });
      setToStorage("languages", remaining);
      return {
        ...state,
        languages: remaining,
        language: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
