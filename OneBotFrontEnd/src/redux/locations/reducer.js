import {
  GET_LOCATIONS,
  GET_LOCATIONS_SUCCESS,
  GET_LOCATIONS_ERROR,
  CREATE_LOCATION,
  CREATE_LOCATION_SUCCESS,
  CREATE_LOCATION_ERROR,
  GET_LOCATION,
  REMOVE_LOCATION,
  REMOVE_LOCATION_SUCCESS,
  REMOVE_LOCATION_ERROR,
  UPDATE_LOCATION,
  UPDATE_LOCATION_SUCCESS,
  UPDATE_LOCATION_ERROR,
  UPLOAD_LOCATIONS,
  UPLOAD_LOCATIONS_SUCCESS,
  UPLOAD_LOCATIONS_ERROR,
  DOWNLOAD_LOCATIONS_TEMPLATE,
  DOWNLOAD_LOCATIONS_TEMPLATE_SUCCESS,
  DOWNLOAD_LOCATIONS_TEMPLATE_ERROR,
  DOWNLOAD_LOCATIONS_ERROR,
  DOWNLOAD_LOCATIONS_SUCCESS,
  DOWNLOAD_LOCATIONS,
} from "../actions";

const initialState = {
  locations: [],
  location: undefined,
  tree: {},
  loading: false,
  file: undefined,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_LOCATIONS:
      return {
        ...state,
        loading: true,
      };
    case GET_LOCATIONS_SUCCESS:
      return {
        ...state,
        locations: action.payload,
        loading: false,
      };
    case GET_LOCATIONS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_LOCATION:
      return {
        ...state,
        location: action.payload,
        loading: true,
      };
    case CREATE_LOCATION:
      return {
        ...state,
        location: action.payload,
        loading: true,
      };
    case CREATE_LOCATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_LOCATION_SUCCESS:
      return {
        ...state,
        location: action.payload.location,
        locations: [...state.locations, action.payload.location],
        loading: false,
      };
    case UPLOAD_LOCATIONS:
      return {
        ...state,
        location: action.payload,
        loading: true,
      };
    case UPLOAD_LOCATIONS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPLOAD_LOCATIONS_SUCCESS:
      return {
        ...state,
        location: action.payload.location,
        locations: [...state.locations, action.payload.location],
        loading: false,
      };
    case UPDATE_LOCATION:
      return {
        ...state,
        location: action.payload,
        loading: true,
      };
    case UPDATE_LOCATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_LOCATION_SUCCESS:
      const idx = state.locations.findIndex(
        (med) => state.location.location.id === med.id
      );
      state.locations.splice(idx, 1, action.payload.location);
      return {
        ...state,
        location: action.payload.location,
        locations: state.locations,
        loading: false,
      };
    case REMOVE_LOCATION:
      return {
        ...state,
        location: action.payload,
        loading: true,
      };
    case REMOVE_LOCATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_LOCATION_SUCCESS:
      const remaining = state.locations.filter((med) => {
        return med.id !== state.location.location.id;
      });
      return {
        ...state,
        locations: remaining,
        location: {},
        loading: false,
      };
    case DOWNLOAD_LOCATIONS:
      return {
        ...state,
        loading: true,
      };
    case DOWNLOAD_LOCATIONS_SUCCESS:
      return {
        ...state,
        file: action.payload,
        loading: false,
      };
    case DOWNLOAD_LOCATIONS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case DOWNLOAD_LOCATIONS_TEMPLATE:
      return {
        ...state,
        loading: true,
      };
    case DOWNLOAD_LOCATIONS_TEMPLATE_SUCCESS:
      return {
        ...state,
        file: action.payload,
        loading: false,
      };
    case DOWNLOAD_LOCATIONS_TEMPLATE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
