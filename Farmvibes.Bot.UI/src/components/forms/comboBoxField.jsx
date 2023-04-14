import React from "react";
import { ComboBox } from "@fluentui/react";
import { Dropdown, Flex, Text } from "@fluentui/react-northstar";
import { useIntl } from "react-intl";

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
  allowFreeform = false,
  handleChange,
  handleSearchQuery,
  values,
  variant = "default",
  hint,
  onBlur,
}) => {
  const comboBoxRef = React.useRef(null);
  const intl = useIntl();
  const [selectedOpt, setSelectedOpt] = React.useState(null);
  const [selectedKey, setSelectedKey] = React.useState(-1);
  const [inputName, setInputName] = React.useState(-1);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const updateValue = (_event, option) => {
    setSelectedKey(option.key);
    values[inputName] = option.key;
  };
  const onClick = React.useCallback(() => comboBoxRef.current?.focus(true), []);
  const [searchQuery, setSearchQuery] = React.useState("");
  React.useEffect(() => {
    setInputName(name);
  }, [name]);

  React.useEffect(() => {
    if (items === undefined) return;
    setSelectedOpt(items.filter((itm) => itm.key === defaultSelectedKeys)[0]);
    setSelectedKey(items.findIndex((itm) => itm.key === defaultSelectedKeys));
  }, [items, defaultSelectedKeys]);

  React.useEffect(() => {
    Array.isArray(options)
      ? setItems(options)
      : Promise.resolve(options)
          .catch(() => {})
          .then((response) => {
            setItems(response);
          });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex fill column>
      {variant === "default" && (
        <ComboBox
          label={label}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          description={description}
          options={items}
          autoComplete={autoComplete}
          allowFreeform={allowFreeform}
          value={defaultSelectedKeys}
          multiSelect={multiSelect}
          name={name}
          onChange={updateValue}
          selectedKey={selectedKey}
          onClick={onClick}
          componentRef={comboBoxRef}
          pickerSuggestionsProps={{
            suggestionsHeaderText: intl.formatMessage({
              id: "general.form.select.options",
            }),
            noResultsFoundText: intl.formatMessage({
              id: "general.form.select.nooptions",
            }),
          }}
        />
      )}
      {variant === "northstar" && (
        <>
          {label}
          <Dropdown
            search={handleSearchQuery ? true : false}
            allowFreeform
            fluid
            inline
            checkable
            loading={loading}
            label={label}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            items={items}
            value={selectedOpt}
            defaultActiveSelectedIndex={selectedKey}
            searchQuery={searchQuery}
            onSearchQueryChange={(_event, data) => {
              if (handleSearchQuery === undefined) return;
              setLoading(true);
              Promise.resolve(handleSearchQuery(data))
                .catch((e) => console.log({ e }))
                .then((result) => {
                  setLoading(false);
                  if (result) setItems(result);
                  else return;
                });
              setSearchQuery(data.searchQuery);
            }}
            onChange={(_event, itm) => {
              handleChange(itm.name, itm.value.key);
            }}
            noResultsMessage={intl.formatMessage({
              id: "general.form.select.nooptions",
            })}
            name={name}
            onBlur={(e, v) =>
              onBlur &&
              onBlur.forEach((f) => {
                if (f !== undefined)
                  f(v.name, v.searchQuery ? v.searchQuery : v.value);
              })
            }
          />
          <Text temporary content={hint} />
        </>
      )}
    </Flex>
  );
};
