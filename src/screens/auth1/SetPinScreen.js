// src/screens/auth/SetPinScreen.js
// u_pin = customer's id, o_pin = old pin, n_pin = new pin.
// Reached from Profile ("Change PIN") or right after using a forget-pin
// temporary PIN to log in.
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import { useSetPin } from '../../hooks/useAuthForms';
import { useAuthContext } from '../../context/AuthContext';

export default function SetPinScreen({ onDone, onCancel }) {
    const theme = useTheme();
    const styles = getStyles(theme);
    const { setPin, loading, error } = useSetPin();
    const { session } = useAuthContext();

    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const errs = {};
        if (!oldPin.trim()) errs.oldPin = 'Enter your current PIN.';
        if (!/^\d{4,6}$/.test(newPin)) errs.newPin = 'New PIN must be 4-6 digits.';
        if (newPin !== confirmPin) errs.confirmPin = 'PINs do not match.';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            await setPin({ u_pin: session.customerId, o_pin: oldPin, n_pin: newPin });
            setSuccess(true);
        } catch {
            // error already surfaced via `error`
        }
    };

    if (success) {
        return (
            <View style={styles.screen}>
                <View style={styles.content}>
                    <AppText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
                        PIN updated
                    </AppText>
                    <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xl }}>
                        Use your new PIN the next time you log in.
                    </AppText>
                    <Button label="Done" onPress={onDone} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <AppText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
                    Change your PIN
                </AppText>
                <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xxl }}>
                    Enter your current PIN and choose a new one.
                </AppText>

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
                {onCancel ? <Button label="Cancel" variant="text" onPress={onCancel} style={{ marginTop: theme.spacing.md }} /> : null}
            </View>
        </View>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.color.background },
        content: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl },
    });