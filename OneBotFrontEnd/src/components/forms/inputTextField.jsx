import React from "react";
import { TextField, Stack, useTheme } from "@fluentui/react";
import { getFromStorage } from "helpers/utils";
import {
  Input,
  NotepadPersonIcon,
  MenuButton,
  Button,
} from "@fluentui/react-northstar";

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
  variables,
  onBlur,
  hasPlaceholders = false,
}) => {
  const { palette } = useTheme();
  const handlePlaceholderClick = (e, props) => {
    e.preventDefault();
    // Transforms.insertText(editor, ` #${props.content.split(" ")[1]}# `);
    handleChange(name, `${value} #${props.content.split(" ")[1]}# `);
  };
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
          onBlur={(e) => onBlur(e.currentTarget.name, e.currentTarget.value)}
        />
      )}
      {variant === "northstar" && (
        <Input
          required={required}
          label={label}
          icon={
            hasPlaceholders ? (
              <MenuButton
                on='hover'
                trigger={
                  <Button
                    icon={<NotepadPersonIcon />}
                    text
                    iconOnly
                    title='Insert personalisation placeholders'
                  />
                }
                menu={[
                  {
                    key: "firstname",
                    content: `Insert firstname`,
                    onClick: handlePlaceholderClick,
                  },
                  {
                    key: "surname",
                    content: `Insert surname`,
                    onClick: handlePlaceholderClick,
                  },
                  ...getFromStorage("reg").map((question) => {
                    return {
                      key: question.description,
                      content: `Insert ${question.description}`,
                      onClick: handlePlaceholderClick,
                    };
                  }),
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
          multiline='true'
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          name={name}
          type='string'
          onBlur={(e) => onBlur(e.currentTarget.name, e.currentTarget.value)}
        />
      )}
    </Stack>
  );
};
