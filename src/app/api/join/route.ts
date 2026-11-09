import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { locations, members } from "@/lib/db/schema";
import { setSessionCookie } from "@/lib/auth/session";
import { normalizeAccessCode } from "@/lib/case/text";

/**
 * Join the file with a location's access code. Creates the member (or, for an email already
 * on the file, signs that device in only if the code matches the member's own location, so
 * a code alone can't be used to take over someone else's account).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ").slice(0, 80) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const code = normalizeAccessCode(typeof body?.code === "string" ? body.code : "");

  if (fullName.length < 2) return NextResponse.json({ error: "Your full name, please." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "A valid email address, please." }, { status: 400 });
  if (!code) return NextResponse.json({ error: "The access code from your room, please." }, { status: 400 });

  try {
    const db = await getDb();
    const [location] = await db.select().from(locations).where(eq(locations.accessCode, code)).limit(1);
    if (!location) {
      return NextResponse.json({ error: "That access code doesn't open anything. Check it against the one on the screen." }, { status: 404 });
    }

    const [existing] = await db.select().from(members).where(eq(members.email, email)).limit(1);
    if (existing) {
      if (existing.locationId && existing.locationId !== location.id) {
        return NextResponse.json(
          { error: "That email is already on the file in another room. Use “Sign in by email” instead.", code: "elsewhere" },
          { status: 409 },
        );
      }
      if (!existing.locationId) await db.update(members).set({ locationId: location.id }).where(eq(members.id, existing.id));
      await setSessionCookie(existing.id);
      return NextResponse.json({ ok: true, returning: true });
    }

    const [created] = await db.insert(members).values({ fullName, email, locationId: location.id }).returning({ id: members.id });
    await setSessionCookie(created.id);
    return NextResponse.json({ ok: true, returning: false });
  } catch (error) {
    console.error("[join]", error);
    return NextResponse.json({ error: "The file could not be reached. Try again in a minute." }, { status: 503 });
  }
}
