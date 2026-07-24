import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import {
  type ThemeSettingsDto,
  defaultThemeSettings,
  fetchThemeSettings,
  saveThemeSettings as apiSaveThemeSettings,
  resetThemeSettings as apiResetThemeSettings,
} from '../services/themeService';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  themeSettings: ThemeSettingsDto;
  updateThemeSettings: (settings: ThemeSettingsDto) => Promise<void>;
  resetThemeSettings: () => Promise<void>;
  applyPreviewTheme: (settings: ThemeSettingsDto) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettingsDto>(defaultThemeSettings);

  const applyThemeCSS = useCallback((settings: ThemeSettingsDto, dark: boolean) => {
    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');

      root.style.setProperty('--color-dark-950-val', settings.darkPageBg);
      root.style.setProperty('--color-dark-900-val', settings.darkCardBg);
      root.style.setProperty('--color-dark-800-val', settings.darkSurfaceBg);
      root.style.setProperty('--color-dark-700-val', settings.darkBorderColor);
      root.style.setProperty('--color-dark-400-val', settings.darkTextMuted);
      root.style.setProperty('--color-dark-300-val', settings.darkTextSecondary);
      root.style.setProperty('--color-dark-100-val', settings.darkTextPrimary);
      root.style.setProperty('--color-dark-200-val', settings.darkTextPrimary);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');

      root.style.setProperty('--color-dark-950-val', settings.lightPageBg);
      root.style.setProperty('--color-dark-900-val', settings.lightCardBg);
      root.style.setProperty('--color-dark-800-val', settings.lightSurfaceBg);
      root.style.setProperty('--color-dark-700-val', settings.lightBorderColor);
      root.style.setProperty('--color-dark-400-val', settings.lightTextMuted);
      root.style.setProperty('--color-dark-300-val', settings.lightTextSecondary);
      root.style.setProperty('--color-dark-100-val', settings.lightTextPrimary);
      root.style.setProperty('--color-dark-200-val', settings.lightTextSecondary);
    }

    root.style.setProperty('--color-primary-600', settings.primaryColor);
    root.style.setProperty('--color-primary-500', settings.primaryColor);
    root.style.setProperty('--color-accent-500', settings.incomeColor);
  }, []);

  // Fetch settings from API on load
  useEffect(() => {
    fetchThemeSettings().then((settings) => {
      setThemeSettings(settings);
      applyThemeCSS(settings, isDark);
    });
  }, [applyThemeCSS, isDark]);

  // Re-apply when isDark changes
  useEffect(() => {
    applyThemeCSS(themeSettings, isDark);
  }, [isDark, themeSettings, applyThemeCSS]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const updateThemeSettings = async (settings: ThemeSettingsDto) => {
    const updated = await apiSaveThemeSettings(settings);
    setThemeSettings(updated);
    applyThemeCSS(updated, isDark);
  };

  const resetThemeSettings = async () => {
    const res = await apiResetThemeSettings();
    setThemeSettings(res);
    applyThemeCSS(res, isDark);
  };

  const applyPreviewTheme = (settings: ThemeSettingsDto) => {
    applyThemeCSS(settings, isDark);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        themeSettings,
        updateThemeSettings,
        resetThemeSettings,
        applyPreviewTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
