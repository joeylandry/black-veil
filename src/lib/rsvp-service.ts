import { eventConfig } from "@/config/event";
import { setStorageValue } from "@/lib/use-storage-value";

export type RsvpSubmission = {
  fullName: string;
  email: string;
  attending: "yes" | "no";
  note: string;
  dressAcknowledged: boolean;
  attendanceStatus?: "invited" | "confirmed" | "declined" | "waitlisted";
  recordedAt: string;
};

export type RsvpService = {
  save(submission: RsvpSubmission): Promise<{ ok: true }>;
  load(): RsvpSubmission | null;
};

/**
 * Prototype-only adapter. Kept for local development without a database connection.
 */
export const localRsvpService: RsvpService = {
  async save(submission) {
    setStorageValue(eventConfig.storageKeys.rsvp, JSON.stringify(submission));
    return { ok: true };
  },
  load() {
    const raw = localStorage.getItem(eventConfig.storageKeys.rsvp);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RsvpSubmission;
    } catch {
      return null;
    }
  },
};

/**
 * Server-backed adapter. `save` writes the RSVP to Postgres via POST /api/rsvp,
 * which is the durable record event management reads. It also mirrors the
 * submission to localStorage purely so this device can render "you already
 * RSVP'd" without a login step; localStorage is a UI cache here, not the
 * source of truth.
 */
export const remoteRsvpService: RsvpService = {
  async save(submission) {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || "Failed to save RSVP.");
    }
    setStorageValue(eventConfig.storageKeys.rsvp, JSON.stringify(submission));
    return { ok: true };
  },
  load() {
    const raw = localStorage.getItem(eventConfig.storageKeys.rsvp);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RsvpSubmission;
    } catch {
      return null;
    }
  },
};
