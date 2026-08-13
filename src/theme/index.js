// src/theme/index.js
// Semantic token layer. Components should import `useTheme()` and reference
// theme.color.background etc — NOT constants/colors.js directly — so that
// dark mode (or any future re-theme) needs zero component changes.
import { colors } from '../constants/colors';
import { typography, fontFamily } from '../constants/typography';
import { spacing } from '../constants/spacing';
import { radius, iconSize, touchTarget, buttonHeight, inputHeight, shadow, animation } from '../constants/layout';

export const lightTheme = {
  mode: 'light',
  color: {
    primary: colors.primary,
    primaryDark: colors.primaryDark,
    primaryLight: colors.primaryLight,
    secondary: colors.secondary,
    secondaryLight: colors.secondaryLight,
    accent: colors.accentGold,
    accentLight: colors.goldLight,
    success: colors.sage,
    background: colors.background,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,
    text: colors.text,
    textSecondary: colors.textSecondary,
    textDisabled: colors.textDisabled,
    border: colors.border,
    error: colors.error,
    warning: colors.warning,
    white: colors.white,
    overlay: colors.overlay,
  },
  typography,
  fontFamily,
  spacing,
  radius,
  iconSize,
  touchTarget,
  buttonHeight,
  inputHeight,
  shadow,
  animation,
};

// Dark mode is intentionally not shipped in v1, but tokens are ready.
// Flip `mode` and swap `color.*` values here when it's time to build it —
// no component should need to change because they all read theme.color.*.
export const darkTheme = {
  ...lightTheme,
  mode: 'dark',
  color: {
    ...lightTheme.color,
    background: '#1B1717',
    surface: '#241F1F',
    surfaceAlt: '#2C2626',
    text: '#F2EEEA',
    textSecondary: '#B8B2AB',
    border: '#3A332F',
  },
};

export default lightTheme;
