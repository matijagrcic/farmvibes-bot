import React from "react";
import { TextField, Stack } from "@fluentui/react";
import { Text, TextArea } from "@fluentui/react-northstar";

export const TextareaField = ({
  name,
  placeholder,
  required = false,
  label,
  description,
  disabled = false,
  multiline = true,
  rows = 3,
  defaultValue,
  variant = "default",
  maxLength,
  onBlur,
  value,
  _handleValidation,
  handleChange,
  hint,
  personalisationFields,
  height,
}) => (
  <Stack>
    {variant === "default" && (
      <>
        <TextField
          validateOnFocusOut={true}
          label={label}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          description={description}
          multiline={multiline}
          rows={rows}
          name={name}
          onChange={handleChange}
          defaultValue={defaultValue}
          autoAdjustHeight
          maxLength={maxLength}
          onBlur={(e) => {
            e.preventDefault();
            onBlur &&
              onBlur.forEach((f) => {
                if (f !== undefined) f(e.currentTarget);
              });
          }}
          onGetErrorMessage={(value) =>
            required ? _handleValidation(value, maxLength) : ""
          }
          validateOnLoad={false}
          value={value}
        />
        <Text color="grey" content={hint} disabled temporary />{" "}
      </>
    )}
    {variant === "northstar" && (
      <>
        <Text content={label} />
        <TextArea
          onChange={handleChange}
          fluid
          defaultValue={value}
          required={required}
          name={name}
          variables={{
            height,
          }}
          onBlur={(e) => {
            e.preventDefault();
            onBlur &&
              onBlur.forEach((f) => {
                if (f !== undefined) f(e.currentTarget);
              });
          }}
        />
      </>
    )}
  </Stack>
);
