import React from "react";
import {
  classNamesFunction,
  Link,
  PrimaryButton,
  Stack,
  styled,
  TextField,
} from "@fluentui/react";
import { useBoolean } from "react-use";
import { Alert } from "@fluentui/react-northstar";
import { get } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { useHistory, useLocation } from "react-router-dom";
import { useAuthentication } from "global/authentication";
import { loginUser } from "../../redux/actions";
import { connect } from "react-redux";
import { getFromStorage } from "helpers/utils";
import { Flex, FlexItem, Image, Text } from "@fluentui/react-northstar";

const getClassNames = classNamesFunction();

function LoginForm({ theme, styles, loginUserAction, error }) {
  const { isAuthenticated, login } = useAuthentication();
  const [visible, setVisible] = useBoolean({
    name: "visible",
    initialValue: true,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  // const [error, setError] = React.useState();
  const history = useHistory();
  const location = useLocation();

  const from = location.state?.from || { pathname: "/" };

  function onSubmit(values) {
    if (values.username !== "" && values.password !== "") {
      loginUserAction(values);
      setTimeout(function () {
        if (
          getFromStorage("user") !== null &&
          Object.entries(getFromStorage("user")).length > 0
        ) {
          login(getFromStorage("user"));
          history.replace(from);
        }
      }, 2000);
    }
  }

  function getErrorMessage(name) {
    return get(errors, name + ".message");
  }

  const classNames = getClassNames(styles, { theme });
  return (
    <>
      {!isAuthenticated && (
        <Flex className={classNames.root} gap='gap.small'>
          <FlexItem size='size.large' grow={7}>
            <Image
              src='https://live.staticflickr.com/4059/5154975822_659bc01ea2_b.jpg'
              alt='Farmer in the farm'
            />
          </FlexItem>
          <FlexItem size='size.large' grow={2}>
            <Flex className={classNames.auth}>
              <Text className={classNames.intro} weight={"regular"}>
                Welcome to
              </Text>
              <Text className={classNames.title} success>
                Msaidizi
              </Text>
              {error && (
                <Alert
                  content={error}
                  danger
                  onVisibleChange={() => setVisible(false)}
                  dismissAction={{
                    "aria-label": "close",
                  }}
                  dismissible
                  header='Unable to log you in: '
                  visible={visible}
                />
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack
                  tokens={{
                    childrenGap: "4em",
                  }}
                  style={{ paddingTop: "40px" }}
                >
                  <Controller
                    as={TextField}
                    control={control}
                    autoComplete='username'
                    autoFocus
                    minLength={3}
                    maxLength={32}
                    defaultValue=''
                    name='username'
                    rules={{
                      required: "Please enter your username",
                      minLength: {
                        value: 3,
                        message: "Please enter your username",
                      },
                      maxLength: { value: 32, message: "Username is too long" },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        underlined
                        label='Username'
                        errorMessage={getErrorMessage("username")}
                      />
                    )}
                  />

                  <Controller
                    name='password'
                    control={control}
                    defaultValue=''
                    minLength={4}
                    maxLength={64}
                    rules={{
                      required: "Please enter your password",
                      minLength: {
                        value: 4,
                        message: "Please enter your password",
                      },
                      maxLength: { value: 64, message: "Password is too long" },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Password'
                        type='password'
                        underlined
                        autoComplete='current-password'
                        errorMessage={getErrorMessage("password")}
                      />
                    )}
                  />

                  <Stack
                    horizontal
                    horizontalAlign='end'
                    tokens={{ childrenGap: "1em" }}
                  >
                    <Link style={{ color: theme.palette.neutralTertiary }}>
                      Reset password
                    </Link>
                    <PrimaryButton type='submit'>Login</PrimaryButton>
                  </Stack>
                </Stack>
              </form>
              <Stack
                align='center'
                verticalAlign='end'
                style={{ minHeight: "300px" }}
              >
                <Text content='Powered by' className={classNames.centered} />
                <Image
                  src='http://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE2qVsJ.jpeg'
                  aria-label='Microsoft Logo'
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
}

function getStyles({ theme }) {
  return {
    root: {
      height: "100vh",
    },
    auth: {
      // margin: `${theme.spacing.l2} auto`,
      flexWrap: "wrap",
      flexDirection: "column",
      padding: "0 75px",
      width: "100%",
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

const mapStateToProps = ({ authUser }) => {
  const { loading, error } = authUser;
  return { loading, error };
};

export default connect(mapStateToProps, {
  loginUserAction: loginUser,
})(styled(LoginForm, getStyles));
