import {
  GET_SERVICES,
  GET_SERVICES_SUCCESS,
  GET_SERVICES_ERROR,
  CREATE_SERVICE,
  CREATE_SERVICE_SUCCESS,
  CREATE_SERVICE_ERROR,
  GET_SERVICE,
  REMOVE_SERVICE,
  REMOVE_SERVICE_SUCCESS,
  REMOVE_SERVICE_ERROR,
  UPDATE_SERVICE,
  UPDATE_SERVICE_SUCCESS,
  UPDATE_SERVICE_ERROR,
  GET_SERVICE_SUCCESS,
  GET_SERVICE_ERROR,
  CREATE_QUESTION_VALIDATION_ERROR,
  CREATE_QUESTION_VALIDATION_SUCCESS,
  CREATE_QUESTION_VALIDATION,
  REMOVE_QUESTION_VALIDATION_SUCCESS,
  REMOVE_QUESTION_VALIDATION_ERROR,
  REMOVE_QUESTION_VALIDATION,
  UPDATE_QUESTION_VALIDATION,
  UPDATE_QUESTION_VALIDATION_SUCCESS,
  UPDATE_QUESTION_VALIDATION_ERROR,
  CREATE_QUESTION_ERROR,
  CREATE_QUESTION_SUCCESS,
  CREATE_QUESTION,
  REMOVE_QUESTION_SUCCESS,
  REMOVE_QUESTION_ERROR,
  REMOVE_QUESTION,
  UPDATE_QUESTION,
  UPDATE_QUESTION_SUCCESS,
  UPDATE_QUESTION_ERROR,
} from "../actions";

const initialState = {
  services: [],
  service: {},
  tree: {},
  loading: true,
  question: {},
  serviceId: null,
  questionId: null,
  questionValidation: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SERVICES:
      return {
        ...state,
        loading: true,
      };
    case GET_SERVICES_SUCCESS:
      return {
        ...state,
        services: action.payload,
        loading: false,
      };
    case GET_SERVICES_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_SERVICE:
      return {
        ...state,
        serviceId: action.payload,
        loading: true,
      };
    case GET_SERVICE_SUCCESS:
      return {
        ...state,
        service: action.payload,
        loading: false,
      };
    case GET_SERVICE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_SERVICE:
      return {
        ...state,
        service: action.payload,
        loading: true,
      };
    case CREATE_SERVICE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_SERVICE_SUCCESS:
      const updated = [...state.services, action.payload.service];
      return {
        ...state,
        service: action.payload.service,
        services: updated,
        loading: false,
      };
    case UPDATE_SERVICE:
      return {
        ...state,
        service: action.payload,
        loading: true,
      };
    case UPDATE_SERVICE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_SERVICE_SUCCESS:
      const idx = state.services.findIndex(
        (item) => state.service.service.id === item.id
      );
      state.services.splice(idx, 1, action.payload.service);
      return {
        ...state,
        service: action.payload.service,
        services: state.services,
        loading: false,
      };
    case REMOVE_SERVICE:
      return {
        ...state,
        serviceId: action.payload,
        loading: true,
      };
    case REMOVE_SERVICE_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_SERVICE_SUCCESS:
      const remaining = state.services.filter((item) => {
        return item.id !== state.service.service.id;
      });
      return {
        ...state,
        services: remaining,
        service: {},
        loading: false,
      };
    case CREATE_QUESTION:
      return {
        ...state,
        question: action.payload,
        loading: true,
      };
    case CREATE_QUESTION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_QUESTION_SUCCESS:
      let updatedService = {
        ...state.service,
        questions: [...state.service["questions"], action.payload],
      };
      return {
        ...state,
        question: {},
        service: updatedService,
        loading: false,
      };
    case REMOVE_QUESTION:
      return {
        ...state,
        questionId: action.payload,
        loading: true,
      };
    case REMOVE_QUESTION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_QUESTION_SUCCESS:
      let newService = {
        ...state.service,
        questions: state.service["questions"].filter(
          (swali) => swali.id !== state.questionId
        ),
      };
      return {
        ...state,
        question: {},
        service: newService,
        loading: false,
      };
    case UPDATE_QUESTION:
      return {
        ...state,
        question: action.payload,
        loading: true,
      };
    case UPDATE_QUESTION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_QUESTION_SUCCESS:
      let updateSService = {
        ...state.service,
        questions: state.service["questions"].map((swali) => {
          return swali.id === action.payload.id ? action.payload : swali;
        }),
      };
      return {
        ...state,
        question: {},
        service: updateSService,
        loading: false,
      };
    case CREATE_QUESTION_VALIDATION:
      return {
        ...state,
        questionValidation: action.payload,
        loading: true,
      };
    case CREATE_QUESTION_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CREATE_QUESTION_VALIDATION_SUCCESS:
      //We need to update the questionvalidation item of the question to which this validation attribute has been added.
      // let questions = state.service.questions.reduce((prev, current) => {
      //   if (
      //     state.questionValidation.questionValidation.question.includes(
      //       current.id
      //     )
      //   ) {
      //     current.questionValidations.push(action.payload);
      //   }
      //   prev.push(current);
      //   return prev;
      // }, []);
      return {
        ...state,
        // service: { ...state.service, ...{ questions: questions } },
        questionValidation: {},
        loading: false,
      };
    case REMOVE_QUESTION_VALIDATION:
      //We need to update the questionvalidation item of the question to which this validation attribute has been added.
      let qr = state.service.questions.reduce((prev, current) => {
        current.questionValidations = current.questionValidations.filter(
          (qv) => qv.id !== action.payload
        );
        prev.push(current);
        return prev;
      }, []);
      return {
        ...state,
        service: { ...state.service, ...{ questions: qr } },
        questionValidation: null,
        loading: true,
      };
    case REMOVE_QUESTION_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case REMOVE_QUESTION_VALIDATION_SUCCESS:
      return {
        ...state,
        questionValidation: {},
        loading: false,
      };
    case UPDATE_QUESTION_VALIDATION:
      return {
        ...state,
        question: action.payload,
        loading: true,
      };
    case UPDATE_QUESTION_VALIDATION_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case UPDATE_QUESTION_VALIDATION_SUCCESS:
      return {
        ...state,
        questionValidation: {},
        loading: false,
      };
    default:
      return state;
  }
};

export default reducer;
