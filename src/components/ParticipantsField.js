// src/components/ParticipantsField.js
// Phase 1 of "Family / Sharing": lets the user attach lightweight contact
// details (name + mobile/email) to a personal event. No account linking
// yet — `appUserId` is left null and is where you'd wire a
// "search registered devotees by mobile number" lookup later (see
// services/calendarApi.js -> userApi, add a `searchByMobile` endpoint).
import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { UserPlus, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';
import FormField from './FormField';
import Button from './Button';

function makeParticipantId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * participants: [{ id, name, mobile, email, appUserId }]
 * onChange(nextParticipants)
 */
export default function ParticipantsField({ participants = [], onChange }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [draft, setDraft] = useState({ name: '', mobile: '', email: '' });
  const [showForm, setShowForm] = useState(false);

  const canAdd = draft.name.trim().length > 0 && (draft.mobile.trim() || draft.email.trim());

  const handleAdd = () => {
    if (!canAdd) return;
    onChange([
      ...participants,
      { id: makeParticipantId(), name: draft.name.trim(), mobile: draft.mobile.trim(), email: draft.email.trim(), appUserId: null },
    ]);
    setDraft({ name: '', mobile: '', email: '' });
    setShowForm(false);
  };

  const handleRemove = (id) => {
    onChange(participants.filter((p) => p.id !== id));
  };

  return (
    <View>
      {participants.map((p) => (
        <View key={p.id} style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="body">{p.name}</AppText>
            <AppText variant="caption" color="textSecondary">
              {[p.mobile, p.email].filter(Boolean).join(' \u2022 ')}
            </AppText>
          </View>
          <Pressable onPress={() => handleRemove(p.id)} hitSlop={8}>
            <X size={18} color={theme.color.textSecondary} />
          </Pressable>
        </View>
      ))}

      {showForm ? (
        <View style={styles.form}>
          <FormField label="Name" value={draft.name} onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))} autoCapitalize="words" />
          <FormField
            label="Mobile Number"
            value={draft.mobile}
            onChangeText={(v) => setDraft((d) => ({ ...d, mobile: v }))}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <FormField
            label="Email (optional)"
            value={draft.email}
            onChangeText={(v) => setDraft((d) => ({ ...d, email: v }))}
            keyboardType="email-address"
          />
          <View style={{ flexDirection: 'row' }}>
            <Button label="Cancel" variant="text" onPress={() => setShowForm(false)} fullWidth={false} style={{ marginRight: theme.spacing.md }} />
            <Button label="Add" onPress={handleAdd} disabled={!canAdd} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Button
          label="Add participant"
          variant="secondary"
          onPress={() => setShowForm(true)}
          icon={<UserPlus size={16} color={theme.color.primary} />}
        />
      )}
    </View>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.color.border,
    },
    form: {
      backgroundColor: theme.color.surfaceAlt,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      marginTop: theme.spacing.sm,
    },
  });
