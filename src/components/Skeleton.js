// src/components/Skeleton.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Never show a blank screen — use this while data loads.
 */
export default function Skeleton({ width = '100%', height = 16, borderRadius, style }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? theme.radius.sm,
          backgroundColor: theme.color.surfaceAlt,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  const theme = useTheme();
  return (
    <Animated.View style={[styles(theme).card]}>
      <Skeleton width="60%" height={14} style={{ marginBottom: theme.spacing.sm }} />
      <Skeleton width="90%" height={20} style={{ marginBottom: theme.spacing.xs }} />
      <Skeleton width="40%" height={14} />
    </Animated.View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.color.surface,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.base,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.color.border,
      marginBottom: theme.spacing.md,
    },
  });
