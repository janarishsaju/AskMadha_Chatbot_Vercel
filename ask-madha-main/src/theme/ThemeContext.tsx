import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeColors } from './themes';

interface ThemeContextValue {
  colors: ThemeColors;
  themeId: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colors, currentTheme } = useThemeStore();

  const value = useMemo(
    () => ({ colors, themeId: currentTheme }),
    [colors, currentTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
