import { ROUTER_BASE_URL } from "global/defaultValues";

if (!window.location.pathname.includes(ROUTER_BASE_URL)) {
  window.history.replaceState(
    "",
    "",
    ROUTER_BASE_URL + window.location.pathname
  );
}
