// src/screens/explore/CreateGroupScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, ScrollView, Platform, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Screen from '../../components/Screen';
import { useCommunities } from '../../hooks/useCommunities';

export default function CreateGroupScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { createGroup } = useCommunities();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await createGroup({ name: name.trim(), description: description.trim(), isPrivate });
      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Could not create this community.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppText variant="h2" style={{ marginBottom: theme.spacing.xl }}>
            Create Community
          </AppText>

          <FormField label="Name" value={name} onChangeText={setName} placeholder="Jagannath Devotees - Bengaluru" autoCapitalize="words" />

          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.xs }}>
              Description
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What's this community about?"
              placeholderTextColor={theme.color.textDisabled}
              style={styles.textArea}
              multiline
            />
          </View>

          <Pressable style={styles.privacyRow} onPress={() => setIsPrivate((v) => !v)}>
            <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]}>
              {isPrivate ? <Check size={14} color={theme.color.white} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body">Private community</AppText>
              <AppText variant="caption" color="textSecondary">
                Only members you approve can join
              </AppText>
            </View>
          </Pressable>

          {error ? (
            <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
              {error}
            </AppText>
          ) : null}

          <Button label="Create" onPress={handleSave} disabled={!canSave} loading={saving} style={{ marginTop: theme.spacing.lg }} />
          <Button label="Cancel" variant="text" onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.sm }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    content: { padding: theme.spacing.base, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.huge },
    textArea: {
      height: 90,
      borderWidth: 1,
      borderColor: theme.color.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.sm,
      backgroundColor: theme.color.surface,
      color: theme.color.text,
      fontSize: 16,
      textAlignVertical: 'top',
    },
    privacyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: theme.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    checkboxChecked: { backgroundColor: theme.color.primary, borderColor: theme.color.primary },
  });
