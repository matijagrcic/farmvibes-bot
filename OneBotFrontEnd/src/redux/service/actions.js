import {
  GET_SERVICES,
  GET_SERVICES_SUCCESS,
  GET_SERVICES_ERROR,
  CREATE_SERVICE,
  CREATE_SERVICE_SUCCESS,
  CREATE_SERVICE_ERROR,
  GET_SERVICE,
  GET_SERVICE_SUCCESS,
  GET_SERVICE_ERROR,
  REMOVE_SERVICE,
  REMOVE_SERVICE_SUCCESS,
  REMOVE_SERVICE_ERROR,
  UPDATE_SERVICE,
  UPDATE_SERVICE_SUCCESS,
  UPDATE_SERVICE_ERROR,
  CREATE_QUESTION_VALIDATION,
  CREATE_QUESTION_VALIDATION_SUCCESS,
  CREATE_QUESTION_VALIDATION_ERROR,
  REMOVE_QUESTION_VALIDATION,
  REMOVE_QUESTION_VALIDATION_ERROR,
  REMOVE_QUESTION_VALIDATION_SUCCESS,
  UPDATE_QUESTION_VALIDATION_ERROR,
  UPDATE_QUESTION_VALIDATION_SUCCESS,
  UPDATE_QUESTION_VALIDATION,
  CREATE_QUESTION,
  CREATE_QUESTION_SUCCESS,
  CREATE_QUESTION_ERROR,
  REMOVE_QUESTION,
  REMOVE_QUESTION_ERROR,
  REMOVE_QUESTION_SUCCESS,
  UPDATE_QUESTION_ERROR,
  UPDATE_QUESTION_SUCCESS,
  UPDATE_QUESTION,
} from "../actions";

export const getServices = (params) => ({
  type: GET_SERVICES,
  payload: params,
});

export const getServicesSuccess = (services) => ({
  type: GET_SERVICES_SUCCESS,
  payload: services,
});

export const getServicesError = (error) => ({
  type: GET_SERVICES_ERROR,
  payload: error,
});

export const createService = (service, history) => ({
  type: CREATE_SERVICE,
  payload: { service, history },
});

export const createServiceSuccess = (service, history) => ({
  type: CREATE_SERVICE_SUCCESS,
  payload: { service, history },
});

export const createServiceError = (error) => ({
  type: CREATE_SERVICE_ERROR,
  payload: error,
});

export const getService = (serviceId, groups) => ({
  type: GET_SERVICE,
  payload: { serviceId, groups },
});

export const getServiceSuccess = (service, history) => ({
  type: GET_SERVICE_SUCCESS,
  payload: service,
});

export const getServiceError = (error) => ({
  type: GET_SERVICE_ERROR,
  payload: error,
});

export const updateService = (service) => ({
  type: UPDATE_SERVICE,
  payload: { service },
});

export const updateServiceSuccess = (service) => ({
  type: UPDATE_SERVICE_SUCCESS,
  payload: { service },
});

export const updateServiceError = (error) => ({
  type: UPDATE_SERVICE_ERROR,
  payload: error,
});

export const removeService = (service) => ({
  type: REMOVE_SERVICE,
  payload: { service },
});

export const removeServiceSuccess = (service) => ({
  type: REMOVE_SERVICE_SUCCESS,
  payload: { service },
});

export const removeServiceError = (error) => ({
  type: REMOVE_SERVICE_ERROR,
  payload: error,
});

export const createQuestion = (question) => ({
  type: CREATE_QUESTION,
  payload: { question },
});

export const createQuestionSuccess = (question) => ({
  type: CREATE_QUESTION_SUCCESS,
  payload: question,
});

export const createQuestionError = (error) => ({
  type: CREATE_QUESTION_ERROR,
  payload: error,
});

export const removeQuestion = (questionId) => ({
  type: REMOVE_QUESTION,
  payload: questionId,
});

export const removeQuestionSuccess = () => ({
  type: REMOVE_QUESTION_SUCCESS,
  payload: {},
});

export const removeQuestionError = (error) => ({
  type: REMOVE_QUESTION_ERROR,
  payload: error,
});

export const updateQuestion = (question) => ({
  type: UPDATE_QUESTION,
  payload: { question },
});

export const updateQuestionSuccess = (question) => ({
  type: UPDATE_QUESTION_SUCCESS,
  payload: question,
});

export const updateQuestionError = (error) => ({
  type: UPDATE_QUESTION_ERROR,
  payload: error,
});

export const createQuestionValidation = (questionValidation) => ({
  type: CREATE_QUESTION_VALIDATION,
  payload: { questionValidation },
});

export const createQuestionValidationSuccess = (questionValidation) => ({
  type: CREATE_QUESTION_VALIDATION_SUCCESS,
  payload: questionValidation,
});

export const createQuestionValidationError = (error) => ({
  type: CREATE_QUESTION_VALIDATION_ERROR,
  payload: error,
});

export const removeQuestionValidation = (questionValidationId) => ({
  type: REMOVE_QUESTION_VALIDATION,
  payload: questionValidationId,
});

export const removeQuestionValidationSuccess = () => ({
  type: REMOVE_QUESTION_VALIDATION_SUCCESS,
  payload: {},
});

export const removeQuestionValidationError = (error) => ({
  type: REMOVE_QUESTION_VALIDATION_ERROR,
  payload: error,
});

export const updateQuestionValidation = (questionValidation) => ({
  type: UPDATE_QUESTION_VALIDATION,
  payload: { questionValidation },
});

export const updateQuestionValidationSuccess = (questionValidation) => ({
  type: UPDATE_QUESTION_VALIDATION_SUCCESS,
  payload: questionValidation,
});

export const updateQuestionValidationError = (error) => ({
  type: UPDATE_QUESTION_VALIDATION_ERROR,
  payload: error,
});
