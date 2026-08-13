// src/services/calendarApi.js
// All backend calls related to the panchang/festival/temple calendar data.
// Screens and hooks never call apiClient directly — they go through here,
// so the backend contract only has to change in one place.
import { apiClient } from './apiClient';

export const calendarApi = {
  /**
   * Fetch panchang + festival + temple-event data for a given month.
   * month: 1-12, year: e.g. 2026
   */
  getMonth: (year, month) => apiClient.get(`/calendar?year=${year}&month=${month}`),

  /** Fetch full detail (observances, temple events) for a single date. */
  getDayDetails: (dateKey) => apiClient.get(`/calendar/day/${dateKey}`),
};

export const eventsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/events${query ? `?${query}` : ''}`);
  },
  create: (event) => apiClient.post('/events', event),
  update: (id, event) => apiClient.put(`/events/${id}`, event),
  remove: (id) => apiClient.delete(`/events/${id}`),
};

export const userApi = {
  getPreferences: () => apiClient.get('/me/preferences'),
  updatePreferences: (prefs) => apiClient.patch('/me/preferences', prefs),
  getMe: () => apiClient.get('/me'),
};
