// FRANK Design System Colors for React Native
export const FRANK_COLORS = {
  // Primary
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fb923c',

  // Background (Dark Theme)
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: '#1a1a1a',
  bgElevated: '#262626',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#737373',

  // Accents
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',

  // Borders
  border: '#333333',
  borderLight: '#404040',
} as const;

// Typography
export const FRANK_TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// Spacing
export const FRANK_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// Border Radius
export const FRANK_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
