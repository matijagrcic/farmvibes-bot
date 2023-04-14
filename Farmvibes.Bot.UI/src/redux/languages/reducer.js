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
      //Let's update default locale for showing content
      setToStorage("locale", action.payload.filter((l) => l.isDefault)[0].code);
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
      const newVal = [...state.languages, action.payload.language];
      setToStorage("languages", newVal);
      return {
        ...state,
        language: action.payload.language,
        languages: newVal,
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
      let updlanguages = state.languages.map((itm) => {
        if (
          action.payload.language.isDefault &&
          itm.id !== action.payload.language.id
        ) {
          itm["isDefault"] = false;
        }
        return itm.id === action.payload.language.id
          ? action.payload.language
          : itm;
      });

      setToStorage("languages", updlanguages);

      //Incase we have a new default, let's update it in the storage
      setToStorage("locale", updlanguages.filter((l) => l.isDefault)[0].code);
      return {
        ...state,
        language: action.payload.language,
        languages: updlanguages,
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
