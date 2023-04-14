import React from "react";
import {
  DefaultTheme,
  TeamsTheme,
  WordTheme,
} from "@fluentui/theme-samples";
import { ThemeProvider } from "@fluentui/react";
import { Button } from "@fluentui/react-northstar";
import { useLocalStorage } from "react-use";
import { capitaliseSentense } from "helpers/utils";

export const themes = {
  default: DefaultTheme,
  // dark: DarkTheme,
  teams: TeamsTheme,
  word: WordTheme,
};

export const ThemeContext = React.createContext({
  theme: "dark",
  changeTheme: (name) => {},
});

export const useTheme = () => React.useContext(ThemeContext);

function ThemeConsumer({ children }) {
  const { theme } = useTheme();
  return <ThemeProvider theme={themes[theme]}>{children}</ThemeProvider>;
}

export function DynamicThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage("theme", "default");

  const changeTheme = (name) => themes[name] && setTheme(name);
  const themeContextValue = { theme, changeTheme };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeConsumer>{children}</ThemeConsumer>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, changeTheme } = useTheme();
  return Object.keys(themes).map((key) => (
    <Button
      text
      key={key}
      content={capitaliseSentense(key)}
      primary={theme === key}
      flat
      onClick={() => changeTheme(key)}
    />
  ));
}
