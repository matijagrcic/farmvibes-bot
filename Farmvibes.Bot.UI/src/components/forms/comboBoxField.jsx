import React from "react";
import { ComboBox, Stack } from "@fluentui/react";
import { Dropdown } from "@fluentui/react-northstar";

export const ComboBoxField = ({
  name,
  placeholder,
  required = false,
  label,
  description,
  options,
  disabled = false,
  defaultSelectedKeys,
  multiSelect,
  autoComplete = "on",
  allowFreeform = true,
  handleChange,
  values,
  variant = "default",
  searchFunction,
}) => {
  const comboBoxRef = React.useRef(null);
  const [selectedKey, setSelectedKey] = React.useState("");
  const [inputName, setInputName] = React.useState("");
  const updateValue = (event, option) => {
    setSelectedKey(option.key);
    values[inputName] = option.key;
  };
  const onClick = React.useCallback(() => comboBoxRef.current?.focus(true), []);
  React.useEffect(() => {
    setInputName(name);
  }, [name]);
  return (
    <Stack>
      {variant == "default" && (
        <ComboBox
          label={label}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          description={description}
          options={options}
          autoComplete={autoComplete}
          allowFreeform={allowFreeform}
          defaultSelectedKeys={defaultSelectedKeys}
          multiSelect={multiSelect}
          name={name}
          onChange={updateValue}
          selectedKey={selectedKey}
          onClick={onClick}
          componentRef={comboBoxRef}
          pickerSuggestionsProps={{
            suggestionsHeaderText: "Suggested Options",
            noResultsFoundText: "No options were found",
          }}
        />
      )}
      {variant == "northstar" && (
        <Dropdown
          search
          fluid
          label={label}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          items={options}
          onChange={(event, itm) => {
            handleChange(itm.name, itm.value.content);
          }}
          defaultActiveSelectedIndex={defaultSelectedKeys}
          noResultsMessage={"No options were found"}
          name={name}
        />
      )}
    </Stack>
  );
};
