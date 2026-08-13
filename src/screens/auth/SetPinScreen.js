// src/screens/auth/SetPinScreen.js
// u_pin = customer's id, o_pin = old pin, n_pin = new pin.
// All three are entered by the user (per spec) — u_pin is NOT silently
// filled from the session, since this screen can also be reached right
// after a forget-pin flow before a normal login has ever happened.
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Screen from '../../components/Screen';
import { useSetPin } from '../../hooks/useAuthForms';
import { useAuthContext } from '../../context/AuthContext';

export default function SetPinScreen({ onDone, onCancel }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { setPin, loading, error } = useSetPin();
  const { session } = useAuthContext();

  // Pre-fill from the session as a convenience when the user is already
  // logged in, but keep it editable — the field is the source of truth.
  const [customerId, setCustomerId] = useState(session.customerId || '');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!customerId.trim()) errs.customerId = "Enter your customer ID.";
    if (!oldPin.trim()) errs.oldPin = 'Enter your current PIN.';
    if (!/^\d{4,6}$/.test(newPin)) errs.newPin = 'New PIN must be 4-6 digits.';
    if (newPin !== confirmPin) errs.confirmPin = 'PINs do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await setPin({ u_pin: customerId.trim(), o_pin: oldPin, n_pin: newPin });
      setSuccess(true);
    } catch {
      // error already surfaced via `error`
    }
  };

  if (success) {
    return (
      <Screen edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.content}>
          <AppText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
            PIN updated
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
            Use your new PIN the next time you log in.
          </AppText>
          <Button label="Done" onPress={onDone} />
        </View>
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
          <AppText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
            Change your PIN
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xxl }}>
            Enter your customer ID, current PIN, and choose a new one.
          </AppText>

          <FormField
            label="Customer ID"
            value={customerId}
            onChangeText={setCustomerId}
            placeholder="Your customer ID"
            error={fieldErrors.customerId}
          />
          <FormField
            label="Current PIN"
            value={oldPin}
            onChangeText={setOldPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            error={fieldErrors.oldPin}
          />
          <FormField
            label="New PIN"
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            error={fieldErrors.newPin}
          />
          <FormField
            label="Confirm New PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            error={fieldErrors.confirmPin}
          />

          {error ? (
            <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
              {error}
            </AppText>
          ) : null}

          <Button label="Update PIN" onPress={handleSubmit} loading={loading} />
          {onCancel ? (
            <Button label="Cancel" variant="text" onPress={onCancel} style={{ marginTop: theme.spacing.md }} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl },
  });
