import {
  GET_MEDIA,
  GET_MEDIA_SUCCESS,
  GET_MEDIA_ERROR,
  CREATE_MEDIUM,
  CREATE_MEDIUM_SUCCESS,
  CREATE_MEDIUM_ERROR,
  GET_MEDIUM,
  GET_MEDIUM_SUCCESS,
  GET_MEDIUM_ERROR,
  REMOVE_MEDIUM,
  REMOVE_MEDIUM_SUCCESS,
  REMOVE_MEDIUM_ERROR,
  UPDATE_MEDIUM,
  UPDATE_MEDIUM_SUCCESS,
  UPDATE_MEDIUM_ERROR,
} from "../actions";

export const getMedia = (params) => ({
  type: GET_MEDIA,
  payload: params,
});

export const getMediaSuccess = (media) => ({
  type: GET_MEDIA_SUCCESS,
  payload: media,
});

export const getMediaError = (error) => ({
  type: GET_MEDIA_ERROR,
  payload: error,
});

export const createMedium = (medium, history) => ({
  type: CREATE_MEDIUM,
  payload: { medium, history },
});

export const createMediumSuccess = (medium, history) => ({
  type: CREATE_MEDIUM_SUCCESS,
  payload: { medium, history },
});

export const createMediumError = (error) => ({
  type: CREATE_MEDIUM_ERROR,
  payload: error,
});

export const getMedium = (medium) => ({
  type: GET_MEDIUM,
  payload: { medium },
});

export const getMediumSuccess = (medium, history) => ({
  type: GET_MEDIUM_SUCCESS,
  payload: { medium },
});

export const getMediumError = (error) => ({
  type: GET_MEDIUM_ERROR,
  payload: error,
});

export const updateMedium = (medium) => ({
  type: UPDATE_MEDIUM,
  payload: { medium },
});

export const updateMediumSuccess = (medium) => ({
  type: UPDATE_MEDIUM_SUCCESS,
  payload: { medium },
});

export const updateMediumError = (error) => ({
  type: UPDATE_MEDIUM_ERROR,
  payload: error,
});

export const removeMedium = (medium) => ({
  type: REMOVE_MEDIUM,
  payload: { medium },
});

export const removeMediumSuccess = (medium) => ({
  type: REMOVE_MEDIUM_SUCCESS,
  payload: { medium },
});

export const removeMediumError = (error) => ({
  type: REMOVE_MEDIUM_ERROR,
  payload: error,
});
