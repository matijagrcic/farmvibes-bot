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
  UPDATE_CONTENT_ERROR,
  UPDATE_CONTENT_SUCCESS,
  UPDATE_CONTENT_ITEM,
  RESET_CONTENT_ITEM,
  UPDATE_CONTENT_TEXT_ITEM_ERROR,
  UPDATE_CONTENT_TEXT_ITEM_SUCCESS,
  UPDATE_CONTENT_TEXT_ITEM,
  REMOVE_CONTENT_TEXT_ITEM,
  REMOVE_CONTENT_TEXT_ITEM_SUCCESS,
  REMOVE_CONTENT_TEXT_ITEM_ERROR,
  CREATE_CONTENT_ITEM_SUCCESS,
  CREATE_CONTENT_ITEM,
} from "../actions";

const initialState = {
  contents: [],
  content: {},
  contentText: {},
  loading: true,
  data: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CONTENTS:
      return {
        ...state,
        loading: true,
      };
    case GET_CONTENTS_SUCCESS:
      return {
        ...state,
        contents: action.payload,
        loading: false,
      };
    case GET_CONTENTS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_CONTENT:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case CREATE_CONTENT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_CONTENT_SUCCESS:
      return {
        ...state,
        content: action.payload.content,
        contents: [action.payload.content, ...state.contents],
        data: {},
        loading: false,
      };
    case GET_CONTENT:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case GET_CONTENT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_CONTENT_SUCCESS:
      return {
        ...state,
        content: action.payload.content,
        history: action.payload.history,
        loading: false,
      };
    case REMOVE_CONTENT:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case REMOVE_CONTENT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_CONTENT_SUCCESS:
      return {
        ...state,
        content: null,
        contents: state.contents.filter(
          (c) => c.id !== state.content.content.id
        ),
        history: action.payload.history,
        loading: false,
      };
    case UPDATE_CONTENT_ITEM:
      const newVal =
        Object.keys(action.payload).length > 0
          ? { ...state.data, ...action.payload }
          : {};
      return {
        ...state,
        data: newVal,
        loading: false,
      };
    case RESET_CONTENT_ITEM:
      return {
        ...state,
        data: {},
      };
    case UPDATE_CONTENT_TEXT_ITEM:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case UPDATE_CONTENT_TEXT_ITEM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_CONTENT_TEXT_ITEM_SUCCESS:
      let afterUpdate = state.contents.map((c) => {
        if (state.content.content.content.includes(c.id)) {
          let txt = {
            ...c,
            text: c.text.map((ci) =>
              ci.id !== state.content.content.id ? ci : action.payload
            ),
          };
          return txt;
        } else return c;
      });
      return {
        ...state,
        content: action.payload.content,
        contents: afterUpdate,
        loading: false,
      };
    case UPDATE_CONTENT:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case UPDATE_CONTENT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_CONTENT_SUCCESS:
      return {
        ...state,
        content: action.payload.content,
        loading: false,
      };
    case REMOVE_CONTENT_TEXT_ITEM:
      return {
        ...state,
        content: action.payload,
        loading: true,
      };
    case REMOVE_CONTENT_TEXT_ITEM_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_CONTENT_TEXT_ITEM_SUCCESS:
      let afterRemove = state.contents.map((c) => {
        if (c.id === state.content.group) {
          let remainingtxt = {
            ...c,
            text: c.text.filter((ci) => ci.id !== state.content.id),
          };
          return remainingtxt;
        } else return c;
      });
      return {
        ...state,
        content: action.payload.content,
        contents: afterRemove,
        loading: false,
      };
    case CREATE_CONTENT_ITEM:
      return {
        ...state,
        content: action.payload.content,
        contentText: action.payload,
        loading: true,
      };
    case CREATE_CONTENT_ITEM_SUCCESS:
      let updatedci = state.contents.map((c) => {
        if (state.contentText.content.content.includes(c.id)) {
          return { ...c, text: [...c.text, action.payload] };
        } else return c;
      });
      return {
        ...state,
        content: action.payload.content,
        contents: updatedci,
        contentText: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
