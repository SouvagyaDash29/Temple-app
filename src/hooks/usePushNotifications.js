// src/hooks/usePushNotifications.js
import { useEffect, useRef, useState } from 'react';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
} from '../services/notificationService1';
import { userApi } from '../services/calendarApi';

/**
 * Call once near the app root (see App.js). Registers the device for push,
 * saves the Expo push token to the backend, and routes notification taps.
 */
export function usePushNotifications({ onNotificationTap } = {}) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const listenerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const token = await registerForPushNotifications();
      if (!isMounted) return;

      if (!token) {
        setPermissionDenied(true);
        return;
      }

      setExpoPushToken(token);
      try {
        await userApi.updatePreferences({ pushToken: token });
      } catch (err) {
        console.warn('Could not save push token to backend:', err.message);
      }
    })();

    listenerRef.current = addNotificationResponseListener((response) => {
      onNotificationTap?.(response.notification.request.content.data);
    });

    return () => {
      isMounted = false;
      listenerRef.current?.remove();
    };
  }, [onNotificationTap]);

  return { expoPushToken, permissionDenied };
}

export default usePushNotifications;
