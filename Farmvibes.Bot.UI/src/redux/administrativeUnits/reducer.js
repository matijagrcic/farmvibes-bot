import {
  GET_ADMINISTRATIVE_UNITS,
  GET_ADMINISTRATIVE_UNITS_SUCCESS,
  GET_ADMINISTRATIVE_UNITS_ERROR,
  CREATE_ADMINISTRATIVE_UNIT,
  CREATE_ADMINISTRATIVE_UNIT_SUCCESS,
  CREATE_ADMINISTRATIVE_UNIT_ERROR,
  GET_ADMINISTRATIVE_UNIT,
  REMOVE_ADMINISTRATIVE_UNIT,
  REMOVE_ADMINISTRATIVE_UNIT_SUCCESS,
  REMOVE_ADMINISTRATIVE_UNIT_ERROR,
  UPDATE_ADMINISTRATIVE_UNIT,
  UPDATE_ADMINISTRATIVE_UNIT_SUCCESS,
  UPDATE_ADMINISTRATIVE_UNIT_ERROR,
} from "../actions";
import { setToStorage } from "helpers/utils";

const initialState = {
  administrativeUnits: [],
  administrativeUnit: undefined,
  tree: {},
  loading: true,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ADMINISTRATIVE_UNITS:
      return {
        ...state,
        loading: true,
      };
    case GET_ADMINISTRATIVE_UNITS_SUCCESS:
      setToStorage("administrativeUnits", action.payload);
      return {
        ...state,
        administrativeUnits: action.payload,
        loading: false,
      };
    case GET_ADMINISTRATIVE_UNITS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_ADMINISTRATIVE_UNIT:
      return {
        ...state,
        administrativeUnit: action.payload,
        loading: true,
      };
    case CREATE_ADMINISTRATIVE_UNIT:
      return {
        ...state,
        administrativeUnit: action.payload,
        loading: true,
      };
    case CREATE_ADMINISTRATIVE_UNIT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_ADMINISTRATIVE_UNIT_SUCCESS:
      const updated = [
        ...state.administrativeUnit,
        action.payload.administrativeUnit,
      ];
      setToStorage("administrativeUnits", updated);
      return {
        ...state,
        administrativeUnit: action.payload.administrativeUnit,
        administrativeUnits: updated,
        loading: false,
      };
    case UPDATE_ADMINISTRATIVE_UNIT:
      return {
        ...state,
        administrativeUnit: action.payload,
        loading: true,
      };
    case UPDATE_ADMINISTRATIVE_UNIT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_ADMINISTRATIVE_UNIT_SUCCESS:
      const idx = state.administrativeUnits.findIndex(
        (unit) => state.administrativeUnit.administrativeUnit.code === unit.code
      );
      state.administrativeUnits.splice(
        idx,
        1,
        action.payload.administrativeUnit
      );
      setToStorage("administrativeUnits", state.administrativeUnits);
      return {
        ...state,
        administrativeUnit: action.payload.administrativeUnit,
        administrativeUnits: state.administrativeUnits,
        loading: false,
      };
    case REMOVE_ADMINISTRATIVE_UNIT:
      return {
        ...state,
        administrativeUnit: action.payload,
        loading: true,
      };
    case REMOVE_ADMINISTRATIVE_UNIT_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_ADMINISTRATIVE_UNIT_SUCCESS:
      const remaining = state.administrativeUnits.filter((unit) => {
        return unit.code !== state.administrativeUnit.administrativeUnit.code;
      });
      setToStorage("administrativeUnits", remaining);
      return {
        ...state,
        administrativeUnits: remaining,
        administrativeUnit: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
