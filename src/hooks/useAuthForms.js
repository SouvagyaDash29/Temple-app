// src/hooks/useAuthForms.js
import { useCallback, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

function useAsyncAction(actionFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);
            try {
                return await actionFn(...args);
            } catch (err) {
                setError(err.message || 'Something went wrong. Please try again.');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [actionFn]
    );

    return { run, loading, error, setError };
}

/**
 * name, mobile_number, email_id, alternate_contact_number
 * On success returns { pin, ref_code } and stores ref_code, so the caller
 * can show the temporary pin/ref_code before navigating to Login.
 */
export function useRegister() {
    const { authApi, completeRegistration } = useAuthContext();

    const action = useCallback(
        async (form) => {
            const data = await authApi.register(form);
            await completeRegistration({ ref_code: data.ref_code });
            return data; // { pin, ref_code, message }
        },
        [authApi, completeRegistration]
    );

    const { run, loading, error } = useAsyncAction(action);
    return { register: run, loading, error };
}

/** mobile_number, pin -> stores token/cust_ref_code/customer_id */
export function useLogin() {
    const { authApi, completeLogin } = useAuthContext();

    const action = useCallback(
        async (form) => {
            const data = await authApi.login(form);
            await completeLogin({
                token: data.token,
                cust_ref_code: data.cust_ref_code,
                customer_id: data.customer_id,
            });
            return data;
        },
        [authApi, completeLogin]
    );

    const { run, loading, error } = useAsyncAction(action);
    return { login: run, loading, error };
}

/** mobile_number only -> returns { e_pin } to display temporarily */
export function useForgetPin() {
    const { authApi } = useAuthContext();
    const { run, loading, error } = useAsyncAction((form) => authApi.forgetPin(form));
    return { forgetPin: run, loading, error };
}

/** u_pin (customer id), o_pin (old pin), n_pin (new pin) */
export function useSetPin() {
    const { authApi } = useAuthContext();
    const { run, loading, error } = useAsyncAction((form) => authApi.setPin(form));
    return { setPin: run, loading, error };
}