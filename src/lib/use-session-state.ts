"use client";

import { useEffect, useState } from "react";

/**
 * Like useState, but mirrors the value to sessionStorage so it survives
 * navigating away and back within the same tab, and disappears once the
 * tab is closed. Reads happen after mount to avoid SSR/hydration mismatches.
 */
export function useSessionState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time synchronous hydration from sessionStorage on mount, deferred to an
    // effect (rather than a lazy useState initializer) so the client's first render
    // matches the server's — sessionStorage isn't available during SSR.
    try {
      const raw = sessionStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setState(JSON.parse(raw) as T);
    } catch {
      // sessionStorage unavailable (private browsing, etc.) — keep in-memory state
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state, ready]);

  return [state, setState] as const;
}

export function clearSessionState(keys: string[]) {
  keys.forEach((key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}
