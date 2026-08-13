// src/components/calendar/CalendarHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../AppText';
import IconButton from '../IconButton';

export default function CalendarHeader({ label, onPrev, onNext, onPressTitle }) {
  const theme = useTheme();
  return (
    <View style={styles(theme).row}>
      <IconButton
        accessibilityLabel="Previous month"
        onPress={onPrev}
        icon={<ChevronLeft size={theme.iconSize.nav} color={theme.color.text} />}
      />
      <AppText variant="h3" onPress={onPressTitle} accessibilityRole="button">
        {label}
      </AppText>
      <IconButton
        accessibilityLabel="Next month"
        onPress={onNext}
        icon={<ChevronRight size={theme.iconSize.nav} color={theme.color.text} />}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
  });
