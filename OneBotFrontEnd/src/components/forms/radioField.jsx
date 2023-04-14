import React from "react";
import { ChoiceGroup, Stack } from "@fluentui/react";

export const RadioField = ({
  name,
  placeholder,
  required = false,
  label,
  options,
  description,
  disabled = false,
  defaultSelectedKey,
  handleChange,
}) => {
  return (
    <Stack>
      <ChoiceGroup
        label={label}
        required={required}
        options={options}
        disabled={disabled}
        placeholder={placeholder}
        description={description}
        defaultSelectedKey={defaultSelectedKey}
        name={name}
        onChange={handleChange}
      />
    </Stack>
  );
};
