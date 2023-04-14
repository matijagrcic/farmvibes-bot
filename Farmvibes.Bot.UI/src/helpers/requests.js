import * as App from "../index";
import { backendPath } from "../global/defaultValues";
import { getToken, isTokenExpired } from "./utils";
import { loginRequest } from "../authConfig";

const request = async ({
  url,
  params = {},
  method = "GET",
  local,
  json,
  blob,
}) => {
  const instance = App.msalInstance;

  let accessToken = getToken(instance);
  let isValidToken = isTokenExpired(accessToken);
  if (isValidToken) {
    return await makeRequest({
      accessToken,
      json,
      params,
      method,
      blob,
      url,
      local,
    }).then((r) => {
      return r;
    });
  } else {
    //MSAL has a problem, it will return expired token instead of renewed so to remedy situation,
    //let's go back to log-in page.
    return instance
      .loginPopup(loginRequest)
      .catch((e) => {
        console.log(e);
      })
      .then(async () => {
        accessToken = getToken(instance);
        return await makeRequest({
          accessToken,
          json,
          params,
          method,
          blob,
          url,
          local,
        }).then((r) => r);
      });
  }
};

const makeRequest = async ({
  accessToken,
  params,
  method,
  json,
  blob,
  url,
  local,
}) => {
  const headers = new Headers();
  if (json) headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${accessToken}`);
  const options = {
    method,
    headers,
  };

  let uri = local ? backendPath + url : url;
  if (method === "GET") {
    if (Object.entries(params).length > 0)
      uri += url.includes("?")
        ? `&${new URLSearchParams(params).toString()}`
        : `?${new URLSearchParams(params).toString()}`;
  } else if (json) options.body = JSON.stringify(params);
  else options.body = params;

  if (blob) options.responseType = "blob";

  const result = await fetch(uri, options);

  if (result.status !== 204) {
    if (blob) return result.blob();
    else return result.json();
  } else {
    return JSON.stringify({ status: result.status });
  }
};

export async function get({
  url,
  params,
  local = true,
  json = true,
  blob = false,
}) {
  let res = await request({ url, params, method: "GET", local, json, blob });
  return res;
}
export const post = (url, params, local = true, json = true) =>
  request({ url, params, method: "POST", local, json });
export const remove = (url, params, local = true, json = true) =>
  request({ url, params, method: "DELETE", local, json });
export const patch = (url, params, local = true, json = true) =>
  request({ url, params, method: "PATCH", local, json });
