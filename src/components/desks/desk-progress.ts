"use client";

import { useMemo } from "react";
import { eventConfig } from "@/config/event";
import { setStorageValue, useStorageValue } from "@/lib/use-storage-value";

function parseClosed(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Desk tickets this browser has closed. `ready` is false until storage has been read. */
export function useClosedTickets() {
  const raw = useStorageValue(eventConfig.storageKeys.deskClosed);
  const closed = useMemo(() => parseClosed(raw), [raw]);
  return { closed, ready: raw !== undefined };
}

export function closeTicket(ticket: string) {
  try {
    const closed = parseClosed(localStorage.getItem(eventConfig.storageKeys.deskClosed));
    if (!closed.includes(ticket)) setStorageValue(eventConfig.storageKeys.deskClosed, JSON.stringify([...closed, ticket]));
  } catch {
    // Storage unavailable: the ticket simply won't be remembered as closed.
  }
}
