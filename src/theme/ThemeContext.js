// src/theme/ThemeContext.js
import React, { createContext, useContext, useMemo, useState } from 'react';
import { lightTheme, darkTheme } from './index';

const ThemeContext = createContext(lightTheme);

export function ThemeProvider({ children }) {
  // Dark mode toggle is wired but not exposed in UI yet (see constants/layout).
  const [isDark, setIsDark] = useState(false);

  const value = useMemo(
    () => ({
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx.theme;
}

export function useThemeToggle() {
  return useContext(ThemeContext);
}
