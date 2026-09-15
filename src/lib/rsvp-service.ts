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
 * Prototype-only adapter. Replace this object with a server-backed implementation
 * when permanent RSVP persistence is connected.
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
