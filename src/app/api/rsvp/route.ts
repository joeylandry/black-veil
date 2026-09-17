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

  const db = getDb();

  await db.insert(rsvps).values({
    fullName: normalizedName,
    email: normalizedEmail,
    attending,
    note: typeof note === "string" ? note.trim().slice(0, 500) : "",
    dressAcknowledged: true,
    attendanceStatus: normalizedStatus,
    recordedAt: typeof recordedAt === "string" && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt) : new Date(),
  });

  // Establish (or update) this guest's identity and sign this device in, so CTF
  // progress and any future claim submissions attach to them without an extra step.
  const [guest] = await db
    .insert(guests)
    .values({ email: normalizedEmail, fullName: normalizedName })
    .onConflictDoUpdate({ target: guests.email, set: { fullName: normalizedName } })
    .returning();
  await setSessionCookie(guest.id);

  return NextResponse.json({ ok: true });
}
