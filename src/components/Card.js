// src/components/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Generic card surface. Not everything needs one — use sparingly per design system.
 * accentColor: optional left-border accent (e.g. today's observances use gold).
 */
export default function Card({ children, style, accentColor, noPadding = false }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles(theme).base,
        noPadding && { padding: 0 },
        accentColor && { borderLeftWidth: 3, borderLeftColor: accentColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    base: {
      backgroundColor: theme.color.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.color.border,
      ...theme.shadow,
    },
  });
