import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { eventConfig } from "@/config/event";

/**
 * The /admin passcode. It lives here, in server-only code, never in src/config/event.ts: that file
 * is imported by pages that run in the browser, so anything in it is public. The ADMIN_SECRET
 * environment variable, if the host sets it, also works.
 */
const ADMIN_PASSCODE = "1926staff";

/**
 * Shared-secret auth for the staff-only /admin routes. No per-staff accounts yet.
 *
 * Returns null when the request may proceed, otherwise the response to send.
 */
export function adminGuard(request: Request): NextResponse | null {
  // Switch in src/config/event.ts: no passcode at all. Keep it off.
  if (eventConfig.adminOpen) return null;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const accepted = [ADMIN_PASSCODE, process.env.ADMIN_SECRET].filter((value): value is string => Boolean(value));
  const ok = accepted.some((secret) => {
    const expected = Buffer.from(`Bearer ${secret}`);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!ok) return NextResponse.json({ error: "That passcode was rejected.", code: "bad-passphrase" }, { status: 401 });
  return null;
}

/** The response for a staff request that passed the guard but could not reach the database. */
export function adminDatabaseError(context: string, error: unknown) {
  console.error(`[admin] ${context}:`, error);
  return NextResponse.json(
    {
      error: "The passcode is right, but the database could not be read. Check DATABASE_URL on this deployment and that migrations have been run.",
      code: "database",
    },
    { status: 503 },
  );
}
