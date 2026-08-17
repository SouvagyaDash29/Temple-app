// src/i18n/index.js
import { useCallback } from 'react';
import { translations } from './translations';
import { usePreferences } from '../hooks/usePreferences';

const FALLBACK_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { key: 'hi', label: '\u0939\u093f\u0928\u094d\u0926\u0940 (Hindi)' },
  { key: 'or', label: '\u0b13\u0b21\u0bbc\u0bbf\u0bb6\u0bbe (Odia)' },
  { key: 'en', label: 'English' },
];

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );
}

/**
 * const { t, lang, setLanguage } = useTranslation();
 * t('goodMorning') -> looks up preferences.language, falls back to English,
 * falls back to the raw key itself if even English is missing it (so the
 * UI never crashes on a missing translation, worst case it just shows the
 * key in English word-ish form during development).
 *
 * Optional second arg: t('pageOf', { page: 2, total: 12 }) interpolates
 * {placeholders} in the resolved string.
 */
export function useTranslation() {
  const { preferences, update } = usePreferences();
  const lang = preferences?.language || FALLBACK_LANGUAGE;

  const t = useCallback(
    (key, params) =>
      interpolate(translations[lang]?.[key] ?? translations[FALLBACK_LANGUAGE]?.[key] ?? key, params),
    [lang]
  );

  const setLanguage = useCallback((langKey) => update({ language: langKey }), [update]);

  return { t, lang, setLanguage };
}

export default useTranslation;
