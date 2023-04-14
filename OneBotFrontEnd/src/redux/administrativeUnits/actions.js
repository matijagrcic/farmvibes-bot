import {
  GET_ADMINISTRATIVE_UNITS,
  GET_ADMINISTRATIVE_UNITS_SUCCESS,
  GET_ADMINISTRATIVE_UNITS_ERROR,
  CREATE_ADMINISTRATIVE_UNIT,
  CREATE_ADMINISTRATIVE_UNIT_SUCCESS,
  CREATE_ADMINISTRATIVE_UNIT_ERROR,
  GET_ADMINISTRATIVE_UNIT,
  GET_ADMINISTRATIVE_UNIT_SUCCESS,
  GET_ADMINISTRATIVE_UNIT_ERROR,
  REMOVE_ADMINISTRATIVE_UNIT,
  REMOVE_ADMINISTRATIVE_UNIT_SUCCESS,
  REMOVE_ADMINISTRATIVE_UNIT_ERROR,
  UPDATE_ADMINISTRATIVE_UNIT,
  UPDATE_ADMINISTRATIVE_UNIT_SUCCESS,
  UPDATE_ADMINISTRATIVE_UNIT_ERROR,
} from "../actions";

export const getAdministrativeUnits = (params) => ({
  type: GET_ADMINISTRATIVE_UNITS,
  payload: params,
});

export const getAdministrativeUnitsSuccess = (administrativeUnits) => ({
  type: GET_ADMINISTRATIVE_UNITS_SUCCESS,
  payload: administrativeUnits,
});

export const getAdministrativeUnitsError = (error) => ({
  type: GET_ADMINISTRATIVE_UNITS_ERROR,
  payload: error,
});

export const createAdministrativeUnit = (administrativeUnit, history) => ({
  type: CREATE_ADMINISTRATIVE_UNIT,
  payload: { administrativeUnit, history },
});

export const createAdministrativeUnitSuccess = (
  administrativeUnit,
  history
) => ({
  type: CREATE_ADMINISTRATIVE_UNIT_SUCCESS,
  payload: { administrativeUnit, history },
});

export const createAdministrativeUnitError = (error) => ({
  type: CREATE_ADMINISTRATIVE_UNIT_ERROR,
  payload: error,
});

export const getAdministrativeUnit = (administrativeUnit) => ({
  type: GET_ADMINISTRATIVE_UNIT,
  payload: { administrativeUnit },
});

export const getAdministrativeUnitSuccess = (administrativeUnit, history) => ({
  type: GET_ADMINISTRATIVE_UNIT_SUCCESS,
  payload: { administrativeUnit },
});

export const getAdministrativeUnitError = (error) => ({
  type: GET_ADMINISTRATIVE_UNIT_ERROR,
  payload: error,
});

export const updateAdministrativeUnit = (administrativeUnit) => ({
  type: UPDATE_ADMINISTRATIVE_UNIT,
  payload: { administrativeUnit },
});

export const updateAdministrativeUnitSuccess = (administrativeUnit) => ({
  type: UPDATE_ADMINISTRATIVE_UNIT_SUCCESS,
  payload: { administrativeUnit },
});

export const updateAdministrativeUnitError = (error) => ({
  type: UPDATE_ADMINISTRATIVE_UNIT_ERROR,
  payload: error,
});

export const removeAdministrativeUnit = (administrativeUnit) => ({
  type: REMOVE_ADMINISTRATIVE_UNIT,
  payload: { administrativeUnit },
});

export const removeAdministrativeUnitSuccess = (administrativeUnit) => ({
  type: REMOVE_ADMINISTRATIVE_UNIT_SUCCESS,
  payload: { administrativeUnit },
});

export const removeAdministrativeUnitError = (error) => ({
  type: REMOVE_ADMINISTRATIVE_UNIT_ERROR,
  payload: error,
});
