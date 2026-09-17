/**
 * Server-only. Never import this from a "use client" component or from
 * src/data/ctf.ts — either would bundle these values into client JS.
 * Only src/lib/ctf-scoring.ts (used from API route handlers) and the
 * server-rendered /secret page (which intentionally reveals VII in its
 * page source as the puzzle solution) should import it.
 */
export const ctfFlags: Record<string, string> = {
  "unmapped-passage": "VEIL{RIVER_SIDE}",
  "second-annotation": "VEIL{NOT_THE_LAST}",
  "cabinet-account": "VEIL{KEEPER}",
  "interrupted-session": "VEIL{1147}",
  "thread-in-the-rose": "VEIL{MERRIMACK_ROOM}",
  "uninvited-guest": "VEIL{SILENT_PARTNER}",
  "unlisted-room": "VEIL{UNLISTED_ROOM}",
};
