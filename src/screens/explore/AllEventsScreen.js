// src/screens/explore/AllEventsScreen.js
// Combines the current month's panchang festivals with the user's personal
// events into one searchable, scrollable list. Personal events are
// editable; API-sourced festivals get an "Add to my calendar" action
// instead (see EventCard's `source` prop).
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, FlatList } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Screen from '../../components/Screen';
import EventCard from '../../components/calendar/EventCard';
import EmptyState from '../../components/EmptyState';
import { useCalendarMonth } from '../../hooks/useCalendarMonth';
import { usePreferences } from '../../hooks/usePreferences';
import { useEvents } from '../../hooks/useEvents';
import { shareEvent } from '../../services/shareService';

export default function AllEventsScreen({ navigation, route }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const onlyMine = route.params?.filter === 'mine';

  const { preferences } = usePreferences();
  const { panchangByDate, personalByDate, loading, refresh } = useCalendarMonth(preferences, new Date());
  const { createEvent } = useEvents();
  const [query, setQuery] = useState('');

  const allEvents = useMemo(() => {
    const personal = Object.values(personalByDate)
      .flat()
      .map((e) => ({ ...e, source: 'local' }));

    if (onlyMine) return personal;

    const festivals = Object.entries(panchangByDate).flatMap(([dateKey, day]) =>
      (day.festivals || []).map((name, idx) => ({
        id: `${dateKey}-festival-${idx}`,
        type: 'festival',
        title: name,
        date: dateKey,
        source: 'api',
      }))
    );

    return [...personal, ...festivals].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [personalByDate, panchangByDate, onlyMine]);

  const filtered = allEvents.filter((e) => e.title?.toLowerCase().includes(query.trim().toLowerCase()));

  const handleOpenEvent = (event) => {
    if (event.source !== 'local') return;
    navigation.navigate('AddEventFromExplore', { eventId: event.id });
  };

  const handleAddApiEvent = async (event) => {
    await createEvent({
      title: event.title,
      type: event.type || 'festival',
      date: new Date(event.date),
      repeat: 'none',
      reminder: '1_day',
      notes: '',
    });
    refresh();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h2">{onlyMine ? 'My Events' : 'All Events'}</AppText>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.color.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events"
            placeholderTextColor={theme.color.textDisabled}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={handleOpenEvent}
            onAdd={item.source === 'api' ? handleAddApiEvent : undefined}
            onShare={() => shareEvent(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyState title="No events found" description="Try a different search, or add your own." /> : null
        }
      />
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    header: { padding: theme.spacing.base },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.color.surface,
      borderWidth: 1,
      borderColor: theme.color.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      height: theme.inputHeight.default,
      marginTop: theme.spacing.md,
    },
    searchInput: { flex: 1, marginLeft: theme.spacing.sm, color: theme.color.text, fontSize: 16 },
    listContent: { paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.huge },
  });
