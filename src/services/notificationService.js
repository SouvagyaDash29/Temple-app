// src/services/notificationService.js
// All expo-notifications logic lives here. Two concerns are kept deliberately
// separate:
//   1. Local scheduling (reminders) — works fully offline, no Firebase/FCM,
//      no server. This is what event reminders use.
//   2. Remote push token registration — requires FCM on Android (a Firebase
//      project + google-services.json uploaded to EAS). Optional; only
//      needed if you later add server-triggered notifications. If it fails
//      or FCM isn't configured, local reminders must keep working.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let permissionEnsured = false;

/**
 * Requests notification permission and creates the Android channel.
 * Safe to call many times — only does real work once. This is required
 * before ANY notification (local or remote) will show on Android 8+, and
 * must NOT be blocked by push-token/FCM failures.
 */
export async function ensureNotificationPermissions() {
  if (permissionEnsured) return true;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Spiritual calendar',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      lightColor: '#7A263A',
    });
  }

  permissionEnsured = true;
  return true;
}

/**
 * Optional: registers this device for REMOTE push (needs FCM configured on
 * Android — a Firebase project + google-services.json in EAS credentials).
 * Returns null (and logs a warning) instead of throwing if that isn't set
 * up yet, so it never breaks local reminders.
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) return null;

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data;
  } catch (err) {
    // Expected until FCM (Android) / APNs (iOS) credentials are set up in
    // EAS. Local reminders below are unaffected.
    console.warn('Remote push registration skipped:', err.message);
    return null;
  }
}

/**
 * Schedule a local reminder for a personal/festival event.
 * reminderOffsetMinutes: e.g. 1440 for "1 day before", or a fraction like
 * 1/60 for "1 minute before" (used by the "Test in 1 minute" option).
 */
export async function scheduleEventReminder({ title, body, eventDate, reminderOffsetMinutes = 60 }) {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    console.warn('Notification permission not granted — reminder not scheduled.');
    return null;
  }

  const triggerDate = new Date(eventDate.getTime() - reminderOffsetMinutes * 60 * 1000);

  if (triggerDate.getTime() <= Date.now()) {
    return null; // in the past — nothing to schedule
  }

  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    // SDK 51+ requires an explicit trigger `type` — a bare Date is no
    // longer accepted and throws "trigger object ... invalid".
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

/**
 * Fires a notification ~60 seconds from now, ignoring eventDate entirely.
 * Use this to sanity-check that local notifications work on a dev build
 * without waiting for a real reminder offset.
 */
export async function scheduleTestNotificationIn1Minute() {
  const granted = await ensureNotificationPermissions();
  if (!granted) throw new Error('Notification permission was not granted.');

  return Notifications.scheduleNotificationAsync({
    content: { title: 'Test reminder', body: 'This confirms local notifications are working.', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60, repeats: false },
  });
}

export async function cancelReminder(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
