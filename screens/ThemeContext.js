import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [splashMessage, setSplashMessage] = useState("");

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const setDefaultTheme = () => {
    setIsDarkMode(null); // Set to null to use default theme based on device system theme
  };

  useEffect(() => {
    if (isDarkMode === true) {
      setSplashMessage("Welcome to Dark Side");
    } else if (isDarkMode === false) {
      setSplashMessage("Welcome to Light Side");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setDefaultTheme,
        splashMessage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
