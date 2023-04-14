import React from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { MasterLayout } from "./MasterLayout";
import { BlankLayout } from "./BlankLayout";

export function AutoSwitchLayout({ children, onLocaleChange }) {
  return (
    <>
      <AuthenticatedTemplate>
        <MasterLayout onLocaleChange={onLocaleChange}>{children}</MasterLayout>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <BlankLayout>{children}</BlankLayout>
      </UnauthenticatedTemplate>
    </>
  );
}
