import { all } from "redux-saga/effects";
import userSagas from "./user/saga";
import menusSagas from "./menus/saga";
import contentSagas from "./content/saga";
import languageSagas from "./languages/saga";
import channelSagas from "./channels/saga";
import administrativeUnitSagas from "./administrativeUnits/saga";
import serviceSagas from "./service/saga";
import mediaSagas from "./media/saga";
import locationsSagas from "./locations/saga";
import validationsSagas from "./validations/saga";
import adminUsers from "./admin-users/saga";
import constraintsSaga from "./constraints/saga";

export default function* rootSaga() {
  yield all([
    userSagas(),
    menusSagas(),
    adminUsers(),
    contentSagas(),
    languageSagas(),
    channelSagas(),
    administrativeUnitSagas(),
    serviceSagas(),
    mediaSagas(),
    locationsSagas(),
    validationsSagas(),
    constraintsSaga(),
  ]);
}
