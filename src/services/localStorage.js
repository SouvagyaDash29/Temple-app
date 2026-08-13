// src/services/localStorage.js
// Non-sensitive local persistence (onboarding flag, preferences, cached
// personal events for offline-first calendar reads).
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDED: 'temple_app_onboarded',
  PREFERENCE_CHOSEN: 'temple_app_preference_chosen', // first-time "pick your calendar" gate
  PREFERENCES: 'temple_app_preferences',
  PERSONAL_EVENTS: 'temple_app_personal_events',
};

async function getJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const localStorage = {
  KEYS,
  getJson,
  setJson,
  remove: (key) => AsyncStorage.removeItem(key),

  hasOnboarded: () => getJson(KEYS.ONBOARDED, false),
  setOnboarded: (value = true) => setJson(KEYS.ONBOARDED, value),

  // Distinct from "state is null" (which is a valid, deliberate choice of
  // "plain calendar"). This flag tracks whether the first-time preference
  // screen has ever been completed at all.
  hasChosenPreference: () => getJson(KEYS.PREFERENCE_CHOSEN, false),
  setPreferenceChosen: (value = true) => setJson(KEYS.PREFERENCE_CHOSEN, value),

  // state: e.g. 'odisha' | null (no state chosen -> plain calendar, no festival data)
  // panji: e.g. 'jagannath_panji' | null (no panji chosen -> plain calendar within that state)
  getPreferences: () =>
    getJson(KEYS.PREFERENCES, { language: 'en', state: null, panji: null, deities: [], temples: [] }),
  setPreferences: (prefs) => setJson(KEYS.PREFERENCES, prefs),
  updatePreferences: async (patch) => {
    const current = await getJson(KEYS.PREFERENCES, { language: 'en', state: null, panji: null, deities: [], temples: [] });
    const next = { ...current, ...patch };
    await setJson(KEYS.PREFERENCES, next);
    return next;
  },

  getPersonalEvents: () => getJson(KEYS.PERSONAL_EVENTS, []),
  setPersonalEvents: (events) => setJson(KEYS.PERSONAL_EVENTS, events),

  getEventById: async (id) => {
    const events = await getJson(KEYS.PERSONAL_EVENTS, []);
    return events.find((e) => e.id === id) || null;
  },
  updateEventById: async (id, patch) => {
    const events = await getJson(KEYS.PERSONAL_EVENTS, []);
    const next = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    await setJson(KEYS.PERSONAL_EVENTS, next);
    return next.find((e) => e.id === id);
  },
  removeEventById: async (id) => {
    const events = await getJson(KEYS.PERSONAL_EVENTS, []);
    await setJson(KEYS.PERSONAL_EVENTS, events.filter((e) => e.id !== id));
  },
};

export default localStorage;