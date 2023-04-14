import { setToStorage } from "helpers/utils";
import {
  GET_CHANNELS,
  GET_CHANNELS_SUCCESS,
  GET_CHANNELS_ERROR,
  CREATE_CHANNEL,
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_ERROR,
  GET_CHANNEL,
  REMOVE_CHANNEL,
  REMOVE_CHANNEL_SUCCESS,
  REMOVE_CHANNEL_ERROR,
  UPDATE_CHANNEL,
  UPDATE_CHANNEL_SUCCESS,
  UPDATE_CHANNEL_ERROR,
} from "../actions";

const initialState = {
  channels: [],
  channel: undefined,
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CHANNELS:
      return {
        ...state,
        loading: true,
      };
    case GET_CHANNELS_SUCCESS:
      setToStorage("channels", action.payload);
      return {
        ...state,
        channels: action.payload,
        loading: false,
      };
    case GET_CHANNELS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_CHANNEL:
      return {
        ...state,
        channel: action.payload,
        loading: true,
      };
    case CREATE_CHANNEL:
      return {
        ...state,
        channel: action.payload,
        loading: true,
      };
    case CREATE_CHANNEL_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_CHANNEL_SUCCESS:
      let channelist = [...state.channels, action.payload.channel];
      setToStorage("channels", channelist);
      return {
        ...state,
        channel: action.payload.channel,
        channels: channelist,
        loading: false,
      };
    case UPDATE_CHANNEL:
      return {
        ...state,
        channel: action.payload,
        loading: true,
      };
    case UPDATE_CHANNEL_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_CHANNEL_SUCCESS:
      let newVal = state.channels.map((itm) => {
        return itm.id === action.payload.channel.id
          ? action.payload.channel
          : itm;
      });
      setToStorage("channels", newVal);
      return {
        ...state,
        channel: action.payload.channel,
        channels: newVal,
        loading: false,
      };
    case REMOVE_CHANNEL:
      return {
        ...state,
        channel: action.payload,
        loading: true,
      };
    case REMOVE_CHANNEL_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_CHANNEL_SUCCESS:
      const remaining = state.channels.filter((c) => {
        return c.id !== state.channel.channel.id;
      });
      setToStorage("channels", remaining);
      return {
        ...state,
        channels: remaining,
        channel: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
