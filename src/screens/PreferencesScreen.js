// src/screens/PreferencesScreen.js
// Lets the devotee pick their state (and panji, if that state has more than
// one) so the calendar knows which GitHub panchang data to load. Picking no
// state at all is valid — the calendar just falls back to a plain grid.
// Also provides a toggle to connect / disconnect Google Calendar so personal
// events are synced automatically.
import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { AVAILABLE_STATES } from '../services/panchangService';
import { usePreferences } from '../hooks/usePreferences';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import { useTranslation } from '../i18n';

export default function PreferencesScreen({ onDone }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  const { preferences, setState, setPanji } = usePreferences();
  const {
    connected: googleConnected,
    connecting: googleConnecting,
    error: googleError,
    connect: connectGoogle,
    disconnect: disconnectGoogle,
    isRequestReady,
  } = useGoogleCalendar();

  if (!preferences) return null;

  const selectedState = AVAILABLE_STATES.find((s) => s.key === preferences.state);

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h2" style={{ marginBottom: theme.spacing.xs }}>
          {t('preferencesTitle')}
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
          {t('preferencesSubtitle')}
        </AppText>

        <AppText variant="caption" color="textSecondary" style={{ marginBottom: theme.spacing.sm }}>
          {t('preferencesState').toUpperCase()}
        </AppText>
        <Card noPadding style={{ marginBottom: theme.spacing.xl, overflow: 'hidden' }}>
          <OptionRow
            label={t('preferencesNoPreference')}
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
              {t('preferencesPanji').toUpperCase()}
            </AppText>
            <Card noPadding style={{ marginBottom: theme.spacing.xl, overflow: 'hidden' }}>
              <OptionRow
                label={t('preferencesNoPanji')}
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

        {/* ---- Google Calendar sync ---- */}
        <AppText variant="caption" color="textSecondary" style={{ marginBottom: theme.spacing.sm }}>
          GOOGLE CALENDAR
        </AppText>
        <Card style={{ marginBottom: theme.spacing.xl }}>
          <AppText variant="body" style={{ marginBottom: theme.spacing.xs }}>
            {googleConnected ? 'Connected ✓' : 'Not connected'}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.md }}>
            {googleConnected
              ? 'Personal events you add will automatically sync to your Google Calendar.'
              : 'Connect your Google account so personal events are added to your Google Calendar automatically.'}
          </AppText>

          {googleError ? (
            <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.sm }}>
              {googleError}
            </AppText>
          ) : null}

          {googleConnecting ? (
            <ActivityIndicator color={theme.color.primary} />
          ) : googleConnected ? (
            <Button label={t('disconnect')} variant="secondary" onPress={disconnectGoogle} />
          ) : (
            <Button
              label={t('connectGoogleCalendar')}
              onPress={connectGoogle}
              disabled={!isRequestReady}
            />
          )}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t('commonDone')} onPress={onDone} />
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
      padding: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.color.border,
      backgroundColor: theme.color.surface,
    },
  });
