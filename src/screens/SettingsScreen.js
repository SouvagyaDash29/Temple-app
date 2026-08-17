// src/screens/SettingsScreen.js
// Single place to pick app language and theme accent colour. Language is
// stored in preferences (read by useTranslation); the accent colour flows
// into the theme through ThemeContext -> buildTheme.
import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Check, X, Languages, Palette } from 'lucide-react-native';
import { useTheme, useThemeToggle } from '../theme/ThemeContext';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n';
import { accentPalettes, ACCENT_KEYS } from '../constants/palettes';
import AppText from '../components/AppText';
import Card from '../components/Card';
import Screen from '../components/Screen';
import IconButton from '../components/IconButton';

export default function SettingsScreen({ onClose }) {
  const theme = useTheme();
  const { t, lang, setLanguage } = useTranslation();
  const { setAccentColor } = useThemeToggle();
  const accent = theme.color.primary;
  const styles = getStyles(theme);

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ width: theme.touchTarget.preferred }} />
        <AppText variant="h3" numberOfLines={1} style={styles.headerTitle}>
          {t('settingsTitle')}
        </AppText>
        <IconButton icon={<X size={22} color={theme.color.text} />} onPress={onClose} accessibilityLabel={t('commonClose')} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="bodySmall" color="textSecondary" style={styles.subtitle}>
          {t('settingsSubtitle')}
        </AppText>

        <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
          {t('language')}
        </AppText>
        <Card noPadding style={styles.card}>
          {SUPPORTED_LANGUAGES.map((langOption, idx) => (
            <View key={langOption.key}>
              {idx > 0 ? <View style={styles.divider} /> : null}
              <OptionRow
                label={langOption.label}
                icon={<Languages size={18} color={theme.color.primary} />}
                selected={lang === langOption.key}
                onPress={() => setLanguage(langOption.key)}
                theme={theme}
              />
            </View>
          ))}
        </Card>

        <AppText variant="caption" color="textSecondary" style={styles.sectionLabel}>
          {t('settingsThemeColor')}
        </AppText>
        <Card style={styles.swatchCard}>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.base }}>
            {t('settingsThemeColorSub')}
          </AppText>
          <View style={styles.swatchRow}>
            {ACCENT_KEYS.map((key) => {
              const palette = accentPalettes[key];
              const selected = accent === palette.primary;
              return (
                <Pressable
                  key={key}
                  onPress={() => setAccentColor(key)}
                  accessibilityRole="button"
                  accessibilityLabel={t(`palette${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: palette.primary },
                      selected && styles.swatchSelected,
                    ]}
                  >
                    {selected ? <Check size={18} color={theme.color.white} /> : null}
                  </View>
                  <AppText
                    variant="caption"
                    color={selected ? 'primary' : 'textSecondary'}
                    style={styles.swatchLabel}
                  >
                    {t(`palette${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function OptionRow({ label, icon, selected, onPress, theme }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={rowStyles(theme).row}>
      <View style={rowStyles(theme).iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <AppText variant="body">{label}</AppText>
      </View>
      {selected ? <Check size={20} color={theme.color.primary} /> : null}
    </Pressable>
  );
}

const rowStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.base,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.color.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
  });

const getStyles = (theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.sm,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      marginHorizontal: theme.spacing.sm,
    },
    content: {
      padding: theme.spacing.base,
      paddingBottom: theme.spacing.huge,
    },
    subtitle: {
      marginBottom: theme.spacing.base,
    },
    sectionLabel: {
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    card: {
      marginBottom: theme.spacing.xl,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.color.border,
      marginLeft: theme.spacing.base + 36 + theme.spacing.md,
    },
    swatchCard: {
      marginBottom: theme.spacing.xl,
    },
    swatchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    swatchWrap: {
      alignItems: 'center',
      width: 64,
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchSelected: {
      borderWidth: 3,
      borderColor: theme.color.border,
    },
    swatchLabel: {
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
  });
