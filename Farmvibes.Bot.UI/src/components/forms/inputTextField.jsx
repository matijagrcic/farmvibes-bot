import React from "react";
import { TextField, Stack } from "@fluentui/react";
import {
  Input,
  NotepadPersonIcon,
  MenuButton,
  Button,
} from "@fluentui/react-northstar";
import { useIntl } from "react-intl";

export const InputTextField = ({
  name,
  placeholder,
  required = false,
  label,
  description,
  prefix,
  suffix,
  disabled = false,
  defaultValue,
  type,
  borderless,
  value,
  handleChange,
  variant = "default",
  icon,
  styles,
  inverted,
  onBlur,
  hasPlaceholders = false,
  personalisationFields,
  inputValidation,
  fieldAttributes,
  validationPattern,
}) => {
  const handlePlaceholderClick = (e, props) => {
    e.preventDefault();
    // Transforms.insertText(editor, ` #${props.content.split(" ")[1]}# `);
    handleChange(name, `${value} #${props.content.split(" ")[1]}# `);
  };

  const intl = useIntl();

  let error = inputValidation
    ? inputValidation.filter((f) => f.field === name)
    : [];

  return (
    <Stack>
      {variant === "default" && (
        <TextField
          label={label}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          description={description}
          suffix={suffix}
          prefix={prefix}
          name={name}
          defaultValue={defaultValue}
          onChange={handleChange}
          type={type}
          borderless={borderless}
          value={value}
          onBlur={(e) => {
            e.preventDefault();
            onBlur &&
              onBlur.forEach((f) => {
                if (f !== undefined)
                  f(e.currentTarget.name, e.currentTarget.value);
              });
          }}
        />
      )}
      {variant === "northstar" && (
        <>
          <Input
            required={required}
            label={label}
            type={type}
            icon={
              hasPlaceholders ? (
                <MenuButton
                  on="hover"
                  trigger={
                    <Button
                      icon={<NotepadPersonIcon />}
                      text
                      iconOnly
                      title={intl.formatMessage({
                        id: "general.form.personalisation",
                      })}
                    />
                  }
                  menu={[
                    {
                      key: "firstname",
                      content: intl.formatMessage({
                        id: "general.form.personalisation.firstname",
                      }),
                      onClick: handlePlaceholderClick,
                    },
                    {
                      key: "surname",
                      content: intl.formatMessage({
                        id: "general.form.personalisation.surname",
                      }),
                      onClick: handlePlaceholderClick,
                    },
                    ...personalisationFields,
                  ]}
                />
              ) : (
                icon
              )
            }
            inverted={inverted}
            styles={styles}
            disabled={disabled}
            fluid
            clearable={false}
            showSuccessIndicator={false}
            multiline="true"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            pattern={validationPattern}
            name={name}
            onBlur={(e) => {
              e.preventDefault();
              onBlur &&
                onBlur.forEach((f) => {
                  if (f !== undefined) f(e.currentTarget);
                });
            }}
            error={error.length > 0}
            {...fieldAttributes}
          />
        </>
      )}
    </Stack>
  );
};
