// src/components/Fab.js
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Fab({ onPress, style }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Add event"
      style={({ pressed }) => [styles(theme).fab, pressed && { opacity: 0.9 }, style]}
    >
      <Plus size={26} color={theme.color.white} />
    </Pressable>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      right: theme.spacing.base,
      bottom: theme.spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadow,
    },
  });
