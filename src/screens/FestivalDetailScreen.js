// src/screens/FestivalDetailScreen.js
// Shows details for a festival by fetching its summary from Wikipedia's
// public REST API (no key needed). Falls back to a "no details" state when
// Wikipedia has no page for the name.
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ChevronLeft, ExternalLink, Sparkles } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../i18n';
import AppText from '../components/AppText';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';

export const WIKIPEDIA_SUMMARY_BASE_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

function summaryUrl(festivalName) {
  const slug = encodeURIComponent(String(festivalName || '').trim().replace(/\s+/g, '_'));
  return `${WIKIPEDIA_SUMMARY_BASE_URL}/${slug}`;
}

export async function fetchFestivalSummary(festivalName) {
  const response = await fetch(summaryUrl(festivalName));
  if (!response.ok) {
    const err = new Error(`Wikipedia returned ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

export default function FestivalDetailScreen({ festivalName, onBack }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFestivalSummary(festivalName);
      // For disambiguation pages, take the first listed page as the best match.
      const resolved =
        data?.type === 'disambiguation' && Array.isArray(data.pages) && data.pages.length
          ? data.pages[0]
          : data;
      setSummary(resolved || null);
    } catch (err) {
      setError(err.status === 404 ? 'notFound' : 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivalName]);

  const openOnWikipedia = () => {
    const url = summary?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(festivalName.replace(/\s+/g, '_'))}`;
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('commonBack')}>
          <ChevronLeft size={26} color={theme.color.text} />
        </Pressable>
        <AppText variant="h3" numberOfLines={1} style={styles.headerTitle}>
          {t('festivalTitle')}
        </AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={theme.color.primary} />
            <AppText variant="bodySmall" color="textSecondary" style={styles.centerText}>
              {t('festivalLoading')}
            </AppText>
          </View>
        ) : error || !summary ? (
          <View style={styles.centerBox}>
            <View style={styles.iconCircle}>
              <Sparkles size={28} color={theme.color.primary} />
            </View>
            <AppText variant="h3" style={{ textAlign: 'center', marginTop: theme.spacing.base }}>
              {t(error === 'notFound' ? 'festivalNotFound' : 'festivalError', { name: festivalName })}
            </AppText>
            <Button label={t('commonRetry')} onPress={load} fullWidth={false} style={{ marginTop: theme.spacing.lg }} />
          </View>
        ) : (
          <>
            {summary?.originalimage?.source || summary?.thumbnail?.source ? (
              <Image
                source={{ uri: summary.originalimage?.source || summary.thumbnail.source }}
                style={styles.banner}
                resizeMode="cover"
              />
            ) : null}

            <Card style={styles.card}>
              <AppText variant="h2">{summary.title || festivalName}</AppText>
              {summary.description ? (
                <AppText variant="bodySmall" color="textSecondary" style={styles.description}>
                  {summary.description}
                </AppText>
              ) : null}
              {summary.extract ? (
                <AppText variant="body" style={styles.extract}>
                  {summary.extract}
                </AppText>
              ) : (
                <AppText variant="body" color="textSecondary">
                  {t('festivalNotFound', { name: festivalName })}
                </AppText>
              )}
            </Card>

            <Button
              label={t('festivalReadOnWikipedia')}
              variant="secondary"
              icon={<ExternalLink size={18} color={theme.color.primary} />}
              onPress={openOnWikipedia}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
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
    centerBox: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },
    centerText: {
      marginTop: theme.spacing.sm,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.color.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    banner: {
      width: '100%',
      height: 200,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.base,
    },
    card: {
      marginBottom: theme.spacing.lg,
    },
    description: {
      marginTop: theme.spacing.xs,
    },
    extract: {
      marginTop: theme.spacing.base,
    },
  });
