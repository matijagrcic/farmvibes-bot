import React from "react";
import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";

export const AuthorizedRoute = ({ isPublic, children }) => {
  const isAuthenticated = useIsAuthenticated();
  const authorized = isPublic || isAuthenticated;
  if (!authorized) {
    return <Navigate to="/login" />;
  }
  return children;
};
