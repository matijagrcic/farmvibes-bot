import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";

import { initializeIcons } from "@fluentui/react/lib/Icons";

import { DynamicThemeProvider } from "./global/themes";
import { Provider } from "react-redux";
import { Provider as NorthStar, teamsTheme } from "@fluentui/react-northstar";
import { configureStore } from "./redux/store";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

initializeIcons();
export const msalInstance = new PublicClientApplication(msalConfig);
// Default to using the first account if no account is active on page load
if (
  !msalInstance.getActiveAccount() &&
  msalInstance.getAllAccounts().length > 0
) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Optional - This will update account state if a user signs in from another tab or window
msalInstance.enableAccountStorageEvents();

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <Router basename={"/admin"}>
    <Provider store={configureStore()}>
      <NorthStar theme={teamsTheme}>
        <DynamicThemeProvider>
          <App pca={msalInstance} />
        </DynamicThemeProvider>
      </NorthStar>
    </Provider>
  </Router>
);
// reportWebVitals(console.log);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
