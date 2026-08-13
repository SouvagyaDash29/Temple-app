// src/services/googleCalendarService.js
// Handles Google OAuth (via expo-auth-session) and syncing a personal event
// to the user's primary Google Calendar via the Calendar REST API.
//
// Setup required (see SETUP.md):
//  1. Create OAuth client IDs (iOS, Android, Web) in Google Cloud Console.
//  2. Enable the "Google Calendar API".
//  3. Add the scope below to the OAuth consent screen.
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { saveGoogleToken, getGoogleToken, clearGoogleToken } from './authStorage';

WebBrowser.maybeCompleteAuthSession();

const SCOPES = ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar.events'];

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Replace with your own client IDs from Google Cloud Console (SETUP.md).
export const GOOGLE_OAUTH_CONFIG = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

/**
 * Use inside a component with the `useGoogleAuthRequest` hook (see
 * hooks/useGoogleCalendar.js) which wraps AuthSession.useAuthRequest.
 * This helper just builds the shared config object.
 */
export function buildAuthRequestConfig() {
  return {
    clientId:
      GOOGLE_OAUTH_CONFIG.webClientId || GOOGLE_OAUTH_CONFIG.iosClientId || GOOGLE_OAUTH_CONFIG.androidClientId,
    scopes: SCOPES,
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'templeapp' }),
    responseType: 'code',
    usePKCE: true,
  };
}

export async function exchangeCodeForToken(code, redirectUri, codeVerifier) {
  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: GOOGLE_OAUTH_CONFIG.webClientId,
      code,
      redirectUri,
      extraParams: { code_verifier: codeVerifier },
    },
    discovery
  );
  await saveGoogleToken(tokenResponse);
  return tokenResponse;
}

export async function isGoogleCalendarConnected() {
  const token = await getGoogleToken();
  return !!token?.accessToken;
}

export async function disconnectGoogleCalendar() {
  await clearGoogleToken();
}

async function getValidAccessToken() {
  const token = await getGoogleToken();
  if (!token) throw new Error('Google Calendar is not connected.');

  const isExpired = token.issuedAt && token.expiresIn && Date.now() / 1000 > token.issuedAt + token.expiresIn - 60;

  if (!isExpired) return token.accessToken;

  const refreshed = await AuthSession.refreshAsync(
    { clientId: GOOGLE_OAUTH_CONFIG.webClientId, refreshToken: token.refreshToken },
    discovery
  );
  await saveGoogleToken({ ...token, ...refreshed, issuedAt: Date.now() / 1000 });
  return refreshed.accessToken;
}

/**
 * Push a temple-app event into the user's primary Google Calendar.
 * event: { title, notes, startDate: Date, endDate: Date, location }
 * Returns the created Google event id — store it so edits/deletes can sync too.
 */
export async function addEventToGoogleCalendar(event) {
  const accessToken = await getValidAccessToken();

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.title,
      description: event.notes || '',
      location: event.location || '',
      start: { dateTime: event.startDate.toISOString() },
      end: { dateTime: (event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)).toISOString() },
      recurrence: event.repeatYearly ? ['RRULE:FREQ=YEARLY'] : undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Could not sync this event to Google Calendar.');
  }

  return response.json();
}

export async function updateGoogleCalendarEvent(googleEventId, event) {
  const accessToken = await getValidAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: event.title,
        description: event.notes || '',
        location: event.location || '',
        start: { dateTime: event.startDate.toISOString() },
        end: { dateTime: (event.endDate || new Date(event.startDate.getTime() + 60 * 60 * 1000)).toISOString() },
      }),
    }
  );
  if (!response.ok) throw new Error('Could not update the Google Calendar event.');
  return response.json();
}

export async function deleteGoogleCalendarEvent(googleEventId) {
  const accessToken = await getValidAccessToken();
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
