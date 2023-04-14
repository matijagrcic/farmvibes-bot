import React from "react";
import { Stack, Separator, ActionButton } from "@fluentui/react";

export const ArrayField = ({
  name,
  required = false,
  label,
  description,
  addFieldRow,
  disabled = false,
  fieldsFunction,
  fields,
  addIcon,
  addText = "New item",
  locale,
  value,
}) => {
  return (
    <Stack>
      <h3>{label}</h3>
      {description && <p>{description}</p>}
      <Stack
        // className={{ padding: "0 10px 10px 10px" }}
        tokens={{ childrenGap: 15 }}
      >
        {fieldsFunction(fields, locale, name)}
        <Separator />
        <ActionButton
          iconProps={addIcon}
          text={addText}
          onClick={addFieldRow}
        />
      </Stack>
    </Stack>
  );
};
