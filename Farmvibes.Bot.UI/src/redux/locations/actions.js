import {
  GET_LOCATIONS,
  GET_LOCATIONS_SUCCESS,
  GET_LOCATIONS_ERROR,
  CREATE_LOCATION,
  CREATE_LOCATION_SUCCESS,
  CREATE_LOCATION_ERROR,
  GET_LOCATION,
  GET_LOCATION_SUCCESS,
  GET_LOCATION_ERROR,
  REMOVE_LOCATION,
  REMOVE_LOCATION_SUCCESS,
  REMOVE_LOCATION_ERROR,
  UPDATE_LOCATION,
  UPDATE_LOCATION_SUCCESS,
  UPDATE_LOCATION_ERROR,
  UPLOAD_LOCATIONS,
  UPLOAD_LOCATIONS_SUCCESS,
  UPLOAD_LOCATIONS_ERROR,
  DOWNLOAD_LOCATIONS_TEMPLATE_ERROR,
  DOWNLOAD_LOCATIONS_TEMPLATE_SUCCESS,
  DOWNLOAD_LOCATIONS_TEMPLATE,
  DOWNLOAD_LOCATIONS_ERROR,
  DOWNLOAD_LOCATIONS_SUCCESS,
  DOWNLOAD_LOCATIONS,
} from "../actions";

export const getLocations = (params) => ({
  type: GET_LOCATIONS,
  payload: params,
});

export const getLocationsSuccess = (media) => ({
  type: GET_LOCATIONS_SUCCESS,
  payload: media,
});

export const getLocationsError = (error) => ({
  type: GET_LOCATIONS_ERROR,
  payload: error,
});

export const createLocation = (location, history) => ({
  type: CREATE_LOCATION,
  payload: { location, history },
});

export const createLocationSuccess = (location, history) => ({
  type: CREATE_LOCATION_SUCCESS,
  payload: { location, history },
});

export const createLocationError = (error) => ({
  type: CREATE_LOCATION_ERROR,
  payload: error,
});

export const uploadLocations = (location) => ({
  type: UPLOAD_LOCATIONS,
  payload: { location },
});

export const uploadLocationsSuccess = (location, history) => ({
  type: UPLOAD_LOCATIONS_SUCCESS,
  payload: { location, history },
});

export const uploadLocationsError = (error) => ({
  type: UPLOAD_LOCATIONS_ERROR,
  payload: error,
});

export const downloadLocations = (location) => ({
  type: DOWNLOAD_LOCATIONS,
  payload: { location },
});

export const downloadLocationsSuccess = (location, history) => ({
  type: DOWNLOAD_LOCATIONS_SUCCESS,
  payload: { location, history },
});

export const downloadLocationsError = (error) => ({
  type: DOWNLOAD_LOCATIONS_ERROR,
  payload: error,
});

export const downloadLocationsTemplate = () => ({
  type: DOWNLOAD_LOCATIONS_TEMPLATE,
  payload: {},
});

export const downloadLocationsTemplateSuccess = (location) => ({
  type: DOWNLOAD_LOCATIONS_TEMPLATE_SUCCESS,
  payload: { location },
});

export const downloadLocationsTemplateError = (error) => ({
  type: DOWNLOAD_LOCATIONS_TEMPLATE_ERROR,
  payload: error,
});

export const getLocation = (location) => ({
  type: GET_LOCATION,
  payload: { location },
});

export const getLocationSuccess = (location, history) => ({
  type: GET_LOCATION_SUCCESS,
  payload: { location },
});

export const getLocationError = (error) => ({
  type: GET_LOCATION_ERROR,
  payload: error,
});

export const updateLocation = (location) => ({
  type: UPDATE_LOCATION,
  payload: { location },
});

export const updateLocationSuccess = (location) => ({
  type: UPDATE_LOCATION_SUCCESS,
  payload: { location },
});

export const updateLocationError = (error) => ({
  type: UPDATE_LOCATION_ERROR,
  payload: error,
});

export const removeLocation = (location) => ({
  type: REMOVE_LOCATION,
  payload: { location },
});

export const removeLocationSuccess = (location) => ({
  type: REMOVE_LOCATION_SUCCESS,
  payload: { location },
});

export const removeLocationError = (error) => ({
  type: REMOVE_LOCATION_ERROR,
  payload: error,
});
