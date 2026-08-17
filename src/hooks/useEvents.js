// src/hooks/useEvents.js
// Personal events are stored locally on-device (localStorage) — see file
// header note in services/localStorage.js. Swap these calls for a real
// `eventsApi` later; the hook's public shape won't need to change.
import { useCallback, useState } from 'react';
import { localStorage } from '../services/localStorage';
import { scheduleEventReminder, cancelReminder } from '../services/notificationService';
import {
  addEventToGoogleCalendar,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  isGoogleCalendarConnected,
} from '../services/googleCalendarService';

const REMINDER_MINUTES = { '1_min_test': 1, '15_min': 15, '1_hour': 60, '1_day': 1440, '1_week': 10080 };

function makeId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useEvents() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const getEvent = useCallback((id) => localStorage.getEventById(id), []);

  const createEvent = useCallback(async (formValues, { syncToGoogle = true } = {}) => {
    setSaving(true);
    setError(null);
    try {
      const created = {
        id: makeId(),
        title: formValues.title,
        type: formValues.type || 'personal',
        date: formValues.date.toISOString(),
        repeat: formValues.repeat,
        reminder: formValues.reminder,
        notes: formValues.notes,
        notificationId: null,
        googleEventId: null,
      };

      if (formValues.reminder && formValues.reminder !== 'none') {
        created.notificationId = await scheduleEventReminder({
          title: created.title,
          body: `${created.title} is coming up`,
          eventDate: formValues.date,
          reminderOffsetMinutes: REMINDER_MINUTES[formValues.reminder] || 60,
        });
      }

      if (syncToGoogle) {
        try {
          const connected = await isGoogleCalendarConnected();
          if (connected) {
            const googleEvent = await addEventToGoogleCalendar({
              title: created.title,
              notes: created.notes,
              startDate: formValues.date,
              repeatYearly: formValues.repeat === 'yearly',
            });
            created.googleEventId = googleEvent.id;
          }
        } catch (googleErr) {
          console.warn('Google Calendar sync failed:', googleErr.message);
        }
      }

      const cached = await localStorage.getPersonalEvents();
      await localStorage.setPersonalEvents([...cached, created]);
      return created;
    } catch (err) {
      setError(err.message || 'Could not save this event.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  /** Edits an existing event: reschedules its reminder and re-syncs to Google. */
  const updateEvent = useCallback(async (id, formValues, { syncToGoogle = true } = {}) => {
    setSaving(true);
    setError(null);
    try {
      const existing = await localStorage.getEventById(id);
      if (!existing) throw new Error('This event no longer exists.');

      if (existing.notificationId) {
        await cancelReminder(existing.notificationId);
      }

      let notificationId = null;
      if (formValues.reminder && formValues.reminder !== 'none') {
        notificationId = await scheduleEventReminder({
          title: formValues.title,
          body: `${formValues.title} is coming up`,
          eventDate: formValues.date,
          reminderOffsetMinutes: REMINDER_MINUTES[formValues.reminder] || 60,
        });
      }

      let googleEventId = existing.googleEventId || null;
      if (syncToGoogle) {
        try {
          const connected = await isGoogleCalendarConnected();
          if (connected) {
            if (googleEventId) {
              await updateGoogleCalendarEvent(googleEventId, {
                title: formValues.title,
                notes: formValues.notes,
                startDate: formValues.date,
              });
            } else {
              const googleEvent = await addEventToGoogleCalendar({
                title: formValues.title,
                notes: formValues.notes,
                startDate: formValues.date,
                repeatYearly: formValues.repeat === 'yearly',
              });
              googleEventId = googleEvent.id;
            }
          }
        } catch (googleErr) {
          console.warn('Google Calendar sync failed:', googleErr.message);
        }
      }

      const updated = await localStorage.updateEventById(id, {
        title: formValues.title,
        type: formValues.type || existing.type,
        date: formValues.date.toISOString(),
        repeat: formValues.repeat,
        reminder: formValues.reminder,
        notes: formValues.notes,
        notificationId,
        googleEventId,
      });
      return updated;
    } catch (err) {
      setError(err.message || 'Could not update this event.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteEvent = useCallback(async (event) => {
    if (event.notificationId) await cancelReminder(event.notificationId);
    if (event.googleEventId) {
      try {
        const connected = await isGoogleCalendarConnected();
        if (connected) await deleteGoogleCalendarEvent(event.googleEventId);
      } catch (googleErr) {
        console.warn('Could not remove event from Google Calendar:', googleErr.message);
      }
    }
    await localStorage.removeEventById(event.id);
  }, []);

  return { getEvent, createEvent, updateEvent, deleteEvent, saving, error };
}

export default useEvents;
