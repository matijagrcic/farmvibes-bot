import {
  GET_CONTENTS,
  GET_CONTENTS_ERROR,
  GET_CONTENTS_SUCCESS,
  CREATE_CONTENT_ERROR,
  CREATE_CONTENT_SUCCESS,
  CREATE_CONTENT,
  GET_CONTENT,
  GET_CONTENT_ERROR,
  GET_CONTENT_SUCCESS,
  REMOVE_CONTENT,
  REMOVE_CONTENT_ERROR,
  REMOVE_CONTENT_SUCCESS,
  UPDATE_CONTENT,
  UPDATE_CONTENT_SUCCESS,
  UPDATE_CONTENT_ERROR,
  UPDATE_CONTENT_ITEM,
  RESET_CONTENT_ITEM,
  UPDATE_CONTENT_TEXT_ITEM_ERROR,
  UPDATE_CONTENT_TEXT_ITEM_SUCCESS,
  UPDATE_CONTENT_TEXT_ITEM,
  REMOVE_CONTENT_TEXT_ITEM,
  REMOVE_CONTENT_TEXT_ITEM_SUCCESS,
  REMOVE_CONTENT_TEXT_ITEM_ERROR,
  CREATE_CONTENT_ITEM_ERROR,
  CREATE_CONTENT_ITEM_SUCCESS,
  CREATE_CONTENT_ITEM,
} from "../actions";

export const getContents = (params) => ({
  type: GET_CONTENTS,
  payload: params,
});

export const getContentsSuccess = (contents) => ({
  type: GET_CONTENTS_SUCCESS,
  payload: contents,
});

export const getContentsError = (error) => ({
  type: GET_CONTENTS_ERROR,
  payload: error,
});

export const createContent = (content) => ({
  type: CREATE_CONTENT,
  payload: { content },
});

export const createContentSuccess = (content) => ({
  type: CREATE_CONTENT_SUCCESS,
  payload: { content },
});

export const createContentError = (error) => ({
  type: CREATE_CONTENT_ERROR,
  payload: error,
});

export const getContent = (content) => ({
  type: GET_CONTENT,
  payload: { content },
});

export const getContentSuccess = (content) => ({
  type: GET_CONTENT_SUCCESS,
  payload: content,
});

export const getContentError = (error) => ({
  type: GET_CONTENT_ERROR,
  payload: error,
});

export const removeContent = (content) => ({
  type: REMOVE_CONTENT,
  payload: { content },
});

export const removeContentSuccess = (content) => ({
  type: REMOVE_CONTENT_SUCCESS,
  payload: content,
});

export const removeContentError = (error) => ({
  type: REMOVE_CONTENT_ERROR,
  payload: error,
});

export const updateContent = (content) => ({
  type: UPDATE_CONTENT,
  payload: { content },
});

export const updateContentSuccess = (content) => ({
  type: UPDATE_CONTENT_SUCCESS,
  payload: content,
});

export const updateContentError = (error) => ({
  type: UPDATE_CONTENT_ERROR,
  payload: error,
});

export const updateContentItem = (values) => ({
  type: UPDATE_CONTENT_ITEM,
  payload: values,
});

export const resetContentItem = () => ({
  type: RESET_CONTENT_ITEM,
});

export const removeContentTextItem = (content) => ({
  type: REMOVE_CONTENT_TEXT_ITEM,
  payload: content,
});

export const removeContentTextItemSuccess = (content) => ({
  type: REMOVE_CONTENT_TEXT_ITEM_SUCCESS,
  payload: content,
});

export const removeContentTextItemError = (error) => ({
  type: REMOVE_CONTENT_TEXT_ITEM_ERROR,
  payload: error,
});

export const updateContentTextItem = (content) => ({
  type: UPDATE_CONTENT_TEXT_ITEM,
  payload: { content },
});

export const updateContentTextItemSuccess = (content) => ({
  type: UPDATE_CONTENT_TEXT_ITEM_SUCCESS,
  payload: content,
});

export const updateContentTextItemError = (error) => ({
  type: UPDATE_CONTENT_TEXT_ITEM_ERROR,
  payload: error,
});

export const createContentItem = (content) => ({
  type: CREATE_CONTENT_ITEM,
  payload: { content },
});

export const createContentItemSuccess = (content) => ({
  type: CREATE_CONTENT_ITEM_SUCCESS,
  payload: content,
});

export const createContentItemError = (error) => ({
  type: CREATE_CONTENT_ITEM_ERROR,
  payload: error,
});
