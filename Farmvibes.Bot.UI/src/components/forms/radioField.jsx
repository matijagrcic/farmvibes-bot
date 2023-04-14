import React from "react";
import { ChoiceGroup, Stack } from "@fluentui/react";
import { RadioGroup } from "@fluentui/react-northstar";

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
  variant = "default",
}) => {
  return (
    <Stack>
      {variant === "default" ? (
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
      ) : (
        <RadioGroup
          defaultCheckedValue={defaultSelectedKey}
          items={options}
          onCheckedValueChange={handleChange}
        />
      )}
    </Stack>
  );
};
