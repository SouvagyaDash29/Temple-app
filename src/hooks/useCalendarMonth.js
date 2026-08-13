// src/hooks/useCalendarMonth.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMonthPanchang } from '../services/panchangService';
import { localStorage } from '../services/localStorage';
import { buildMonthGrid, monthLabel, toDateKey } from '../utils/date';

/**
 * Loads one month of panchang/festival data (from the GitHub repo, per the
 * user's state/panji preference) and merges in the user's own personal
 * events, then exposes a ready-to-render grid plus month navigation.
 *
 * preference: { state: 'odisha' | null, panji: 'jagannath_panji' | null }
 * If `state` is null, this simply returns a plain calendar (no festival
 * data) — personal events still show.
 */
export function useCalendarMonth(preference, initialDate = new Date()) {
  const [cursor, setCursor] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [panchangByDate, setPanchangByDate] = useState({});
  const [personalByDate, setPersonalByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // Guards against a slow, stale request (e.g. from a month the user has
  // already navigated away from) overwriting fresher state once it resolves
  // out of order — this was the cause of festivals "sometimes" not showing.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const [panchang, personalEvents] = await Promise.all([
        preference?.state ? fetchMonthPanchang(preference, year, month) : Promise.resolve({}),
        localStorage.getPersonalEvents(),
      ]);

      if (thisRequestId !== requestIdRef.current) return; // a newer request has since started

      setPanchangByDate(panchang || {});

      const grouped = {};
      personalEvents
        .filter((e) => {
          const d = new Date(e.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .forEach((e) => {
          const key = toDateKey(new Date(e.date));
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(e);
        });
      setPersonalByDate(grouped);
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      setError(err.message || 'Could not load your calendar.');
      setPanchangByDate({});
      setPersonalByDate({});
    } finally {
      if (thisRequestId === requestIdRef.current) setLoading(false);
    }
  }, [preference?.state, preference?.panji, year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const goToNextMonth = useCallback(() => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToPrevMonth = useCallback(() => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToMonth = useCallback((targetYear, targetMonth) => {
    setCursor(new Date(targetYear, targetMonth, 1));
  }, []);

  // Build the eventTypes-per-date map the CalendarGrid expects: dots only,
  // no text, per design system.
  const eventsByDate = {};
  Object.keys(panchangByDate).forEach((dateKey) => {
    const day = panchangByDate[dateKey];
    if (day?.festivals?.length) {
      eventsByDate[dateKey] = [...(eventsByDate[dateKey] || []), 'festival'];
    }
  });
  Object.keys(personalByDate).forEach((dateKey) => {
    eventsByDate[dateKey] = [...(eventsByDate[dateKey] || []), 'personal'];
  });

  const days = buildMonthGrid(year, month, eventsByDate);

  return {
    year,
    month,
    label: monthLabel(year, month),
    days,
    panchangByDate,
    personalByDate,
    loading,
    error,
    refresh: load,
    goToNextMonth,
    goToPrevMonth,
    goToMonth,
  };
}

export default useCalendarMonth;