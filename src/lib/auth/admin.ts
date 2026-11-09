import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { isStaff } from "@/lib/auth/session";

/** True when `given` is the deployment's ADMIN_SECRET. */
export function passphraseMatches(given: string) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Guard for /api/admin routes. Staff sign in once at /admin (POST /api/admin/session), which
 * sets an httpOnly staff cookie; every admin route checks it. Returns null to proceed, or
 * the response to send.
 */
export async function adminGuard(): Promise<NextResponse | null> {
  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not set on this deployment. Add it to the host's environment and redeploy.", code: "not-configured" },
      { status: 503 },
    );
  }
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Staff sign-in required.", code: "signed-out" }, { status: 401 });
  }
  return null;
}

export function adminDatabaseError(context: string, error: unknown) {
  console.error(`[admin] ${context}:`, error);
  return NextResponse.json(
    { error: "The database could not be reached. Check DATABASE_URL and that migrations have run.", code: "database" },
    { status: 503 },
  );
}
