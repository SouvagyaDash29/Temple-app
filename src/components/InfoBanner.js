// src/components/InfoBanner.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import AppText from './AppText';

/**
 * Used to show values that are only surfaced in the response temporarily
 * (registration PIN + ref_code, forget-pin's e_pin) until email delivery
 * is wired up on the backend.
 */
export default function InfoBanner({ title, rows = [] }) {
    const theme = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Info size={18} color={theme.color.secondary} />
                <AppText variant="bodySmall" style={{ marginLeft: theme.spacing.sm, color: theme.color.secondary }}>
                    {title}
                </AppText>
            </View>
            {rows.map((row) => (
                <View key={row.label} style={styles.row}>
                    <AppText variant="bodySmall" color="textSecondary">
                        {row.label}
                    </AppText>
                    <AppText variant="h3">{row.value}</AppText>
                </View>
            ))}
        </View>
    );
}

const getStyles = (theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.color.secondaryLight,
            borderRadius: theme.radius.md,
            padding: theme.spacing.base,
            marginBottom: theme.spacing.lg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
        },
    });