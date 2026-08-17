// src/hooks/useCommunities.js
// Server-style pagination for the communities list: keeps a page cursor,
// appends on loadMore (infinite scroll), resets on search change / refresh.
// The API (communityApi.list) already returns { groups, page, hasMore, total }.
import { useCallback, useEffect, useRef, useState } from 'react';
import { communityApi } from '../services/communityApi';

export function useCommunities() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true); // first page only
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const requestId = useRef(0);

  const loadFirstPage = useCallback(async ({ search = '', silent = false } = {}) => {
    const rid = ++requestId.current;
    setError(null);
    if (!silent) setLoading(true);
    try {
      const data = await communityApi.list(search, 1);
      if (rid !== requestId.current) return;
      setGroups(data.groups || data || []);
      setPage(data.page || 1);
      setTotal(data.total || 0);
      setHasMore(!!data.hasMore);
    } catch (err) {
      if (rid === requestId.current) setError(err.message || 'Could not load communities.');
    } finally {
      if (rid === requestId.current) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(async (search = '') => {
    if (loading || loadingMore || refreshing) return;
    if (!hasMore) return;
    const nextPage = page + 1;
    const rid = requestId.current;
    setLoadingMore(true);
    try {
      const data = await communityApi.list(search, nextPage);
      if (rid !== requestId.current) return;
      setGroups((prev) => [...prev, ...(data.groups || data || [])]);
      setPage(data.page || nextPage);
      setTotal(data.total || total);
      setHasMore(!!data.hasMore);
    } catch (err) {
      if (rid === requestId.current) setError(err.message || 'Could not load more.');
    } finally {
      if (rid === requestId.current) setLoadingMore(false);
    }
  }, [loading, loadingMore, refreshing, hasMore, page, total]);

  const refresh = useCallback(async (search = '') => {
    setRefreshing(true);
    await loadFirstPage({ search, silent: true });
  }, [loadFirstPage]);

  const searchGroups = useCallback((search = '') => loadFirstPage({ search }), [loadFirstPage]);

  useEffect(() => {
    loadFirstPage({});
  }, [loadFirstPage]);

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

  return {
    groups,
    loading,
    loadingMore,
    refreshing,
    error,
    page,
    total,
    hasMore,
    search: searchGroups,
    loadMore,
    refresh,
    createGroup,
    joinGroup,
    leaveGroup,
  };
}

export default useCommunities;
