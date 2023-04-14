import React, { Suspense } from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ProgressIndicator, styled } from "@fluentui/react";
import { get, isArray, isNil, flattenDeep } from "lodash";
import { CustomNavigationClient } from "helpers/utilities";
import path from "path";
import { AutoSwitchLayout } from "./components/layout";
import { MsalProvider } from "@azure/msal-react";
import "helpers/utilities/ensureBasename";
import { useLocalStorage } from "react-use";
import {
  AuthorizedRoute,
  RouteIndexList,
  ComingSoon,
  NoMatch,
} from "./components/route";
import { hierarchize } from "./global/hierarchical";
import routes from "./routes";
import { getFromStorage } from "helpers/utils";

const keyName = "key";
const pathName = "path";
const uniqueKeyName = "uniqueKey";

async function loadMessages(locale) {
  try {
    return require(`lang/${locale}.json`);
  } catch (err) {
    return import("lang/en.json");
  }
}

function generateRoutePath(node, parent) {
  const parentUniqueKey = get(parent, uniqueKeyName);
  const uniqueKey = parentUniqueKey
    ? parentUniqueKey + "." + node[keyName]
    : node[keyName];

  const parentPath = get(parent, pathName, "");
  const routePath = get(node, pathName, path.join(parentPath, node[keyName]));
  node[uniqueKeyName] = uniqueKey;
  node[pathName] = routePath;
}

function renderRoute(route) {
  const isGroup = isArray(route.children);
  const PageComponent = isNil(route.component)
    ? isGroup
      ? RouteIndexList
      : ComingSoon
    : route.component;

  const routeComponent = (
    <Route
      exact
      path={`${route.path}/*`}
      key={route.uniqueKey}
      element={
        <AuthorizedRoute children={route.children} isPublic={route.isPublic}>
          <PageComponent route={route} />
        </AuthorizedRoute>
      }
    />
  );

  const childComponents = isGroup ? route.children.map(renderRoute) : [];
  return [routeComponent, ...childComponents];
}

function App({ theme, pca }) {
  const navigate = useNavigate();
  const navigationClient = new CustomNavigationClient(navigate);
  pca.setNavigationClient(navigationClient);
  //We will use the top level language codes at the moment.
  let initLocale =
    getFromStorage("locale") ||
    navigator.language.substring(0, navigator.language.indexOf("-"));
  const { semanticColors } = theme;
  React.useLayoutEffect(() => {
    document.body.style.backgroundColor = semanticColors.bodyBackground;
    document.body.style.color = semanticColors.bodyText;
  }, [semanticColors]);

  const routeList = hierarchize(routes, null, generateRoutePath);

  const routeComponents = renderRoute(routeList);
  const flatRouteComponents = flattenDeep(routeComponents);
  const [locale, setLocale] = useLocalStorage("locale", initLocale);
  const [messages, setMessages] = React.useState(null);

  React.useEffect(() => {
    // if (!getFromStorage("locale")) setToStorage("locale", locale);
    loadMessages(locale).then(setMessages);
  }, [locale]);

  return messages ? (
    <MsalProvider instance={pca}>
      <IntlProvider locale={locale} messages={messages}>
        <AutoSwitchLayout
          onLocaleChange={(locale) => {
            setLocale(locale);
          }}
        >
          <Suspense
            fallback={
              <ProgressIndicator
                label={<FormattedMessage id="general.page.loading" />}
              />
            }
          >
            <Routes>
              {flatRouteComponents}
              <Route path="*" element={<NoMatch />} />
            </Routes>
          </Suspense>
        </AutoSwitchLayout>
      </IntlProvider>
    </MsalProvider>
  ) : null;
}

export default styled(App);
