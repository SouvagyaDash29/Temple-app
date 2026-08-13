// src/components/Badge.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';

/**
 * Pill-shaped tag, e.g. "Ekadashi", "Krishna Paksha".
 * tone: 'neutral' | 'primary' | 'gold' | 'sage'
 */
export default function Badge({ label, tone = 'neutral', style }) {
  const theme = useTheme();
  const tones = {
    neutral: { bg: theme.color.surfaceAlt, fg: theme.color.textSecondary },
    primary: { bg: theme.color.primaryLight, fg: theme.color.primary },
    gold: { bg: theme.color.accentLight, fg: theme.color.accent },
    sage: { bg: '#E7EFE8', fg: theme.color.success },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <View style={[styles(theme).base, { backgroundColor: t.bg }, style]}>
      <AppText variant="caption" style={{ color: t.fg }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    base: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      alignSelf: 'flex-start',
    },
  });
