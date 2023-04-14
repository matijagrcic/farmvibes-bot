import React from "react";
import { Checkbox, Stack } from "@fluentui/react";
import { Checkbox as CheckboxNorth } from "@fluentui/react-northstar";

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
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    if (Array.isArray(options)) {
      setItems(options);
    } else {
      Promise.resolve(options)
        .catch(() => {})
        .then((response) => {
          setItems(response);
        });
    }
  }, [options]);

  return (
    <Stack horizontal={horizontal}>
      {items &&
        items.map((option) => {
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
                    handleChange(name, {
                      ...items.filter((opt) => opt.label === checked.label)[0],
                      ...checked,
                    });
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
