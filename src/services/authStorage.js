// src/services/authStorage.js
// Wraps expo-secure-store so auth tokens never sit in plain AsyncStorage.
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'temple_app_auth_token';
const CUST_REF_CODE_KEY = 'temple_app_cust_ref_code';
const CUSTOMER_ID_KEY = 'temple_app_customer_id';
const REF_CODE_KEY = 'temple_app_ref_code'; // returned at registration, before login
const GOOGLE_TOKEN_KEY = 'temple_app_google_token';

export async function saveSession({ token, cust_ref_code, customer_id }) {
  await Promise.all([
    SecureStore.setItemAsync(AUTH_TOKEN_KEY, String(token)),
    SecureStore.setItemAsync(CUST_REF_CODE_KEY, String(cust_ref_code)),
    SecureStore.setItemAsync(CUSTOMER_ID_KEY, String(customer_id)),
  ]);
}

export async function getToken() {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function getCustRefCode() {
  return SecureStore.getItemAsync(CUST_REF_CODE_KEY);
}

export async function getCustomerId() {
  return SecureStore.getItemAsync(CUSTOMER_ID_KEY);
}

export async function clearSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
    SecureStore.deleteItemAsync(CUST_REF_CODE_KEY),
    SecureStore.deleteItemAsync(CUSTOMER_ID_KEY),
  ]);
}

export async function saveToken(token) {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

// ---- ref_code (returned at registration, before the user has ever logged in) ----
// Presence of this (without a token) means: show Login screen, not Register.

export async function saveRefCode(refCode) {
  await SecureStore.setItemAsync(REF_CODE_KEY, String(refCode));
}

export async function getRefCode() {
  return SecureStore.getItemAsync(REF_CODE_KEY);
}

export async function clearRefCode() {
  await SecureStore.deleteItemAsync(REF_CODE_KEY);
}

// ---- Google Calendar OAuth token (separate concern) ----

export async function saveGoogleToken(tokenPayload) {
  await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, JSON.stringify(tokenPayload));
}

export async function getGoogleToken() {
  const raw = await SecureStore.getItemAsync(GOOGLE_TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearGoogleToken() {
  await SecureStore.deleteItemAsync(GOOGLE_TOKEN_KEY);
}