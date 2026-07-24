import { API_BASE_URL, fetchWithAuth } from './api';

export interface ThemeSettingsDto {
  // Dark Mode Palette
  darkPageBg: string;
  darkCardBg: string;
  darkSurfaceBg: string;
  darkBorderColor: string;
  darkTextPrimary: string;
  darkTextSecondary: string;
  darkTextMuted: string;

  // Light Mode Palette
  lightPageBg: string;
  lightCardBg: string;
  lightSurfaceBg: string;
  lightBorderColor: string;
  lightTextPrimary: string;
  lightTextSecondary: string;
  lightTextMuted: string;

  // Primary Accents
  primaryColor: string;
  incomeColor: string;
  expenseColor: string;
}

export const defaultThemeSettings: ThemeSettingsDto = {
  darkPageBg: '#020617',
  darkCardBg: '#0f172a',
  darkSurfaceBg: '#1e293b',
  darkBorderColor: '#334155',
  darkTextPrimary: '#f1f5f9',
  darkTextSecondary: '#cbd5e1',
  darkTextMuted: '#94a3b8',

  lightPageBg: '#f8fafc',
  lightCardBg: '#ffffff',
  lightSurfaceBg: '#f1f5f9',
  lightBorderColor: '#e2e8f0',
  lightTextPrimary: '#0f172a',
  lightTextSecondary: '#475569',
  lightTextMuted: '#64748b',

  primaryColor: '#2563eb',
  incomeColor: '#10b981',
  expenseColor: '#ef4444',
};

export const fetchThemeSettings = async (): Promise<ThemeSettingsDto> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/theme`);
    if (!res.ok) return defaultThemeSettings;
    return await res.json();
  } catch {
    return defaultThemeSettings;
  }
};

export const saveThemeSettings = async (settings: ThemeSettingsDto): Promise<ThemeSettingsDto> => {
  const res = await fetchWithAuth('/api/theme', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    let errorText = `Fehler (${res.status}): Farbeinstellungen konnten nicht gespeichert werden.`;
    try {
      const err = await res.json();
      if (err.title || err.detail || typeof err === 'string') {
        errorText = err.detail || err.title || err;
      }
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
  return await res.json();
};

export const resetThemeSettings = async (): Promise<ThemeSettingsDto> => {
  const res = await fetchWithAuth('/api/theme/reset', {
    method: 'POST',
  });
  if (!res.ok) {
    let errorText = `Fehler (${res.status}): Farbeinstellungen konnten nicht zurückgesetzt werden.`;
    try {
      const err = await res.json();
      if (err.title || err.detail || typeof err === 'string') {
        errorText = err.detail || err.title || err;
      }
    } catch {
      // ignore
    }
    throw new Error(errorText);
  }
  return await res.json();
};
