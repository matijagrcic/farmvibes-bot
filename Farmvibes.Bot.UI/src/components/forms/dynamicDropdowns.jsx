import * as React from "react";
import { Text, Dropdown } from "@fluentui/react-northstar";
import { useIntl } from "react-intl";

export const DynamicDropdowns = ({
  options,
  onChange,
  index,
  label,
  paths,
  isLast,
  disabled,
  constraint,
  level,
  loading,
  fieldVal,
}) => {
  const intl = useIntl();
  return (
    <>
      <Text content={label} styles={{ marginTop: "20px", display: "block" }} />
      {
        <Dropdown
          multiple={isLast}
          search={isLast}
          loading={loading}
          disabled={disabled}
          loadingMessage={intl.formatMessage(
            { id: "general.loading" },
            { subject: "" }
          )}
          placeholder={intl.formatMessage({
            id: "general.form.select.filteroptions",
          })}
          fluid
          checkable
          defaultValue={
            isLast
              ? () => {
                  if (fieldVal !== undefined) {
                    return fieldVal.map((v) => {
                      return { header: v };
                    });
                  }
                }
              : fieldVal
          }
          items={options}
          constraint={constraint}
          onChange={(_ev, el) => {
            onChange({
              value: el.value,
              paths,
              isLast,
              index,
              constraint,
              level,
            });
            return;
          }}
        />
      }
    </>
  );
};
