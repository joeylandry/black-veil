import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { guests, rsvps } from "@/lib/db/schema";
import { setSessionCookie } from "@/lib/auth/session";

const attendanceStatuses = ["invited", "confirmed", "declined", "waitlisted"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { fullName, email, attending, note, dressAcknowledged, attendanceStatus, recordedAt } =
    body as Record<string, unknown>;

  if (typeof fullName !== "string" || fullName.trim().length < 2) {
    return NextResponse.json({ error: "A full name is required." }, { status: 400 });
  }
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (attending !== "yes" && attending !== "no") {
    return NextResponse.json({ error: "attending must be \"yes\" or \"no\"." }, { status: 400 });
  }
  if (!dressAcknowledged) {
    return NextResponse.json({ error: "The dress requirement must be acknowledged." }, { status: 400 });
  }

  const normalizedStatus =
    typeof attendanceStatus === "string" && attendanceStatuses.includes(attendanceStatus as (typeof attendanceStatuses)[number])
      ? (attendanceStatus as (typeof attendanceStatuses)[number])
      : null;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();

  let db: ReturnType<typeof getDb>;
  try {
    db = getDb();
  } catch (error) {
    // DATABASE_URL missing on this deployment. Nothing was written, and retrying
    // will not help, so say so rather than inviting the guest to submit again.
    console.error("[rsvp] the database is not configured:", error);
    return NextResponse.json(
      { error: "The guest register is not configured on this deployment. Please let the host know." },
      { status: 503 },
    );
  }

  try {
    await db.insert(rsvps).values({
      fullName: normalizedName,
      email: normalizedEmail,
      attending,
      note: typeof note === "string" ? note.trim().slice(0, 500) : "",
      dressAcknowledged: true,
      attendanceStatus: normalizedStatus,
      recordedAt: typeof recordedAt === "string" && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt) : new Date(),
    });
  } catch (error) {
    // Unreachable database, or migrations never applied to it ("relation \"rsvps\"
    // does not exist"). The server log carries the real cause; the guest only needs
    // to know their name was not written down.
    console.error("[rsvp] failed to record the RSVP:", error);
    return NextResponse.json(
      { error: "The guest register could not be reached, so nothing was recorded. Please try again, and tell the host if it keeps failing." },
      { status: 503 },
    );
  }

  // The RSVP above is the durable record and it is now safely written. Establishing
  // this guest's identity and signing the device in is a convenience layered on top,
  // so a failure here must not be reported as a failed RSVP — that would send the
  // guest back to submit a second time and duplicate their own entry in the register.
  try {
    const [guest] = await db
      .insert(guests)
      .values({ email: normalizedEmail, fullName: normalizedName })
      .onConflictDoUpdate({ target: guests.email, set: { fullName: normalizedName } })
      .returning();
    await setSessionCookie(guest.id);
  } catch (error) {
    console.error("[rsvp] recorded the RSVP but could not sign the guest in:", error);
    return NextResponse.json({ ok: true, signedIn: false });
  }

  return NextResponse.json({ ok: true, signedIn: true });
}
