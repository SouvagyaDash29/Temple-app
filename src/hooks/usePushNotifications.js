// src/hooks/usePushNotifications.js
import { useEffect, useRef, useState } from 'react';
import {
  ensureNotificationPermissions,
  registerForPushNotifications,
  addNotificationResponseListener,
} from '../services/notificationService';
import { userApi } from '../services/calendarApi';

/**
 * Call once near the app root (see App.js).
 *  1. Always ensures local notification permission + the Android channel —
 *     this alone is enough for event reminders to work, no Firebase needed.
 *  2. Separately (best-effort) registers for remote push. If FCM isn't
 *     configured on Android yet, this step fails quietly and step 1 is
 *     unaffected.
 */
export function usePushNotifications({ onNotificationTap } = {}) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const listenerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const granted = await ensureNotificationPermissions();
      if (!isMounted) return;
      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      // Remote push is optional — never let a failure here affect local
      // reminders, which have already been unlocked above.
      const token = await registerForPushNotifications();
      if (!isMounted || !token) return;

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
