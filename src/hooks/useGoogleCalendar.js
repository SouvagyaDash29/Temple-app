// src/hooks/useGoogleCalendar.js
import { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { saveGoogleToken, getGoogleToken } from '../services/authStorage';
import { isGoogleCalendarConnected, disconnectGoogleCalendar } from '../services/googleCalendarService';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const SCOPES = ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/calendar.events'];

/**
 * Drop this in a screen (e.g. Profile / Preferences) to let the user connect
 * their Google Calendar. `connect()` opens the OAuth consent screen.
 *
 * Uses expo-auth-session's official Google provider, which picks the right
 * client ID (iOS/Android/Web) and redirect scheme for the current platform
 * automatically — this is what fixes silent failures you'd get from
 * manually building the request with a Web client ID on a native build.
 */
export function useGoogleCalendar() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const redirectUri = AuthSession.makeRedirectUri({
    native: 'com.yourorg.templedevotee:/oauth2redirect/google',
  })

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // only used on Expo web

    redirectUri,

    scopes: SCOPES,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    // access_type=offline + prompt=consent are required to get a
    // refreshToken back — without these Google only issues a short-lived
    // access token and the connection silently stops working after ~1hr.
    extraParams: { access_type: 'offline', prompt: 'consent' },
  });

  useEffect(() => {
    isGoogleCalendarConnected().then(setConnected);
  }, []);

  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') {
        if (response?.type === 'error') {
          setError(response.error?.message || 'Could not connect Google Calendar.');
        }
        return;
      }
      setConnecting(true);
      setError(null);
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: request.clientId, // same client ID the request used — required
            code: response.params.code,
            redirectUri: request.redirectUri,
            extraParams: { code_verifier: request.codeVerifier },
          },
          discovery
        );
        await saveGoogleToken({
          ...tokenResponse,
          clientId: request.clientId,
          issuedAt: Date.now() / 1000,
        });
        setConnected(true);
      } catch (err) {
        setError(err.message || 'Could not connect Google Calendar.');
      } finally {
        setConnecting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const connect = useCallback(() => {
    setError(null);
    promptAsync();
  }, [promptAsync]);

  const disconnect = useCallback(async () => {
    await disconnectGoogleCalendar();
    setConnected(false);
  }, []);

  return { connected, connecting, error, connect, disconnect, isRequestReady: !!request };
}

export default useGoogleCalendar;
