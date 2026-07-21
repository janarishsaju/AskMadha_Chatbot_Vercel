import { LIGHT_THEME, DARK_THEME } from './tokens';

export type ThemeId = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  foreground: string;
  muted: string;
  mutedFaint: string;
  border: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryMuted: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  accentMuted: string;
  card: string;
  cardForeground: string;
  ring: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  white: string;
  overlay: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  previewColors: [string, string, string];
  colors: ThemeColors;
}

export const themes: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean slate background with dark text, violet-pink gradient headings, and glassmorphism surfaces.',
    previewColors: ['#7C3AED', '#EC4899', '#F59E0B'],
    colors: LIGHT_THEME,
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Deep slate background with light text, the same gradient headings, and subtle floating glows.',
    previewColors: ['#8B5CF6', '#EC4899', '#FBBF24'],
    colors: DARK_THEME,
  },
};

export function getThemeColors(themeId: ThemeId): ThemeColors {
  return themes[themeId].colors;
}
