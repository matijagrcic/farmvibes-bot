import React from "react";
import { Checkbox, Stack } from "@fluentui/react";
import {
  Checkbox as CheckboxNorth,
  reactionClassName,
} from "@fluentui/react-northstar";

export const CheckboxField = ({
  name,
  required = false,
  options = [],
  disabled = false,
  handleChange,
  variant,
  toggle = true,
  checkBoxstyle,
  horizontal = true,
}) => {
  const [selectedItems, setSelectedItems] = React.useState(() =>
    options.filter((option) => {
      return option.checked;
    })
  );
  const [toggled, setToggled] = React.useState(false);
  React.useEffect(
    () =>
      toggled &&
      handleChange(
        name,
        selectedItems.map((item) => {
          return options.filter((option) => option.label === item.label)[0].key;
        })
      ),
    [selectedItems]
  );
  return (
    <Stack horizontal={horizontal}>
      {options.map((option) => {
        if (variant === "northstar")
          return (
            <div key={`${option.key}-field`}>
              <CheckboxNorth
                label={option.label}
                key={option.key}
                toggle={toggle}
                name={name}
                disabled={disabled}
                required={required}
                onChange={(e, checked) => {
                  setSelectedItems((prev) => {
                    return checked.checked
                      ? [...prev, checked]
                      : selectedItems.filter(
                          (item) => item.label !== checked.label
                        );
                  });
                  setToggled(true);
                }}
                style={checkBoxstyle}
                checked={option.checked}
              />
            </div>
          );
        else
          return (
            <div key={option.key}>
              <Checkbox
                label={option.label}
                key={`${option.key}-field`}
                required={required}
                disabled={disabled}
                defaultChecked={option.checked}
                name={name}
                onChange={handleChange}
                style={checkBoxstyle}
              />
            </div>
          );
      })}
    </Stack>
  );
};
