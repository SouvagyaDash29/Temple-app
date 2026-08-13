// src/screens/AddEventScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { useEvents } from '../hooks/useEvents';
import { formatFullDate, formatTime } from '../utils/date';

const REPEAT_OPTIONS = [
  { key: 'none', label: 'Does not repeat' },
  { key: 'yearly', label: 'Every year' },
];

const REMINDER_OPTIONS = [
  { key: 'none', label: 'No reminder' },
  { key: '1_hour', label: '1 hour before' },
  { key: '1_day', label: '1 day before' },
  { key: '1_week', label: '1 week before' },
];

/**
 * eventId: pass this to edit an existing personal event instead of
 * creating a new one — the screen loads it, prefills the form, and shows
 * Update / Delete instead of Save.
 */
export default function AddEventScreen({ initialDate = new Date(), eventId = null, onSaved, onDeleted, onCancel }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { getEvent, createEvent, updateEvent, deleteEvent, saving, error } = useEvents();

  const isEditMode = !!eventId;
  const [loadingEvent, setLoadingEvent] = useState(isEditMode);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeat, setRepeat] = useState('yearly');
  const [reminder, setReminder] = useState('1_day');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isEditMode) return;
    let isMounted = true;
    (async () => {
      const existing = await getEvent(eventId);
      if (!isMounted || !existing) {
        setLoadingEvent(false);
        return;
      }
      setTitle(existing.title || '');
      setDate(new Date(existing.date));
      setRepeat(existing.repeat || 'none');
      setReminder(existing.reminder || 'none');
      setNotes(existing.notes || '');
      setLoadingEvent(false);
    })();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, eventId, getEvent]);

  const canSave = title.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      if (isEditMode) {
        await updateEvent(eventId, { title: title.trim(), date, repeat, reminder, notes });
      } else {
        await createEvent({ title: title.trim(), date, repeat, reminder, notes });
      }
      onSaved?.();
    } catch {
      // error already surfaced via `error`
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const existing = await getEvent(eventId);
      if (existing) await deleteEvent(existing);
      onDeleted?.();
    } finally {
      setDeleting(false);
    }
  };

  if (loadingEvent) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.color.primary} />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.titleRow}>
          <AppText variant="h2">{isEditMode ? 'Edit Event' : 'Add Event'}</AppText>
          {isEditMode && (
            <Pressable onPress={handleDelete} disabled={deleting} hitSlop={8}>
              {deleting ? <ActivityIndicator color={theme.color.error} /> : <Trash2 size={22} color={theme.color.error} />}
            </Pressable>
          )}
        </View>

        <Field label="Title">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Father's Birthday"
            placeholderTextColor={theme.color.textDisabled}
            style={styles.input}
          />
        </Field>

        <Field label="Date">
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <AppText variant="body">{formatFullDate(date)}</AppText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selected) setDate(selected);
              }}
            />
          )}
        </Field>

        <Field label="Time">
          <Pressable onPress={() => setShowTimePicker(true)} style={styles.input}>
            <AppText variant="body">{formatTime(date)}</AppText>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (selected) setDate(selected);
              }}
            />
          )}
        </Field>

        <Field label="Repeat">
          <OptionRow options={REPEAT_OPTIONS} value={repeat} onChange={setRepeat} />
        </Field>

        <Field label="Reminder">
          <OptionRow options={REMINDER_OPTIONS} value={reminder} onChange={setReminder} />
        </Field>

        <Field label="Notes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            placeholderTextColor={theme.color.textDisabled}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </Field>

        {error ? (
          <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
            {error}
          </AppText>
        ) : null}
      </ScrollView>

        <View style={styles.footer}>
          <Button label="Cancel" variant="text" onPress={onCancel} fullWidth={false} style={{ marginRight: theme.spacing.md }} />
          <Button
            label={isEditMode ? 'Update Event' : 'Save Event'}
            onPress={handleSave}
            disabled={!canSave}
            loading={saving}
            style={{ flex: 1 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field({ label, children }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.xs }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function OptionRow({ options, value, onChange }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: selected ? theme.color.primary : theme.color.border,
              backgroundColor: selected ? theme.color.primaryLight : theme.color.surface,
              marginRight: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
            }}
          >
            <AppText variant="bodySmall" color={selected ? 'primary' : 'textSecondary'}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.color.background },
    content: { padding: theme.spacing.base, paddingBottom: theme.spacing.huge },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    input: {
      height: theme.inputHeight.default,
      borderWidth: 1,
      borderColor: theme.color.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      justifyContent: 'center',
      backgroundColor: theme.color.surface,
      color: theme.color.text,
      fontSize: 16,
    },
    textArea: {
      height: 90,
      paddingTop: theme.spacing.sm,
      textAlignVertical: 'top',
    },
    footer: {
      flexDirection: 'row',
      padding: theme.spacing.base,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.color.border,
      backgroundColor: theme.color.surface,
    },
  });
