// src/services/authApi.js
// All devotee auth endpoints live here. Screens/hooks never call apiClient
// directly for auth — they go through this file, so the request/response
// shape only has to change in one place if the backend contract changes.
import { apiClient } from './apiClient';

// TODO: replace with your real endpoint paths once the backend is ready.
const base_path_login = "/customer/api"

const ENDPOINTS = {
    REGISTER: `${base_path_login}/customer_registration/`,
    LOGIN: `${base_path_login}/customer_pin_login/`,
    FORGET_PIN: `${base_path_login}/customer_forget_pin/`,
    SET_PIN: `${base_path_login}/customer_set_pin/`,
};

export const authApi = {
    /**
     * name, mobile_number, email_id, alternate_contact_number
     * Response (current/temporary shape — pin will move to email later):
     *   { pin, ref_code, message }
     */
    register: ({ name, mobile_number, email_id, alternate_contact_number }) =>
        apiClient.post(
            ENDPOINTS.REGISTER,
            { name, mobile_number, email_id, alternate_contact_number },
            { auth: false }
        ),

    /**
     * mobile_number, pin
     * Response: { token, cust_ref_code, customer_id }
     */
    login: ({ mobile_number, pin }) =>
        apiClient.post(ENDPOINTS.LOGIN, { mobile_number, pin }, { auth: false }),

    /**
     * mobile_number only.
     * Response (temporary — e_pin will move to email later): { e_pin, message }
     */
    forgetPin: ({ mobile_number }) =>
        apiClient.post(ENDPOINTS.FORGET_PIN, { mobile_number }, { auth: false }),

    /**
     * u_pin -> customer_id, o_pin -> old pin, n_pin -> new pin
     * Response: { message }
     */
    setPin: ({ u_pin, o_pin, n_pin }) =>
        apiClient.post(ENDPOINTS.SET_PIN, { u_pin, o_pin, n_pin }),
};

export default authApi;