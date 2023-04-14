import {
  GET_MEDIA,
  GET_MEDIA_SUCCESS,
  GET_MEDIA_ERROR,
  CREATE_MEDIUM,
  CREATE_MEDIUM_SUCCESS,
  CREATE_MEDIUM_ERROR,
  GET_MEDIUM,
  REMOVE_MEDIUM,
  REMOVE_MEDIUM_SUCCESS,
  REMOVE_MEDIUM_ERROR,
  UPDATE_MEDIUM,
  UPDATE_MEDIUM_SUCCESS,
  UPDATE_MEDIUM_ERROR,
} from "../actions";

const initialState = {
  media: [],
  medium: undefined,
  tree: {},
  loading: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MEDIA:
      return {
        ...state,
        loading: true,
      };
    case GET_MEDIA_SUCCESS:
      return {
        ...state,
        media: action.payload,
        loading: false,
      };
    case GET_MEDIA_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_MEDIUM:
      return {
        ...state,
        medium: action.payload,
        loading: true,
      };
    case CREATE_MEDIUM:
      return {
        ...state,
        medium: action.payload,
        loading: true,
      };
    case CREATE_MEDIUM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_MEDIUM_SUCCESS:
      return {
        ...state,
        medium: action.payload.medium,
        media: [...state.media, action.payload.medium],
        loading: false,
      };
    case UPDATE_MEDIUM:
      return {
        ...state,
        medium: action.payload,
        loading: true,
      };
    case UPDATE_MEDIUM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_MEDIUM_SUCCESS:
      const idx = state.media.findIndex(
        (med) => state.medium.medium.id === med.id
      );
      state.media.splice(idx, 1, action.payload.medium);
      return {
        ...state,
        medium: action.payload.medium,
        media: state.media,
        loading: false,
      };
    case REMOVE_MEDIUM:
      return {
        ...state,
        medium: action.payload,
        loading: true,
      };
    case REMOVE_MEDIUM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_MEDIUM_SUCCESS:
      const remaining = state.media.filter((med) => {
        return med.id !== state.medium.medium.id;
      });
      return {
        ...state,
        media: remaining,
        medium: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
