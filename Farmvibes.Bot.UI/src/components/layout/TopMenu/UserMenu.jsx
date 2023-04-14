import React from "react";
import {
  Popup,
  Avatar,
  Flex,
  Text,
  Button,
  Divider,
} from "@fluentui/react-northstar";
import { useMsal } from "@azure/msal-react";
import { ThemeToggle } from "global/themes";
import { UXLanguageSwitcher } from "./UXLanguageSwitcher";
import { useIntl } from "react-intl";

export function UserMenu({ onLocaleChange }) {
  const { accounts, instance } = useMsal();
  const intl = useIntl();
  const name = accounts[0] && accounts[0].name;
  const email = accounts[0] && accounts[0].username;

  const handleLogout = (logoutType) => {
    const logoutRequest = {
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/", // redirects the top level app after logout
    };
    if (logoutType === "popup") {
      instance.logoutPopup(logoutRequest);
    } else {
      instance.logoutRedirect(logoutRequest);
    }
  };

  return (
    <Popup
      trigger={<Avatar name={name} styles={{ cursor: "pointer" }} />}
      content={
        <Flex column gap="gap.medium">
          <Flex space="between">
            <Text content="Door Training" />
            <Button
              onClick={() => handleLogout("redirect")}
              content={intl.formatMessage({ id: "general.form.logout" })}
              text
              styles={{
                fontWeight: "normal",
                justifyContent: "right",
                padding: "0px",
                marginTop: "-5px",
              }}
            />
          </Flex>
          <Flex gap="gap.small">
            <Avatar name={name} status="unknown" size="larger" />
            <Flex column vAlign="center">
              <Text content={name} weight="bold" />
              <Text content={email} size="small" />
            </Flex>
          </Flex>
          <Flex column gap="gap.medium">
            <Divider />
            <Text
              content={intl.formatMessage({ id: "user.default.theme" })}
              weight="semibold"
            />
            <Flex>
              <ThemeToggle />
            </Flex>
            <Divider />
            <Text
              content={intl.formatMessage({ id: "user.default.language" })}
              weight="semibold"
            />
            <Flex>
              <UXLanguageSwitcher onLocaleChange={onLocaleChange} />
            </Flex>
          </Flex>
        </Flex>
      }
    />
  );
}
