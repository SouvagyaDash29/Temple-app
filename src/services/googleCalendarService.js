// src/services/googleCalendarService.js
// Handles Google Calendar sync via the Calendar REST API. OAuth itself is
// driven by hooks/useGoogleCalendar.js using expo-auth-session's official
// Google provider — this file only holds the token storage + Calendar API
// calls, plus the discovery doc used for refreshing tokens.
//
// IMPORTANT — client ID setup (this was the bug):
// Google's "Web application" OAuth client type only accepts https/localhost
// redirect URIs — it silently rejects a custom app scheme like
// "templeapp://", so sign-in fails quietly. For a native Expo dev/standalone
// build you need:
//   - An "iOS" OAuth client ID, Bundle ID matching app.json's
//     ios.bundleIdentifier.
//   - An "Android" OAuth client ID, package name matching app.json's
//     android.package, with your dev-client/EAS build's SHA-1 fingerprint
//     added.
// Put both (plus a Web client ID only if you also support Expo web) in
// .env. The SAME client ID must be used for the auth request, the code
// exchange, and every token refresh — mixing them causes silent failures,
// so we store which one was used alongside the token (see saveGoogleToken).
import * as AuthSession from 'expo-auth-session';
import { saveGoogleToken, getGoogleToken, clearGoogleToken } from './authStorage';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Fetches the connected Google account's basic profile (email, name) using
 * the current access token — used to show "Connected as you@gmail.com" in
 * the UI instead of just a blind "Connected" state.
 */
export async function fetchGoogleUserInfo(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Could not fetch the connected Google account.');
  return response.json(); // { email, name, picture, ... }
}

export async function getConnectedGoogleAccountEmail() {
  const token = await getGoogleToken();
  return token?.email || null;
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

  const isExpired =
    token.issuedAt && token.expiresIn && Date.now() / 1000 > token.issuedAt + token.expiresIn - 60;

  if (!isExpired) return token.accessToken;

  if (!token.refreshToken) {
    throw new Error('Your Google Calendar connection expired. Please reconnect it.');
  }

  // Must reuse the exact client ID the original request/exchange used.
  const refreshed = await AuthSession.refreshAsync(
    { clientId: token.clientId, refreshToken: token.refreshToken },
    discovery
  );
  const next = { ...token, ...refreshed, issuedAt: Date.now() / 1000 };
  await saveGoogleToken(next);
  return next.accessToken;
}

/**
 * Push a temple-app event into the user's primary Google Calendar.
 * event: { title, notes, startDate: Date, endDate: Date, location }
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
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Could not update the Google Calendar event.');
  }
  return response.json();
}

export async function deleteGoogleCalendarEvent(googleEventId) {
  const accessToken = await getValidAccessToken();
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
