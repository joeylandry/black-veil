import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { adminDatabaseError, adminGuard } from "@/lib/auth/admin";
import { clearDemo, loadCast, resetGuest, seedDemo } from "@/lib/demo/seed";

/**
 * The npm run demo:* scripts as staff-only buttons, for when there is no terminal to hand.
 *   load-cast   replace the cast with a fresh, unassigned copy of the 35 characters
 *   seed        everyone in the program on the register, each holding the character based on them
 *   reset       forget one guest by email (RSVP, solves, claims, sign-in links)
 *   clear       remove every demo guest and the demo cast
 */
export async function POST(request: NextRequest) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const db = getDb();

  try {
    if (action === "load-cast") {
      const count = await loadCast(db);
      return NextResponse.json({ ok: true, message: `Loaded ${count} unassigned characters.` });
    }
    if (action === "seed") {
      const result = await seedDemo(db);
      return NextResponse.json({
        ok: true,
        message: `Seeded ${result.guests} guests, each holding the character based on them, plus ${result.pendingClaims} pending claims. ${result.presenterCharacter} is left unassigned: RSVP under your own name, then press Assign characters.`,
      });
    }
    if (action === "reset") {
      const email = typeof body?.email === "string" ? body.email.trim() : "";
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ error: "Enter the email of the guest to forget." }, { status: 400 });
      }
      const result = await resetGuest(db, email);
      return NextResponse.json({
        ok: true,
        message: result.found
          ? `Forgot ${result.email}: RSVP, solves, claims and sign-in links removed.`
          : `${result.email} was not in the register, so there was nothing to remove.`,
      });
    }
    if (action === "clear") {
      const result = await clearDemo(db);
      return NextResponse.json({ ok: true, message: `Removed ${result.guests} demo guests and ${result.characters} demo characters.` });
    }
  } catch (error) {
    return adminDatabaseError(`demo ${action}`, error);
  }

  return NextResponse.json({ error: 'action must be "load-cast", "seed", "reset" or "clear".' }, { status: 400 });
}
