import React, { createContext, useState, useContext } from "react";

const themes = {
  light: {
    background: "#fff",
    text: "#000",
    primary: "#005370",
    accent: "#f9c73f",
    mode: "light",
  },
  dark: {
    background: "#121212",
    text: "#fff",
    primary: "#f9c73f",
    accent: "#005370",
    mode: "dark",
  },
};

type Theme = typeof themes.light;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme: isDark ? themes.dark : themes.light, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
