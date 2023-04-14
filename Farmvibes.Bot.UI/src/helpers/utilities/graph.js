import { loginRequest, graphConfig } from "../authConfig";
import * as App from "../index";

export async function callMsGraph(accessToken) {
  const instance = App.msalInstance;
  if (!accessToken) {
    const account = instance.getActiveAccount();
    if (!account) {
      throw Error(
        "No active account! Verify a user has been signed in and setActiveAccount has been called."
      );
    }

    const response = await instance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });
    accessToken = response.accessToken;
  }

  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
