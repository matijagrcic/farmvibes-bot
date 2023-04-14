import { combineReducers } from "redux";
import userReducer from "./user/reducer";
import menuReducer from "./menus/reducer";
import contentReducer from "./content/reducer";
import authUser from "./auth/reducer";
import languageReducer from "./languages/reducer";
import channelReducer from "./channels/reducer";
import validationsReducer from "./validations/reducer";
import administrativeUnitReducer from "./administrativeUnits/reducer";
import serviceReducer from "./service/reducer";
import mediaReducer from "./media/reducer";
import locationsReducer from "./locations/reducer";

const reducers = combineReducers({
  userReducer,
  authUser,
  menuReducer,
  contentReducer,
  languageReducer,
  channelReducer,
  administrativeUnitReducer,
  serviceReducer,
  mediaReducer,
  locationsReducer,
  validationsReducer,
});

export default reducers;
