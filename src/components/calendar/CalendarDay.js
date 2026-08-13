// src/components/calendar/CalendarDay.js
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../AppText';
import { EVENT_TYPE_COLOR } from '../../constants/eventTypes';

/**
 * A single day cell in the month grid.
 * day: number | null (null renders an empty placeholder cell)
 * eventTypes: array of event type keys present on this date, e.g. ['festival', 'personal']
 *   Rendered as small dots — never as text, per design spec.
 */
function CalendarDay({ day, isSelected, isToday, eventTypes = [], onPress }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  if (day == null) return <View style={styles.cell} />;

  return (
    <Pressable
      onPress={() => onPress(day)}
      accessibilityRole="button"
      accessibilityLabel={`Day ${day}${eventTypes.length ? `, ${eventTypes.length} events` : ''}`}
      accessibilityState={{ selected: isSelected }}
      style={styles.cell}
      hitSlop={4}
    >
      <View style={[styles.circle, isSelected && styles.selectedCircle]}>
        <AppText
          variant="body"
          style={[
            styles.dayText,
            isToday && !isSelected && styles.todayText,
            isSelected && styles.selectedText,
          ]}
        >
          {day}
        </AppText>
      </View>
      <View style={styles.dotsRow}>
        {eventTypes.slice(0, 3).map((type, idx) => (
          <View
            key={`${type}-${idx}`}
            style={[styles.dot, { backgroundColor: EVENT_TYPE_COLOR[type] || theme.color.accent }]}
          />
        ))}
      </View>
    </Pressable>
  );
}

// Memoized: the month grid re-renders often (month swipe, selection change),
// this keeps 30+ day cells cheap.
export default React.memo(CalendarDay);

const getStyles = (theme) =>
  StyleSheet.create({
    cell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingVertical: theme.spacing.sm,
      minHeight: theme.touchTarget.preferred,
    },
    circle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedCircle: {
      backgroundColor: theme.color.primary,
    },
    dayText: {
      fontSize: 14,
      color: theme.color.text,
    },
    todayText: {
      color: theme.color.primary,
      fontFamily: theme.fontFamily.semiBold,
    },
    selectedText: {
      color: theme.color.white,
      fontFamily: theme.fontFamily.semiBold,
    },
    dotsRow: {
      flexDirection: 'row',
      marginTop: 4,
      height: 6,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginHorizontal: 1.5,
    },
  });
