// src/components/IconButton.js
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function IconButton({ icon, onPress, style, accessibilityLabel }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles(theme).base,
        pressed && { backgroundColor: theme.color.surfaceAlt },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    base: {
      width: theme.touchTarget.preferred,
      height: theme.touchTarget.preferred,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
    },
  });
