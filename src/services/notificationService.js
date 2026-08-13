// src/services/notificationService.js
// All expo-notifications logic lives here: permission requests, push-token
// registration, and scheduling a *local* reminder notification tied to an
// event. Screens/hooks call these functions, never `Notifications.*` directly.
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Foreground behaviour: show a gentle banner + sound, no badge spam.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null; // caller should show a friendly explanation, not force it
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Spiritual calendar',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      lightColor: '#7A263A',
    });
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return tokenResponse.data; // send this to your backend to enable remote push
}

/**
 * Schedule a local reminder for a personal/festival event.
 * reminderOffsetMinutes: e.g. 1440 for "1 day before"
 * Returns the notification identifier — store it on the event so it can be
 * cancelled later if the event is edited or deleted.
 */
export async function scheduleEventReminder({ title, body, eventDate, reminderOffsetMinutes = 60 }) {
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

export async function cancelReminder(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
