import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";

import { initializeIcons } from "@fluentui/react/lib/Icons";

import { DynamicThemeProvider } from "./global/themes";
import { AuthenticationProvider } from "./global/authentication";
import { Provider } from "react-redux";
import { Provider as NorthStar, teamsTheme } from "@fluentui/react-northstar";
import { configureStore } from "./redux/store";

initializeIcons();
ReactDOM.render(
  <React.StrictMode>
    <Provider store={configureStore()}>
      <NorthStar theme={teamsTheme}>
        <AuthenticationProvider>
          <DynamicThemeProvider>
            <App />
          </DynamicThemeProvider>
        </AuthenticationProvider>
      </NorthStar>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
// reportWebVitals(console.log);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
