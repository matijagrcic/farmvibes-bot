import React from "react";
import { setToStorage } from "helpers/utils";
import { Stack } from "@fluentui/react";
import { Button } from "@fluentui/react-northstar";
import { useLanguages } from "helpers/utilities";

export const LocaleSwitcher = ({ _onChange, locale }) => {
  const { languages } = useLanguages();
  return (
    <Stack
      horizontal
      horizontalAlign="end"
      verticalAlign="start"
      tokens={{
        childrenGap: 10,
        padding: 0,
      }}
    >
      {languages &&
        languages.map((language, i) => {
          return (
            <Button
              flat={true}
              circular
              key={`${language.code}-${i}`}
              content={language.code.toUpperCase()}
              onClick={(event) => {
                setToStorage("ux_locale", language.code);
                _onChange(event, language.code);
              }}
              primary={language.code === locale}
            />
          );
        })}
    </Stack>
  );
};
