export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  // Fundo levemente destacado, usado em caixas dentro dos cartões.
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  border: string;
  // Cor da marca (âmbar): botões principais e destaques preenchidos.
  primary: string;
  onPrimary: string;
  // Versão do destaque com contraste bom para texto e ícones.
  accent: string;
  success: string;
  warning: string;
  danger: string;
  muted: string;
  lampOn: string;
  lampOff: string;
  temperature: string;
  humidity: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F4F6FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF1F8',
  text: '#0F1530',
  textSecondary: '#4B5675',
  border: '#E1E6F2',
  primary: '#F59E0B',
  onPrimary: '#2A1700',
  accent: '#B45309',
  success: '#15803D',
  warning: '#B45309',
  danger: '#B91C1C',
  muted: '#6B7599',
  lampOn: '#F59E0B',
  lampOff: '#9AA3BC',
  temperature: '#EA580C',
  humidity: '#0284C7',
  cardShadow: '0px 6px 20px 0px rgba(15, 21, 48, 0.08)',
};

export const darkColors: ThemeColors = {
  background: '#0A0E1C',
  surface: '#131A30',
  surfaceAlt: '#1B2440',
  text: '#F3F5FB',
  textSecondary: '#A9B3D0',
  border: '#26304F',
  primary: '#FBBF24',
  onPrimary: '#1F1500',
  accent: '#FCD34D',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
  muted: '#8590B0',
  lampOn: '#FBBF24',
  lampOff: '#3B4566',
  temperature: '#FB923C',
  humidity: '#38BDF8',
  cardShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.35)',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};
