import React from "react";
import { Dropdown, Stack } from "@fluentui/react";
import { reactionClassName } from "@fluentui/react-northstar";

export const DropDownField = ({
  name,
  placeholder,
  required = false,
  label,
  description,
  options,
  disabled = false,
  defaultSelectedKeys,
  defaultSelectedKey,
  multiSelect = false,
  handleChange,
  styles,
}) => {
  const [selectedItems, setSelectedItems] = React.useState([]);

  React.useEffect(() => {
    if (selectedItems.length > 0)
      handleChange(
        name,
        selectedItems.map((selected) => {
          return selected.key;
        })
      );
  }, [selectedItems]);

  React.useEffect(() => {
    if (
      defaultSelectedKey !== undefined &&
      typeof defaultSelectedKey === "string"
    )
      setSelectedItems(
        options.filter((option) => {
          return option.key === defaultSelectedKey;
        })
      );
  }, [defaultSelectedKey]);

  return (
    <Stack>
      <Dropdown
        label={label}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        description={description}
        options={options}
        selectedKey={defaultSelectedKey}
        defaultSelectedKeys={defaultSelectedKeys}
        multiSelect={multiSelect}
        name={name}
        onChange={(event, item) => {
          setSelectedItems((prev) => {
            if (multiSelect) {
              return item.selected
                ? [...prev, item.key]
                : prev.filter((key) => key !== item.key);
            } else {
              return [item];
            }
          });
        }}
        styles={styles}
      />
    </Stack>
  );
};
