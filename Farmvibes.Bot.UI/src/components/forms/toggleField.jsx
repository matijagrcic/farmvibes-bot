import React from "react";
import { Toggle, Stack } from "@fluentui/react";
import { RadioGroup, Divider } from "@fluentui/react-northstar";

export const ToggleField = ({
  name,
  defaultChecked = false,
  required = false,
  label,
  description,
  onText,
  disabled = false,
  offText,
  inlineLabel = "",
  handleChange,
  options,
  variant,
  checkedValue = "",
}) => {
  const handleSelect = (e, props) => {
    handleChange(name, props.value);
  };

  return (
    <Stack>
      {variant === "default" && (
        <Toggle
          label={label}
          required={required}
          disabled={disabled}
          defaultChecked={defaultChecked}
          onText={onText}
          offText={offText}
          description={description}
          name={name}
          onChange={handleChange}
        />
      )}
      {variant === "northstar" && (
        <div
          style={{
            maxWidth: "400px",
          }}
        >
          {label}
          <Divider />
          <RadioGroup
            defaultCheckedValue={checkedValue}
            items={options}
            onCheckedValueChange={handleSelect}
          />
        </div>
      )}
    </Stack>
  );
};
