import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { post, patch, remove, get } from "../../helpers/requests";
import { createConstraintError, createConstraintSuccess, CREATE_CONSTRAINTS, getConstraintError, getConstraintsError, getConstraintsSuccess, getConstraintSuccess, GET_CONSTRAINT, GET_CONSTRAINTS, removeConstraintError, removeConstraintSuccess, REMOVE_CONSTRAINTS, updateConstraintError, updateConstraintSuccess, UPDATE_CONSTRAINTS } from "redux/actions";


function* fetchConstraints({payload}) {
    const {path } = payload;
    try {
        const result = yield call(get,{url: path});
        if(result.hasOwnProperty('title') && result.title.includes('error'))
            yield put(getConstraintsError(result));
        else
            yield put(getConstraintsSuccess(result));
            
    } catch (error) {
        yield put(getConstraintsError(error))
    }
}

function* fetchConstraint({payload}) {
    const {path } = payload;
    try {
        const result = yield call(get,{url: path});
        if(result.hasOwnProperty('title') && result.title.includes('error'))
            yield put(getConstraintSuccess(result));
        else
            yield put(getConstraintError(result));
    } catch (error) {
        yield put(getConstraintError(error));
    }
}

function* updateConstraints({payload}) {
    const {path, object } = payload;
    try {
        const result = yield call(patch, {url: path, params: object});
        if(result.hasOwnProperty('title') && result.title.includes('error'))
            yield put(updateConstraintSuccess(result));
        else
            yield put(updateConstraintError(result));
    } catch (error) {
        yield put(updateConstraintError(error));
    }
}

function* createConstraints({payload}) {
    const {path, object } = payload;
    try {
        const result = yield call(async () => await post(path, object)); 
        if(result.hasOwnProperty('title') && result.title.includes('error'))
            yield put(createConstraintError(result));
        else
            yield put(createConstraintSuccess(result));
    } catch (error) {
        yield put(createConstraintError(error));
    }
}

export function* removeConstraint({payload}) {
    const {path } = payload;
    try {
        const result = yield call(async () => await remove(path)
        .then((result) => result)
        .catch((error) => error));
        yield put(removeConstraintSuccess(result));
    } catch (error) {
        yield put(removeConstraintError(error));
    }
}

export function* watchGetConstraints() {
    // eslint-disable-next-line no-use-before-define
    yield takeEvery(GET_CONSTRAINTS, fetchConstraints);
  }

export function* watchGetConstraint() {
    yield takeEvery(GET_CONSTRAINT, fetchConstraint);
}

export function* watchUpdateConstraint() {
    yield takeEvery(UPDATE_CONSTRAINTS, updateConstraints);
}

export function* watchRemoveConstraint() {
    yield takeEvery(REMOVE_CONSTRAINTS, removeConstraint);
}
export function* watchCreateConstraint() {
    yield takeEvery(CREATE_CONSTRAINTS, createConstraints);
}

export default function* rootSaga() {
    yield all([fork(watchGetConstraints)]);
    yield all([fork(watchGetConstraint)]);
    yield all([fork(watchUpdateConstraint)]);
    yield all([fork(watchRemoveConstraint)]);
    yield all([fork(watchCreateConstraint)]);
}