import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Shared-secret auth for the staff-only /admin routes. No per-staff accounts yet.
 *
 * Returns null when the request may proceed, otherwise the response to send. A missing
 * ADMIN_SECRET and a wrong passphrase are answered differently, with a `code` the
 * /admin page turns into a message, so staff aren't told their passphrase is wrong
 * when the deployment simply has none set.
 */
export function adminGuard(request: Request): NextResponse | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        error: "ADMIN_SECRET is not set on this deployment, so no passphrase can work. Add it in the host's environment variables and redeploy.",
        code: "not-configured",
      },
      { status: 503 },
    );
  }
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "That passphrase was rejected.", code: "bad-passphrase" }, { status: 401 });
  }
  return null;
}

/** The response for a staff request that passed the guard but could not reach the database. */
export function adminDatabaseError(context: string, error: unknown) {
  console.error(`[admin] ${context}:`, error);
  return NextResponse.json(
    {
      error: "The passphrase is right, but the database could not be read. Check DATABASE_URL on this deployment and that migrations have been run.",
      code: "database",
    },
    { status: 503 },
  );
}
