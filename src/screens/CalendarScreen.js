// src/screens/CalendarScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Screen from '../components/Screen';
import CalendarHeader from '../components/calendar/CalendarHeader';
import CalendarGrid from '../components/calendar/CalendarGrid';
import ObservancesCard from '../components/calendar/ObservancesCard';
import EventCard from '../components/calendar/EventCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import Fab from '../components/Fab';
import { useCalendarMonth } from '../hooks/useCalendarMonth';
import { useDayDetails } from '../hooks/useDayDetails';
import { usePreferences } from '../hooks/usePreferences';
import { formatFullDate } from '../utils/date';
import { screenPadding } from '../constants/spacing';

export default function CalendarScreen({ userName = 'Devotee', onAddEvent, onOpenEvent, onOpenPreferences }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const today = new Date();

  const { preferences } = usePreferences();

  const {
    label,
    days,
    panchangByDate,
    personalByDate,
    loading: monthLoading,
    error: monthError,
    goToNextMonth,
    goToPrevMonth,
    refresh,
  } = useCalendarMonth(preferences, today);

  const [selectedDate, setSelectedDate] = useState(today);
  const { observances, events } = useDayDetails(selectedDate, panchangByDate, personalByDate);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Re-pull personal events whenever this screen regains focus (e.g. after
  // Save/Update/Delete in AddEventScreen navigates back) so the new event
  // shows immediately instead of only after switching months.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleSelectDay = (item) => {
    setSelectedDate(item.date);
  };

  const personalEvents = events.filter((e) => e.type === 'personal' || e.type === 'reminder');
  const templeEvents = events.filter((e) => e.type === 'festival' || e.type === 'temple_event' || e.type === 'puja' || e.type === 'seva');

  const selectedInVisibleMonth =
    selectedDate.getMonth() === days.find((d) => d)?.date.getMonth() &&
    selectedDate.getFullYear() === days.find((d) => d)?.date.getFullYear();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <AppText variant="h2">Good morning, {userName}</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              {preferences?.state ? 'Your spiritual calendar' : 'Set your state to see festivals \u2192'}
            </AppText>
          </View>
          <Image
            source={require('../assets/avatar-placeholder.png')}
            style={styles.avatar}
            onTouchEnd={onOpenPreferences}
          />
        </View>

        <Card style={styles.calendarCard}>
          <CalendarHeader label={label} onPrev={goToPrevMonth} onNext={goToNextMonth} />
          <CalendarGrid
            days={days}
            selectedDay={selectedInVisibleMonth ? selectedDate.getDate() : null}
            todayDay={today.getDate()}
            onSelectDay={handleSelectDay}
          />
        </Card>

        <AppText variant="h3" style={styles.dateHeading}>
          {formatFullDate(selectedDate)}
        </AppText>

        {monthLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <ObservancesCard observances={observances} />

            {personalEvents.length > 0 && (
              <>
                <SectionLabel text="Your Events" />
                {personalEvents.map((event) => (
                  <EventCard key={event.id} event={event} onPress={onOpenEvent} />
                ))}
              </>
            )}

            {templeEvents.length > 0 && (
              <>
                <SectionLabel text="Festivals & Temple Events" />
                {templeEvents.map((event) => (
                  <EventCard key={event.id} event={event} onPress={onOpenEvent} />
                ))}
              </>
            )}

            {!observances.length && !personalEvents.length && !templeEvents.length && (
              <EmptyState
                title="Make your calendar personal"
                description="Add birthdays, anniversaries, pujas and important occasions."
                actionLabel="+ Add Event"
                onAction={() => onAddEvent?.(selectedDate)}
              />
            )}
          </>
        )}

        {monthError ? (
          <AppText variant="bodySmall" color="error" style={{ marginTop: theme.spacing.md }}>
            {monthError}
          </AppText>
        ) : null}
      </ScrollView>

      <Fab onPress={() => onAddEvent?.(selectedDate)} />
    </Screen>
  );
}

function SectionLabel({ text }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
      <AppText variant="caption" color="textSecondary">
        {text.toUpperCase()}
      </AppText>
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.color.background },
    scrollContent: {
      paddingHorizontal: screenPadding,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.huge * 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    calendarCard: {
      marginBottom: theme.spacing.xl,
    },
    dateHeading: {
      marginBottom: theme.spacing.md,
    },
  });
