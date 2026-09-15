"use client";

import { useCallback, useSyncExternalStore } from "react";

const storageEvent = "black-veil-storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(storageEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(storageEvent, callback);
  };
}

export function useStorageValue(key: string) {
  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

export function setStorageValue(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event(storageEvent));
}

export function removeStorageValue(key: string) {
  localStorage.removeItem(key);
  window.dispatchEvent(new Event(storageEvent));
}
