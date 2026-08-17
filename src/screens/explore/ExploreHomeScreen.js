// src/screens/explore/ExploreHomeScreen.js
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { CalendarSearch, CalendarPlus, Users, ListChecks } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Screen from '../../components/Screen';

const TILES = [
  { key: 'allEvents', label: 'All Events', description: 'Browse & search every event', icon: CalendarSearch, nav: 'AllEvents' },
  { key: 'myEvents', label: 'My Events', description: 'Just your personal events', icon: ListChecks, nav: 'AllEvents', params: { filter: 'mine' } },
  { key: 'addEvent', label: 'Add Event', description: 'Create a new personal event', icon: CalendarPlus, nav: 'AddEventFromExplore' },
  { key: 'communities', label: 'Communities', description: 'Create or join a group', icon: Users, nav: 'Community' },
];

export default function ExploreHomeScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h2">Explore</AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Everything beyond your own calendar
        </AppText>
      </View>

      <View style={styles.grid}>
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <Pressable
              key={tile.key}
              style={styles.tile}
              onPress={() => navigation.navigate(tile.nav, tile.params)}
              accessibilityRole="button"
            >
              <View style={styles.iconWrap}>
                <Icon size={26} color={theme.color.primary} />
              </View>
              <AppText variant="h3" style={{ marginTop: theme.spacing.md }}>
                {tile.label}
              </AppText>
              <AppText variant="caption" color="textSecondary" style={{ marginTop: 2, textAlign: 'center' }}>
                {tile.description}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    header: { padding: theme.spacing.base, paddingTop: theme.spacing.lg },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
    },
    tile: {
      width: '48%',
      backgroundColor: theme.color.surface,
      borderRadius: theme.radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.color.border,
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.color.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
