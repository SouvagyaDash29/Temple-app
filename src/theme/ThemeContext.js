// src/theme/ThemeContext.js
import React, { createContext, useContext, useMemo, useState } from 'react';
import { buildTheme } from './index';
import { usePreferences } from '../hooks/usePreferences';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { preferences, update } = usePreferences();
  const accent = preferences?.accent || 'maroon';
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => buildTheme(accent, isDark), [accent, isDark]);

  const setAccentColor = useMemo(
    () => (accentKey) => update({ accent: accentKey }),
    [update]
  );

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme: () => setIsDark((prev) => !prev),
      setAccentColor,
    }),
    [theme, isDark, setAccentColor]
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
