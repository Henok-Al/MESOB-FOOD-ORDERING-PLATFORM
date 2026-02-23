// FRANK Design System - Shared Constants
// Based on https://frankmeat.ru/en

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
  success: '#22c55e', // Green for "NEW" badges, success states
  error: '#ef4444',
  warning: '#f59e0b',

  // Borders
  border: '#333333',
  borderLight: '#404040',
} as const;

export const FRANK_TYPOGRAPHY = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,

  // Font weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const FRANK_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;

export const FRANK_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
} as const;

export const FRANK_BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
