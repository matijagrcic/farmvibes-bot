import React from "react";
import { getFromStorage } from "helpers/utils";
import { Stack } from "@fluentui/react";
import { Button } from "@fluentui/react-northstar";

export const LocaleSwitcher = ({ locale, _onChange, disabled }) => {
  return (
    <Stack
      horizontal
      horizontalAlign='end'
      verticalAlign='start'
      tokens={{
        childrenGap: 10,
        padding: 0,
      }}
    >
      {getFromStorage("languages").map((language, i) => {
        return (
          <Button
            flat={true}
            key={`${language.code}-${i}`}
            content={language.name}
            onClick={(event) => _onChange(event, language.code)}
            primary={language.code === locale}
          />
        );
      })}
    </Stack>
  );
};
