import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { loadThemeMode, saveThemeMode } from '../services/storageService';
import { themes } from './colors';
import type { ThemeColors, ThemeMode } from './colors';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  isLoading: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [storedMode, setStoredMode] = useState<ThemeMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadThemeMode().then((saved) => {
      if (!active) return;

      setStoredMode(saved);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  // Sem preferência salva, acompanha o tema do sistema.
  const mode: ThemeMode = storedMode ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const setMode = useCallback((next: ThemeMode) => {
    setStoredMode(next);
    void saveThemeMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: themes[mode],
      isDark: mode === 'dark',
      isLoading,
      setMode,
      toggleMode,
    }),
    [mode, isLoading, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }

  return context;
}
