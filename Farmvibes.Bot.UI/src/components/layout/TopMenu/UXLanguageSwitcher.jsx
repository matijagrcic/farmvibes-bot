import { Stack } from "@fluentui/react";
import { Button, Dropdown } from "@fluentui/react-northstar";
import { useLanguages } from "helpers/utilities";
import useLocalStorage from "helpers/utilities/useLocalStorage";
import * as React from "react";

export const UXLanguageSwitcher = ({ onLocaleChange }) => {
  const { languages } = useLanguages();
  const [locale] = useLocalStorage("locale");
  const [options, setOptions] = React.useState([]);
  React.useEffect(() => {
    if (languages) {
      setOptions(
        languages.reduce((arr, lang) => {
          try {
            if (require(`lang/${lang.code}.json`)) {
              let obj = {
                key: lang.code,
                content: lang.translations[locale]?.name,
                header: lang.code.toUpperCase(),
              };
              arr.push(obj);
            }
            return arr;
          } catch (err) {
            return arr;
          }
        }, [])
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);
  return options.length < 5 ? (
    <>
      <Dropdown
        items={options}
        inline
        checkable
        onChange={(_e, v) => {
          onLocaleChange(v.value.key);
          return;
        }}
        defaultValue={locale.toUpperCase()}
      />
    </>
  ) : (
    <Stack
      horizontal
      horizontalAlign="end"
      verticalAlign="start"
      tokens={{
        childrenGap: 10,
        padding: 0,
      }}
    >
      {options.forEach((language, i) => (
        <Button
          flat={true}
          circular
          key={`${language.key}-${i}`}
          content={language.key.toUpperCase()}
          onClick={(_e, v) => onLocaleChange(language.key)}
          primary={language.key === locale}
        />
      ))}
    </Stack>
  );
};
