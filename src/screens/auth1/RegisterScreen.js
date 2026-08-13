// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import InfoBanner from '../../components/InfoBanner';
import { useRegister } from '../../hooks/useAuthForms';

export default function RegisterScreen({ onGoToLogin }) {
    const theme = useTheme();
    const styles = getStyles(theme);
    const { register, loading, error } = useRegister();

    const [form, setForm] = useState({ name: '', mobile_number: '', email_id: '', alternate_contact_number: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [result, setResult] = useState(null); // { pin, ref_code }

    const setField = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Please enter your name.';
        if (!/^\d{10}$/.test(form.mobile_number)) errs.mobile_number = 'Enter a valid 10-digit mobile number.';
        if (form.email_id && !/^\S+@\S+\.\S+$/.test(form.email_id)) errs.email_id = 'Enter a valid email address.';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            const data = await register(form);
            // Shown temporarily until the backend emails pin + ref_code instead.
            setResult({ pin: data.pin, ref_code: data.ref_code });
        } catch {
            // error already surfaced via `error`
        }
    };

    if (result) {
        return (
            <View style={styles.screen}>
                <View style={styles.content}>
                    <AppText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
                        You're registered!
                    </AppText>
                    <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
                        Save these details. They'll also be emailed to you once email delivery is enabled.
                    </AppText>
                    <InfoBanner
                        title="Your login details"
                        rows={[
                            { label: 'PIN', value: result.pin },
                            { label: 'Reference Code', value: result.ref_code },
                        ]}
                    />
                    <Button label="Continue to Login" onPress={onGoToLogin} />
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <AppText variant="h2" style={{ marginBottom: theme.spacing.xs }}>
                    Create your account
                </AppText>
                <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
                    Just a few details to get your spiritual calendar started.
                </AppText>

                <FormField label="Full Name" value={form.name} onChangeText={setField('name')} placeholder="Souvagya Mohanty" autoCapitalize="words" error={fieldErrors.name} />
                <FormField
                    label="Mobile Number"
                    value={form.mobile_number}
                    onChangeText={setField('mobile_number')}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={fieldErrors.mobile_number}
                />
                <FormField
                    label="Email ID"
                    value={form.email_id}
                    onChangeText={setField('email_id')}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    error={fieldErrors.email_id}
                />
                <FormField
                    label="Alternate Contact Number (optional)"
                    value={form.alternate_contact_number}
                    onChangeText={setField('alternate_contact_number')}
                    placeholder="9876543210"
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                {error ? (
                    <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
                        {error}
                    </AppText>
                ) : null}

                <Button label="Register" onPress={handleSubmit} loading={loading} style={{ marginTop: theme.spacing.sm }} />

                <View style={styles.footerRow}>
                    <AppText variant="bodySmall" color="textSecondary">
                        Already have an account?
                    </AppText>
                    <Button label="Log in" variant="text" onPress={onGoToLogin} fullWidth={false} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.color.background },
        content: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxxl, paddingBottom: theme.spacing.huge },
        footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.md },
    });