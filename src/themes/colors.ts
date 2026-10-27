export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  lampOn: string;
  lampOff: string;
}

export const lightColors: ThemeColors = {
  background: '#F4F6FA',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  muted: '#64748B',
  lampOn: '#F59E0B',
  lampOff: '#94A3B8',
};

export const darkColors: ThemeColors = {
  background: '#0B1220',
  surface: '#151E2E',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#263244',
  primary: '#60A5FA',
  onPrimary: '#0B1220',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  muted: '#94A3B8',
  lampOn: '#FBBF24',
  lampOff: '#475569',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};
