// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Screen from '../../components/Screen';
import { useLogin } from '../../hooks/useAuthForms';

export default function LoginScreen({ onGoToRegister, onGoToForgetPin }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { login, loading, error } = useLogin();

  const [mobileNumber, setMobileNumber] = useState('');
  const [pin, setPin] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!/^\d{10}$/.test(mobileNumber)) errs.mobile_number = 'Enter a valid 10-digit mobile number.';
    if (!pin.trim()) errs.pin = 'Enter your PIN.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await login({ mobile_number: mobileNumber, pin });
      // AuthContext flips status to 'authenticated' — App.js re-renders automatically.
    } catch {
      // error already surfaced via `error`
    }
  };

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
            Welcome back
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xxl }}>
            Log in to see your spiritual calendar.
          </AppText>

          <FormField
            label="Mobile Number"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            error={fieldErrors.mobile_number}
          />
          <FormField
            label="PIN"
            value={pin}
            onChangeText={setPin}
            placeholder="\u2022\u2022\u2022\u2022"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            error={fieldErrors.pin}
          />

          <Button
            label="Forgot PIN?"
            variant="text"
            onPress={onGoToForgetPin}
            fullWidth={false}
            style={{ alignSelf: 'flex-end', marginBottom: theme.spacing.lg }}
          />

          {error ? (
            <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
              {error}
            </AppText>
          ) : null}

          <Button label="Log In" onPress={handleSubmit} loading={loading} />

          <View style={styles.footerRow}>
            <AppText variant="bodySmall" color="textSecondary">
              New here?
            </AppText>
            <Button label="Create an account" variant="text" onPress={onGoToRegister} fullWidth={false} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (theme) =>
  StyleSheet.create({
    content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.xl },
    footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.lg },
  });
