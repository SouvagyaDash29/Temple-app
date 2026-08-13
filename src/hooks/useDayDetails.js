// src/hooks/useDayDetails.js
// Derives "Today's Observances" + the day's personal/temple events purely
// from data already loaded by useCalendarMonth — no extra network call
// needed per-day, since the month payload already has every day's tithi/
// nakshatra/festivals.
import { useMemo } from 'react';
import { toDateKey } from '../utils/date';

export function useDayDetails(selectedDate, panchangByDate = {}, personalByDate = {}) {
  const dateKey = selectedDate ? toDateKey(selectedDate) : null;

  return useMemo(() => {
    if (!dateKey) return { observances: [], panchang: null, events: [] };

    const panchang = panchangByDate[dateKey] || null;
    const observances = [];
    if (panchang?.tithi) observances.push(panchang.tithi);
    if (panchang?.festivals?.length) observances.push(...panchang.festivals);

    const personalEvents = (personalByDate[dateKey] || []).map((e) => ({
      id: e.id,
      type: e.type || 'personal',
      title: e.title,
      time: e.time,
      location: e.location,
    }));

    // Festivals surface as their own "temple event"-style cards too, so the
    // Selected Date section matches the design spec's layout even without a
    // temple-events backend yet.
    const festivalCards = (panchang?.festivals || []).map((name, idx) => ({
      id: `${dateKey}-festival-${idx}`,
      type: 'festival',
      title: name,
      time: panchang?.muhurats?.[0],
    }));

    return {
      observances,
      panchang,
      events: [...personalEvents, ...festivalCards],
    };
  }, [dateKey, panchangByDate, personalByDate]);
}

export default useDayDetails;