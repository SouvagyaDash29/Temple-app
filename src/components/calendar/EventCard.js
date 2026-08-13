// src/components/calendar/EventCard.js
import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../AppText';
import Card from '../Card';
import { EVENT_TYPE_LABEL, EVENT_TYPE_ICON, EVENT_TYPE_COLOR } from '../../constants/eventTypes';

/**
 * event: {
 *   id, type, title, time, location, imageUrl
 * }
 */
export default function EventCard({ event, onPress }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const IconComp = Icons[EVENT_TYPE_ICON[event.type]] || Icons.Calendar;
  const accentColor = EVENT_TYPE_COLOR[event.type] || theme.color.primary;

  return (
    <Pressable onPress={() => onPress && onPress(event)} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.row}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.iconWrap, { backgroundColor: theme.color.surfaceAlt }]}>
              <IconComp size={20} color={accentColor} />
            </View>
          )}
          <View style={styles.textCol}>
            <AppText variant="caption" style={{ color: accentColor }}>
              {EVENT_TYPE_LABEL[event.type]?.toUpperCase()}
            </AppText>
            <AppText variant="h3" numberOfLines={1}>
              {event.title}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1}>
              {[event.time, event.location].filter(Boolean).join(' \u2022 ')}
            </AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      marginRight: theme.spacing.md,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    textCol: {
      flex: 1,
    },
  });
