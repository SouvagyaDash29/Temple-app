// src/context/AuthContext.js
// Single source of truth for "where should the user land":
//   no token + no ref_code -> Register
//   no token + ref_code    -> Login
//   token present          -> App (Calendar)
//
// Wrap the app in <AuthProvider> once (see App.js) and read state via
// useAuthContext() anywhere.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    getToken,
    getCustRefCode,
    getCustomerId,
    getRefCode,
    saveSession,
    saveRefCode,
    clearSession,
    clearRefCode,
} from '../services/authStorage';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [status, setStatus] = useState('loading'); // 'loading' | 'register' | 'login' | 'authenticated'
    const [session, setSession] = useState({ token: null, custRefCode: null, customerId: null });
    const [refCode, setRefCode] = useState(null);

    const bootstrap = useCallback(async () => {
        const [token, custRefCode, customerId, storedRefCode] = await Promise.all([
            getToken(),
            getCustRefCode(),
            getCustomerId(),
            getRefCode(),
        ]);

        if (token) {
            setSession({ token, custRefCode, customerId });
            setStatus('authenticated');
        } else if (storedRefCode) {
            setRefCode(storedRefCode);
            setStatus('login');
        } else {
            setStatus('register');
        }
    }, []);

    useEffect(() => {
        bootstrap();
    }, [bootstrap]);

    /** Call after a successful registration API response. */
    const completeRegistration = useCallback(async ({ ref_code }) => {
        await saveRefCode(ref_code);
        setRefCode(ref_code);
        setStatus('login'); // register -> redirect to login, per spec
    }, []);

    /** Call after a successful login API response. */
    const completeLogin = useCallback(async ({ token, cust_ref_code, customer_id }) => {
        await saveSession({ token, cust_ref_code, customer_id });
        setSession({ token, custRefCode: cust_ref_code, customerId: customer_id });
        setStatus('authenticated');
    }, []);

    const logout = useCallback(async () => {
        await clearSession();
        // ref_code is intentionally kept — a logged-out returning devotee
        // should land back on Login, not Register.
        setSession({ token: null, custRefCode: null, customerId: null });
        setStatus(refCode ? 'login' : 'register');

    }, [refCode]);

    /** Rarely needed: fully forget this device's devotee (e.g. "not you?" link). */
    const forgetDevice = useCallback(async () => {
        await clearSession();
        await clearRefCode();
        setSession({ token: null, custRefCode: null, customerId: null });
        setRefCode(null);
        setStatus('register');
    }, []);

    const value = useMemo(
        () => ({
            status, // drives navigation in App.js
            session,
            refCode,
            authApi,
            completeRegistration,
            completeLogin,
            logout,
            forgetDevice,
            goToRegister: () => setStatus('register'),
            goToLogin: () => setStatus('login'),
        }),
        [status, session, refCode, completeRegistration, completeLogin, logout, forgetDevice]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
}