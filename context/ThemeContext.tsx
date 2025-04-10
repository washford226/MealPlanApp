import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance } from 'react-native';

const lightTheme = {
  background: '#ffffff',
  text: '#000000',
  button: '#007bff',
  buttonText: '#ffffff',
};

const darkTheme = {
  background: '#000000',
  text: '#ffffff',
  button: '#444444',
  buttonText: '#ffffff',
};

const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(
    Appearance.getColorScheme() === 'dark' ? darkTheme : lightTheme
  );

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => listener.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);