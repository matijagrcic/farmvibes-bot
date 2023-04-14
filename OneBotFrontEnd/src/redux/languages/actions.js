import {
  GET_LANGUAGES,
  GET_LANGUAGES_SUCCESS,
  GET_LANGUAGES_ERROR,
  CREATE_LANGUAGE,
  CREATE_LANGUAGE_SUCCESS,
  CREATE_LANGUAGE_ERROR,
  GET_LANGUAGE,
  GET_LANGUAGE_SUCCESS,
  GET_LANGUAGE_ERROR,
  REMOVE_LANGUAGE,
  REMOVE_LANGUAGE_SUCCESS,
  REMOVE_LANGUAGE_ERROR,
  UPDATE_LANGUAGE,
  UPDATE_LANGUAGE_SUCCESS,
  UPDATE_LANGUAGE_ERROR,
} from "../actions";

export const getLanguages = (params) => ({
  type: GET_LANGUAGES,
  payload: params,
});

export const getLanguagesSuccess = (languages) => ({
  type: GET_LANGUAGES_SUCCESS,
  payload: languages,
});

export const getLanguagesError = (error) => ({
  type: GET_LANGUAGES_ERROR,
  payload: error,
});

export const createLanguage = (language, history) => ({
  type: CREATE_LANGUAGE,
  payload: { language, history },
});

export const createLanguageSuccess = (language, history) => ({
  type: CREATE_LANGUAGE_SUCCESS,
  payload: { language, history },
});

export const createLanguageError = (error) => ({
  type: CREATE_LANGUAGE_ERROR,
  payload: error,
});

export const getLanguage = (language) => ({
  type: GET_LANGUAGE,
  payload: { language },
});

export const getLanguageSuccess = (language, history) => ({
  type: GET_LANGUAGE_SUCCESS,
  payload: { language },
});

export const getLanguageError = (error) => ({
  type: GET_LANGUAGE_ERROR,
  payload: error,
});

export const updateLanguage = (language) => ({
  type: UPDATE_LANGUAGE,
  payload: { language },
});

export const updateLanguageSuccess = (language) => ({
  type: UPDATE_LANGUAGE_SUCCESS,
  payload: { language },
});

export const updateLanguageError = (error) => ({
  type: UPDATE_LANGUAGE_ERROR,
  payload: error,
});

export const removeLanguage = (language) => ({
  type: REMOVE_LANGUAGE,
  payload: { language },
});

export const removeLanguageSuccess = (language) => ({
  type: REMOVE_LANGUAGE_SUCCESS,
  payload: { language },
});

export const removeLanguageError = (error) => ({
  type: REMOVE_LANGUAGE_ERROR,
  payload: error,
});
