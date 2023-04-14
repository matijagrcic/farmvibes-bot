import React from "react";
import { classNamesFunction, Stack, styled } from "@fluentui/react";
import { useIsAuthenticated } from "@azure/msal-react";
import { getLanguages } from "../../redux/actions";
import { Flex, FlexItem, Image, Text, Button } from "@fluentui/react-northstar";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";

const getClassNames = classNamesFunction();

const LoginForm = ({ theme, styles }) => {
  const isAuthenticated = useIsAuthenticated();

  const dispatch = useDispatch();
  const { instance } = useMsal();
  const intl = useIntl();

  const handleLogin = (loginType) => {
    if (loginType === "popup") {
      instance
        .loginPopup(loginRequest)
        .catch((e) => {
          console.log(e);
        })
        .then(() => {
          dispatch(getLanguages());
        });
    } else {
      instance.loginRedirect(loginRequest);
    }
  };

  const classNames = getClassNames(styles, { theme });

  return (
    <>
      {!isAuthenticated && (
        <Flex className={classNames.root} gap="gap.small">
          <FlexItem size="size.large" grow={7}>
            <Image
              src="https://live.staticflickr.com/4059/5154975822_659bc01ea2_b.jpg"
              alt="Farmer in the farm"
            />
          </FlexItem>
          <FlexItem size="size.large" grow={2}>
            <Flex className={classNames.auth}>
              <Text className={classNames.intro} weight={"regular"}>
                {intl.formatMessage({ id: "general.welcome" })}
              </Text>
              <Text className={classNames.title} success>
                {intl.formatMessage({ id: "general.app.name" })}
              </Text>

              <Button
                onClick={() => handleLogin("redirect")}
                content={intl.formatMessage({ id: "general.form.login" })}
                fluid
                style={{ color: "rgb(0, 0, 0)" }}
              />
              <Stack
                align="center"
                verticalAlign="end"
                style={{ minHeight: "300px" }}
              >
                <Text
                  content={intl.formatMessage({ id: "general.app.sponsor" })}
                  className={classNames.centered}
                />
                <Image
                  src="http://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2qVsJ.jpeg"
                  aria-label="Microsoft Logo"
                  style={{
                    width: "100%",
                    maxWidth: "10rem",
                    maxHeight: "5.5rem",
                    objectFit: "contain",
                    margin: "0 auto",
                    flex: "none",
                  }}
                />
              </Stack>
            </Flex>
          </FlexItem>
        </Flex>
      )}
    </>
  );
};

function getStyles({ theme }) {
  return {
    root: {
      height: "100vh",
      width: "100%",
    },
    auth: {
      margin: `${theme.spacing.l2} auto`,
      flexWrap: "wrap",
      flexDirection: "column",
      padding: "0 75px",
      display: "flex",
      alignSelf: "flex-end",
    },
    title: {
      ...theme.fonts.xxLargePlus,
      display: "block",
      fontSize: "65px",
      lineHeight: "50px",
      marginBottom: "18%",
      fontWeight: 500,
    },
    intro: {
      ...theme.fonts.xxLarge,
      fontWeight: 300,
      color: theme.palette.neutralSecondary,
    },
    centered: {
      alignItems: "center",
      color: theme.palette.neutralSecondary,
      display: "flex",
      justifyContent: "center",
    },
  };
}

export default styled(LoginForm, getStyles);
