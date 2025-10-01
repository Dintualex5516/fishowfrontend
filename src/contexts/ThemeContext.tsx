import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then default to light
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      console.log('Using saved theme:', savedTheme);
      return savedTheme;
    }
    console.log('Using default light theme');
    return 'light';
  });

  useEffect(() => {
    console.log('Applying theme:', theme);
    const root = window.document.documentElement;
    const body = window.document.body;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Also add data attribute to body for easier debugging
    body.setAttribute('data-theme', theme);
    
    localStorage.setItem('theme', theme);
    console.log('Document classes after theme change:', root.classList.toString());
    console.log('Body data-theme:', body.getAttribute('data-theme'));
  }, [theme]);

  const toggleTheme = () => {
    console.log('Toggling theme from:', theme);
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
