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
  RESET_SERVICE_ITEM,
  UPDATE_SERVICE_ITEM,
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
  GET_QUESTIONS,
  GET_QUESTIONS_SUCCESS,
  GET_QUESTIONS_ERROR,
  REMOVE_QUESTION_SUCCESS,
  REMOVE_QUESTION_ERROR,
  REMOVE_QUESTION,
  UPDATE_QUESTION,
  UPDATE_QUESTION_SUCCESS,
  UPDATE_QUESTION_ERROR,
} from "../actions";

const initialState = {
  services: [],
  questions: [],
  service: {},
  serviceObj: {},
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
    case UPDATE_SERVICE_ITEM:
      const newVal =
        Object.keys(action.payload).length > 0
          ? { ...state.serviceObj, ...action.payload }
          : {};
      return {
        ...state,
        serviceObj: newVal,
        loading: false,
      };
    case RESET_SERVICE_ITEM:
      return {
        ...state,
        serviceObj: {},
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
        services: updated.sort((a, b) => a.createdAt - b.createdAt),
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
      let afterUpdate = state.services.map((itm) => {
        return itm.id === action.payload.service.id
          ? action.payload.service
          : itm;
      });
      return {
        ...state,
        service: null,
        services: afterUpdate,
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
        return item.id !== state.serviceId.service.id;
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
      let updatedQuestionList = [...state.questions, action.payload];
      return {
        ...state,
        question: {},
        questions: updatedQuestionList,
        loading: false,
      };
    case GET_QUESTIONS:
      return {
        ...state,
        service: action.payload,
        loading: true,
      };
    case GET_QUESTIONS_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GET_QUESTIONS_SUCCESS:
      return {
        ...state,
        question: {},
        questions: action.payload,
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
      let questionsList = state.questions.filter(
        (swali) => swali.id !== state.questionId.id
      );
      return {
        ...state,
        question: {},
        questions: questionsList,
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
      let updatedQuestions = state.questions.map((swali) => {
        return swali.id === action.payload.id ? action.payload : swali;
      });
      return {
        ...state,
        question: {},
        questions: updatedQuestions.sort((a, b) => a.position - b.position),
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
