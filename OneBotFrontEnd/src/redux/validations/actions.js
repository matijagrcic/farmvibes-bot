import {
  GET_VALIDATIONS,
  GET_VALIDATIONS_SUCCESS,
  GET_VALIDATIONS_ERROR,
  CREATE_VALIDATION,
  CREATE_VALIDATION_SUCCESS,
  CREATE_VALIDATION_ERROR,
  GET_VALIDATION,
  GET_VALIDATION_SUCCESS,
  GET_VALIDATION_ERROR,
  REMOVE_VALIDATION,
  REMOVE_VALIDATION_SUCCESS,
  REMOVE_VALIDATION_ERROR,
  UPDATE_VALIDATION,
  UPDATE_VALIDATION_SUCCESS,
  UPDATE_VALIDATION_ERROR,
  REMOVE_VALIDATION_ATTRIBUTE_ERROR,
  REMOVE_VALIDATION_ATTRIBUTE_SUCCESS,
  REMOVE_VALIDATION_ATTRIBUTE,
  UPDATE_VALIDATION_ATTRIBUTE_ERROR,
  UPDATE_VALIDATION_ATTRIBUTE_SUCCESS,
  UPDATE_VALIDATION_ATTRIBUTE,
  GET_VALIDATION_ATTRIBUTE_ERROR,
  GET_VALIDATION_ATTRIBUTE_SUCCESS,
  GET_VALIDATION_ATTRIBUTE,
  CREATE_VALIDATION_ATTRIBUTE_ERROR,
  CREATE_VALIDATION_ATTRIBUTE_SUCCESS,
  CREATE_VALIDATION_ATTRIBUTE,
  GET_VALIDATION_ATTRIBUTES_ERROR,
  GET_VALIDATION_ATTRIBUTES_SUCCESS,
  GET_VALIDATION_ATTRIBUTES,
} from "../actions";

export const getValidations = (params) => ({
  type: GET_VALIDATIONS,
  payload: params,
});

export const getValidationsSuccess = (validations) => ({
  type: GET_VALIDATIONS_SUCCESS,
  payload: validations,
});

export const getValidationsError = (error) => ({
  type: GET_VALIDATIONS_ERROR,
  payload: error,
});

export const createValidation = (validation, history) => ({
  type: CREATE_VALIDATION,
  payload: { validation, history },
});

export const createValidationSuccess = (validation, history) => ({
  type: CREATE_VALIDATION_SUCCESS,
  payload: { validation, history },
});

export const createValidationError = (error) => ({
  type: CREATE_VALIDATION_ERROR,
  payload: error,
});

export const getValidation = (validation) => ({
  type: GET_VALIDATION,
  payload: { validation },
});

export const getValidationSuccess = (validation, history) => ({
  type: GET_VALIDATION_SUCCESS,
  payload: { validation },
});

export const getValidationError = (error) => ({
  type: GET_VALIDATION_ERROR,
  payload: error,
});

export const updateValidation = (validation) => ({
  type: UPDATE_VALIDATION,
  payload: { validation },
});

export const updateValidationSuccess = (validation) => ({
  type: UPDATE_VALIDATION_SUCCESS,
  payload: { validation },
});

export const updateValidationError = (error) => ({
  type: UPDATE_VALIDATION_ERROR,
  payload: error,
});

export const removeValidation = (validation) => ({
  type: REMOVE_VALIDATION,
  payload: { validation },
});

export const removeValidationSuccess = (validation) => ({
  type: REMOVE_VALIDATION_SUCCESS,
  payload: { validation },
});

export const removeValidationError = (error) => ({
  type: REMOVE_VALIDATION_ERROR,
  payload: error,
});

export const getValidationAttributesItems = (params) => ({
  type: GET_VALIDATION_ATTRIBUTES,
  payload: params,
});

export const getValidationAttributesSuccess = (validations) => ({
  type: GET_VALIDATION_ATTRIBUTES_SUCCESS,
  payload: validations,
});

export const getValidationAttributesError = (error) => ({
  type: GET_VALIDATION_ATTRIBUTES_ERROR,
  payload: error,
});

export const createValidationAttribute = (validation, history) => ({
  type: CREATE_VALIDATION_ATTRIBUTE,
  payload: { validation, history },
});

export const createValidationAttributeSuccess = (validation, history) => ({
  type: CREATE_VALIDATION_ATTRIBUTE_SUCCESS,
  payload: { validation, history },
});

export const createValidationAttributeError = (error) => ({
  type: CREATE_VALIDATION_ATTRIBUTE_ERROR,
  payload: error,
});

export const getValidationAttribute = (validation) => ({
  type: GET_VALIDATION_ATTRIBUTE,
  payload: { validation },
});

export const getValidationAttributeSuccess = (validation, history) => ({
  type: GET_VALIDATION_ATTRIBUTE_SUCCESS,
  payload: { validation },
});

export const getValidationAttributeError = (error) => ({
  type: GET_VALIDATION_ATTRIBUTE_ERROR,
  payload: error,
});

export const updateValidationAttribute = (validation) => ({
  type: UPDATE_VALIDATION_ATTRIBUTE,
  payload: { validation },
});

export const updateValidationAttributeSuccess = (validation) => ({
  type: UPDATE_VALIDATION_ATTRIBUTE_SUCCESS,
  payload: { validation },
});

export const updateValidationAttributeError = (error) => ({
  type: UPDATE_VALIDATION_ATTRIBUTE_ERROR,
  payload: error,
});

export const removeValidationAttribute = (validation) => ({
  type: REMOVE_VALIDATION_ATTRIBUTE,
  payload: { validation },
});

export const removeValidationAttributeSuccess = (validation) => ({
  type: REMOVE_VALIDATION_ATTRIBUTE_SUCCESS,
  payload: { validation },
});

export const removeValidationAttributeError = (error) => ({
  type: REMOVE_VALIDATION_ATTRIBUTE_ERROR,
  payload: error,
});
