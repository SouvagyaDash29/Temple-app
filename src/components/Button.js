// src/components/Button.js
import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';

/**
 * variant: 'primary' | 'secondary' | 'text'
 * size: 'default' (48px height, per design system)
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon = null, // optional element rendered before label
  style,
  fullWidth = true,
}) {
  const theme = useTheme();
  const styles = useMemoStyles(theme);

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'text' && styles.textVariant,
    disabled && styles.disabled,
    fullWidth && { alignSelf: 'stretch' },
    style,
  ];

  const textColor =
    variant === 'primary' ? 'white' : variant === 'secondary' ? 'primary' : 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        ...containerStyle,
        pressed && !disabled && { opacity: 0.85 },
      ]}
      hitSlop={8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? theme.color.white : theme.color.primary} />
        ) : (
          <>
            {icon}
            <AppText variant="button" color={textColor} style={icon ? { marginLeft: theme.spacing.sm } : null}>
              {label}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

function useMemoStyles(theme) {
  return StyleSheet.create({
    base: {
      height: theme.buttonHeight.default,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      minWidth: theme.touchTarget.preferred,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: theme.color.primary,
    },
    secondary: {
      backgroundColor: theme.color.primaryLight,
    },
    textVariant: {
      backgroundColor: 'transparent',
      height: theme.touchTarget.min,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
