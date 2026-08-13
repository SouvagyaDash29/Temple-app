// src/screens/auth/ForgetPinScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import InfoBanner from '../../components/InfoBanner';
import { useForgetPin } from '../../hooks/useAuthForms';

export default function ForgetPinScreen({ onBackToLogin }) {
    const theme = useTheme();
    const styles = getStyles(theme);
    const { forgetPin, loading, error } = useForgetPin();

    const [mobileNumber, setMobileNumber] = useState('');
    const [fieldError, setFieldError] = useState(null);
    const [result, setResult] = useState(null); // { e_pin }

    const handleSubmit = async () => {
        if (!/^\d{10}$/.test(mobileNumber)) {
            setFieldError('Enter a valid 10-digit mobile number.');
            return;
        }
        setFieldError(null);
        try {
            const data = await forgetPin({ mobile_number: mobileNumber });
            setResult({ e_pin: data.e_pin });
        } catch {
            // error already surfaced via `error`
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.content}>
                <AppText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
                    Forgot your PIN?
                </AppText>
                <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.xxl }}>
                    Enter your mobile number and we'll send you a temporary PIN.
                </AppText>

                {result ? (
                    <>
                        <InfoBanner
                            title="Temporary PIN"
                            rows={[{ label: 'PIN', value: result.e_pin }]}
                        />
                        <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.lg }}>
                            This will be emailed to you once email delivery is enabled. Use
                            it to log in, then set a new PIN from your profile.
                        </AppText>
                        <Button label="Back to Login" onPress={onBackToLogin} />
                    </>
                ) : (
                    <>
                        <FormField
                            label="Mobile Number"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            placeholder="9876543210"
                            keyboardType="phone-pad"
                            maxLength={10}
                            error={fieldError}
                        />
                        {error ? (
                            <AppText variant="bodySmall" color="error" style={{ marginBottom: theme.spacing.base }}>
                                {error}
                            </AppText>
                        ) : null}
                        <Button label="Send Temporary PIN" onPress={handleSubmit} loading={loading} />
                        <Button label="Back to Login" variant="text" onPress={onBackToLogin} style={{ marginTop: theme.spacing.md }} />
                    </>
                )}
            </View>
        </View>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        screen: { flex: 1, backgroundColor: theme.color.background },
        content: { flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.xl },
    });