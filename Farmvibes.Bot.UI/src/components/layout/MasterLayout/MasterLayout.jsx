import React from "react";
import { Stack, styled, classNamesFunction } from "@fluentui/react";
import { Provider } from "@fluentui/react-northstar";
import { Sidebar } from "../Sidebar";
import { TopMenu } from "../TopMenu";

const getStyles = ({ theme }) => {
  return {
    root: {},
    sidebar: {},
    contentWrapper: {
      paddingLeft: theme.spacing.l2,
      paddingRight: theme.spacing.l2,
    },
  };
};

const getClassNames = classNamesFunction();

function MasterLayoutComponent({ children, theme, styles, onLocaleChange }) {
  const classNames = getClassNames(styles, { theme });
  const customNorthStar = {
    siteVariables: {
      colors: {
        brand: {
          300: theme.palette.themeLighter,
          400: theme.palette.themeLight,
          450: theme.palette.themeTertiary,
          500: theme.palette.themeSecondary,
          600: theme.palette.themePrimary,
          700: theme.palette.themeDarkAlt,
          800: theme.palette.themeDark,
          900: theme.palette.themeDarker,
        },
      },
      colorScheme: {
        default: {
          background: theme.palette.white,
        },
        brand: {
          background: theme.palette.themePrimary,
          backgroundHover: theme.palette.themeDarkAlt,
          backgroundPressed: theme.palette.neutralLight,
          borderFocus1: theme.palette.themeDarkAlt,
          foreground: theme.palette.themePrimary,
          backgroundActive1: theme.palette.themePrimary,
        },
      },
    },
  };
  return (
    <Provider theme={customNorthStar}>
      <Stack horizontal className={classNames.root}>
        <Stack.Item grow={false} className={classNames.sidebar}>
          <Sidebar />
        </Stack.Item>
        <Stack.Item grow={true}>
          <TopMenu onLocaleChange={onLocaleChange} />
          <Stack className={classNames.contentWrapper}>{children}</Stack>
        </Stack.Item>
      </Stack>
    </Provider>
  );
}

export const MasterLayout = styled(MasterLayoutComponent, getStyles);
