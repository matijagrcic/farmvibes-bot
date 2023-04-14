import {
  GET_CHANNELS,
  GET_CHANNELS_SUCCESS,
  GET_CHANNELS_ERROR,
  CREATE_CHANNEL,
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_ERROR,
  GET_CHANNEL,
  GET_CHANNEL_SUCCESS,
  GET_CHANNEL_ERROR,
  REMOVE_CHANNEL,
  REMOVE_CHANNEL_SUCCESS,
  REMOVE_CHANNEL_ERROR,
  UPDATE_CHANNEL,
  UPDATE_CHANNEL_SUCCESS,
  UPDATE_CHANNEL_ERROR,
} from "../actions";

export const getChannels = (params) => ({
  type: GET_CHANNELS,
  payload: params,
});

export const getChannelsSuccess = (channels) => ({
  type: GET_CHANNELS_SUCCESS,
  payload: channels,
});

export const getChannelsError = (error) => ({
  type: GET_CHANNELS_ERROR,
  payload: error,
});

export const createChannel = (channel, history) => ({
  type: CREATE_CHANNEL,
  payload: { channel, history },
});

export const createChannelSuccess = (channel, history) => ({
  type: CREATE_CHANNEL_SUCCESS,
  payload: { channel, history },
});

export const createChannelError = (error) => ({
  type: CREATE_CHANNEL_ERROR,
  payload: error,
});

export const getChannel = (channel) => ({
  type: GET_CHANNEL,
  payload: { channel },
});

export const getChannelSuccess = (channel, history) => ({
  type: GET_CHANNEL_SUCCESS,
  payload: { channel },
});

export const getChannelError = (error) => ({
  type: GET_CHANNEL_ERROR,
  payload: error,
});

export const updateChannel = (channel) => ({
  type: UPDATE_CHANNEL,
  payload: { channel },
});

export const updateChannelSuccess = (channel) => ({
  type: UPDATE_CHANNEL_SUCCESS,
  payload: { channel },
});

export const updateChannelError = (error) => ({
  type: UPDATE_CHANNEL_ERROR,
  payload: error,
});

export const removeChannel = (channel) => ({
  type: REMOVE_CHANNEL,
  payload: { channel },
});

export const removeChannelSuccess = (channel) => ({
  type: REMOVE_CHANNEL_SUCCESS,
  payload: { channel },
});

export const removeChannelError = (error) => ({
  type: REMOVE_CHANNEL_ERROR,
  payload: error,
});
