// src/screens/PreferencesScreen.js
// Lets the devotee pick their state (and panji, if that state has more than
// one) so the calendar knows which GitHub panchang data to load. Picking no
// state at all is valid — the calendar just falls back to a plain grid.
import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { AVAILABLE_STATES } from '../services/panchangService';
import { usePreferences } from '../hooks/usePreferences';

export default function PreferencesScreen({ onDone }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { preferences, setState, setPanji } = usePreferences();

  if (!preferences) return null;

  const selectedState = AVAILABLE_STATES.find((s) => s.key === preferences.state);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h2" style={{ marginBottom: theme.spacing.xs }}>
          Your calendar
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
          Choose your state to see relevant festivals and panchang details.
        </AppText>

        <AppText variant="caption" color="textSecondary" style={{ marginBottom: theme.spacing.sm }}>
          STATE
        </AppText>
        <Card noPadding style={{ marginBottom: theme.spacing.xl, overflow: 'hidden' }}>
          <OptionRow
            label="No preference (plain calendar)"
            selected={!preferences.state}
            onPress={() => setState(null)}
          />
          {AVAILABLE_STATES.map((s) => (
            <OptionRow key={s.key} label={s.label} selected={preferences.state === s.key} onPress={() => setState(s.key)} />
          ))}
        </Card>

        {selectedState && selectedState.panjis.length > 0 && (
          <>
            <AppText variant="caption" color="textSecondary" style={{ marginBottom: theme.spacing.sm }}>
              PANJI
            </AppText>
            <Card noPadding style={{ marginBottom: theme.spacing.xl, overflow: 'hidden' }}>
              <OptionRow
                label="No panji (plain calendar)"
                selected={!preferences.panji}
                onPress={() => setPanji(null)}
              />
              {selectedState.panjis.map((p) => (
                <OptionRow
                  key={p.key}
                  label={p.label}
                  selected={preferences.panji === p.key}
                  onPress={() => setPanji(p.key)}
                />
              ))}
            </Card>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Done" onPress={onDone} />
      </View>
    </Screen>
  );
}

function OptionRow({ label, selected, onPress }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={rowStyles(theme).row}>
      <AppText variant="body">{label}</AppText>
      {selected ? <Check size={20} color={theme.color.primary} /> : null}
    </Pressable>
  );
}

const rowStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.base,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.color.border,
    },
  });

const getStyles = (theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.color.background },
    content: { padding: theme.spacing.base, paddingBottom: theme.spacing.huge },
    footer: {
      padding: theme.spacing.base,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.color.border,
      backgroundColor: theme.color.surface,
    },
  });
