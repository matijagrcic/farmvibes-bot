import React from "react";
import { useSessionStorage } from "react-use";
import { setToStorage } from "helpers/utils";
import { defaultAuthState } from "./defaultValues";

const STOREGE_KEY = "authentication";

export const AuthenticationContext = React.createContext(defaultAuthState);

export function AuthenticationProvider({ children }) {
  const [authentication, setAuthentication] = useSessionStorage(
    STOREGE_KEY,
    defaultAuthState
  );

  const login = (principal) =>
    setAuthentication({ isAuthenticated: true, principal });

  const logout = () => {
    setToStorage("user");
    setAuthentication(defaultAuthState);
  };

  const authenticationValue = { ...authentication, login, logout };

  return (
    <AuthenticationContext.Provider value={authenticationValue}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthentication() {
  return React.useContext(AuthenticationContext);
}
