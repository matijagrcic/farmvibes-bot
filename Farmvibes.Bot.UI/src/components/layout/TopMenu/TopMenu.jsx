import React from "react";
import { Stack, styled, classNamesFunction } from "@fluentui/react";
import { UserMenu } from "./UserMenu";

const getStyles = ({ theme }) => {
  return {
    root: {
      borderBottomStyle: "solid",
      borderBottomColor: theme.semanticColors.bodyFrameDivider,
      borderBottomWidth: 1,
      padding: theme.spacing.s1,
      height: 48,
      backgroundColor: theme.palette.themeDarkAlt,
    },
  };
};

const getClassNames = classNamesFunction();

function TopMenuComponent({ styles, theme, onLocaleChange }) {
  const classNames = getClassNames(styles, { theme });
  return (
    <Stack
      horizontal
      horizontalAlign="end"
      className={classNames.root}
      tokens={{ childrenGap: "1em" }}
    >
      <UserMenu onLocaleChange={onLocaleChange} />
    </Stack>
  );
}

export const TopMenu = styled(TopMenuComponent, getStyles);
