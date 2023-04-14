import { backendPath, defaultAuthState } from "../global/defaultValues";
import { getFromStorage, setToStorage } from "./utils";

// const cache = {};
const request = async ({
  url,
  params = {},
  method = "GET",
  local,
  json,
  blob,
}) => {
  // Quick return from cache.
  // const cacheKey = JSON.stringify({ url, params, method });
  // if (cache[cacheKey]) {
  //   return cache[cacheKey];
  // }

  const headers = new Headers();
  if (json) headers.append("Content-Type", "application/json");

  //Let's apply token to requests if user is authenticated
  if (
    getFromStorage("user") !== null &&
    Object.entries(getFromStorage("user")).length > 0
  )
    headers.append("Authorization", `Bearer ${getFromStorage("user").token}`);

  const options = {
    method,
    headers,
  };
  let uri = local ? backendPath + url : url;
  if (method === "GET") {
    if (Object.entries(params).length > 0)
      uri += `?${new URLSearchParams(params).toString()}`;
  } else if (json) options.body = JSON.stringify(params);
  else options.body = params;

  if (blob) options.responseType = "blob";

  const result = await fetch(uri, options);

  if (!result.ok) {
    /*User's token has expired, let's take them back to sign in */
    if (result.status === 401 && !window.location.pathname.includes("login")) {
      setToStorage("user");
      window.sessionStorage.setItem("authentication", defaultAuthState);
      setTimeout((window.location = "/admin/login"));
    } else {
      return result.json();
    }
  } else {
    if (result.status !== 204) {
      if (blob) return result.blob();
      else return result.json();
    } else {
      return JSON.stringify({ status: result.status });
    }
  }

  // cache[cacheKey] = result;
};

export const get = ({ url, params, local = true, json = true, blob = false }) =>
  request({ url, params, method: "GET", local, json, blob });
export const post = (url, params, local = true, json = true) =>
  request({ url, params, method: "POST", local, json });
export const remove = (url, params, local = true, json = true) =>
  request({ url, params, method: "DELETE", local, json });
export const patch = (url, params, local = true, json = true) =>
  request({ url, params, method: "PATCH", local, json });
