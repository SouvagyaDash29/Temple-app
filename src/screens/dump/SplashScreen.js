// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';

export default function SplashScreen({ onFinished }) {
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => onFinished?.(), 1400);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <View style={styles(theme).container}>
      <Image
        source={require('../assets/logo-diya.png')}
        style={styles(theme).logo}
        resizeMode="contain"
        accessibilityLabel="App logo"
      />
      <AppText variant="h2" style={{ marginTop: theme.spacing.lg }}>
        Temple Devotee
      </AppText>
      <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
        Your spiritual calendar
      </AppText>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: 96,
      height: 96,
    },
  });
