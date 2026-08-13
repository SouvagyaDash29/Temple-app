// src/components/EmptyState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarPlus } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';
import Button from './Button';

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        {icon || <CalendarPlus size={theme.iconSize.emptyState} color={theme.color.primary} />}
      </View>
      <AppText variant="h3" style={{ textAlign: 'center', marginTop: theme.spacing.base }}>
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="bodySmall"
          color="textSecondary"
          style={{ textAlign: 'center', marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg }}
        >
          {description}
        </AppText>
      ) : null}
      {actionLabel ? <Button label={actionLabel} onPress={onAction} fullWidth={false} style={{ paddingHorizontal: theme.spacing.xl }} /> : null}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.color.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
