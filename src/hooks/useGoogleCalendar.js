// src/hooks/useGoogleCalendar.js
import { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import {
  buildAuthRequestConfig,
  exchangeCodeForToken,
  isGoogleCalendarConnected,
  disconnectGoogleCalendar,
} from '../services/googleCalendarService';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

/**
 * Drop this in a screen (e.g. Profile / Preferences) to let the user connect
 * their Google Calendar. `promptAsync()` opens the OAuth consent screen.
 */
export function useGoogleCalendar() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const config = buildAuthRequestConfig();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(config, discovery);

  useEffect(() => {
    isGoogleCalendarConnected().then(setConnected);
  }, []);

  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') return;
      setConnecting(true);
      try {
        await exchangeCodeForToken(response.params.code, config.redirectUri, request?.codeVerifier);
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
