// src/components/calendar/ObservancesCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n';
import AppText from '../AppText';
import Card from '../Card';
import Badge from '../Badge';

/**
 * observances: string[] e.g. ['Ekadashi', 'Krishna Paksha']
 */
export default function ObservancesCard({ observances = [] }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  if (!observances.length) return null;

  return (
    <Card accentColor={theme.color.accent} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Sparkles size={20} color={theme.color.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            {t('todaysObservances')}
          </AppText>
          <View style={styles.badgeRow}>
            {observances.map((label) => (
              <Badge key={label} label={label} tone="primary" style={{ marginRight: theme.spacing.sm, marginBottom: theme.spacing.xs }} />
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.color.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });
