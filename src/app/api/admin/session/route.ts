import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests } from "@/lib/db/schema";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";

/**
 * What the /admin unlock form calls: checks the passphrase, then that the database is
 * reachable and migrated, so a failure names its real cause instead of blaming the
 * passphrase.
 */
export async function GET(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;
  try {
    await getDb().select({ count: sql<number>`count(*)` }).from(guests);
  } catch (error) {
    return adminDatabaseError("unlock check", error);
  }
  return NextResponse.json({ ok: true });
}
