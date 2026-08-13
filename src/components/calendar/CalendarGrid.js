// src/components/calendar/CalendarGrid.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../AppText';
import CalendarDay from './CalendarDay';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * days: array of { day: number, dateKey: 'YYYY-MM-DD', eventTypes: string[] } | null (blank leading cells)
 */
export default function CalendarGrid({ days, selectedDay, todayDay, onSelectDay }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <View key={`${w}-${i}`} style={styles.weekCell}>
            <AppText variant="caption" color="textSecondary">
              {w}
            </AppText>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((item, idx) => (
          <CalendarDay
            key={item ? item.dateKey : `blank-${idx}`}
            day={item ? item.day : null}
            eventTypes={item ? item.eventTypes : []}
            isSelected={item && item.day === selectedDay}
            isToday={item && item.day === todayDay}
            onPress={() => item && onSelectDay(item)}
          />
        ))}
      </View>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    weekRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    weekCell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });
