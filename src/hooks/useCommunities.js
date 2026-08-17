// src/hooks/useCommunities.js
import { useCallback, useEffect, useState } from 'react';
import { communityApi } from '../services/communityApi';

export function useCommunities() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await communityApi.list(search);
      setGroups(data.groups || data || []);
    } catch (err) {
      setError(err.message || 'Could not load communities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createGroup = useCallback(
    async (form) => {
      const created = await communityApi.create(form);
      setGroups((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const joinGroup = useCallback(async (groupId) => {
    // Optimistic update — flip immediately, roll back on failure.
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isMember: true, memberCount: (g.memberCount || 0) + 1 } : g)));
    try {
      await communityApi.join(groupId);
    } catch (err) {
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isMember: false, memberCount: Math.max(0, (g.memberCount || 1) - 1) } : g)));
      throw err;
    }
  }, []);

  const leaveGroup = useCallback(async (groupId) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isMember: false, memberCount: Math.max(0, (g.memberCount || 1) - 1) } : g)));
    try {
      await communityApi.leave(groupId);
    } catch (err) {
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isMember: true, memberCount: (g.memberCount || 0) + 1 } : g)));
      throw err;
    }
  }, []);

  return { groups, loading, error, search: load, createGroup, joinGroup, leaveGroup };
}

export default useCommunities;
