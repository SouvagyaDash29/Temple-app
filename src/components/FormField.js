// src/components/FormField.js
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';

/**
 * Single labeled input, shared by Register/Login/ForgetPin/SetPin screens.
 * Labels are always visible (never placeholder-only), per design system.
 */
export default function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    maxLength,
    autoCapitalize = 'none',
    error,
    style,
}) {
    const theme = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={[{ marginBottom: theme.spacing.lg }, style]}>
            <AppText variant="bodySmall" color="textSecondary" style={{ marginBottom: theme.spacing.xs }}>
                {label}
            </AppText>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.color.textDisabled}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                maxLength={maxLength}
                autoCapitalize={autoCapitalize}
                style={[styles.input, error && styles.inputError]}
            />
            {error ? (
                <AppText variant="caption" color="error" style={{ marginTop: theme.spacing.xs }}>
                    {error}
                </AppText>
            ) : null}
        </View>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        input: {
            height: theme.inputHeight.default,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.base,
            backgroundColor: theme.color.surface,
            color: theme.color.text,
            fontSize: 16,
        },
        inputError: {
            borderColor: theme.color.error,
        },
    });