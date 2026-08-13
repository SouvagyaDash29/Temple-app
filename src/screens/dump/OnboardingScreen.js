// src/screens/OnboardingScreen.js
import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { Calendar, Bell, Heart, Settings } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import Button from '../components/Button';
import IconButton from '../components/IconButton';

const SLIDES = [
  {
    key: 'welcome',
    icon: Calendar,
    title: 'Your spiritual calendar, your way.',
    description: 'A peaceful space to track festivals, personal milestones, and temple events.',
  },
  {
    key: 'reminders',
    icon: Bell,
    title: 'Never miss an important festival or personal occasion.',
    description: 'Gentle reminders for the dates that matter to you — nothing more.',
  },
  {
    key: 'personalize',
    icon: Heart,
    title: 'Personalize your calendar with the traditions and temples that matter to you.',
    description: 'Follow your favourite temples and deities to see what matters to you first.',
  },
  {
    key: 'preferences',
    icon: Settings,
    title: 'Choose your preferences',
    description: 'Language, location and favourite temples — just the essentials, nothing more.',
    isLast: true,
  },
];

export default function OnboardingScreen({ onComplete }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const goNext = () => {
    if (index === SLIDES.length - 1) {
      onComplete?.();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).topRow}>
        <View style={{ width: 44 }} />
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles(theme).slide, { width }]}>
              <View style={styles(theme).iconCircle}>
                <Icon size={40} color={theme.color.primary} />
              </View>
              <AppText variant="h2" style={styles(theme).title}>
                {item.title}
              </AppText>
              <AppText variant="body" color="textSecondary" style={styles(theme).description}>
                {item.description}
              </AppText>
            </View>
          );
        }}
      />

      <View style={styles(theme).dotsRow}>
        {SLIDES.map((slide, i) => (
          <View key={slide.key} style={[styles(theme).dot, i === index && styles(theme).dotActive]} />
        ))}
      </View>

      <View style={styles(theme).footer}>
        <Button label={index === SLIDES.length - 1 ? 'Get started' : 'Next'} onPress={goNext} />
        {index < SLIDES.length - 1 && (
          <Button label="Skip" variant="text" onPress={() => onComplete?.()} style={{ marginTop: theme.spacing.sm }} />
        )}
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.background },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.lg,
    },
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xxl,
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.color.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xxl,
    },
    title: { textAlign: 'center', marginBottom: theme.spacing.md },
    description: { textAlign: 'center' },
    dotsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: theme.spacing.lg },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.color.border,
      marginHorizontal: 4,
    },
    dotActive: { backgroundColor: theme.color.primary, width: 20 },
    footer: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl },
  });
