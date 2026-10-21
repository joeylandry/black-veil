import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { guests } from "@/lib/db/schema";
import { setSessionCookie } from "@/lib/auth/session";
import { findGuestForRecovery, normalizeEmail, tooManyAttempts } from "@/lib/auth/recover";

/**
 * "My device forgot me": a guest gives the name and email they registered with and, if they match
 * a guest on the register (names forgive misspellings), this device is signed in as them. Nothing
 * is written to the register. A miss never says whether the name or the email was the problem.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (name.length < 2 || name.length > 120 || email.length < 5 || email.length > 200 || !email.includes("@")) {
    return NextResponse.json({ error: "Enter the name and the email you registered with." }, { status: 400 });
  }

  const address = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  // Everyone at the party shares one wifi address, so the cap per address is generous; what is
  // slowed down is guessing at the same email again and again.
  const overall = tooManyAttempts(`address:${address}`, Date.now(), 150);
  const sameEmail = tooManyAttempts(`email:${address}|${normalizeEmail(email)}`, Date.now(), 6);
  if (overall || sameEmail) {
    return NextResponse.json({ error: "Too many tries. Wait a few minutes and try again, or ask the host." }, { status: 429 });
  }

  let candidates: { id: string; email: string; fullName: string }[];
  try {
    candidates = await getDb().select({ id: guests.id, email: guests.email, fullName: guests.fullName }).from(guests);
  } catch (error) {
    console.error("[recover] the register could not be read:", error);
    return NextResponse.json({ error: "The guest ledger could not be reached. Try again in a moment." }, { status: 503 });
  }

  const guest = findGuestForRecovery(candidates, name, email);
  if (!guest) {
    return NextResponse.json({ error: "We could not match that name and email. Check the spelling, and use the email you registered with." }, { status: 404 });
  }
  await setSessionCookie(guest.id);
  return NextResponse.json({ ok: true });
}
