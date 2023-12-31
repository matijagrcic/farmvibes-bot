import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import {
  GET_SERVICES,
  UPDATE_SERVICE,
  REMOVE_SERVICE,
  CREATE_SERVICE,
  GET_SERVICE,
  CREATE_SERVICE_SUCCESS,
  CREATE_QUESTION,
  GET_QUESTIONS,
  REMOVE_QUESTION,
  UPDATE_QUESTION,
  REMOVE_QUESTION_VALIDATION,
  UPDATE_QUESTION_VALIDATION,
  CREATE_QUESTION_VALIDATION,
} from "../actions";
import { post, patch, remove, get } from "../../helpers/requests";
import { setToStorage, getFromStorage, encodeGroupURI } from "helpers/utils";

import {
  getServicesSuccess,
  getServicesError,
  getServiceSuccess,
  getServiceError,
  createServiceSuccess,
  createServiceError,
  updateServiceError,
  removeServiceError,
  updateServiceSuccess,
  removeServiceSuccess,
  createQuestionError,
  createQuestionSuccess,
  removeQuestionError,
  removeQuestionSuccess,
  updateQuestionError,
  updateQuestionSuccess,
  createQuestionValidationSuccess,
  createQuestionValidationError,
  getQuestionsSuccess,
} from "./actions";

import { makeListRequest } from "helpers/utils";

function* fetchServices({ payload }) {
  try {
    let groups = encodeGroupURI("groups", [
      "uxServiceRequest:read",
      "translations",
    ]);
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: `services?${groups}`,
      options: payload,
    });
    yield put(getServicesSuccess(result));
  } catch (error) {
    yield put(getServicesError(error));
  }
}

function* fetchQuestions({ payload }) {
  try {
    let { service } = payload;
    // eslint-disable-next-line no-useless-computed-key
    const result = yield call(makeListRequest, {
      url: `services/${service}/questions?groups[]=translations&groups[]=uxQuestionRequest:read&pagination=false`,
    });
    yield put(getQuestionsSuccess(result));

    //We need to get question types
    if (!getFromStorage("questionTypes")) {
      const serviceTypes = yield call(makeListRequest, {
        url: "question_types",
        options: {
          "groups[]": "translations",
        },
      });
      setToStorage("questionTypes", serviceTypes);
    }
  } catch (error) {
    yield put(getServicesError(error));
  }
}

function* createServiceItem({ payload }) {
  try {
    const { service, navigate } = payload;
    const result = yield call(async () => await post("services", service));
    if (result.hasOwnProperty("title") && result.title.contains("error"))
      yield put(createServiceError(result));
    else yield put(createServiceSuccess(result, navigate));
  } catch (error) {
    yield put(createServiceError(error));
  }
}

function* createQuestionItem({ payload }) {
  try {
    const { question } = payload;
    const newItem = yield call(async () => await post("questions", question));
    yield put(createQuestionSuccess(newItem));
  } catch (error) {
    yield put(createQuestionError(error));
  }
}

function* createQuestionValidation({ payload }) {
  try {
    const { questionValidation } = payload;
    const newItem = yield call(
      async () => await post("question_validations", questionValidation)
    );
    yield put(createQuestionValidationSuccess(newItem));
  } catch (error) {
    yield put(createQuestionValidationError(error));
  }
}

function* createdServiceSuccess({ payload }) {
  const { service, navigate } = payload;
  yield call(navigate, `${service.id}`, { state: { title: service.name } });
}

function* updateService({ payload }) {
  try {
    const { service } = payload;
    const result = yield call(
      async () =>
        await patch(`services/${service.id}`, service)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateServiceSuccess(result));
  } catch (error) {
    yield put(updateServiceError(error));
  }
}

function* removeService({ payload }) {
  try {
    const { service } = payload;
    const result = yield call(
      async () =>
        await remove(`services/${service.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeServiceSuccess(result));
  } catch (error) {
    yield put(removeServiceError(error));
  }
}

function* fetchService({ payload }) {
  try {
    const { serviceId, groups } = payload;
    const result = yield call(get, {
      url: `services/${serviceId}?groups[]=service:read&groups[]=translations${groups}`,
    });
    yield put(getServiceSuccess(result));
  } catch (error) {
    yield put(getServiceError(error));
  }
}

function* removeQuestionItem({ payload }) {
  try {
    const result = yield call(
      async () =>
        await remove(`services/${payload.serviceId}/question/${payload.id}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeQuestionSuccess(result));
  } catch (error) {
    yield put(removeQuestionError(error));
  }
}

function* updateQuestionItem({ payload }) {
  try {
    const { question } = payload;
    //we need to remove all sub-resources since we won't be persisting them here
    Object.keys(question).forEach((prop) => {
      if (Array.isArray(question[prop] && prop !== "attributes")) {
        delete question[prop];
      }
    });
    const result = yield call(
      async () =>
        await patch(
          `services/${question.serviceId}/question/${question.id}`,
          question
        )
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateQuestionSuccess(result));
  } catch (error) {
    yield put(updateQuestionError(error));
  }
}

function* removeQuestionValidation({ payload }) {
  try {
    const result = yield call(
      async () =>
        await remove(`question_validations/${payload}`)
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(removeQuestionSuccess(result));
  } catch (error) {
    yield put(removeQuestionError(error));
  }
}

function* updateQuestionValidation({ payload }) {
  try {
    const { questionValidation } = payload;
    const result = yield call(
      async () =>
        await patch(
          `question_validations/${questionValidation.id}`,
          questionValidation
        )
          .then((result) => result)
          .catch((error) => error)
    );
    yield put(updateQuestionSuccess(result));
  } catch (error) {
    yield put(updateQuestionError(error));
  }
}

export function* watchGetList() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_SERVICES, fetchServices);
}

export function* watchCreateService() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_SERVICE, createServiceItem);
}

export function* watchGetService() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_SERVICE, fetchService);
}

export function* watchUpdateService() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_SERVICE, updateService);
}

export function* watchRemoveService() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_SERVICE, removeService);
}

export function* watchCreatedServiceSuccess() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_SERVICE_SUCCESS, createdServiceSuccess);
}

export function* watchCreateQuestion() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_QUESTION, createQuestionItem);
}

export function* watchCreateQuestionValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(CREATE_QUESTION_VALIDATION, createQuestionValidation);
}

export function* watchRemoveQuestion() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_QUESTION, removeQuestionItem);
}

export function* watchUpdateQuestion() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_QUESTION, updateQuestionItem);
}

export function* watchRemoveQuestionValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(REMOVE_QUESTION_VALIDATION, removeQuestionValidation);
}

export function* watchUpdateQuestionValidation() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(UPDATE_QUESTION_VALIDATION, updateQuestionValidation);
}

export function* watchGetQuestion() {
  // eslint-disable-next-line no-use-before-define
  yield takeEvery(GET_QUESTIONS, fetchQuestions);
}

export default function* rootSaga() {
  yield all([fork(watchGetList)]);
  yield all([fork(watchGetService)]);
  yield all([fork(watchUpdateService)]);
  yield all([fork(watchRemoveService)]);
  yield all([fork(watchCreateService)]);
  yield all([fork(watchCreatedServiceSuccess)]);
  yield all([fork(watchCreateQuestion)]);
  yield all([fork(watchRemoveQuestion)]);
  yield all([fork(watchUpdateQuestion)]);
  yield all([fork(watchGetQuestion)]);
  yield all([fork(watchRemoveQuestionValidation)]);
  yield all([fork(watchUpdateQuestionValidation)]);
  yield all([fork(watchCreateQuestionValidation)]);
}
