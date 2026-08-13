// src/hooks/useOnboarding.js
import { useCallback, useEffect, useState } from 'react';
import { localStorage } from '../services/localStorage';

export function useOnboarding() {
  const [hasOnboarded, setHasOnboarded] = useState(null); // null = still checking

  useEffect(() => {
    localStorage.hasOnboarded().then(setHasOnboarded);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await localStorage.setOnboarded(true);
    setHasOnboarded(true);
  }, []);

  return { hasOnboarded, completeOnboarding };
}

export default useOnboarding;
