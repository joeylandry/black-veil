import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { guests } from "@/lib/db/schema";
import { adminGuard } from "@/lib/auth/admin";
import { setSessionCookie } from "@/lib/auth/session";

/**
 * Staff-only: signs this browser in as the named guest, exactly as their magic link
 * would, so staff can see the site as that guest does. The browser then visits
 * /resume/restored to load that guest's register into local storage.
 */
export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const guestId = typeof body?.guestId === "string" ? body.guestId : "";
  if (!/^[0-9a-f-]{36}$/i.test(guestId)) {
    return NextResponse.json({ error: "A guest id is required." }, { status: 400 });
  }

  const [guest] = await getDb().select({ id: guests.id }).from(guests).where(eq(guests.id, guestId)).limit(1);
  if (!guest) {
    return NextResponse.json({ error: "No such guest." }, { status: 404 });
  }

  await setSessionCookie(guest.id);
  return NextResponse.json({ ok: true });
}
