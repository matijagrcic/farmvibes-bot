import { combineReducers } from "redux";
import userReducer from "./user/reducer";
import menuReducer from "./menus/reducer";
import contentReducer from "./content/reducer";
import languageReducer from "./languages/reducer";
import channelReducer from "./channels/reducer";
import validationsReducer from "./validations/reducer";
import administrativeUnitReducer from "./administrativeUnits/reducer";
import serviceReducer from "./service/reducer";
import mediaReducer from "./media/reducer";
import locationsReducer from "./locations/reducer";
import adminUserReducer from "./admin-users/reducer";
import constraintsReducer from "./constraints/reducer";

const reducers = combineReducers({
  userReducer,
  adminUserReducer,
  menuReducer,
  contentReducer,
  languageReducer,
  channelReducer,
  administrativeUnitReducer,
  serviceReducer,
  mediaReducer,
  locationsReducer,
  validationsReducer,
  constraintsReducer,
});

export default reducers;
